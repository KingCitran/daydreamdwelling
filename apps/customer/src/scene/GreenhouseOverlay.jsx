import { useMemo } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'

// ── Greenhouse floral overlay ──────────────────────────────────────
// On the Greenhouse mood, renders cascading floral vines draping from
// the top edges of the viewport — like looking up through a glass roof
// with plants trailing down. Uses the Etsy cascading floral PNGs
// (30 images, black background → mix-blend-mode: screen).
//
// A random subset of 4-6 florals is chosen on mount, placed at random
// positions along the top edge, slightly overlapping the room view.

const FLORAL_COUNT = 30
const floralUrl = i => `/fx-florals/floral-${i}.png`

// Pick N random unique indices from 1..FLORAL_COUNT
function pickRandom(n) {
  const pool = Array.from({ length: FLORAL_COUNT }, (_, i) => i + 1)
  const picked = []
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

export default function GreenhouseOverlay() {
  const { mood } = useMoodControl()

  const florals = useMemo(() => {
    if (mood !== 'Greenhouse') return []
    const count = 4 + Math.floor(Math.random() * 3) // 4-6 florals
    return pickRandom(count).map((id, i, arr) => ({
      id,
      // Spread evenly across the top with some randomness
      left: (i / arr.length) * 80 + Math.random() * 15,
      top: -5 + Math.random() * 8,
      size: 14 + Math.random() * 10, // 14-24vw
      rotate: -15 + Math.random() * 30, // -15 to +15 deg
      flipX: Math.random() > 0.5,
      opacity: 0.7 + Math.random() * 0.25,
    }))
  }, [mood])

  if (mood !== 'Greenhouse' || !florals.length) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {florals.map(f => (
        <img
          key={f.id}
          src={floralUrl(f.id)}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: `${f.size}vw`,
            height: 'auto',
            transform: `rotate(${f.rotate}deg)${f.flipX ? ' scaleX(-1)' : ''}`,
            mixBlendMode: 'screen',
            opacity: f.opacity,
            filter: 'saturate(1.3) brightness(1.1)',
          }}
        />
      ))}
    </div>
  )
}
