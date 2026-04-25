import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const PLAY_LOG_THRESHOLD = 30 // seconds — listening past this counts as a "completed" play

// Filters approved+active tracks by station/mood, fisher-yates shuffles, returns the queue.
// Re-runs whenever the mood or station changes.
export default function useMusicPlayer({ mood, station, enabled = true }) {
  const { user } = useAuth()
  const audioRef = useRef(null)
  const [queue,        setQueue]       = useState([])
  const [currentIdx,   setCurrentIdx]  = useState(0)
  const [isPlaying,    setIsPlaying]   = useState(false)
  const [muted,        setMuted]       = useState(true)
  const [volume,       setVolume]      = useState(0.4)

  // Track listening time so we know when to log a "completed" play
  const listenStartRef = useRef(0)
  const loggedRef      = useRef(false)

  const currentTrack = queue[currentIdx] ?? null

  // Load queue when mood/station changes
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function load() {
      let q = supabase
        .from('artist_tracks')
        .select('id, title, audio_url, duration_seconds, station_tags, mood_tags, descriptive_tags, artist_id, artist_profiles(artist_name, external_links, preferred_destination)')
        .eq('approval_status', 'approved')
        .neq('rotation_status', 'removed')
        .limit(40)

      if (station) q = q.contains('station_tags', [station])
      else if (mood) q = q.contains('mood_tags', [mood])

      const { data } = await q
      if (cancelled) return
      // Limited tracks get half the slots — repeat active ones
      const active  = (data ?? []).filter(t => t.rotation_status !== 'limited')
      const limited = (data ?? []).filter(t => t.rotation_status === 'limited')
      const merged  = [...active, ...active, ...limited] // active gets weighted ×2
      // Fisher-Yates shuffle
      for (let i = merged.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[merged[i], merged[j]] = [merged[j], merged[i]]
      }
      setQueue(merged)
      setCurrentIdx(0)
    }
    load()
    return () => { cancelled = true }
  }, [mood, station, enabled])

  // Wire audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    audio.src = currentTrack.audio_url
    audio.volume = muted ? 0 : volume
    listenStartRef.current = Date.now()
    loggedRef.current = false
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
  }, [currentIdx, currentTrack?.audio_url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = muted ? 0 : volume
  }, [muted, volume])

  // Log a play once the listener crosses the 30s threshold
  const logPlay = useCallback(async (completed) => {
    if (loggedRef.current || !currentTrack) return
    loggedRef.current = true
    const playedSec = Math.round((Date.now() - listenStartRef.current) / 1000)
    // Trigger on artist_track_plays bumps the cached play_count/skip_count on artist_tracks
    await supabase.from('artist_track_plays').insert({
      track_id:               currentTrack.id,
      user_id:                user?.id ?? null,
      station:                station ?? null,
      room_mood:              mood ?? null,
      completed,
      duration_played_seconds: playedSec,
    })
  }, [currentTrack, user, mood, station])

  // Track time tick — log completed once user crosses threshold
  useEffect(() => {
    if (!isPlaying || !currentTrack) return
    const tick = setInterval(() => {
      const elapsed = (Date.now() - listenStartRef.current) / 1000
      if (elapsed >= PLAY_LOG_THRESHOLD && !loggedRef.current) {
        logPlay(true)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [isPlaying, currentTrack, logPlay])

  function next(skipReason = 'manual') {
    // If user advanced before threshold, log as a skip
    if (!loggedRef.current && skipReason === 'manual') logPlay(false)
    setCurrentIdx(i => (i + 1) % Math.max(queue.length, 1))
  }

  function play()  { setIsPlaying(true);  setMuted(false); audioRef.current?.play().catch(() => {}) }
  function pause() { setIsPlaying(false); audioRef.current?.pause() }
  function toggle(){ isPlaying ? pause() : play() }

  // Auto-advance on track end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      // Natural end → log as completed if not already
      if (!loggedRef.current) logPlay(true)
      next('auto')
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [logPlay])

  // Hidden audio element for the consumer to mount once
  function audioElement() {
    return <audio ref={audioRef} preload="metadata" />
  }

  return {
    audioRef,
    audioElement,
    currentTrack,
    isPlaying,
    muted, setMuted,
    volume, setVolume,
    queue,
    play, pause, toggle, next,
    hasTracks: queue.length > 0,
  }
}
