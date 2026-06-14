import { useEffect, useRef, useState, useCallback } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'

// Moods where lightning can fire. Dark skies only — light moods would
// look wrong with white-on-transparent bolts.
const LIGHTNING_MOODS = new Set([
  'Northern Lights',
  'Neon Nights',
  'Moonlight',
  'Dark Academia',
])

const BOLT_COUNT = 12
const boltUrl = i => `/fx-lightning/bolt-${i}.png`

// Preload a bolt image so the flash isn't delayed by network.
function preloadBolt(idx) {
  const img = new Image()
  img.src = boltUrl(idx)
}

// ── Lightning overlay ──────────────────────────────────────────────
// Renders a fullscreen bolt PNG that flashes in briefly, fades out,
// then waits a random interval (8–25s) before firing again. Only
// active on dark moods. Each strike picks a random bolt + random
// horizontal position so it never feels repetitive.
//
// The bolt flashes ON instantly (0ms transition) for the "crack" feel,
// then fades to 0 over ~400ms. A second micro-flash can follow 100ms
// later at lower opacity for realism.

export default function LightningOverlay() {
  const { mood } = useMoodControl()
  const [flash, setFlash] = useState(null) // { bolt, x, opacity }
  const timerRef = useRef(null)
  const active = LIGHTNING_MOODS.has(mood)

  const strike = useCallback(() => {
    const bolt = Math.ceil(Math.random() * BOLT_COUNT)
    const x = Math.random() * 60 - 30 // -30% to +30% horizontal offset
    const flipX = Math.random() > 0.5

    // Preload the next random bolt so it's instant
    preloadBolt(Math.ceil(Math.random() * BOLT_COUNT))

    // Main flash
    setFlash({ bolt, x, flipX, opacity: 0.85 })

    // Fade out after 120ms
    setTimeout(() => setFlash(f => f ? { ...f, opacity: 0 } : null), 120)

    // Optional micro-reflash at 200ms (50% chance)
    if (Math.random() > 0.5) {
      setTimeout(() => setFlash(f => f ? { ...f, opacity: 0.4 } : null), 220)
      setTimeout(() => setFlash(f => f ? { ...f, opacity: 0 } : null), 300)
    }

    // Clear after fade completes
    setTimeout(() => setFlash(null), 600)
  }, [])

  useEffect(() => {
    if (!active) { setFlash(null); return }

    // Preload a bolt immediately
    preloadBolt(Math.ceil(Math.random() * BOLT_COUNT))

    function scheduleNext() {
      // Random interval: 8–25 seconds between strikes
      const delay = 8000 + Math.random() * 17000
      timerRef.current = setTimeout(() => {
        strike()
        scheduleNext()
      }, delay)
    }

    // First strike after a short random delay (2–6s)
    timerRef.current = setTimeout(() => {
      strike()
      scheduleNext()
    }, 2000 + Math.random() * 4000)

    return () => clearTimeout(timerRef.current)
  }, [active, strike])

  if (!flash) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2, // above SkyBackdrop + canvas, below UI
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <img
        src={boltUrl(flash.bolt)}
        alt=""
        style={{
          position: 'absolute',
          top: '-10%',
          left: `${50 + flash.x}%`,
          transform: `translateX(-50%)${flash.flipX ? ' scaleX(-1)' : ''}`,
          width: '80vw',
          maxWidth: 1400,
          height: 'auto',
          opacity: flash.opacity,
          transition: flash.opacity > 0 ? 'none' : 'opacity 0.4s ease-out',
          mixBlendMode: 'screen',
          filter: 'brightness(1.5)',
        }}
      />
      {/* Screen flash — brief white tint across the whole viewport */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(200,200,255,0.06)',
          opacity: flash.opacity > 0.3 ? 1 : 0,
          transition: flash.opacity > 0.3 ? 'none' : 'opacity 0.3s ease-out',
        }}
      />
    </div>
  )
}
