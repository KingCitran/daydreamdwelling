import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import TrackTags from './TrackTags'

// Vertical sidebar variant for community pages — sits under the logo on the
// left edge. Same audio engine as the bar; only the layout differs.

const DEST_LABELS = {
  spotify:     { label: 'Spotify',     icon: '♫' },
  apple_music: { label: 'Apple Music', icon: '◍' },
  bandcamp:    { label: 'Bandcamp',    icon: '◐' },
  website:     { label: 'Website',     icon: '◎' },
}
const PPC_DESTS = new Set(['spotify', 'apple_music', 'bandcamp'])

export default function MusicPlayerSidebar() {
  const t = useTheme()
  const { user } = useAuth()
  const {
    currentTrack, isPlaying, muted, volume, queueLabel, progress,
    setMuted, toggle, next, prev, closeWidget, hasTracks,
    seekTo, adjustVolume,
  } = useMusicPlayer()

  if (!hasTracks || !currentTrack) return null

  const artist = currentTrack.artist_profiles
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
    <aside style={{
      position: 'fixed', top: 116, left: 16, zIndex: 90,
      width: 240,
      background: 'rgba(15,12,30,0.85)', backdropFilter: 'blur(14px)',
      border: `1px solid ${t.accent}30`,
      borderRadius: 16, padding: 16,
      boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: t.accent, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
          {queueLabel}
        </span>
        <button onClick={closeWidget} style={{ ...iconBtn, padding: 0, fontSize: 14, opacity: 0.6 }} title="Close player">✕</button>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentTrack.title}
        </div>
        <div style={{ fontSize: 11, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {artist?.artist_name ?? 'Artist'}
        </div>
      </div>

      <TrackTags trackId={currentTrack.id} descriptiveTags={currentTrack.descriptive_tags ?? []} compact />

      <div onClick={onScrub} style={{
        height: 4, background: 'rgba(255,255,255,0.1)',
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
    </aside>
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
