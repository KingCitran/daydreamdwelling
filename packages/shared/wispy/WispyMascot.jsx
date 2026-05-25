import { useContext, useEffect, useState } from 'react'
import { WispyContext } from './WispyProvider.jsx'
import Idle from './poses/Idle.jsx'
import Talking from './poses/Talking.jsx'
import Pointing from './poses/Pointing.jsx'
import { useMoodControl } from '../ThemeProvider.jsx'

const FLAP_MS = 180
const BLINK_INTERVAL_MIN = 3000
const BLINK_INTERVAL_MAX = 7000
const BLINK_DURATION = 110

export default function WispyMascot() {
  const ctx = useContext(WispyContext)
  // useMoodControl reads from ThemeProvider's shared context so mood
  // changes from the picker propagate here. useMood() called directly
  // creates an isolated state branch — picker changes wouldn't show.
  const { mood } = useMoodControl()
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

  const { pose, dismissed, reopen, isMobile } = ctx

  // Dismissed-state mini-cloud — affordance to bring Wispy back. Stays
  // fixed in the corner instead of drifting (the parent drift container
  // is also conditionally rendered, so this fixed pos doesn't conflict).
  if (dismissed) {
    return (
      <button
        onClick={reopen}
        aria-label="Bring Wispy back"
        style={{
          position: 'fixed',
          right: 24, bottom: 24,
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

  // Active state — just render the art. The parent drift container in
  // WispyProvider handles positioning + horizontal animation; we just
  // bob inside it so she looks like she's floating on a breeze.
  const isSleeping = pose === 'sleeping'
  const isTalking = pose === 'talking'
  const isPointing = pose === 'pointing-left' || pose === 'pointing-right'
  const wispyWidth = isMobile ? 100 : 140

  let poseEl
  if (isPointing) {
    poseEl = <Pointing mood={mood} direction={pose === 'pointing-left' ? 'left' : 'right'} mouthOpen={mouthOpen && isTalking} eyeClosed={eyeClosed || isSleeping} width={wispyWidth} />
  } else if (isTalking) {
    poseEl = <Talking mood={mood} mouthOpen={mouthOpen} eyeClosed={eyeClosed} width={wispyWidth} />
  } else {
    poseEl = <Idle mood={mood} eyeClosed={eyeClosed || isSleeping} width={wispyWidth} />
  }

  return (
    <div style={{
      animation: isSleeping ? 'none' : 'wispyBob 3.5s ease-in-out infinite',
      pointerEvents: 'auto',
    }}>
      {poseEl}
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
