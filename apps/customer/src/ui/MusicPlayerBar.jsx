import { useEffect, useState } from 'react'
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
    widgetMinimized, setWidgetMinimized,
  } = useMusicPlayer()
  const [infoOpen, setInfoOpen] = useState(false)
  const [droppedToday, setDroppedToday] = useState(false)
  const [raindropCount, setRaindropCount] = useState(0)
  const [raindropMsg, setRaindropMsg] = useState('')

  // Sync local raindrop state when the current track changes. We don't
  // reach into the catalog's droppedToday set; the bar lives across many
  // routes so it queries directly.
  useEffect(() => {
    if (!currentTrack) return
    setRaindropCount(currentTrack.raindrop_count ?? 0)
    setRaindropMsg('')
    if (!user) { setDroppedToday(false); return }
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    supabase
      .from('artist_track_raindrops')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', currentTrack.id)
      .gte('dropped_at', startOfDay.toISOString())
      .limit(1)
      .then(({ data }) => setDroppedToday((data ?? []).length > 0))
  }, [user, currentTrack])

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

  // Bio sheet shows every link the artist set, even PPC-disabled ones —
  // the expand sheet is the "everything about this track" surface, not the
  // compact-bar honesty filter.
  const allLinks = Object.entries(links).filter(([, url]) => !!url)

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

  async function giveRaindrop() {
    setRaindropMsg('')
    if (!user) { setRaindropMsg('Sign in to give raindrops.'); return }
    const { error } = await supabase.rpc('give_raindrop', { p_track_id: currentTrack.id })
    if (error) { setRaindropMsg(error.message); return }
    setDroppedToday(true)
    setRaindropCount(c => c + 1)
  }

  // ── Minimized pill ─────────────────────────────────────────────────────
  if (widgetMinimized) {
    return (
      <div style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 95,
        background: 'rgba(15,12,30,0.94)', backdropFilter: 'blur(12px)',
        border: `1px solid ${t.surfaceBorder}`, borderRadius: 32,
        padding: '6px 10px 6px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 6px 22px rgba(0,0,0,0.35)',
        maxWidth: 'min(360px, 92vw)',
      }}>
        <button onClick={toggle} style={miniPlayBtn(t)} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.title}
          </div>
          <div style={{ fontSize: 9, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {artist?.artist_name ?? 'Artist'}
          </div>
        </div>
        <button onClick={() => setWidgetMinimized(false)} style={iconBtn} title="Expand player">▴</button>
      </div>
    )
  }

  // ── Full bar + optional expand sheet ───────────────────────────────────
  return (
    <>
      {infoOpen && (
        <TrackInfoSheet
          t={t}
          track={currentTrack}
          artist={artist}
          queueLabel={queueLabel}
          allLinks={allLinks}
          ppcFunded={ppcFunded}
          onClickDestination={onClickDestination}
          droppedToday={droppedToday}
          raindropCount={raindropCount}
          raindropMsg={raindropMsg}
          onRaindrop={giveRaindrop}
          onClose={() => setInfoOpen(false)}
        />
      )}

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

            <button onClick={() => setInfoOpen(o => !o)} style={{
              ...trackTitleBtn,
              minWidth: 0, flex: 1, textAlign: 'left',
            }} title="Show track details">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: 11, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                {artist?.artist_name ?? 'Artist'} · {queueLabel}
              </div>
              <TrackTags trackId={currentTrack.id} descriptiveTags={currentTrack.descriptive_tags ?? []} compact />
            </button>
          </div>

          {/* Raindrop on the bar — quick action, full bio + counts live in the sheet */}
          <button onClick={giveRaindrop} disabled={droppedToday} title={droppedToday ? 'Raindropped today' : 'Give a raindrop (5/day)'} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 10px', borderRadius: 16,
            background: droppedToday ? `${t.accent}30` : 'transparent',
            border: `1px solid ${droppedToday ? t.accent : 'rgba(255,255,255,0.15)'}`,
            color: droppedToday ? t.accent : '#e0d9ff',
            fontSize: 11, fontWeight: 700, cursor: droppedToday ? 'default' : 'pointer', flexShrink: 0,
          }}>
            <span style={{ fontSize: 12 }}>💧</span>
            {raindropCount.toLocaleString()}
          </button>

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
          <button onClick={() => setWidgetMinimized(true)} style={iconBtn} title="Minimize">▿</button>
          <button onClick={closeWidget} style={iconBtn} title="Close player">✕</button>
        </div>
      </div>
    </>
  )
}

function TrackInfoSheet({ t, track, artist, queueLabel, allLinks, ppcFunded, onClickDestination, droppedToday, raindropCount, raindropMsg, onRaindrop, onClose }) {
  const cover = artist?.cover_url
  const avatar = artist?.avatar_url

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(560px, 96vw)',
        background: 'rgba(20,16,40,0.98)', color: '#f0eaff',
        border: `1px solid ${t.surfaceBorder}`,
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        marginBottom: 64, // sits above the player bar
        overflow: 'hidden',
      }}>
        {/* Cover banner */}
        <div style={{
          position: 'relative', height: 130,
          background: cover
            ? `center / cover no-repeat url(${cover})`
            : `linear-gradient(135deg, ${t.accent}40 0%, ${t.accent}10 100%)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(20,16,40,0.95) 100%)',
          }} />
          <button onClick={onClose} aria-label="Close" style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: 14,
            background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
            fontSize: 14, cursor: 'pointer',
          }}>✕</button>
          <div style={{
            position: 'absolute', left: 18, bottom: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: avatar ? `center / cover no-repeat url(${avatar})` : `${t.accent}40`,
              border: '2px solid #fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#fff',
            }}>{!avatar && '♪'}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{track.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {artist?.artist_name ?? 'Artist'} · {queueLabel}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 18px 18px' }}>
          {artist?.bio && (
            <p style={{
              margin: '0 0 12px', fontSize: 12, color: 'rgba(240,234,255,0.85)',
              lineHeight: 1.55,
            }}>{artist.bio}</p>
          )}

          {/* Raindrop + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button onClick={onRaindrop} disabled={droppedToday} title={droppedToday ? 'Raindropped today' : 'Give a raindrop (5/day)'} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 18,
              background: droppedToday ? `${t.accent}40` : t.accent,
              border: 'none', color: droppedToday ? t.accent : t.accentText,
              fontSize: 12, fontWeight: 700, cursor: droppedToday ? 'default' : 'pointer',
              boxShadow: droppedToday ? 'none' : `0 4px 16px ${t.accent}40`,
            }}>
              <span style={{ fontSize: 14 }}>💧</span>
              {droppedToday ? 'Raindropped' : 'Give a raindrop'}
            </button>
            <span style={{ fontSize: 11, color: 'rgba(240,234,255,0.7)' }}>
              {raindropCount.toLocaleString()} {raindropCount === 1 ? 'raindrop' : 'raindrops'} total
            </span>
          </div>
          {raindropMsg && (
            <div style={{
              padding: '8px 12px', marginBottom: 12, borderRadius: 8,
              background: raindropMsg.startsWith('Sign in') ? 'rgba(255,200,122,0.15)' : 'rgba(255,138,138,0.15)',
              color: raindropMsg.startsWith('Sign in') ? '#ffc87a' : '#ff8a8a',
              fontSize: 11,
            }}>{raindropMsg}</div>
          )}

          {/* Tag chips */}
          {(track.station_tags?.length || track.mood_tags?.length || track.descriptive_tags?.length) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
              {(track.station_tags ?? []).map(tag => (
                <span key={`s-${tag}`} style={tagChip(t)}>{tag}</span>
              ))}
              {(track.mood_tags ?? []).map(tag => (
                <span key={`m-${tag}`} style={tagChipSubtle}>{tag}</span>
              ))}
              {(track.descriptive_tags ?? []).map(tag => (
                <span key={`d-${tag}`} style={tagChipSubtle}>{tag}</span>
              ))}
            </div>
          )}

          {/* All destination links — including PPC-disabled ones, shown with a note */}
          {allLinks.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,234,255,0.55)', letterSpacing: '1px', marginBottom: 8, textTransform: 'uppercase' }}>
                Find this artist on
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allLinks.map(([key]) => {
                  const meta = DEST_LABELS[key] ?? { label: key, icon: '↗' }
                  const isPpc = PPC_DESTS.has(key)
                  const disabled = isPpc && !ppcFunded
                  return (
                    <button key={key} onClick={() => !disabled && onClickDestination(key)} disabled={disabled} title={disabled ? 'Artist is out of PPC balance — link paused' : `Open ${meta.label}`} style={{
                      ...destBtn(t),
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}>
                      <span style={{ fontSize: 12 }}>{meta.icon}</span>
                      {meta.label}
                    </button>
                  )
                })}
              </div>
              {allLinks.some(([k]) => PPC_DESTS.has(k)) && !ppcFunded && (
                <div style={{ fontSize: 10, color: 'rgba(240,234,255,0.5)', marginTop: 8, fontStyle: 'italic' }}>
                  Streaming links pause when the artist is out of click-through balance. They auto-resume when they top up.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const playBtn = t => ({
  width: 38, height: 38, borderRadius: '50%', border: 'none',
  background: t.accent, color: t.accentText, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
})
const miniPlayBtn = t => ({
  width: 28, height: 28, borderRadius: '50%', border: 'none',
  background: t.accent, color: t.accentText, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0,
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
const trackTitleBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 0, color: 'inherit', fontFamily: 'inherit',
}
const tagChip = t => ({
  fontSize: 9, padding: '2px 8px', borderRadius: 10,
  background: `${t.accent}25`, color: t.accent, fontWeight: 700, letterSpacing: '0.3px',
})
const tagChipSubtle = {
  fontSize: 9, padding: '2px 8px', borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', color: '#c0b5e8', fontWeight: 600,
}
