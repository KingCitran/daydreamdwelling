import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import TrackTags from './TrackTags'

const DEST_LABELS = {
  spotify:     { label: 'Spotify',     icon: '♫' },
  apple_music: { label: 'Apple Music', icon: '◍' },
  bandcamp:    { label: 'Bandcamp',    icon: '◐' },
  website:     { label: 'Website',     icon: '◎' },
}

// Streaming destinations are PPC-billed; the website is a free always-on info link.
const PPC_DESTS = new Set(['spotify', 'apple_music', 'bandcamp'])

export default function MusicPlayerBar() {
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

  // Hide PPC streaming buttons when artist balance can't cover a click — keeps the
  // listener experience honest. Website + bio info still show. Artist gets nudged
  // on their dashboard to top up.
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
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(15,12,30,0.92)', backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${t.surfaceBorder}`, zIndex: 95,
      paddingTop: 0,
    }}>
      {/* Mini progress bar — full-width, click to seek */}
      <div onClick={onScrub} style={{
        height: 4, background: 'rgba(255,255,255,0.08)',
        cursor: 'pointer', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: t.accent,
          transition: 'width 0.15s linear',
        }} />
      </div>

      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={prev} style={iconBtn} title="Previous">⏮</button>
          <button onClick={toggle} style={playBtn(t)} title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '❚❚' : '▶'}</button>
          <button onClick={() => next('manual')} style={iconBtn} title="Skip">⏭</button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 11, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
              {artist?.artist_name ?? 'Artist'} · {queueLabel}
            </div>
            <TrackTags trackId={currentTrack.id} descriptiveTags={currentTrack.descriptive_tags ?? []} compact />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {visibleLinks.map(([key]) => {
            const meta = DEST_LABELS[key] ?? { label: key, icon: '↗' }
            return (
              <button key={key} onClick={() => onClickDestination(key)} style={destBtn(t)} title={`Find on ${meta.label}`}>
                <span style={{ fontSize: 12 }}>{meta.icon}</span>
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* Volume controls — separate from mute so level is preserved */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button onClick={() => adjustVolume(-0.1)} style={volBtn} title="Volume down">−</button>
          <div style={{
            width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(muted ? 0 : volume) * 100}%`,
              background: t.accent,
            }} />
          </div>
          <button onClick={() => adjustVolume(0.1)} style={volBtn} title="Volume up">+</button>
        </div>

        <button onClick={() => setMuted(m => !m)} style={iconBtn} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button onClick={closeWidget} style={iconBtn} title="Close player">✕</button>
      </div>
    </div>
  )
}

const playBtn = t => ({
  width: 38, height: 38, borderRadius: '50%', border: 'none',
  background: t.accent, color: t.accentText, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
})
const iconBtn = {
  background: 'none', border: 'none', color: '#c8b8ee', cursor: 'pointer',
  fontSize: 18, padding: '6px 8px', flexShrink: 0, lineHeight: 1,
}
const volBtn = {
  background: 'none', border: 'none', color: '#c8b8ee', cursor: 'pointer',
  fontSize: 14, fontWeight: 700, padding: '4px 8px', flexShrink: 0,
  width: 24, height: 24,
}
const destBtn = t => ({
  padding: '6px 12px', borderRadius: 16, border: `1px solid ${t.accent}40`,
  background: 'transparent', color: '#e0d9ff', cursor: 'pointer',
  fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
})
