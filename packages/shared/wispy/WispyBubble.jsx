import { useContext, useEffect, useRef, useState } from 'react'
import { WispyContext } from './WispyProvider.jsx'

const TYPE_CHAR_MS = 22

export default function WispyBubble() {
  const ctx = useContext(WispyContext)
  const [typed, setTyped] = useState('')
  const targetEl = useRef(null)

  const bubble = ctx?.bubble
  const text = bubble?.text || ''

  // Type-on animation. Reset whenever bubble.id changes.
  useEffect(() => {
    setTyped('')
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i += 1
      setTyped(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, TYPE_CHAR_MS)
    return () => clearInterval(id)
  }, [bubble?.id])

  // Manual-advance button is always visible once a bubble is shown. The
  // old fallback timer that auto-revealed the buttons after 20s is gone
  // — the user wants bubbles to be persistently visible until they
  // dismiss them explicitly.

  // Highlight target element on the page
  useEffect(() => {
    if (targetEl.current) {
      targetEl.current.style.animation = ''
      targetEl.current.style.borderRadius = ''
      targetEl.current = null
    }
    if (!bubble?.target) return
    const el = document.querySelector(bubble.target)
    if (!el) return
    targetEl.current = el
    el.style.animation = 'wispyHighlight 1.6s ease-in-out infinite'
    el.style.borderRadius = el.style.borderRadius || '12px'
    return () => {
      if (el) {
        el.style.animation = ''
      }
    }
  }, [bubble?.id, bubble?.target])

  // Click-target advance: if advance === 'click_target', clicking the target
  // hides the bubble and emits the implicit 'target_clicked' event so
  // step orchestration can advance.
  useEffect(() => {
    if (!bubble?.target || bubble?.advance !== 'click_target') return
    const el = document.querySelector(bubble.target)
    if (!el) return
    function onClick() {
      ctx?.emit('target_clicked', { target: bubble.target, bubbleId: bubble.id })
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [bubble?.id, bubble?.target, bubble?.advance])

  if (!ctx || !bubble || ctx.dismissed) return null

  // Bubble lives BELOW Wispy inside the same drift container in
  // WispyProvider, so it follows her like a banner trailing from a
  // plane. Below (not above) so it never gets clipped at the top of
  // the viewport — Wispy floats near top: 80, and a tall bubble above
  // her would push off-screen.
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 14px)',      // sits below Wispy with a small gap
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        maxWidth: 340,
        minWidth: 180,
        animation: 'wispyBubbleIn 0.3s ease-out forwards',
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'auto',
      }}
    >
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.97)',
        border: '1.5px solid #ddd4f5',
        borderRadius: 18,
        padding: '12px 36px 12px 18px',
        boxShadow: '0 8px 28px rgba(120,100,200,0.22)',
        fontSize: 13,
        lineHeight: 1.5,
        color: '#251340',
        fontStyle: 'italic',
        fontWeight: 300,
      }}>
        <span>{typed}</span>
        <span style={{ opacity: typed.length < text.length ? 0.4 : 0 }}>▎</span>

        <button
          onClick={() => ctx.hideBubble()}
          aria-label="Close"
          style={{
            position: 'absolute', top: 6, right: 10,
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 14,
            color: '#a080e0', lineHeight: 1, padding: 2,
          }}
        >✕</button>

        {bubble.advance !== 'click_target' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                ctx.emit('bubble_skipped', { bubbleId: bubble.id })
                if (typeof bubble.onDismiss === 'function') bubble.onDismiss()
                ctx.hideBubble()
              }}
              style={{
                fontSize: 12, fontFamily: 'inherit',
                background: 'transparent', border: 'none',
                color: '#9080b8', cursor: 'pointer', padding: '4px 8px',
              }}
            >skip</button>
            <button
              onClick={() => {
                ctx.emit('bubble_advanced', { bubbleId: bubble.id })
                if (typeof bubble.onDismiss === 'function') bubble.onDismiss()
                ctx.hideBubble()
              }}
              style={{
                fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                background: '#b89adb', color: '#fff', border: 'none',
                borderRadius: 14, cursor: 'pointer', padding: '6px 14px',
                boxShadow: '0 2px 6px rgba(150,120,200,0.3)',
              }}
            >next</button>
          </div>
        )}

        {/* Arrow pointing UP toward Wispy — centered since the bubble
            sits directly below her in the drift container. */}
        <div style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '10px solid #ddd4f5',
        }} />
        <div style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderBottom: '9px solid rgba(255,255,255,0.97)',
        }} />
      </div>
    </div>
  )
}
