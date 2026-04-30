import { useEffect, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../../contexts/MusicPlayerContext'

// Inline player on the artist dashboard. Loads the artist's own approved +
// pending tracks and plays them through the global music player by swapping
// the queue. Clicking the same row again toggles play/pause; clicking a
// different row swaps to that track immediately.

const TRACK_SELECT = `
  id, title, audio_url, duration_seconds,
  station_tags, mood_tags, descriptive_tags, approval_status, rotation_status, play_count,
  artist_id,
  artist_profiles(artist_name, external_links, preferred_destination, ppc_balance_cents, ppc_rate_cents)
`

export default function ArtistSelfListenPlayer({ userId }) {
  const t = useTheme()
  const player = useMusicPlayer()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase.from('artist_tracks')
      .select(TRACK_SELECT)
      .eq('artist_id', userId)
      .in('approval_status', ['approved', 'pending'])
      .order('submitted_at', { ascending: false })
      .then(({ data }) => { setTracks(data ?? []); setLoading(false) })
  }, [userId])

  function onPlayRow(idx) {
    const track = tracks[idx]
    const isThisRow = player.queueLabel === 'My tracks' && player.currentTrack?.id === track.id
    if (isThisRow) {
      player.toggle()
      return
    }
    player.setCustomQueue(tracks, 'My tracks')
    player.playTrackAtIndex(idx)
  }

  if (loading || tracks.length === 0) return null

  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16, padding: '18px 20px', marginBottom: 24,
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>Listen to your tracks</h2>
        <span style={{ fontSize: 11, color: t.textSoft }}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tracks.map((track, idx) => {
          const isThisRow = player.queueLabel === 'My tracks' && player.currentTrack?.id === track.id
          const showPause = isThisRow && player.isPlaying
          const status = track.approval_status
          return (
            <button key={track.id} onClick={() => onPlayRow(idx)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 10px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: isThisRow ? `${t.accent}14` : 'transparent',
              textAlign: 'left',
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: t.accent, color: t.accentText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>{showPause ? '❚❚' : '▶'}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: t.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.title}
              </span>
              {status !== 'approved' && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                  background: status === 'pending' ? `${t.accent}20` : '#ff8a8a25',
                  color:      status === 'pending' ? t.accent : '#ff8a8a',
                  letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0,
                }}>{status}</span>
              )}
              <span style={{ fontSize: 11, color: t.textSoft, flexShrink: 0 }}>
                {Math.floor((track.duration_seconds ?? 0) / 60)}:{String((track.duration_seconds ?? 0) % 60).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
