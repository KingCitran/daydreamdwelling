import { useEffect, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'

// Slow falling neon "drops" for Neon Nights. Each drop is a tiny dot wrapped
// in a heavy colored glow — the drop shadow IS the dominant visible thing.
// Drops fall slowly straight down (with a very subtle horizontal sway) and a
// small bloom screen-blends over the cloud layer so clouds underneath pick
// up the drop's color as it passes through.
//
// Tuned to be ambient, not distracting — many small drops continuously fading
// in and out across the sky, like coloured rain that never really lands.

const NEON_PALETTE = [
  '#2adcff',  // cyan
  '#ff2ad8',  // magenta
  '#ff5a8a',  // hot pink
  '#9a78ff',  // electric purple
  '#5affe0',  // bright teal
]

const TARGET_DROPS    = 16      // simultaneous drops on screen
const STAGGER_MS      = 600     // base spawn cadence (jittered)
const SPEED_PX_MS_MIN = 0.030   // very slow — drops take 15-25s to cross
const SPEED_PX_MS_MAX = 0.060
const DOT_SIZE        = 3
const GLOW_RADIUS     = 26      // halo around the dot
const BLOOM_RADIUS    = 130     // wider screen-blended cloud-reflection halo
const SWAY_AMPLITUDE  = 18      // tiny horizontal drift in px
const SWAY_HZ_MIN     = 0.05
const SWAY_HZ_MAX     = 0.15

function rand(min, max) { return min + Math.random() * (max - min) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function NeonDrops() {
  const { mood } = useMoodControl()
  const containerRef = useRef(null)
  const dropsRef = useRef([])
  const lastSpawnRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (mood !== 'Neon Nights') return
    const container = containerRef.current
    if (!container) return

    function spawnDrop() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const color = pick(NEON_PALETTE)
      const x0 = rand(0, vw)
      const y0 = rand(-vh * 0.2, -20)
      const vy = rand(SPEED_PX_MS_MIN, SPEED_PX_MS_MAX)
      const swayHz = rand(SWAY_HZ_MIN, SWAY_HZ_MAX)
      const swayPhase = rand(0, Math.PI * 2)
      // Life: long enough to clear the screen at its speed
      const life = (vh + 200) / vy

      const dot = document.createElement('div')
      dot.style.cssText = `
        position: absolute;
        left: 0; top: 0;
        width: ${DOT_SIZE}px;
        height: ${DOT_SIZE}px;
        margin-left: ${-DOT_SIZE / 2}px;
        margin-top: ${-DOT_SIZE / 2}px;
        background: ${color};
        border-radius: 50%;
        filter:
          drop-shadow(0 0 ${GLOW_RADIUS / 4}px ${color})
          drop-shadow(0 0 ${GLOW_RADIUS / 2}px ${color})
          drop-shadow(0 0 ${GLOW_RADIUS}px ${color}cc);
        pointer-events: none;
        will-change: transform, opacity;
        opacity: 0;
        transition: opacity 1200ms ease-out;
      `

      const bloom = document.createElement('div')
      bloom.style.cssText = `
        position: absolute;
        left: 0; top: 0;
        width: ${BLOOM_RADIUS}px;
        height: ${BLOOM_RADIUS}px;
        margin-left: ${-BLOOM_RADIUS / 2}px;
        margin-top: ${-BLOOM_RADIUS / 2}px;
        background: radial-gradient(circle, ${color}44 0%, ${color}18 40%, transparent 75%);
        mix-blend-mode: screen;
        pointer-events: none;
        will-change: transform, opacity;
        opacity: 0;
        transition: opacity 1200ms ease-out;
      `

      container.appendChild(bloom)
      container.appendChild(dot)
      requestAnimationFrame(() => {
        dot.style.opacity = '1'
        bloom.style.opacity = '0.85'
      })

      dropsRef.current.push({
        dot, bloom, color,
        x0, y: y0, vy,
        swayHz, swayPhase,
        life, born: performance.now(),
        fadedOut: false,
      })
    }

    let last = performance.now()
    function tick(now) {
      const dt = Math.min(40, now - last)
      last = now
      const vh = window.innerHeight

      // Maintain a steady population. Spawn one drop per stagger window
      // until we hit the target, then back off.
      if (now - lastSpawnRef.current > STAGGER_MS * rand(0.6, 1.4)) {
        if (dropsRef.current.length < TARGET_DROPS) {
          spawnDrop()
          lastSpawnRef.current = now
        }
      }

      for (let i = dropsRef.current.length - 1; i >= 0; i--) {
        const d = dropsRef.current[i]
        d.y += d.vy * dt
        const ageS = (now - d.born) / 1000
        const sway = Math.sin(ageS * Math.PI * 2 * d.swayHz + d.swayPhase) * SWAY_AMPLITUDE
        const x = d.x0 + sway

        d.dot.style.transform = `translate3d(${x}px, ${d.y}px, 0)`
        d.bloom.style.transform = `translate3d(${x}px, ${d.y}px, 0)`

        // Begin fading out as the drop approaches the bottom of the viewport
        // so it dissolves rather than vanishes.
        if (!d.fadedOut && d.y > vh - 80) {
          d.fadedOut = true
          d.dot.style.opacity = '0'
          d.bloom.style.opacity = '0'
        }
        if (d.y > vh + 100) {
          d.dot.remove()
          d.bloom.remove()
          dropsRef.current.splice(i, 1)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      for (const d of dropsRef.current) {
        d.dot.remove()
        d.bloom.remove()
      }
      dropsRef.current = []
      lastSpawnRef.current = 0
    }
  }, [mood])

  if (mood !== 'Neon Nights') return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        isolation: 'isolate',
        zIndex: 1,
      }}
    />
  )
}
