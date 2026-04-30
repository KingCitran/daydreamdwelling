import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import TrackTags from './TrackTags'

// id = the underlying station_tag value that artists submit tracks against.
// label = the friendly name shown in the picker. Dropping Silence per founder
// ask — listeners just turn music off.
const STATIONS = [
  { id: 'Cozy',    label: 'Cozy Vibes',   icon: '🏡', desc: 'Acoustic & soft indie' },
  { id: 'Jazz',    label: 'Jazz Lounge',  icon: '🎷', desc: 'Smooth jazz & bossa nova' },
  { id: 'Focus',   label: 'Lo-fi Study',  icon: '📚', desc: 'Chill beats to focus' },
  { id: 'Bright',  label: 'Upbeat',       icon: '✨', desc: 'Pop & feel-good' },
  { id: 'Evening', label: 'Ambient',      icon: '🌌', desc: 'Atmospheric & spacious' },
  { id: 'Nature',  label: 'Nature',       icon: '🌿', desc: 'Rain, forest & calm' },
]

// Music tab content (renders inside DockablePanel tabId="music"). Combines
// playback controls + the queue-source picker (Most Popular / By Mood) so
// listening + per-context music control happen in one place.
//
// DockablePanel provides the outer chrome (header with title, drag handle,
// dock/close buttons). This component is just the panel body.

const DEST_LABELS = {
  spotify:     { label: 'Spotify',     icon: '♫' },
  apple_music: { label: 'Apple Music', icon: '◍' },
  bandcamp:    { label: 'Bandcamp',    icon: '◐' },
  website:     { label: 'Website',     icon: '◎' },
}
const PPC_DESTS = new Set(['spotify', 'apple_music', 'bandcamp'])

export default function MusicTabPanel() {
  const t = useTheme()
  const { user } = useAuth()
  const {
    currentTrack, isPlaying, muted, volume, queueLabel, progress,
    queueType, visualMood, stationFilter, hasTracks, loadState,
    setMuted, toggle, next, prev, seekTo, adjustVolume,
    switchToPopular, switchToStation, triggerReload,
  } = useMusicPlayer()

  const [showStations, setShowStations] = useState(false)

  const artist = currentTrack?.artist_profiles
  const links = artist?.external_links ?? {}
  const balance = artist?.ppc_balance_cents ?? 0
  const rate = artist?.ppc_rate_cents ?? 2
  const ppcFunded = balance >= rate

  const visibleLinks = Object.entries(links).filter(([key, url]) => {
    if (!url) return false
    if (PPC_DESTS.has(key)) return ppcFunded
    return true
  })

  async function onClickDestination(key) {
    const isPpc = PPC_DESTS.has(key)
    if (!isPpc) {
      const direct = links[key]
      if (direct) window.open(direct, '_blank', 'noopener,noreferrer')
      return
    }
    try {
      const { data, error } = await supabase.functions.invoke('artist-ppc-click', {
        body: { trackId: currentTrack.id, destinationKey: key, userId: user?.id ?? null },
      })
      if (error) throw error
      if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      const fallback = links[key]
      if (fallback) window.open(fallback, '_blank', 'noopener,noreferrer')
    }
  }

  function onScrub(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seekTo(pct)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Queue source picker — Most Popular vs Choose Station */}
      <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 10, background: 'rgba(0,0,0,0.18)' }}>
        <button
          onClick={() => { switchToPopular(); setShowStations(false) }}
          style={pickerBtn(t, queueType === 'popular' && !showStations)}
        >★ Most Popular</button>
        <button
          onClick={() => setShowStations(s => !s)}
          style={pickerBtn(t, queueType === 'station' || showStations)}
        >◐ {queueType === 'station' ? (STATIONS.find(s => s.id === stationFilter)?.label ?? stationFilter) : 'Choose Station'}</button>
      </div>

      {/* Station chooser — expanded list of stations to pick from */}
      {showStations && (
        <div style={{
          padding: 8, borderRadius: 10,
          background: 'rgba(0,0,0,0.22)',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6,
        }}>
          {STATIONS.map(st => {
            const active = queueType === 'station' && stationFilter === st.id
            return (
              <button
                key={st.id}
                onClick={() => { switchToStation(st.id, st.label); setShowStations(false) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 2, padding: '8px 10px', borderRadius: 8,
                  border: `1px solid ${active ? t.accent : 'rgba(255,255,255,0.08)'}`,
                  background: active ? `${t.accent}28` : 'rgba(255,255,255,0.04)',
                  color: '#f0eaff', cursor: 'pointer', textAlign: 'left',
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>{st.icon} {st.label}</span>
                <span style={{ fontSize: 9, color: '#a090c8', lineHeight: 1.3 }}>{st.desc}</span>
              </button>
            )
          })}
          <div style={{
            gridColumn: '1 / -1', padding: '6px 8px', borderRadius: 8,
            border: '1px dashed rgba(255,255,255,0.15)',
            fontSize: 9, color: '#8a78a8', textAlign: 'center', letterSpacing: '0.4px',
          }}>YOUR PLAYLISTS · coming soon</div>
        </div>
      )}

      {hasTracks && currentTrack ? (
        <>
          {/* Now playing */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 11, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {artist?.artist_name ?? 'Artist'} · {queueLabel}
            </div>
          </div>

          <TrackTags trackId={currentTrack.id} descriptiveTags={currentTrack.descriptive_tags ?? []} compact />

          <div onClick={onScrub} style={{
            height: 4, background: 'rgba(255,255,255,0.12)',
            cursor: 'pointer', position: 'relative', borderRadius: 2,
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${progress * 100}%`, background: t.accent, borderRadius: 2,
              transition: 'width 0.15s linear',
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
            <button onClick={prev} style={iconBtn} title="Previous">⏮</button>
            <button onClick={toggle} style={playBtn(t)} title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '❚❚' : '▶'}</button>
            <button onClick={() => next('manual')} style={iconBtn} title="Skip">⏭</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setMuted(m => !m)} style={iconBtn} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🔊'}
            </button>
            <button onClick={() => adjustVolume(-0.1)} style={volBtn} title="Volume down">−</button>
            <div style={{
              flex: 1, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${(muted ? 0 : volume) * 100}%`, background: t.accent,
              }} />
            </div>
            <button onClick={() => adjustVolume(0.1)} style={volBtn} title="Volume up">+</button>
          </div>

          {visibleLinks.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {visibleLinks.map(([key]) => {
                const meta = DEST_LABELS[key] ?? { label: key, icon: '↗' }
                return (
                  <button key={key} onClick={() => onClickDestination(key)} style={destBtn(t)} title={`Find on ${meta.label}`}>
                    <span style={{ fontSize: 11 }}>{meta.icon}</span>
                    {meta.label}
                  </button>
                )
              })}
            </div>
          )}
        </>
      ) : (
        // Empty / loading state with diagnostic info + retry
        <div style={{ fontSize: 12, color: '#c8b8ee', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, color: '#f0eaff' }}>No track is playing.</div>
          <div style={{ fontSize: 11, color: '#a090c8', lineHeight: 1.5 }}>
            <div>Status: <strong style={{ color: loadState?.status === 'error' ? '#ff8a8a' : '#a0d0a0' }}>{loadState?.status ?? 'unknown'}</strong></div>
            <div>Loaded: {loadState?.count ?? 0} track(s)</div>
            <div>Queue: {queueType}{queueType === 'mood' ? ` (${visualMood})` : ''}</div>
            {loadState?.error && (
              <div style={{ marginTop: 6, color: '#ff8a8a', wordBreak: 'break-word' }}>
                Error: {loadState.error}
              </div>
            )}
          </div>
          <button onClick={triggerReload} style={{
            padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: t.accent, color: t.accentText, fontSize: 11, fontWeight: 700,
            alignSelf: 'flex-start',
          }}>↻ Try again</button>
        </div>
      )}
    </div>
  )
}

const playBtn = t => ({
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  background: t.accent, color: t.accentText, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
})
const iconBtn = {
  background: 'none', border: 'none', color: '#c8b8ee', cursor: 'pointer',
  fontSize: 18, padding: 4, flexShrink: 0, lineHeight: 1,
}
const volBtn = {
  background: 'none', border: 'none', color: '#c8b8ee', cursor: 'pointer',
  fontSize: 14, fontWeight: 700, padding: '4px 6px', flexShrink: 0,
  width: 22, height: 22,
}
const destBtn = t => ({
  padding: '4px 8px', borderRadius: 12, border: `1px solid ${t.accent}40`,
  background: 'transparent', color: '#e0d9ff', cursor: 'pointer',
  fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
})
const pickerBtn = (t, active) => ({
  flex: 1, padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
  border: 'none',
  background: active ? t.accent : 'transparent',
  color: active ? t.accentText : '#c8b8ee',
  fontSize: 11, fontWeight: 700,
  fontFamily: "'Outfit', system-ui, sans-serif",
})
