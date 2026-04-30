import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { getTabAnchor, useSideTab } from '../contexts/SideTabContext'
import { dragSignal } from '../contexts/dragSignal'

// Generic dock-aware chrome around any panel. Shows a header with the tab's
// label, a "dock back" button (only when floating), a drag handle, and an X
// to close. Panel content is rendered as children.
//
// Two states:
//   docked   → position attached to the right of its source tab (auto-tracks
//              tab's viewport position via getTabAnchor)
//   floating → position from panelStates[id].position; user can drag the
//              header to move it freely
//
// Drag UX uses translate3d + direct DOM updates during drag so the panel
// doesn't re-render on every mousemove (same trick as MusicPlayerFloating).

// Distance (px) below which the floating panel will snap back to its tab.
// Generous so the user doesn't have to nudge the panel exactly back onto the
// tab — they just have to bring it close to that side of the screen.
const SNAP_RADIUS = 180

export default function DockablePanel({ tabId, children, width = 320, minHeight = 200, maxHeight }) {
  const t = useTheme()
  const { panelStates, tabDefs, closePanel, floatPanel, dockPanel, setPanelPosition } = useSideTab()
  const state = panelStates[tabId]
  const def = tabDefs[tabId]
  const widgetRef = useRef(null)

  // pos drives the inline transform on render. Lazy initializer means the
  // first render already has the correct position — no {0,0} flash before
  // the effect fires.
  const [pos, setPos] = useState(() => {
    if (!state?.open) return { x: 0, y: 0 }
    return state.docked ? getTabAnchor(tabId) : (state.position ?? getTabAnchor(tabId))
  })
  // Mirror of pos that drag handlers can read synchronously without setState.
  const posRef = useRef(pos)
  useEffect(() => { posRef.current = pos }, [pos])

  // Sync pos when external state changes (e.g., user clicked dock button →
  // state.docked toggles → re-anchor). Skipped during open=false to keep
  // ref values around for next open.
  useEffect(() => {
    if (!state?.open) return
    const newPos = state.docked
      ? getTabAnchor(tabId)
      : (state.position ?? getTabAnchor(tabId))
    setPos(newPos)
  }, [state?.open, state?.docked, tabId])

  // Re-anchor the docked panel when window resizes
  useEffect(() => {
    if (!state?.open || !state?.docked) return
    function onResize() { setPos(getTabAnchor(tabId)) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [state?.open, state?.docked, tabId])

  // Pre-warm GPU compositing layer when the panel first opens. Browsers tend
  // to defer materializing the composite layer until the first transform
  // change — doing it here means the layer is hot by the time the user can
  // grab the panel.
  useEffect(() => {
    if (!state?.open || !widgetRef.current) return
    const el = widgetRef.current
    void el.offsetHeight
    requestAnimationFrame(() => {
      if (!widgetRef.current) return
      const cur = widgetRef.current.style.transform
      widgetRef.current.style.transform = cur + ' translateZ(0)'
      void widgetRef.current.offsetHeight
      widgetRef.current.style.transform = cur
    })
  }, [state?.open])

  function startDrag(e) {
    e.preventDefault()
    if (!widgetRef.current) return
    const rect = widgetRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    const wasDocked = state.docked
    // Cache the tab anchor at drag start so we don't query the DOM every frame.
    // Tabs don't move during drag (the strip is anchored), so the anchor is stable.
    const anchor = getTabAnchor(tabId)

    const prevUserSelect = document.body.style.userSelect
    const prevCursor = document.body.style.cursor
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    // Tell the rest of the app to pause expensive periodic work (music
    // progress updates, etc.) until drag ends.
    dragSignal.isDragging = true


    let movedFar = false
    let inSnapZone = false
    // The source tab DOM element. We toggle a class on it directly during
    // drag so React doesn't re-render DockablePanel on every snap-zone
    // crossing (which would re-apply stale transform from JSX).
    const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`)

    // Drag updates are RAF-batched. mousemove can fire faster than display
    // refresh — coalescing into one update per frame avoids redundant DOM
    // writes that compete with the rest of the page (3D canvas, etc.).
    let pendingEv = null
    let rafId = 0

    function flush() {
      rafId = 0
      const ev = pendingEv
      pendingEv = null
      if (!ev) return

      const next = { x: ev.clientX - offsetX, y: ev.clientY - offsetY }
      const dx = next.x - anchor.x
      const dy = next.y - anchor.y
      const distSq = dx * dx + dy * dy

      if (!movedFar && distSq > 30 * 30) movedFar = true

      const inSnap = (movedFar || !wasDocked) && distSq < SNAP_RADIUS * SNAP_RADIUS
      if (inSnap !== inSnapZone) {
        inSnapZone = inSnap
        if (tabEl) tabEl.classList.toggle('snap-target', inSnap)
      }

      posRef.current = next
      if (widgetRef.current) {
        widgetRef.current.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`
      }
    }

    function onMove(ev) {
      pendingEv = ev
      if (rafId) return
      rafId = requestAnimationFrame(flush)
    }

    function onUp() {
      // Drain any pending RAF tick so posRef reflects the actual final mouse
      // position before we decide snap-back vs float.
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
        flush()
      }
      document.body.style.userSelect = prevUserSelect
      document.body.style.cursor = prevCursor
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (tabEl) tabEl.classList.remove('snap-target')
      dragSignal.isDragging = false

      // No actual drag — header was tapped/clicked. Bail without state change.
      if (!movedFar) return

      const dx = posRef.current.x - anchor.x
      const dy = posRef.current.y - anchor.y
      const within = (dx * dx + dy * dy) < SNAP_RADIUS * SNAP_RADIUS

      if (within) {
        // Snap home: pin to anchor visually + ensure docked state. Update
        // both the ref (used by next drag) and React state (used by next render).
        posRef.current = anchor
        if (widgetRef.current) {
          widgetRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0)`
        }
        setPos(anchor)
        dockPanel(tabId)
      } else {
        // Float at the released position. setPos so React's render matches
        // the DOM transform; floatPanel persists the new state.
        setPos(posRef.current)
        floatPanel(tabId, posRef.current)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (!state?.open) return null

  return (
    <div ref={widgetRef} style={{
      position: 'fixed', top: 0, left: 0, zIndex: 95,
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      width,
      minHeight,
      ...(maxHeight ? { maxHeight } : {}),
      // Solid background instead of backdrop-filter blur. The blur looks
      // glassy but forces a per-frame GPU shader re-evaluation that fights
      // the drag handler. Solid is much cheaper and the panel is opaque
      // enough that the visual difference is minimal.
      background: 'rgb(20,15,38)',
      border: `1px solid ${def?.accent ?? t.accent}40`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
      willChange: 'transform',
      // Tell the browser this subtree's layout, paint, and styles are
      // independent of everything outside it — so changes here can't force
      // recalc of the rest of the page.
      contain: 'layout paint style',
      isolation: 'isolate',
    }}>
      <div onMouseDown={startDrag} style={{
        cursor: 'grab', padding: '9px 12px',
        background: `linear-gradient(180deg, ${def?.accent ?? t.accent}28, ${def?.accent ?? t.accent}06)`,
        borderBottom: `1px solid ${def?.accent ?? t.accent}25`,
        display: 'flex', alignItems: 'center', gap: 10,
        userSelect: 'none',
      }}>
        <span style={{ color: '#a090c8', fontSize: 12, letterSpacing: 1 }}>⋮⋮</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#f0eaff', letterSpacing: '0.3px',
          textShadow: 'none', WebkitTextStroke: 0,
        }}>{def?.label ?? tabId}</span>
        {!state.docked && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => dockPanel(tabId)}
            title="Dock panel back to tab"
            style={iconBtn}
          >⇱</button>
        )}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => closePanel(tabId)}
          title="Close panel"
          style={iconBtn}
        >✕</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 14, color: '#e0d9ff',
        textShadow: 'none', WebkitTextStroke: 0,
      }}>
        {children}
      </div>

    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', color: '#c8b8ee', cursor: 'pointer',
  fontSize: 13, padding: '4px 6px', flexShrink: 0, lineHeight: 1,
}
