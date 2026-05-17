import { useEffect, useMemo, useRef, useState } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { shouldDrapeAt, drapeForShape, drapeImgStyle, canDrapeOnCloud, DRAPE_WRAPPER_STYLE } from './cloudDrapes'
import { CLOUD_SHAPES, availableShapes, shapeUrl } from './cloudShapes'

// Dev cycle constants — see CloudConveyorPuffs.jsx for rationale.
const EE_SLOT_COUNT = 3
const EE_TICK_MS = 3500

// Drift-specific EE tuning. Drift doesn't have a depth concept, just a per-
// cloud scale (0.45 small-back .. 4.80 huge-foreground). For the cycle:
// - Pin the 3 EE slots to fixed (xVw, yVh, scale) tuples high on the screen.
// - Any non-EE cloud with scale above EE_HIDE_SCALE is hidden (kills the
//   foreground + mid clouds that would otherwise overlap the shapes).
// - Among the remaining back clouds, screen-space breathing radius keeps
//   even small clouds clear of the EE silhouettes.
const EE_HIDE_SCALE = 1.4
const EE_BREATHING_RADIUS = 720
const EE_BREATHING_INNER  = 0.78
const EE_SLOT_POSITIONS_DRIFT = [
  { xStart: 18, yVh: 12, scale: 0.65 },
  { xStart: 50, yVh:  8, scale: 0.70 },
  { xStart: 82, yVh: 12, scale: 0.65 },
]

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
  'Coastal Morning': {
    // Inverted: sun rising at horizon, lower-contrast fresh-morning lighting.
    // Cool steel-blue crown → pewter mid → warm peach underbelly. Less
    // saturated than Vivid Sunset; glow mask inverted to light underside.
    tintGradient: 'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
    tintShadow:   'drop-shadow(0 -3px 14px rgba(255,180,90,0.30)) drop-shadow(0 12px 22px rgba(40,70,110,0.35))',
    shadeOpacity: 0.62,
    shadeFilter:  'contrast(1.15) brightness(1.08)',
    glowOpacity:  0.50,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.22) saturate(1.15) hue-rotate(-4deg)',
    glowMask:     'linear-gradient(180deg, transparent 30%, #fff 70%, #fff 100%)',
  },
  'Greenhouse': {
    // Dappled glasshouse light — sun through glass roof, cream-green clouds.
    tintGradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    tintShadow:   'drop-shadow(0 10px 22px rgba(120,160,90,0.30)) drop-shadow(0 4px 14px rgba(255,240,180,0.32))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.30) brightness(1.02)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.9) sepia(0.18) saturate(1.15)',
  },
  'Neon Nights': {
    // Purple cloud bodies LIT BY EXTERNAL NEON — magenta from above, cyan from
    // below. The stacked colored drop-shadows on the tint paint light spill
    // into the surrounding sky so each cloud has its own magenta/cyan aura.
    tintGradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    tintShadow:   'drop-shadow(0 -8px 22px rgba(255,80,220,0.70)) drop-shadow(0 -5px 55px rgba(255,40,180,0.45)) drop-shadow(0 14px 32px rgba(80,160,255,0.55)) drop-shadow(0 6px 75px rgba(80,140,255,0.38)) drop-shadow(0 0 90px rgba(180,40,220,0.32))',
    shadeOpacity: 0.75,
    shadeFilter:  'contrast(1.4) brightness(0.95)',
    glowOpacity:  0.60,
    glowFilter:   'brightness(1.5) contrast(0.9) saturate(1.7) hue-rotate(280deg)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 30%, transparent 70%)',
  },
  'Vivid Sunset': {
    // Inverted: sun below horizon, clouds carry the saturation. Glow mask flipped
    // so the screened highlight lights the underbelly. Warmer-amber rim instead
    // of canary yellow; upward bloom reduced so it doesn't clip the band edge.
    tintGradient: 'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
    tintShadow:   'drop-shadow(0 -2px 9px rgba(255,140,90,0.28)) drop-shadow(0 14px 24px rgba(20,28,80,0.45))',
    shadeOpacity: 0.50,
    shadeFilter:  'contrast(1.3) brightness(1.1)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.30) saturate(1.3) hue-rotate(-8deg)',
    glowMask:     'linear-gradient(180deg, transparent 35%, #fff 75%, #fff 100%)',
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
export default function CloudConveyorDrift({ forceEasterEggs = false }) {
  const cloudsRef = useRef([])         // raw mode: refs to <img>
  const tintRefs = useRef([])
  const shadeRefs = useRef([])
  const glowRefs = useRef([])
  const { mood } = useMoodControl()
  const theme = MOOD_THEMES[mood]
  const isThemed = !!theme

  // Dev cycle: a few specific cloud slots become Easter-egg shapes,
  // rotating through availableShapes() (excluded ones already filtered).
  const [eeCursor, setEeCursor] = useState(0)
  const cyclePool = useMemo(() => availableShapes(), [forceEasterEggs])
  useEffect(() => {
    if (!forceEasterEggs || !cyclePool.length) return
    const total = Math.ceil(cyclePool.length / EE_SLOT_COUNT)
    const interval = setInterval(() => setEeCursor(c => (c + 1) % total), EE_TICK_MS)
    return () => clearInterval(interval)
  }, [forceEasterEggs, cyclePool.length])
  const visibleShapes = forceEasterEggs && cyclePool.length
    ? Array.from({ length: EE_SLOT_COUNT }, (_, slot) => cyclePool[(eeCursor * EE_SLOT_COUNT + slot) % cyclePool.length])
    : []

  const clouds = useMemo(() => {
    // Cloud counts bumped ~40% for higher density across the scene (sky
    // felt sparse, especially in moods like Greenhouse where lush is the
    // whole point). Adjust if performance suffers.
    const layers = [
      { count: 54, speed: [0.0009, 0.0024], scale: [0.45, 0.95], yMin:  2, yMax: 22 },
      { count: 45, speed: [0.0021, 0.0048], scale: [0.85, 1.55], yMin: 12, yMax: 38 },
      { count: 36, speed: [0.0042, 0.0084], scale: [1.30, 2.20], yMin: 25, yMax: 52 },
      { count: 25, speed: [0.0072, 0.0132], scale: [2.00, 3.20], yMin: 42, yMax: 70 },
      { count: 11, speed: [0.0090, 0.0165], scale: [3.50, 4.80], yMin: 55, yMax: 80 },
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

  // EE slot indices — three positions evenly spread across the first
  // (smallest / backmost) layer so the shape clouds sit small + far back.
  const eeSlotIndices = useMemo(
    () => Array.from({ length: EE_SLOT_COUNT }, (_, i) => Math.floor((i + 0.5) * 54 / EE_SLOT_COUNT)),
    []
  )
  const eeSlotSet = useMemo(() => new Set(eeSlotIndices), [eeSlotIndices])

  // Once on mount (and whenever EE mode toggles), pin the chosen cloud
  // slots to fixed (xStart, y, scale) so they don't drift away from the
  // top-row open-sky positions.
  useEffect(() => {
    if (!forceEasterEggs) return
    eeSlotIndices.forEach((cloudIdx, slot) => {
      const c = clouds[cloudIdx]
      const p = EE_SLOT_POSITIONS_DRIFT[slot]
      if (!c || !p) return
      c.xStart = p.xStart
      c.y = p.yVh
      c.scale = p.scale
      c.flip = false
      c.yDrift = 0                     // pinned — no vertical oscillation
      c.speed = 0.0006                 // very slow drift so the shape lingers
      c.opacity = 1                    // always full
    })
  }, [forceEasterEggs, clouds, eeSlotIndices])

  useEffect(() => {
    let raf
    let tick = 0
    const animate = () => {
      tick += 1
      const nodes = cloudsRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Pre-pass: EE slot screen centers for breathing-room math.
      let eePositions = null
      if (forceEasterEggs) {
        eePositions = eeSlotIndices.map(idx => {
          const c = clouds[idx]
          const xRaw = c.xStart + tick * c.speed
          const xv = ((xRaw % 160) + 160) % 160 - 30
          return { x: (xv / 100) * vw, y: (c.y / 100) * vh }
        })
      }

      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i]
        const node = nodes[i]
        if (!node) continue
        const xRaw = c.xStart + tick * c.speed
        const x = ((xRaw % 160) + 160) % 160 - 30
        const yOff = Math.sin(c.yPhase + tick * c.yFreq) * c.yDrift
        node.style.transform =
          `translate3d(${x}vw, ${c.y + yOff}vh, 0) scale(${c.scale})${c.flip ? ' scaleX(-1)' : ''}`
        // CSS var for drape counter-scale (uniform on-screen drape size).
        node.style.setProperty('--cs', String(c.scale))

        // EE breathing room (only when dev cycle is on).
        const isEe = forceEasterEggs && eeSlotSet.has(i)
        let breathing = 1
        if (forceEasterEggs && !isEe) {
          if (c.scale >= EE_HIDE_SCALE) {
            breathing = 0                         // hide all foreground / mid clouds
          } else if (eePositions) {
            const myScreenX = (x / 100) * vw
            const myScreenY = ((c.y + yOff) / 100) * vh
            for (const ee of eePositions) {
              const dx = myScreenX - ee.x
              const dy = myScreenY - ee.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < EE_BREATHING_RADIUS) {
                const local = dist / EE_BREATHING_RADIUS
                const fade = local < EE_BREATHING_INNER
                  ? 0
                  : (local - EE_BREATHING_INNER) / (1 - EE_BREATHING_INNER)
                breathing = Math.min(breathing, fade)
              }
            }
          }
        }
        node.style.opacity = String(c.opacity * breathing)
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [clouds, forceEasterEggs, eeSlotIndices, eeSlotSet])

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
        // EE slot when in dev cycle mode: the three indices computed in
        // eeSlotIndices (within the smallest/back layer). Everything else
        // stays as a regular cloud.
        const eeSlot = forceEasterEggs ? eeSlotIndices.indexOf(idx) : -1
        const u = (eeSlot >= 0 && visibleShapes[eeSlot])
          ? shapeUrl(visibleShapes[eeSlot])
          : `/clouds/cloud-${pad(c.shape)}.webp`
        const url = `url("${u}")`
        const layer = { position: 'absolute', inset: 0, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain', userSelect: 'none' }

        if (!isThemed) {
          // Raw photographic — natural look for non-themed moods.
          return (
            <img
              key={idx}
              ref={el => { cloudsRef.current[idx] = el }}
              src={u}
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
            {/* Drape rendered FIRST so cloud body layers below cover its top */}
            {mood === 'Greenhouse' && shouldDrapeAt(c.shape, c.y, 45) && (() => {
              const file = drapeForShape(c.shape)
              if (!canDrapeOnCloud(file, c.shape)) return null
              return (
                <div style={DRAPE_WRAPPER_STYLE}>
                  <img src={`/${file}`} alt="" style={drapeImgStyle(file)} draggable={false} />
                </div>
              )
            })()}
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
      {forceEasterEggs && visibleShapes.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '10px 16px', borderRadius: 999,
          background: 'rgba(20,15,38,0.94)',
          border: '1px solid rgba(200,168,255,0.5)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
          color: '#f0eaff',
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 11,
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 14,
          whiteSpace: 'nowrap',
          maxWidth: '92vw', overflowX: 'auto',
        }}>
          <span style={{ fontWeight: 700, color: '#c8a8ff', letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: 9 }}>
            EE Cycle · {eeCursor + 1}/{Math.ceil(cyclePool.length / EE_SLOT_COUNT)}
          </span>
          {visibleShapes.map((s, i) => (
            <span key={i} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
              {s.label} <span style={{ color: '#8a78a8', fontSize: 10 }}>({s.id})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
