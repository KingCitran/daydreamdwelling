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

  // Airplane-banner style: bubble sits to the LEFT of Wispy (trailing
  // behind her left-to-right drift direction), centered vertically on
  // her body, attached by a short tether. Wide and short — banner-
  // shaped, not balloon-shaped. The tutorial skip/next buttons live in
  // a future orchestrator-only branch; ambient messages just get ✕.
  return (
    <div
      style={{
        position: 'absolute',
        right: 'calc(100% + 14px)',    // sits LEFT of Wispy with a small gap
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1001,
        maxWidth: 320,
        minWidth: 200,
        animation: 'wispyBubbleIn 0.3s ease-out forwards',
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'auto',
      }}
    >
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.97)',
        border: '1.5px solid #ddd4f5',
        borderRadius: 14,
        padding: '10px 30px 10px 14px',
        boxShadow: '0 6px 20px rgba(120,100,200,0.22)',
        fontSize: 12,
        lineHeight: 1.45,
        color: '#251340',
        fontStyle: 'italic',
        fontWeight: 400,
        whiteSpace: 'normal',
      }}>
        <span>{typed}</span>
        <span style={{ opacity: typed.length < text.length ? 0.4 : 0 }}>▎</span>

        <button
          onClick={() => {
            if (typeof bubble.onDismiss === 'function') bubble.onDismiss()
            ctx.hideBubble()
          }}
          aria-label="Close"
          style={{
            position: 'absolute', top: 5, right: 8,
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 12,
            color: '#a080e0', lineHeight: 1, padding: 2,
          }}
        >✕</button>

        {/* Right-edge arrow pointing INTO Wispy (rightward). */}
        <div style={{
          position: 'absolute',
          right: -10, top: '50%',
          transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop:    '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft:   '10px solid #ddd4f5',
        }} />
        <div style={{
          position: 'absolute',
          right: -8, top: '50%',
          transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop:    '9px solid transparent',
          borderBottom: '9px solid transparent',
          borderLeft:   '9px solid rgba(255,255,255,0.97)',
        }} />
      </div>
    </div>
  )
}
