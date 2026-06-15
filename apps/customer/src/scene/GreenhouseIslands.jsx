import { useEffect, useMemo, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'

// ── Greenhouse floating islands ────────────────────────────────────
// On the Greenhouse mood, renders 2-3 watercolor greenhouse/arbor
// illustrations perched on cloud beds, drifting slowly across the sky.
// Think floating botanical gardens — Ghibli meets conservatory.
//
// Each island = a greenhouse JPG (mix-blend-mode: multiply to knock
// out the white background against the light Greenhouse sky) sitting
// above a cloud image. They drift left-to-right at cloud speed, wrap
// around when they go off-screen.

const GH_COUNT = 18
const ARBOR_COUNT = 23
const ghUrl = i => `/fx-greenhouse/greenhouse-${i}.jpg`
const arborUrl = i => `/fx-greenhouse/arbor-${i}.jpg`

function pickIslands() {
  // 2-3 islands, mix of greenhouses and arbors
  const count = 2 + Math.floor(Math.random() * 2)
  const islands = []
  for (let i = 0; i < count; i++) {
    const useArbor = Math.random() > 0.5
    const id = useArbor
      ? 1 + Math.floor(Math.random() * ARBOR_COUNT)
      : 1 + Math.floor(Math.random() * GH_COUNT)
    islands.push({
      src: useArbor ? arborUrl(id) : ghUrl(id),
      // Spread across the viewport vertically in the cloud zone
      y: 18 + i * 22 + Math.random() * 10,
      // Each starts at a different horizontal offset
      xStart: -10 + i * 40 + Math.random() * 20,
      // Drift speed (% of viewport per second)
      speed: 0.8 + Math.random() * 0.6,
      size: 10 + Math.random() * 6, // 10-16vw
      cloudShape: 1 + Math.floor(Math.random() * 30),
      flip: Math.random() > 0.5,
    })
  }
  return islands
}

function pad(n) { return String(n).padStart(2, '0') }

export default function GreenhouseIslands() {
  const { mood } = useMoodControl()
  const islandsRef = useRef([])
  const nodesRef = useRef([])
  const rafRef = useRef(null)

  const islands = useMemo(() => {
    if (mood !== 'Greenhouse') return []
    return pickIslands()
  }, [mood])

  // Store in ref for animation loop
  useEffect(() => { islandsRef.current = islands }, [islands])

  // Animation loop — drift islands left to right
  useEffect(() => {
    if (mood !== 'Greenhouse' || !islands.length) return
    let lastTime = performance.now()

    function animate(now) {
      const dt = (now - lastTime) / 1000
      lastTime = now
      islandsRef.current.forEach((island, i) => {
        island.xStart += island.speed * dt
        // Wrap around when fully off right side
        if (island.xStart > 110) island.xStart = -20
        const node = nodesRef.current[i]
        if (node) {
          node.style.transform = `translateX(${island.xStart}vw)${island.flip ? ' scaleX(-1)' : ''}`
        }
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mood, islands])

  if (mood !== 'Greenhouse' || !islands.length) return null

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 2,
      overflow: 'hidden',
    }}>
      {islands.map((island, i) => (
        <div
          key={i}
          ref={el => { nodesRef.current[i] = el }}
          style={{
            position: 'absolute',
            top: `${island.y}%`,
            left: 0,
            transform: `translateX(${island.xStart}vw)${island.flip ? ' scaleX(-1)' : ''}`,
            width: `${island.size}vw`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Greenhouse illustration */}
          <img
            src={island.src}
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              height: 'auto',
              mixBlendMode: 'multiply',
              opacity: 0.85,
              filter: 'saturate(1.1)',
              position: 'relative',
              zIndex: 1,
            }}
          />
          {/* Cloud bed underneath */}
          <img
            src={`/clouds/cloud-${pad(island.cloudShape)}.webp`}
            alt=""
            style={{
              width: '130%',
              height: 'auto',
              marginTop: '-18%',
              opacity: 0.7,
              filter: 'brightness(1.2)',
              position: 'relative',
              zIndex: 0,
            }}
          />
        </div>
      ))}
    </div>
  )
}
