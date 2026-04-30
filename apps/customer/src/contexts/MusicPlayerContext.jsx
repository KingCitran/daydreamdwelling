import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useMood } from '@shared/useMood'
import { supabase } from '@shared/supabase'
import { dragSignal } from './dragSignal'

// Global music player state for the entire customer app. Owns the audio element,
// queue, playback state, and persists to localStorage so playback resumes across
// reloads (paused — autoplay policies + listener consent).
//
// Queue types:
//   'popular' — top approved tracks by play_count
//   'mood'    — tracks tagged with the current visual mood
//   'custom'  — caller-supplied queue (used by dashboard self-listen)
//
// Plays log to artist_track_plays after PLAY_LOG_THRESHOLD seconds (which fires
// the trigger that bumps play_count / skip_count / skip_rate on artist_tracks).

const MusicPlayerContext = createContext(null)

const PLAY_LOG_THRESHOLD = 30
const STORAGE_KEY = 'ddd_music_v1'
const POSITION_SAVE_INTERVAL = 5000

// Lookup: visual mood → music station tag. Mood drives both visuals and music
// rotation, so this map keeps them aligned without a second user setting.
const MOOD_TO_STATION = {
  'Bright Day':              'Bright',
  'Golden Hour':             'Cozy',
  'Vivid Sunset':            'Bright',
  "Ember's Sunrise":         'Cozy',
  'Candlelit Cozy Evening':  'Evening',
  'Moonlight':               'Evening',
  'Northern Lights':         'Evening',
  'Dark Academia':           'Focus',
  'Cottagecore Dawn':        'Nature',
  'Coastal Morning':         'Nature',
  'Dream State':             'Cozy',
  'Neon Nights':             'Party',
  'Greenhouse':              'Nature',
  'Studio':                  'Focus',
  'Studio Dark':             'Focus',
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function persist(partial) {
  try {
    const prev = loadStored() ?? {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...partial }))
  } catch { /* localStorage may be disabled */ }
}

const TRACK_SELECT = `
  id, title, audio_url, duration_seconds,
  station_tags, mood_tags, descriptive_tags, rotation_status, play_count,
  artist_id,
  artist_profiles(artist_name, external_links, preferred_destination, ppc_balance_cents, ppc_rate_cents)
`

export function MusicPlayerProvider({ children, appKey = 'customer' }) {
  const { user } = useAuth()
  const { mood: visualMood } = useMood(appKey)

  const audioRef = useRef(null)
  const stored = useRef(loadStored()).current

  // Custom queues require a caller-provided list (artist self-listen, future
  // playlists). They don't survive reload, so guard against being stuck in
  // 'custom' mode with nothing to play.
  const initialQueueType = stored?.queueType === 'custom' ? 'popular' : (stored?.queueType ?? 'popular')
  const initialQueueLabel = stored?.queueType === 'custom' ? 'Most Popular' : (stored?.queueLabel ?? 'Most Popular')
  const [queueType, setQueueType] = useState(initialQueueType)
  const [queueLabel, setQueueLabel] = useState(initialQueueLabel)
  const [stationFilter, setStationFilter] = useState(stored?.stationFilter ?? 'Cozy')
  const [queue, setQueue] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [muted, setMuted] = useState(stored?.muted ?? true)
  const [volume, setVolume] = useState(stored?.volume ?? 0.4)
  const [widgetOpen, setWidgetOpen] = useState(stored?.widgetOpen ?? false)
  const [widgetVariant, setWidgetVariant] = useState('bar') // 'bar' | 'sidebar' | 'floating'
  const [floatingPos, setFloatingPos] = useState(stored?.floatingPos ?? null)
  const [progress, setProgress] = useState(0) // 0..1, seek position

  // Restore-once values (consumed during first queue load)
  const restoreTrackIdRef = useRef(stored?.currentTrackId ?? null)
  const restorePositionRef = useRef(stored?.position ?? 0)

  // Surface load state in the UI so the user can debug without DevTools
  const [loadState, setLoadState] = useState({ status: 'idle', count: 0, error: null })
  const [reloadKey, setReloadKey] = useState(0)
  const triggerReload = useCallback(() => setReloadKey(k => k + 1), [])

  const listenStartRef = useRef(0)
  const loggedRef = useRef(false)

  const currentTrack = queue[currentIdx] ?? null
  const stationForMusic = MOOD_TO_STATION[visualMood] ?? 'Bright'

  // Load queue when type or mood changes. Custom-queue path skips this entirely:
  // the setCustomQueue caller writes queue + currentIdx synchronously.
  useEffect(() => {
    if (queueType === 'custom') return
    let cancelled = false
    setLoadState(s => ({ ...s, status: 'loading' }))
    async function load() {
      let q = supabase
        .from('artist_tracks')
        .select(TRACK_SELECT)
        .eq('approval_status', 'approved')
        .neq('rotation_status', 'removed')
        .limit(40)

      if (queueType === 'mood' && visualMood) {
        q = q.contains('mood_tags', [visualMood])
      } else if (queueType === 'station' && stationFilter) {
        q = q.contains('station_tags', [stationFilter])
      } else {
        q = q.order('play_count', { ascending: false })
      }

      const { data, error } = await q
      if (cancelled) return
      if (error) {
        console.error('[MusicPlayer] queue fetch failed:', error)
        setLoadState({ status: 'error', count: 0, error: error.message ?? String(error) })
        setQueue([])
        return
      }
      const count = (data ?? []).length
      console.log(`[MusicPlayer] ${queueType} queue loaded: ${count} track(s)`,
        queueType === 'mood' ? `mood=${visualMood}` : '')
      setLoadState({ status: 'ok', count, error: null })

      // Active tracks weighted 2× over limited (active + active + limited)
      const active = (data ?? []).filter(t => t.rotation_status !== 'limited')
      const limited = (data ?? []).filter(t => t.rotation_status === 'limited')
      let merged = [...active, ...active, ...limited]

      // Shuffle for mood; keep order for popular (popularity is the order)
      if (queueType === 'mood') {
        for (let i = merged.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[merged[i], merged[j]] = [merged[j], merged[i]]
        }
      }
      setQueue(merged)

      // First-load: try to restore the track the user was on
      const restoreId = restoreTrackIdRef.current
      if (restoreId) {
        const idx = merged.findIndex(t => t.id === restoreId)
        setCurrentIdx(idx >= 0 ? idx : 0)
        restoreTrackIdRef.current = null
      } else {
        setCurrentIdx(0)
      }
    }
    load()
    return () => { cancelled = true }
  }, [queueType, visualMood, stationFilter, reloadKey])

  // Wire audio element on track change. Plays/pauses are driven by a separate
  // effect (below) so that swap-queue-then-play sequences don't race the src
  // assignment.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    audio.src = currentTrack.audio_url
    audio.volume = muted ? 0 : volume
    listenStartRef.current = Date.now()
    loggedRef.current = false

    if (restorePositionRef.current > 0) {
      audio.currentTime = restorePositionRef.current
      restorePositionRef.current = 0
    }
  }, [currentIdx, currentTrack?.audio_url]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drive actual playback off the isPlaying flag + current track. This effect
  // re-runs after the track-change effect within the same render, so audio.src
  // is always set before audio.play() is called.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [isPlaying, currentTrack?.audio_url])

  // Track audio progress for the mini scrubber. timeupdate fires ~4 times/sec
  // but we throttle to ~1Hz — every progress update triggers a re-render of
  // every music-context consumer (player panel, etc.), which competes with
  // smooth dragging when the panel itself is being moved. Also fully skipped
  // while a panel is being dragged (dragSignal flips during drag).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let lastUpdate = 0
    const onTime = () => {
      if (dragSignal.isDragging) return
      const now = Date.now()
      if (now - lastUpdate < 1000) return
      lastUpdate = now
      const dur = audio.duration
      setProgress(dur > 0 && isFinite(dur) ? audio.currentTime / dur : 0)
    }
    audio.addEventListener('timeupdate', onTime)
    return () => audio.removeEventListener('timeupdate', onTime)
  }, [currentTrack?.audio_url])

  // Volume / mute changes apply immediately
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = muted ? 0 : volume
  }, [muted, volume])

  // Log play once listener crosses the 30s threshold
  const logPlay = useCallback(async (completed) => {
    if (loggedRef.current || !currentTrack) return
    loggedRef.current = true
    const playedSec = Math.round((Date.now() - listenStartRef.current) / 1000)
    await supabase.from('artist_track_plays').insert({
      track_id: currentTrack.id,
      user_id: user?.id ?? null,
      station: stationForMusic,
      room_mood: visualMood ?? null,
      completed,
      duration_played_seconds: playedSec,
    })
  }, [currentTrack, user, stationForMusic, visualMood])

  // Tick to log completed once the threshold is crossed
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

  // Auto-advance on natural end → log completed if not already
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (!loggedRef.current) logPlay(true)
      next('auto')
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [logPlay]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist non-position state when it changes. Custom queue types are
  // transient (caller-provided), so we save 'popular' instead — otherwise the
  // user would reload into an empty queue.
  useEffect(() => {
    const persistType = queueType === 'custom' ? 'popular' : queueType
    const persistLabel = queueType === 'custom' ? 'Most Popular' : queueLabel
    persist({
      queueType: persistType,
      queueLabel: persistLabel,
      currentTrackId: currentTrack?.id ?? null,
      volume,
      muted,
      widgetOpen,
      stationFilter,
    })
  }, [queueType, queueLabel, currentTrack, volume, muted, widgetOpen, stationFilter])

  // Periodically save audio position so reload resumes mid-track
  useEffect(() => {
    if (!isPlaying) return
    const tick = setInterval(() => {
      const audio = audioRef.current
      const position = audio?.currentTime ?? 0
      persist({ position })
    }, POSITION_SAVE_INTERVAL)
    return () => clearInterval(tick)
  }, [isPlaying])

  // ── Controls ────────────────────────────────────────────────────────
  // play/pause just flip state; the isPlaying effect handles audio.play/pause.
  const play = useCallback(() => {
    setIsPlaying(true)
    setMuted(false)
  }, [])

  const pause = useCallback(() => setIsPlaying(false), [])

  const toggle = useCallback(() => {
    if (isPlaying) pause(); else play()
  }, [isPlaying, play, pause])

  const next = useCallback((skipReason = 'manual') => {
    // Manual skip before threshold counts as a skip event
    if (!loggedRef.current && skipReason === 'manual') logPlay(false)
    setCurrentIdx(i => (i + 1) % Math.max(queue.length, 1))
  }, [queue.length, logPlay])

  const prev = useCallback(() => {
    setCurrentIdx(i => (i - 1 + queue.length) % Math.max(queue.length, 1))
  }, [queue.length])

  const openWidget = useCallback(() => setWidgetOpen(true), [])
  // Closing the widget hides the window but DOES NOT stop audio. Closing the
  // floating panel is "minimize" — explicit pause/play stays under the user's
  // control via the play button.
  const closeWidget = useCallback(() => setWidgetOpen(false), [])

  const switchToPopular = useCallback(() => {
    setQueueLabel('Most Popular')
    setQueueType('popular')
  }, [])

  const switchToMood = useCallback(() => {
    setQueueLabel(visualMood)
    setQueueType('mood')
  }, [visualMood])

  const switchToStation = useCallback((stationId, stationLabel) => {
    setStationFilter(stationId)
    setQueueLabel(stationLabel ?? `${stationId} Station`)
    setQueueType('station')
  }, [])

  // Used by dashboard self-listen + future playlist load. Writes queue +
  // currentIdx synchronously so playback can start right after this call.
  const setCustomQueue = useCallback((tracks, label, initialIdx = 0) => {
    setQueueType('custom')
    setQueueLabel(label ?? 'Custom')
    setQueue(tracks)
    setCurrentIdx(initialIdx)
  }, [])

  const playTrackAtIndex = useCallback((idx) => {
    setCurrentIdx(idx)
    setIsPlaying(true)
    setMuted(false)
    setWidgetOpen(true)
  }, [])

  const seekTo = useCallback((pct) => {
    const audio = audioRef.current
    if (!audio || !audio.duration || !isFinite(audio.duration)) return
    audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration
  }, [])

  const adjustVolume = useCallback((delta) => {
    setVolume(v => Math.max(0, Math.min(1, v + delta)))
    setMuted(false)
  }, [])

  // Persist floating widget position
  useEffect(() => {
    if (floatingPos) persist({ floatingPos })
  }, [floatingPos])

  const value = {
    // state
    queueType, queueLabel, queue, currentTrack, currentIdx,
    isPlaying, muted, volume, widgetOpen, widgetVariant, floatingPos, progress,
    visualMood, stationForMusic, stationFilter,
    hasTracks: queue.length > 0,
    loadState, // { status: 'idle'|'loading'|'ok'|'error', count, error }
    // setters
    setMuted, setVolume, setWidgetVariant, setFloatingPos,
    // controls
    play, pause, toggle, next, prev, seekTo, adjustVolume,
    openWidget, closeWidget, triggerReload,
    switchToPopular, switchToMood, switchToStation, setCustomQueue, playTrackAtIndex,
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
  return ctx
}
