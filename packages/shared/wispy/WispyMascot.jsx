import { useContext, useEffect, useState } from 'react'
import { WispyContext } from './WispyProvider.jsx'
import Idle from './poses/Idle.jsx'
import Talking from './poses/Talking.jsx'
import Pointing from './poses/Pointing.jsx'
import { useTheme } from '../ThemeProvider.jsx'
import { useMood } from '../useMood.js'
import { inkForBg } from './inkMode.js'

const FLAP_MS = 180
const BLINK_INTERVAL_MIN = 3000
const BLINK_INTERVAL_MAX = 7000
const BLINK_DURATION = 110

const POSITIONS = {
  'bottom-right': { right: 24, bottom: 24 },
  'bottom-left':  { left: 24,  bottom: 24 },
  'top-right':    { right: 24, top: 24 },
  'top-left':     { left: 24,  top: 24 },
}

export default function WispyMascot() {
  const ctx = useContext(WispyContext)
  const theme = useTheme()
  const { mood } = useMood()
  const ink = inkForBg(theme?.bg)
  const [mouthOpen, setMouthOpen] = useState(false)
  const [eyeClosed, setEyeClosed] = useState(false)

  // Mouth flap while talking
  useEffect(() => {
    if (!ctx) return
    if (ctx.pose !== 'talking') { setMouthOpen(false); return }
    const id = setInterval(() => setMouthOpen((p) => !p), FLAP_MS)
    return () => clearInterval(id)
  }, [ctx?.pose])

  // Random blink loop
  useEffect(() => {
    let cancelled = false
    function scheduleNext() {
      const delay = BLINK_INTERVAL_MIN + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN)
      setTimeout(() => {
        if (cancelled) return
        setEyeClosed(true)
        setTimeout(() => {
          if (cancelled) return
          setEyeClosed(false)
          scheduleNext()
        }, BLINK_DURATION)
      }, delay)
    }
    scheduleNext()
    return () => { cancelled = true }
  }, [])

  if (!ctx) return null

  const { pose, dismissed, reopen, position, isMobile, bubble } = ctx
  const posStyle = POSITIONS[position] || POSITIONS['bottom-right']

  if (dismissed) {
    // Collapsed cloud icon. Click to bring Wispy back.
    return (
      <button
        onClick={reopen}
        aria-label="Bring Wispy back"
        style={{
          position: 'fixed',
          ...posStyle,
          width: 56, height: 44,
          background: 'rgba(255,255,255,0.9)',
          border: '1.5px solid #ddd4f5',
          borderRadius: 26,
          padding: 0,
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 18px rgba(120,100,200,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <MiniCloud />
      </button>
    )
  }

  // Resolve which pose component to render. Sleeping/surprised/thinking
  // fall back to Idle visuals until those pose files exist (Phase 4 polish).
  const scale = isMobile ? 0.7 : 1
  const isSleeping = pose === 'sleeping'
  const isTalking = pose === 'talking'
  const isPointing = pose === 'pointing-left' || pose === 'pointing-right'
  // Bigger default so she actually catches the eye in the corner. v1
  // rendered at 140; user feedback was "hardly visible." 200 reads as a
  // proper companion without dominating the screen.
  const wispyWidth = 200

  let poseEl
  if (isPointing) {
    poseEl = <Pointing ink={ink} mood={mood} direction={pose === 'pointing-left' ? 'left' : 'right'} mouthOpen={mouthOpen && isTalking} eyeClosed={eyeClosed || isSleeping} width={wispyWidth} />
  } else if (isTalking) {
    poseEl = <Talking ink={ink} mood={mood} mouthOpen={mouthOpen} eyeClosed={eyeClosed} width={wispyWidth} />
  } else {
    poseEl = <Idle ink={ink} mood={mood} eyeClosed={eyeClosed || isSleeping} width={wispyWidth} />
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 1000,
        pointerEvents: bubble ? 'auto' : 'auto',
        animation: 'wispyIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      {/* Soft attention halo — gentle pulsing glow behind Wispy that draws
          the eye without being loud. Pauses when she's asleep so it
          matches her vibe. */}
      <div style={{
        position: 'absolute',
        inset: '8% 8% 12% 8%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, rgba(180,140,230,0.32) 0%, rgba(180,140,230,0.12) 40%, transparent 70%)',
        animation: isSleeping ? 'none' : 'wispyHalo 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: -1,
      }} />
      <div style={{
        animation: isSleeping ? 'none' : 'wispyBob 3.5s ease-in-out infinite',
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }}>
        {poseEl}
      </div>
    </div>
  )
}

function MiniCloud() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22">
      <ellipse cx="17" cy="14" rx="14" ry="7" fill="#fff"/>
      <ellipse cx="9"  cy="12" rx="6"  ry="5" fill="#fff"/>
      <ellipse cx="24" cy="11" rx="7"  ry="5" fill="#fff"/>
      <ellipse cx="14" cy="13" rx="1.2" ry="1.4" fill="#3a1a4a"/>
      <ellipse cx="20" cy="13" rx="1.2" ry="1.4" fill="#3a1a4a"/>
    </svg>
  )
}
