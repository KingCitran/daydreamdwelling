import { useEffect, useMemo, useRef, useState } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { shouldDrapeAt, drapeForShape, drapeImgStyle, canDrapeOnCloud, DRAPE_WRAPPER_STYLE } from './cloudDrapes'
import { CLOUD_SHAPES, availableShapes, shapeUrl, shapeNoFlip, shapeClearanceVw } from './cloudShapes'

// Dev cycle constants — see CloudConveyorPuffs.jsx for rationale.
const EE_SLOT_COUNT = 3
const EE_TICK_MS = 3500

// Drift EE tuning — three slots drift through the upper + middle sky at
// normal cloud speed. Regular clouds within each shape's clearance radius
// (default DEFAULT_CLEARANCE_VW, per-shape override via SHAPE_CONFIG) get
// hidden so the silhouette stays readable.

// Per-mood theming. Add new entries to enable themed rendering for more moods —
// every mood not listed here renders raw photographic clouds.
const MOOD_THEMES = {
  'Dream State': {
    tintGradient: 'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
    eggTintGradient: 'linear-gradient(180deg, #ecc8b4 0%, #e8bcc0 22%, #dcb0c8 48%, #c098c4 72%, #ac8cbc 100%)',
    // v3: blur(1px) on every tint for cloudier silhouette edges.
    tintShadow:   'blur(1px) drop-shadow(0 12px 24px rgba(120,80,180,0.20))',
    shadeOpacity: 0.88,
    shadeFilter:  'contrast(1.45) brightness(1.0)',
    glowOpacity:  0.40,
    glowFilter:   'brightness(1.4) contrast(0.9)',
  },
  'Golden Hour': {
    tintGradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    eggTintGradient: 'linear-gradient(180deg, #ecc888 0%, #e0a868 22%, #c87850 48%, #a85856 72%, #884858 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 12px 24px rgba(120,40,30,0.25))',
    shadeOpacity: 0.86,
    shadeFilter:  'contrast(1.4) brightness(1.0)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.85) sepia(0.25) saturate(1.3)',
  },
  'Moonlight': {
    tintGradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    eggTintGradient: 'linear-gradient(180deg, #b8c0d4 0%, #a0acc4 22%, #7c8ca8 48%, #5e6c8c 72%, #404e74 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 14px 28px rgba(8,12,28,0.55))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.55) brightness(0.92)',
    glowOpacity:  0.28,
    glowFilter:   'brightness(1.25) contrast(0.9) hue-rotate(200deg) saturate(0.55)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 70%)',
  },
  'Blush Hour': {
    tintGradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    eggTintGradient: 'linear-gradient(180deg, #ecc4c8 0%, #ecb0c4 22%, #d894b0 48%, #b87898 72%, #985878 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 14px 28px rgba(180,72,122,0.28))',
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
    eggTintGradient: 'linear-gradient(180deg, #8898ac 0%, #98a4b4 22%, #b4b8b8 46%, #ccbcac 70%, #d0a890 92%, #cc9c84 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 -3px 14px rgba(255,180,90,0.30)) drop-shadow(0 12px 22px rgba(40,70,110,0.35))',
    shadeOpacity: 0.62,
    shadeFilter:  'contrast(1.15) brightness(1.08)',
    glowOpacity:  0.50,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.22) saturate(1.15) hue-rotate(-4deg)',
    glowMask:     'linear-gradient(180deg, transparent 30%, #fff 70%, #fff 100%)',
  },
  'Greenhouse': {
    // Dappled glasshouse light — sun through glass roof, cream-green clouds.
    tintGradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    eggTintGradient: 'linear-gradient(180deg, #e4c890 0%, #d8b06c 18%, #ccc09c 38%, #c4c4b0 56%, #a8b890 74%, #88a07c 92%, #7c9474 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 -3px 14px rgba(255,210,90,0.32)) drop-shadow(0 10px 22px rgba(120,160,90,0.30))',
    shadeOpacity: 0.65,
    shadeFilter:  'contrast(1.30) brightness(1.0)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.88) sepia(0.35) saturate(1.4)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 72%)',
  },
  'Neon Nights': {
    // Purple cloud bodies LIT BY EXTERNAL NEON — magenta from above, cyan from
    // below. The stacked colored drop-shadows on the tint paint light spill
    // into the surrounding sky so each cloud has its own magenta/cyan aura.
    tintGradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    eggTintGradient: 'linear-gradient(172deg, #c468c0 0%, #b85cc0 14%, #9450bc 30%, #6c48ac 48%, #543c9c 66%, #443488 82%, #3c3880 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 -8px 22px rgba(255,80,220,0.70)) drop-shadow(0 -5px 55px rgba(255,40,180,0.45)) drop-shadow(0 14px 32px rgba(80,160,255,0.55)) drop-shadow(0 6px 75px rgba(80,140,255,0.38)) drop-shadow(0 0 90px rgba(180,40,220,0.32))',
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
    eggTintGradient: 'linear-gradient(180deg, #4c5484 0%, #6c5090 22%, #8e5090 38%, #c45878 54%, #dc6478 68%, #dc7860 80%, #d88a4c 92%, #d49850 100%)',
    tintShadow:   'blur(1px) drop-shadow(0 -2px 9px rgba(255,140,90,0.28)) drop-shadow(0 14px 24px rgba(20,28,80,0.45))',
    shadeOpacity: 0.50,
    shadeFilter:  'contrast(1.3) brightness(1.1)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.35) saturate(1.4) hue-rotate(-8deg)',
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

  // EE slots: in dev cycle mode there are 3 slots cycling through the shape
  // pool every EE_TICK_MS; in normal (production) mode there's just ONE
  // slot showing a single random Easter-egg shape that doesn't change.
  const cyclePool = useMemo(() => availableShapes(), [forceEasterEggs])
  const [staticEeShape] = useState(() => {
    const pool = availableShapes()
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
  })
  const [eeCursor, setEeCursor] = useState(0)
  useEffect(() => {
    if (!forceEasterEggs || !cyclePool.length) return
    const total = Math.ceil(cyclePool.length / EE_SLOT_COUNT)
    const interval = setInterval(() => setEeCursor(c => (c + 1) % total), EE_TICK_MS)
    return () => clearInterval(interval)
  }, [forceEasterEggs, cyclePool.length])
  const visibleShapes = forceEasterEggs && cyclePool.length
    ? Array.from({ length: EE_SLOT_COUNT }, (_, slot) => cyclePool[(eeCursor * EE_SLOT_COUNT + slot) % cyclePool.length])
    : (staticEeShape ? [staticEeShape] : [])
  // Held in a ref so the animate raf can read the LATEST visible shapes
  // without depending on them (deps would tear down the raf every cycle).
  const visibleShapesRef = useRef(visibleShapes)
  useEffect(() => { visibleShapesRef.current = visibleShapes })

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

  // EE slot indices — positions within the first (smallest / backmost) layer
  // of 54. In dev mode that's 3 evenly-spread slots; in normal mode just 1
  // slot (so only one Easter-egg shape sails through the sky per page).
  const slotCount = forceEasterEggs ? EE_SLOT_COUNT : (staticEeShape ? 1 : 0)
  const eeSlotIndices = useMemo(
    () => Array.from({ length: slotCount }, (_, i) => Math.floor((i + 0.5) * 54 / Math.max(slotCount, 1))),
    [slotCount]
  )
  const eeSlotSet = useMemo(() => new Set(eeSlotIndices), [eeSlotIndices])

  // Re-profile the chosen cloud slots. Each slot lives in either the upper
  // or middle band; scale is derived from the band so a middle-band EE
  // cloud reads at the natural size for that row (not artificially small).
  // Word shapes skip the mirror flip via shapeNoFlip().
  // Runs in both prod (1 slot, static shape) and dev (3 slots cycling).
  useEffect(() => {
    if (!eeSlotIndices.length) return
    eeSlotIndices.forEach((cloudIdx, slot) => {
      const c = clouds[cloudIdx]
      if (!c) return
      // Pick y across upper + middle bands so the slot lands at varying
      // depths. Scale lerps from layer-0-back (small) at top to roughly
      // layer-2 (mid) at the bottom of the range, matching what a regular
      // cloud at that y would be.
      const y = rand(4, 42)
      const yNorm = (y - 4) / 38                          // 0..1 across band
      c.y = y
      c.scale = 0.55 + yNorm * (2.0 - 0.55)               // ~0.55 at top, ~2.0 at middle
      // Speed scales with the band too — middle clouds move a bit faster
      // (matches the brunt layer-1/2 range 0.0021-0.0084).
      c.speed = 0.0021 + yNorm * (0.0084 - 0.0021)
      c.yDrift = rand(-1.5, 1.5)
      c.yFreq = rand(0.0003, 0.0009)
      c.yPhase = rand(0, Math.PI * 2)
      const shape = visibleShapes[slot]
      c.flip = shape && shapeNoFlip(shape.filename) ? false : Math.random() > 0.5
      c.opacity = rand(0.9, 1.0)
      // xStart kept as-is — random spread across the screen on mount.
    })
  }, [clouds, eeSlotIndices]) // eslint-disable-line react-hooks/exhaustive-deps

  // When the cycle advances and a new shape lands on a slot, re-apply flip
  // for that slot since the new shape might disallow flipping.
  useEffect(() => {
    if (!forceEasterEggs) return
    eeSlotIndices.forEach((cloudIdx, slot) => {
      const c = clouds[cloudIdx]
      const shape = visibleShapes[slot]
      if (!c || !shape) return
      if (shapeNoFlip(shape.filename)) c.flip = false
    })
  }, [eeCursor, forceEasterEggs, eeSlotIndices]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let raf
    let tick = 0
    // Per-cloud previous-opacity cache so we only write to .style.opacity
    // when the value actually changes — eliminates the per-frame style
    // recalc storm that was causing the jerking on a 171-cloud field.
    const lastOpacity = new Array(clouds.length).fill(-1)

    const animate = () => {
      tick += 1
      const nodes = cloudsRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Pre-pass: live EE slot screen positions + per-shape clearance radii.
      // Reads from refs so a cycle-tick changing the shape doesn't tear down
      // the raf loop (the bug behind "resetting every 3-5 seconds").
      const liveSlots = eeSlotIndices
      const liveShapes = visibleShapesRef.current
      const hasEE = liveSlots.length > 0
      let eeClearings = null
      if (hasEE) {
        eeClearings = liveSlots.map((idx, slot) => {
          const c = clouds[idx]
          const xRaw = c.xStart + tick * c.speed
          const xv = ((xRaw % 160) + 160) % 160 - 30
          const yOff = Math.sin(c.yPhase + tick * c.yFreq) * c.yDrift
          const shape = liveShapes[slot]
          const clearanceVw = shape ? shapeClearanceVw(shape.filename) : 18
          return {
            xPx: (xv / 100) * vw,
            yPx: ((c.y + yOff) / 100) * vh,
            radiusPx: (clearanceVw / 100) * vw,
          }
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
        node.style.setProperty('--cs', String(c.scale))

        // Per-shape clearance: regular clouds within an EE silhouette's
        // radius fade out. EE slots themselves stay at full opacity.
        const isEe = hasEE && eeSlotSet.has(i)
        let breathing = 1
        if (eeClearings && !isEe) {
          const myX = (x / 100) * vw
          const myY = ((c.y + yOff) / 100) * vh
          for (let k = 0; k < eeClearings.length; k++) {
            const ee = eeClearings[k]
            const dx = myX - ee.xPx
            const dy = myY - ee.yPx
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < ee.radiusPx) {
              const local = dist / ee.radiusPx
              const fade = local < 0.65 ? 0 : (local - 0.65) / 0.35
              if (fade < breathing) breathing = fade
            }
          }
        }
        const opacity = c.opacity * breathing
        if (opacity !== lastOpacity[i]) {
          node.style.opacity = String(opacity)
          lastOpacity[i] = opacity
        }
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [clouds, eeSlotIndices, eeSlotSet])

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
        // EE slot: in dev mode any of the 3 cycle indices; in normal mode
        // just the single static slot. eeSlotIndices already encodes that.
        const eeSlot = eeSlotIndices.indexOf(idx)
        const isEeSlot = eeSlot >= 0 && visibleShapes[eeSlot]
        const u = isEeSlot
          ? shapeUrl(visibleShapes[eeSlot])
          : `/clouds/cloud-${pad(c.shape)}.webp`
        const url = `url("${u}")`
        const tintGradient = isEeSlot && theme?.eggTintGradient
          ? theme.eggTintGradient
          : theme?.tintGradient
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
              background: tintGradient,
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
