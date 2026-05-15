import { useContext, useEffect, useRef, useState } from 'react'
import { WispyContext } from './WispyProvider.jsx'

const TYPE_CHAR_MS = 22
const FALLBACK_DEFAULT_MS = 20_000

const BUBBLE_POSITIONS = {
  'bottom-right': { right: 24, bottom: 210 },
  'bottom-left':  { left: 24,  bottom: 210 },
  'top-right':    { right: 24, top: 210 },
  'top-left':     { left: 24,  top: 210 },
}

export default function WispyBubble() {
  const ctx = useContext(WispyContext)
  const [typed, setTyped] = useState('')
  const [showAdvance, setShowAdvance] = useState(false)
  const targetEl = useRef(null)
  const fallbackTimerRef = useRef(null)

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

  // Manual-advance button reveal (after fallback timeout, or immediately for manual)
  useEffect(() => {
    setShowAdvance(false)
    if (!bubble) return
    if (bubble.advance === 'manual_button' || bubble.advance === undefined) {
      setShowAdvance(true)
      return
    }
    const ms = bubble.fallback_after ?? FALLBACK_DEFAULT_MS
    fallbackTimerRef.current = setTimeout(() => setShowAdvance(true), ms)
    return () => clearTimeout(fallbackTimerRef.current)
  }, [bubble?.id])

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

  const position = bubble.position || ctx.position || 'bottom-right'
  const posStyle = BUBBLE_POSITIONS[position] || BUBBLE_POSITIONS['bottom-right']
  const arrowSide = position.includes('right') ? 'right' : 'left'

  return (
    <div
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 1001,
        maxWidth: 280,
        animation: 'wispyBubbleIn 0.3s ease-out forwards',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.97)',
        border: '1.5px solid #ddd4f5',
        borderRadius: 18,
        padding: '14px 36px 14px 18px',
        boxShadow: '0 8px 28px rgba(120,100,200,0.22)',
        fontSize: 14,
        lineHeight: 1.55,
        color: '#251340',
        fontStyle: 'italic',
        fontWeight: 300,
      }}>
        <span>{typed}</span>
        <span style={{ opacity: typed.length < text.length ? 0.4 : 0 }}>▎</span>

        <button
          onClick={() => ctx.dismiss()}
          aria-label="Dismiss Wispy"
          style={{
            position: 'absolute', top: 8, right: 10,
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 14,
            color: '#a080e0', lineHeight: 1, padding: 2,
          }}
        >✕</button>

        {showAdvance && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => ctx.emit('bubble_skipped', { bubbleId: bubble.id })}
              style={{
                fontSize: 12, fontFamily: 'inherit',
                background: 'transparent', border: 'none',
                color: '#9080b8', cursor: 'pointer', padding: '4px 8px',
              }}
            >skip</button>
            <button
              onClick={() => ctx.emit('bubble_advanced', { bubbleId: bubble.id })}
              style={{
                fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                background: '#b89adb', color: '#fff', border: 'none',
                borderRadius: 14, cursor: 'pointer', padding: '6px 14px',
                boxShadow: '0 2px 6px rgba(150,120,200,0.3)',
              }}
            >next</button>
          </div>
        )}

        {/* Arrow pointing down toward Wispy */}
        <div style={{
          position: 'absolute',
          bottom: -10,
          [arrowSide]: 32,
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid #ddd4f5',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -8,
          [arrowSide]: 33,
          width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '9px solid rgba(255,255,255,0.97)',
        }} />
      </div>
    </div>
  )
}
