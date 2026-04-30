import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import TrackTags from './TrackTags'

// Draggable floating widget for the room builder. Drag the header to move.
// Listeners attach only during a drag (not via useEffect deps) so we don't
// rebind on every mousemove. body.userSelect locks page text selection during
// drag to keep the canvas/UI from highlighting under the cursor.

const DEST_LABELS = {
  spotify:     { label: 'Spotify',     icon: '♫' },
  apple_music: { label: 'Apple Music', icon: '◍' },
  bandcamp:    { label: 'Bandcamp',    icon: '◐' },
  website:     { label: 'Website',     icon: '◎' },
}
const PPC_DESTS = new Set(['spotify', 'apple_music', 'bandcamp'])

const WIDGET_WIDTH = 280
const WIDGET_HEIGHT_ESTIMATE = 240
const EDGE_PADDING = 12

function defaultPos() {
  if (typeof window === 'undefined') return { x: 24, y: 100 }
  return {
    x: 24,
    y: Math.max(80, window.innerHeight - WIDGET_HEIGHT_ESTIMATE - 80),
  }
}

function clampPos(pos) {
  if (typeof window === 'undefined') return pos
  return {
    x: Math.max(EDGE_PADDING, Math.min(window.innerWidth - WIDGET_WIDTH - EDGE_PADDING, pos.x)),
    y: Math.max(EDGE_PADDING, Math.min(window.innerHeight - 100 - EDGE_PADDING, pos.y)),
  }
}

export default function MusicPlayerFloating() {
  const t = useTheme()
  const { user } = useAuth()
  const {
    currentTrack, isPlaying, muted, volume, queueLabel, progress,
    setMuted, toggle, next, prev, closeWidget, hasTracks,
    seekTo, adjustVolume,
    floatingPos, setFloatingPos,
    loadState, triggerReload, queueType, visualMood,
  } = useMusicPlayer()

  const widgetRef = useRef(null)
  const posRef = useRef(clampPos(floatingPos ?? defaultPos()))
  // Re-clamp if window resizes
  useEffect(() => {
    const onResize = () => {
      posRef.current = clampPos(posRef.current)
      if (widgetRef.current) {
        widgetRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function startDrag(e) {
    e.preventDefault()
    const widgetEl = widgetRef.current
    if (!widgetEl) return
    const rect = widgetEl.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const prevUserSelect = document.body.style.userSelect
    const prevCursor = document.body.style.cursor
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    // Direct DOM transform updates during drag — bypasses React re-render so
    // dragging stays smooth even though the widget tree is sizable. State syncs
    // once at drag end so the position persists through localStorage.
    function onMove(ev) {
      const next = clampPos({ x: ev.clientX - offsetX, y: ev.clientY - offsetY })
      posRef.current = next
      if (widgetRef.current) {
        widgetRef.current.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`
      }
    }
    function onUp() {
      document.body.style.userSelect = prevUserSelect
      document.body.style.cursor = prevCursor
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setFloatingPos(posRef.current)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Empty state — render the chrome so the user sees the widget opened, even
  // when no tracks have loaded (no approved tracks yet, fetch error, etc.).
  // Shows the load status + error + a Try Again button so debugging doesn't
  // require DevTools.
  if (!hasTracks || !currentTrack) {
    return (
      <div ref={widgetRef} className="ember-clear" style={{
        position: 'fixed', top: 0, left: 0, zIndex: 200,
        transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
        width: WIDGET_WIDTH,
        background: 'rgba(15,12,30,0.94)', backdropFilter: 'blur(16px)',
        border: `1px solid ${t.accent}40`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        willChange: 'transform',
      }}>
        <div onMouseDown={startDrag} style={{
          cursor: 'grab', padding: '8px 14px',
          background: `linear-gradient(180deg, ${t.accent}25, ${t.accent}05)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${t.accent}20`,
          userSelect: 'none',
        }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: t.accent, letterSpacing: '1.2px', textTransform: 'uppercase' }}>⋮⋮ Music</span>
          <button onMouseDown={e => e.stopPropagation()} onClick={closeWidget} style={iconBtn} title="Close player">✕</button>
        </div>
        <div style={{ padding: 18, fontSize: 12, color: '#c8b8ee', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <button onMouseDown={e => e.stopPropagation()} onClick={triggerReload} style={{
            padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: t.accent, color: t.accentText, fontSize: 11, fontWeight: 700,
            alignSelf: 'flex-start',
          }}>↻ Try again</button>
        </div>
      </div>
    )
  }

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
    <div ref={widgetRef} style={{
      position: 'fixed', top: 0, left: 0, zIndex: 200,
      transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
      width: WIDGET_WIDTH,
      background: 'rgba(15,12,30,0.94)', backdropFilter: 'blur(16px)',
      border: `1px solid ${t.accent}40`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
      display: 'flex', flexDirection: 'column',
      willChange: 'transform',
    }}>
      <div onMouseDown={startDrag} style={{
        cursor: 'grab', padding: '8px 14px',
        background: `linear-gradient(180deg, ${t.accent}25, ${t.accent}05)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${t.accent}20`,
        userSelect: 'none',
      }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: t.accent, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
          ⋮⋮ {queueLabel}
        </span>
        <button onMouseDown={e => e.stopPropagation()} onClick={closeWidget} style={{ ...iconBtn, padding: 0, fontSize: 14 }} title="Close player">✕</button>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
      </div>
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
