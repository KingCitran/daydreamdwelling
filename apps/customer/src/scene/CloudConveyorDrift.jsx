import { useEffect, useMemo, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'

// Per-mood theming. Add new entries to enable themed rendering for more moods —
// every mood not listed here renders raw photographic clouds.
const MOOD_THEMES = {
  'Dream State': {
    tintGradient: 'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
    tintShadow:   'drop-shadow(0 12px 24px rgba(120,80,180,0.20))',
    shadeOpacity: 0.88,
    shadeFilter:  'contrast(1.45) brightness(1.0)',
    glowOpacity:  0.40,
    glowFilter:   'brightness(1.4) contrast(0.9)',
  },
  'Golden Hour': {
    tintGradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    tintShadow:   'drop-shadow(0 12px 24px rgba(120,40,30,0.25))',
    shadeOpacity: 0.86,
    shadeFilter:  'contrast(1.4) brightness(1.0)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.85) sepia(0.25) saturate(1.3)',
  },
  'Moonlight': {
    tintGradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(8,12,28,0.55))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.55) brightness(0.92)',
    glowOpacity:  0.28,
    glowFilter:   'brightness(1.25) contrast(0.9) hue-rotate(200deg) saturate(0.55)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 70%)',
  },
  'Blush Hour': {
    tintGradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(180,72,122,0.28))',
    shadeOpacity: 0.82,
    shadeFilter:  'contrast(1.25) brightness(1.05)',
    glowOpacity:  0.48,
    glowFilter:   'brightness(1.45) contrast(0.85) saturate(1.15)',
  },
}
const DEFAULT_GLOW_MASK = 'linear-gradient(180deg, #fff 0%, #fff 38%, transparent 78%)'

const CLOUD_COUNT = 150
const EXCLUDED = new Set([37, 49, 51, 59, 68, 104])
const POOL = Array.from({ length: CLOUD_COUNT }, (_, i) => i + 1).filter(n => !EXCLUDED.has(n))

function rand(min, max) { return min + Math.random() * (max - min) }
function pickCloud() { return POOL[Math.floor(Math.random() * POOL.length)] }
function pad(n) { return String(n).padStart(3, '0') }

/**
 * Horizontal-drift cloud field for the room builder.
 *
 * - Default rendering: raw <img> (matches landing page) — natural photographic look.
 * - Dream State mood: 3-layer themed rendering (tint mask + multiply shade
 *   + screen glow) using the Dream State peach/pink/lavender gradient.
 *
 * Constrained to the bottom 78vh band; renders behind the room canvas.
 */
export default function CloudConveyorDrift() {
  const cloudsRef = useRef([])         // raw mode: refs to <img>
  const tintRefs = useRef([])
  const shadeRefs = useRef([])
  const glowRefs = useRef([])
  const { mood } = useMoodControl()
  const theme = MOOD_THEMES[mood]
  const isThemed = !!theme

  const clouds = useMemo(() => {
    const layers = [
      { count: 38, speed: [0.0009, 0.0024], scale: [0.45, 0.95], yMin:  2, yMax: 22 },
      { count: 32, speed: [0.0021, 0.0048], scale: [0.85, 1.55], yMin: 12, yMax: 38 },
      { count: 26, speed: [0.0042, 0.0084], scale: [1.30, 2.20], yMin: 25, yMax: 52 },
      { count: 18, speed: [0.0072, 0.0132], scale: [2.00, 3.20], yMin: 42, yMax: 70 },
      { count:  8, speed: [0.0090, 0.0165], scale: [3.50, 4.80], yMin: 55, yMax: 80 },
    ]
    const all = []
    layers.forEach(L => {
      for (let i = 0; i < L.count; i++) {
        all.push({
          xStart: rand(-25, 130),
          y: rand(L.yMin, L.yMax),
          scale: rand(L.scale[0], L.scale[1]),
          shape: pickCloud(),
          flip: Math.random() > 0.5,
          speed: rand(L.speed[0], L.speed[1]),
          yPhase: rand(0, Math.PI * 2),
          yFreq: rand(0.0003, 0.0009),
          yDrift: rand(-1.5, 1.5),
          opacity: rand(0.85, 1.0),
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
          `translate3d(${x}vw, ${c.y + yOff}vh, 0) scale(${c.scale})${c.flip ? ' scaleX(-1)' : ''}`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [clouds])

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height: '78vh',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0,
    }}>
      {clouds.map((c, idx) => {
        const num = pad(c.shape)
        const url = `url("/clouds/cloud-${num}.webp")`
        const layer = { position: 'absolute', inset: 0, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain', userSelect: 'none' }

        if (!isThemed) {
          // Raw photographic — natural look for non-Dream-State moods.
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
        }

        // Dream State: 3-layer themed rendering.
        return (
          <div
            key={idx}
            ref={el => { cloudsRef.current[idx] = el }}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 240,
              aspectRatio: '3 / 2',           // matches actual cloud aspect (~0.67 h/w)
              opacity: c.opacity,
              transformOrigin: 'center center',
              willChange: 'transform',
              isolation: 'isolate',
            }}
          >
            <div ref={el => { tintRefs.current[idx] = el }} style={{
              ...layer,
              WebkitMaskImage: url, maskImage: url,
              WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
              background: theme.tintGradient,
              filter: theme.tintShadow,
            }} />
            <div ref={el => { shadeRefs.current[idx] = el }} style={{
              ...layer,
              backgroundImage: url,
              mixBlendMode: 'multiply',
              opacity: theme.shadeOpacity,
              filter: theme.shadeFilter,
            }} />
            <div ref={el => { glowRefs.current[idx] = el }} style={{
              ...layer,
              backgroundImage: url,
              mixBlendMode: 'screen',
              opacity: theme.glowOpacity,
              filter: theme.glowFilter,
              WebkitMaskImage: theme.glowMask || DEFAULT_GLOW_MASK,
              maskImage: theme.glowMask || DEFAULT_GLOW_MASK,
            }} />
          </div>
        )
      })}
    </div>
  )
}
