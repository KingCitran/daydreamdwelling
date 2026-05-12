import { useEffect, useMemo, useRef } from 'react'

const CLOUD_COUNT = 150
const EXCLUDED = new Set([37, 49, 59, 68, 104])
const CLOUD_POOL = Array.from({ length: CLOUD_COUNT }, (_, i) => i + 1).filter(n => !EXCLUDED.has(n))

function rand(min, max) { return min + Math.random() * (max - min) }
function pickCloud() { return CLOUD_POOL[Math.floor(Math.random() * CLOUD_POOL.length)] }

export default function CloudField() {
  const containerRef = useRef(null)
  const cloudsRef = useRef([])

  const clouds = useMemo(() => {
    const layers = [
      { count: 55, speed: [0.003, 0.008], scale: [0.45, 0.95], opacity: [0.50, 0.80], yBase: -40,  yRange: 1100 },
      { count: 50, speed: [0.007, 0.016], scale: [0.85, 1.55], opacity: [0.75, 0.95], yBase: 100,  yRange: 1500 },
      { count: 42, speed: [0.014, 0.028], scale: [1.30, 2.20], opacity: [0.88, 1.00], yBase: 500,  yRange: 1900 },
      { count: 28, speed: [0.024, 0.044], scale: [2.00, 3.20], opacity: [0.95, 1.00], yBase: 1200, yRange: 2400 },
      { count: 10, speed: [0.030, 0.055], scale: [3.50, 4.80], opacity: [0.98, 1.00], yBase: 1800, yRange: 2200 },
    ]
    const all = []
    layers.forEach((L) => {
      for (let i = 0; i < L.count; i++) {
        all.push({
          xStart:  rand(-25, 130),
          y:       L.yBase + Math.random() * L.yRange,
          yDrift:  rand(-12, 12),
          yPhase:  rand(0, Math.PI * 2),
          yFreq:   rand(0.0003, 0.0009),
          scale:   rand(L.scale[0], L.scale[1]),
          opacity: rand(L.opacity[0], L.opacity[1]),
          shape:   pickCloud(),
          flip:    Math.random() > 0.5,
          speed:   rand(L.speed[0], L.speed[1]),
        })
      }
    })
    return all
  }, [])

  useEffect(() => {
    let raf
    let tick = 0
    const animate = () => {
      tick += 1
      const nodes = cloudsRef.current
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i]
        const node = nodes[i]
        if (!node) continue
        const xRaw = c.xStart + tick * c.speed
        const x = ((xRaw % 160) + 160) % 160 - 30
        const yOff = Math.sin(c.yPhase + tick * c.yFreq) * c.yDrift
        node.style.transform =
          `translate3d(${x}vw, ${c.y + yOff}px, 0) scale(${c.scale})${c.flip ? ' scaleX(-1)' : ''}`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [clouds])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {clouds.map((c, idx) => {
        const num = String(c.shape).padStart(3, '0')
        return (
          <img
            key={idx}
            ref={el => { cloudsRef.current[idx] = el }}
            src={`/clouds/cloud-${num}.webp`}
            alt=""
            decoding="async"
            draggable={false}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 240,
              height: 'auto',
              opacity: c.opacity,
              transformOrigin: 'center center',
              willChange: 'transform',
              filter: 'drop-shadow(0 10px 28px rgba(60,90,140,0.22))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
