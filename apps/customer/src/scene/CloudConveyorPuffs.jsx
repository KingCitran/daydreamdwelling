import { useEffect, useMemo, useRef, useState } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { shouldDrape, drapeForShape, drapeImgStyle, canDrapeOnCloud, DRAPE_WRAPPER_STYLE } from './cloudDrapes'
import { CLOUD_SHAPES, shapeUrl } from './cloudShapes'

// Dev cycle constants — how many of the 150 puffs are Easter-egg slots at any
// moment (the rest stay as regular photo clouds), how often we advance to the
// next batch of shapes, and the minimum depth EE slots are pinned to (kept
// way in the back so they never crowd into the foreground). EE_Y_SKEW_RANGE
// also biases them toward the upper portion of the screen so the far slot
// reads as a distant horizon detail rather than a low-altitude blob.
const EE_SLOT_COUNT = 3
const EE_TICK_MS = 3500
const EE_BACK_DEPTH = 0.72          // recycle EE slots when they dip below this
const EE_Y_SKEW_MIN = -40           // ySkewVh bias range for EE slots — both
const EE_Y_SKEW_MAX = -10           // negative so EE clouds always sit high

// Per-mood cloud theming. Only moods listed here get the 3-layer themed
// rendering — every other mood renders raw photographic clouds. Each entry
// matches the cloud-design handoff for that mood (gradient, drop-shadow,
// shade & glow blend params).
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
    // Flipped: plum/shadow at top, sunlit cream-gold at bottom (lit from below).
    tintGradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    tintShadow:   'drop-shadow(0 12px 24px rgba(120,40,30,0.25))',
    shadeOpacity: 0.86,
    shadeFilter:  'contrast(1.4) brightness(1.0)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.85) sepia(0.25) saturate(1.3)',
  },
  'Moonlight': {
    // Moon high → cloud crowns lit (silver), undersides deep navy. Low contrast,
    // dim glow — moonlight is ~400,000× dimmer than sun.
    tintGradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(8,12,28,0.55))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.55) brightness(0.92)',
    glowOpacity:  0.28,
    glowFilter:   'brightness(1.25) contrast(0.9) hue-rotate(200deg) saturate(0.55)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 70%)',
  },
  'Blush Hour': {
    // Cream crown → bubblegum body → magenta-rose shadow. Soft pillowy lighting,
    // no warm/yellow stops (would muddy the pink). Lower shade contrast for
    // a softer pillowy read.
    tintGradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(180,72,122,0.28))',
    shadeOpacity: 0.82,
    shadeFilter:  'contrast(1.25) brightness(1.05)',
    glowOpacity:  0.48,
    glowFilter:   'brightness(1.45) contrast(0.85) saturate(1.15)',
  },
  'Coastal Morning': {
    // Inverted lighting: sun rising AT the horizon, so light comes from below.
    // Lower-contrast and more atmospheric than Vivid Sunset — fresh morning,
    // not dramatic sky. Cool steel-blue crown → neutral pewter mid → warm
    // peach-gold underbelly. Less saturated; light blue is the shadow color,
    // not magenta. Glow mask inverted to light the underside.
    tintGradient: 'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
    tintShadow:   'drop-shadow(0 -3px 14px rgba(255,180,90,0.30)) drop-shadow(0 12px 22px rgba(40,70,110,0.35))',
    shadeOpacity: 0.62,
    shadeFilter:  'contrast(1.15) brightness(1.08)',
    glowOpacity:  0.50,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.22) saturate(1.15) hue-rotate(-4deg)',
    glowMask:     'linear-gradient(180deg, transparent 30%, #fff 70%, #fff 100%)',
  },
  'Greenhouse': {
    // Dappled glasshouse light — sun streaming through glass roof onto soft
    // cream-green clouds. Lit from above (standard glow mask). Warm cream
    // crown, green-tinted body, deeper forest-green underbelly reflecting the
    // leaves below. Bright, optimistic, fresh.
    tintGradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    tintShadow:   'drop-shadow(0 10px 22px rgba(120,160,90,0.30)) drop-shadow(0 4px 14px rgba(255,240,180,0.32))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.30) brightness(1.02)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.9) sepia(0.18) saturate(1.15)',
  },
  'Neon Nights': {
    // Purple cloud bodies LIT BY EXTERNAL NEON — hot magenta from above,
    // cyan reflection from below. Amplified drop-shadow stack so each cloud
    // bleeds significantly more colored light into the surrounding sky.
    tintGradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    tintShadow:   'drop-shadow(0 -8px 22px rgba(255,80,220,0.70)) drop-shadow(0 -5px 55px rgba(255,40,180,0.45)) drop-shadow(0 14px 32px rgba(80,160,255,0.55)) drop-shadow(0 6px 75px rgba(80,140,255,0.38)) drop-shadow(0 0 90px rgba(180,40,220,0.32))',
    shadeOpacity: 0.75,
    shadeFilter:  'contrast(1.4) brightness(0.95)',
    glowOpacity:  0.60,
    glowFilter:   'brightness(1.5) contrast(0.9) saturate(1.7) hue-rotate(280deg)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 30%, transparent 70%)',
  },
  'Vivid Sunset': {
    // Inverted lighting: sun has dropped below the horizon, so clouds carry the
    // full color story (deep blue crown → violet → magenta → hot pink → coral →
    // amber underbelly). Sky is muted; clouds are the saturation. The glow mask
    // is INVERTED so the screened highlight lands on the cloud's underside.
    // Gold/yellow rim pulled back to amber so the warm zone doesn't dominate.
    tintGradient: 'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
    // Upward bloom dialed back (was -4px/16px) so it doesn't clip the drift
    // band's top edge.
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
const EXCLUDED = new Set([37, 49, 51, 59, 68, 104])  // bad clouds for Dream State (and shared across moods for now)
const POOL = Array.from({ length: CLOUD_COUNT }, (_, i) => i + 1).filter(n => !EXCLUDED.has(n))

const PUFF_COUNT = 150             // slightly denser — one new puff renders every ~2.5s instead of ~3s
const TRAVEL_SECONDS = 380         // very slow drift — about 6 minutes per cycle
const BAND_HEIGHT_VH = 67          // bottom 2/3 of screen — top 1/3 stays clear

const SCALE_BACK = 0.30            // smaller at the back — many tiny lines at the horizon
const SCALE_FRONT = 3.20           // bigger up close — more dramatic foreground clouds

const PEAK_TOP_BACK_VH = 75        // back peak — high; with overflow:visible there's no clipping risk
const PEAK_TOP_PAST_VH = -40       // sinks well below — wide Y span between adjacent depth layers

const FADE_IN_RANGE = 0.035       // very short fade-in — new puffs become visible quickly
const FADE_OUT_RANGE = 0.06       // short fade-out so departing puffs free up density faster
const RECYCLE_AT_DEPTH = -0.12
const STARTUP_RAMP_SECONDS = 5    // soft global fade-in at mount so the initial pile isn't dumped all at once

const PUFF_WIDTH_BACK_VW = 18      // smaller natural size at the back
const PUFF_WIDTH_FRONT_VW = 70     // big natural size up close

const X_SPAWN_MIN_VW = -50         // wider spawn = more spacing across the horizontal
const X_SPAWN_MAX_VW = 150

const SWAY_PX_MIN = 0              // no sway — motion is purely down + out
const SWAY_PX_MAX = 0
const X_OUTWARD_DRIFT = 0.25       // gentler outward drift — too much created visible side imbalance

function rand(min, max) { return min + Math.random() * (max - min) }
function pickPuff(notMatching) {
  for (let i = 0; i < 8; i++) {
    const n = POOL[Math.floor(Math.random() * POOL.length)]
    if (n !== notMatching) return n
  }
  return POOL[Math.floor(Math.random() * POOL.length)]
}
function pad(n) { return String(n).padStart(3, '0') }

/**
 * Variant of CloudConveyor that uses the 150 individual puff-cloud sprites
 * from the landing-page asset pool (/clouds/cloud-NNN.webp). Each puff is a
 * small soft cloud shape with feathered edges — they layer naturally without
 * needing aggressive bottom-clipping, so 40+ scattered puffs at varying
 * depths read as a dense painterly field.
 *
 * Lifecycle is the same as CloudConveyor: each puff spawns at the back
 * (depth=1, small, faded, near horizon), advances forward, sinks below the
 * bottom edge as it nears the camera, then recycles with a new image and
 * a new random horizontal position.
 */
export default function CloudConveyorPuffs({ forceEasterEggs = false }) {
  const wrapRefs = useRef([])         // wrapper div per puff — animation target
  const tintRefs = useRef([])         // tint layer (mask source = cloud silhouette)
  const shadeRefs = useRef([])        // shade layer (multiply blend)
  const glowRefs = useRef([])         // glow layer (screen blend, top-half mask)
  const stateRef = useRef(null)
  const { mood } = useMoodControl()
  // Themed rendering only applies to moods explicitly listed in MOOD_THEMES
  // (Dream State, Golden Hour, ...). All other moods render raw photographic
  // clouds — natural look, unchanged from before the theming work.
  const theme = MOOD_THEMES[mood]
  const isThemed = !!theme

  // Dev cycle mode: only EE_SLOT_COUNT specific puff slots are replaced with
  // Easter-egg shapes at any time — the rest stay regular clouds so the field
  // reads clearly. A timer advances the batch every EE_TICK_MS so all shapes
  // in CLOUD_SHAPES get airtime in turn. EE slot puffs are pinned to the back
  // half (depth >= EE_BACK_DEPTH) so they never drift up close where they'd
  // dominate the field and become hard to assess.
  const eeSlotIndices = useMemo(
    () => Array.from({ length: EE_SLOT_COUNT }, (_, i) => Math.floor((i + 0.5) * PUFF_COUNT / EE_SLOT_COUNT)),
    []
  )
  const eeSlotSet = useMemo(() => new Set(eeSlotIndices), [eeSlotIndices])
  const [eeCursor, setEeCursor] = useState(0)
  const visibleShapes = forceEasterEggs && CLOUD_SHAPES.length
    ? Array.from({ length: EE_SLOT_COUNT }, (_, slot) => CLOUD_SHAPES[(eeCursor * EE_SLOT_COUNT + slot) % CLOUD_SHAPES.length])
    : []
  const cloudUrlFor = (puffIdx, puffNum) => {
    if (forceEasterEggs && CLOUD_SHAPES.length) {
      const slot = eeSlotIndices.indexOf(puffIdx)
      if (slot >= 0) return shapeUrl(visibleShapes[slot])
    }
    return `/clouds/cloud-${pad(puffNum)}.webp`
  }

  // Advance the shape cursor on a timer when dev mode is on.
  useEffect(() => {
    if (!forceEasterEggs || !CLOUD_SHAPES.length) return
    const totalBatches = Math.ceil(CLOUD_SHAPES.length / EE_SLOT_COUNT)
    const interval = setInterval(
      () => setEeCursor(c => (c + 1) % totalBatches),
      EE_TICK_MS
    )
    return () => clearInterval(interval)
  }, [forceEasterEggs])

  // When eeCursor advances, the JSX re-renders but the per-frame raf loop
  // owns the live styles, so the shape-slot puffs' URLs need a manual push.
  useEffect(() => {
    if (!forceEasterEggs) return
    eeSlotIndices.forEach((puffIdx, slot) => {
      const shape = visibleShapes[slot]
      if (!shape) return
      const u = shapeUrl(shape)
      const url = `url("${u}")`
      if (tintRefs.current[puffIdx])  { tintRefs.current[puffIdx].style.webkitMaskImage = url; tintRefs.current[puffIdx].style.maskImage = url }
      if (shadeRefs.current[puffIdx]) shadeRefs.current[puffIdx].style.backgroundImage = url
      if (glowRefs.current[puffIdx])  glowRefs.current[puffIdx].style.backgroundImage = url
      const wrap = wrapRefs.current[puffIdx]
      if (wrap && wrap.tagName === 'IMG') wrap.src = u
    })
  }, [eeCursor, forceEasterEggs, eeSlotIndices]) // eslint-disable-line react-hooks/exhaustive-deps

  // One-shot cache warm-up at mount: download all 145 puff images so subsequent
  // src swaps during recycle don't hitch from network/decode work. No `.decode()`
  // (would force GPU bitmap allocation = memory pressure spike). No setTimeout
  // staggering (caused ongoing flashing during the first few seconds). Just
  // network warm — most reliable.
  useEffect(() => {
    POOL.forEach(n => {
      const preloader = new Image()
      preloader.src = `/clouds/cloud-${pad(n)}.webp`
    })
  }, [])

  const initial = useMemo(() => {
    const arr = []
    let lastImg = -1
    // Stratify xVw too — pair each depth slot with a randomly-picked x slot
    // so horizontal coverage is always perfectly even AND uncorrelated to depth.
    // Each puff keeps its xVw across recycles (see tick) so coverage is preserved.
    const xRange = X_SPAWN_MAX_VW - X_SPAWN_MIN_VW
    const xSlots = Array.from({ length: PUFF_COUNT }, (_, i) => i)
    for (let i = xSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[xSlots[i], xSlots[j]] = [xSlots[j], xSlots[i]]
    }
    for (let i = 0; i < PUFF_COUNT; i++) {
      // Evenly stratified depths with tiny jitter — ensures the depth
      // distribution starts perfectly uniform so no part of the screen has
      // a "missing wave" of puffs that would leave a visible gap.
      const isEe = forceEasterEggs && eeSlotSet.has(i)
      const depth = isEe
        ? rand(EE_BACK_DEPTH, 1.0)                              // EE slots seed in the back band so the user sees them small from frame 0
        : ((i + 0.5) / PUFF_COUNT + rand(-0.01, 0.01)) % 1
      const img = pickPuff(lastImg)
      lastImg = img
      const xVw = X_SPAWN_MIN_VW + (xSlots[i] + 0.5) / PUFF_COUNT * xRange + rand(-2, 2)
      arr.push({
        depth,
        img,
        speed: 1 / (TRAVEL_SECONDS * rand(0.99, 1.015)),
        xVw,                                                   // FIXED for lifetime — see tick recycle
        ySkewVh: isEe ? rand(EE_Y_SKEW_MIN, EE_Y_SKEW_MAX) : rand(-38, 11),
        sizeJitter: isEe ? rand(0.35, 0.7) : rand(0.25, 1.45), // EE slots shrink so they read as far/atmospheric
        xPhase: rand(0, Math.PI * 2),
        xSwayHz: rand(0.04, 0.09),
        xSwayPx: rand(SWAY_PX_MIN, SWAY_PX_MAX),
      })
    }
    return arr
  }, [forceEasterEggs, eeSlotSet])

  useEffect(() => {
    const mountSecs = performance.now() / 1000
    stateRef.current = initial.map(s => ({ ...s, t0: mountSecs }))
    let raf
    let last = performance.now()

    // Helper used both inside apply() and in the pre-pass that computes EE
    // slot screen positions for the breathing-room fade.
    const computeCenterScreenPos = (s, now, vw, vh) => {
      const t = 1 - s.depth
      const xFromCenter = s.xVw - 50
      const driftedXVw = 50 + xFromCenter * (1 + t * X_OUTWARD_DRIFT)
      const time = now / 1000 - s.t0
      const xSway = Math.sin(s.xPhase + time * s.xSwayHz * 2 * Math.PI) * s.xSwayPx
      const screenX = (driftedXVw / 100) * vw + xSway
      const peakTopVh = PEAK_TOP_BACK_VH + t * (PEAK_TOP_PAST_VH - PEAK_TOP_BACK_VH) + s.ySkewVh
      const screenY = (peakTopVh / 100) * vh
      return { x: screenX, y: screenY }
    }

    // CSS width is fixed at PUFF_WIDTH_FRONT_VW; we shrink via transform scale.
    // Animation only mutates `transform` and `opacity` — both compositor-only,
    // no layout. With 240 sprites this keeps things smooth and flicker-free.
    const apply = (i, s, now, vw, vh, breathingFactor = 1) => {
      const node = wrapRefs.current[i]
      if (!node) return
      const t = 1 - s.depth                                    // 0=back, 1=front, >1=past

      // Width-derived scale (grows linearly with depth)
      const puffWidthVw = PUFF_WIDTH_BACK_VW + t * (PUFF_WIDTH_FRONT_VW - PUFF_WIDTH_BACK_VW)
      const widthScale = puffWidthVw / PUFF_WIDTH_FRONT_VW * s.sizeJitter
      const widthPx = (puffWidthVw / 100) * vw * s.sizeJitter
      const heightPx = widthPx * 0.75                          // approx puff aspect

      // Visible peak Y for this puff (lerps from horizon → below screen)
      const peakTopVh = PEAK_TOP_BACK_VH + t * (PEAK_TOP_PAST_VH - PEAK_TOP_BACK_VH) + s.ySkewVh
      const peakTopPx = (peakTopVh / 100) * vh

      // The puff PNGs have transparent space ABOVE the visible cloud body —
      // the actual cloud content occupies roughly the bottom 65% of each image.
      // Without compensation, anchoring the IMAGE top at peakTopPx makes the
      // visible cloud appear ~35% of the image height LOWER than intended.
      // Lift the image so its visual cloud top lands at peakTopPx instead.
      // Conservative value (0.22) — some cloud assets have less transparent
      // area at the top than others, so a smaller lift means the assumption
      // erring on the side of visual-cloud-being-LOWER than peak avoids the
      // hard-line clipping when peakTopPx + offset overshoots the container cap.
      const VISUAL_TOP_OFFSET_FRAC = 0.22
      const bottomPx = peakTopPx - heightPx * (1 - VISUAL_TOP_OFFSET_FRAC)
      const tyPx = -bottomPx                                   // CSS Y positive = down

      // Outward drift — as puffs advance toward the viewer (t→1), their X
      // position drifts further from screen center than where they spawned.
      // Mimics how clouds in real perspective spread outward as they near you.
      const xFromCenter = s.xVw - 50
      const driftedXVw = 50 + xFromCenter * (1 + t * X_OUTWARD_DRIFT)

      // Horizontal: image is at left:0, width = PUFF_WIDTH_FRONT_VW. We translate
      // into position. Visual center after scale needs to land at the desired X.
      const time = now / 1000 - s.t0
      const xSway = Math.sin(s.xPhase + time * s.xSwayHz * 2 * Math.PI) * s.xSwayPx
      const desiredCenterPx = (driftedXVw / 100) * vw + xSway
      // Image's natural visual center at scale s sits at: txPx + (PUFF_WIDTH_FRONT_VW vw)/2
      // where txPx is our translateX. Solve for txPx.
      const baseWidthPx = (PUFF_WIDTH_FRONT_VW / 100) * vw
      const txPx = desiredCenterPx - baseWidthPx / 2

      const fadeIn  = Math.min(1, Math.max(0, (1 - s.depth) / FADE_IN_RANGE))
      const fadeOut = Math.min(1, Math.max(0, (s.depth + 0.05) / FADE_OUT_RANGE))
      // Global intro ramp — fades the entire field in smoothly at mount so
      // 175 puffs don't appear simultaneously on the very first frame.
      const elapsedSinceMount = now / 1000 - mountSecs
      const introRamp = Math.min(1, elapsedSinceMount / STARTUP_RAMP_SECONDS)
      const opacity = fadeIn * fadeOut * introRamp * breathingFactor

      node.style.transform = `translate3d(${txPx}px, ${tyPx}px, 0) scale(${widthScale})`
      node.style.opacity = String(opacity)
      // CSS var for drape counter-scale: drapes read this to keep their
      // on-screen size roughly uniform regardless of cloud depth/jitter.
      node.style.setProperty('--cs', String(widthScale))
      // Only write z-index when the bucket actually changes. Per-frame z-index
      // churn forces the compositor to reshuffle stacking layers every tick,
      // which is one of the contributors to flashing — particularly with
      // drop-shadow filters that promote each sprite to its own layer.
      const newZ = Math.floor(t * 200)
      if (s.lastZ !== newZ) {
        node.style.zIndex = String(newZ)
        s.lastZ = newZ
      }
    }

    // Screen-space radius around each EE slot inside which regular puffs
    // fully fade out — gives the shape clouds an exposed, open-sky frame.
    const EE_BREATHING_RADIUS = 520

    const tick = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000)
      last = now
      const arr = stateRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Pre-pass: compute EE slot screen centers so the per-puff breathing
      // calculation in apply() can fade out neighbors.
      let eePositions = null
      if (forceEasterEggs && eeSlotIndices.length) {
        eePositions = eeSlotIndices.map(idx => computeCenterScreenPos(arr[idx], now, vw, vh))
      }

      for (let i = 0; i < arr.length; i++) {
        const s = arr[i]
        s.depth -= s.speed * delta
        // EE slot puffs recycle early so they stay in the back half — never
        // drift up close where their shape would dominate the field.
        const isEe = forceEasterEggs && eeSlotSet.has(i)
        const recycleAt = isEe ? EE_BACK_DEPTH : RECYCLE_AT_DEPTH
        if (s.depth < recycleAt) {
          s.depth = 1.0
          s.img = pickPuff(s.img)
          s.speed = 1 / (TRAVEL_SECONDS * rand(0.99, 1.015))
          s.t0 = now / 1000
          // KEEP s.xVw — each puff stays at its assigned lateral slot across
          // recycles. This is what prevents horizontal gaps from emerging
          // between waves over time (random re-rolling causes clusters/gaps).
          // EE slots bias upward so the far one sits high on the horizon
          // and the closer slot still reads as a distant detail.
          s.ySkewVh = isEe ? rand(EE_Y_SKEW_MIN, EE_Y_SKEW_MAX) : rand(-38, 10)
          // Also shrink EE slot sizeJitter so they read smaller / farther
          // even at depth=0.72.
          s.sizeJitter = isEe ? rand(0.35, 0.7) : rand(0.25, 1.45)
          s.xPhase = rand(0, Math.PI * 2)
          s.xSwayHz = rand(0.04, 0.09)
          s.xSwayPx = rand(SWAY_PX_MIN, SWAY_PX_MAX)
          // Update image reference. In themed mode, mutate all 3 layers.
          // In raw mode, the wrapper IS the <img> so set its src directly.
          const u = cloudUrlFor(i, s.img)
          const url = `url("${u}")`
          if (tintRefs.current[i]) {
            tintRefs.current[i].style.webkitMaskImage = url
            tintRefs.current[i].style.maskImage = url
          }
          if (shadeRefs.current[i]) shadeRefs.current[i].style.backgroundImage = url
          if (glowRefs.current[i]) glowRefs.current[i].style.backgroundImage = url
          const wrap = wrapRefs.current[i]
          if (wrap && wrap.tagName === 'IMG') {
            wrap.src = u
          }
        }
        // Breathing room: regular puffs near an EE slot fade out so the
        // shape gets exposed open-sky space around it.
        let breathing = 1
        if (eePositions && !isEe) {
          const me = computeCenterScreenPos(s, now, vw, vh)
          for (const ee of eePositions) {
            const dx = me.x - ee.x
            const dy = me.y - ee.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < EE_BREATHING_RADIUS) {
              const local = dist / EE_BREATHING_RADIUS              // 0..1
              breathing = Math.min(breathing, local)
            }
          }
        }
        apply(i, s, now, vw, vh, breathing)
      }
      raf = requestAnimationFrame(tick)
    }

    const vw0 = window.innerWidth
    const vh0 = window.innerHeight
    const start = performance.now()
    for (let i = 0; i < stateRef.current.length; i++) apply(i, stateRef.current[i], start, vw0, vh0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [initial])

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height: `${BAND_HEIGHT_VH}vh`,
      pointerEvents: 'none',
      // overflow:visible — letting clouds extend slightly past the band's
      // logical top edge avoids the hard horizontal slicing line. The peak
      // ceiling (PEAK_TOP_BACK_VH + ySkewVh max) is tuned to keep visible
      // cloud content roughly within the bottom 2/3, but soft fluffy edges
      // can naturally feather past — much better than a hard cap.
      overflow: 'visible',
      zIndex: 0,
    }}>
      {initial.map((s, idx) => {
        const u = cloudUrlFor(idx, s.img)
        const url = `url("${u}")`
        const layer = { position: 'absolute', inset: 0, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain', userSelect: 'none' }
        // Raw photographic rendering for all moods EXCEPT themed ones. EE
        // slots go through the themed pipeline too so they tonally match
        // the surrounding clouds — the whole point of the cycle is judging
        // visual fit, which requires same gradient treatment.
        if (!isThemed) {
          return (
            <img
              key={idx}
              ref={el => { wrapRefs.current[idx] = el }}
              src={u}
              alt=""
              decoding="async"
              draggable={false}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: `${PUFF_WIDTH_FRONT_VW}vw`,
                height: 'auto',
                transformOrigin: 'center bottom',
                willChange: 'transform, opacity',
                opacity: 0,
                userSelect: 'none',
                filter: 'drop-shadow(0 8px 18px rgba(40,70,120,0.26))',
              }}
            />
          )
        }
        // Dream State: 3-layer themed rendering. EE-slot puffs run through the
        // same pipeline so the shape inherits the mood gradient — but the
        // Easter-egg PNGs come from a different source (sculpted cloud shapes)
        // and carry deeper/darker baseline shadows than the regular puff
        // photos. We compensate by lifting the shape PNG with a prefilter so
        // its tonality is closer to the puff sprites before the multiply
        // shade layer eats it.
        const isEeSlot = forceEasterEggs && eeSlotSet.has(idx)
        const shapeNormalizer = isEeSlot ? ' contrast(0.55) brightness(1.32) saturate(1.05)' : ''
        return (
          <div
            key={idx}
            ref={el => { wrapRefs.current[idx] = el }}
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: `${PUFF_WIDTH_FRONT_VW}vw`,
              aspectRatio: '3 / 2',           // matches the actual cloud aspect (~0.67 h/w)
              transformOrigin: 'center bottom',
              willChange: 'transform, opacity',
              opacity: 0,
              isolation: 'isolate',
            }}
          >
            {/* Drape rendered FIRST so cloud body layers below cover its top */}
            {mood === 'Greenhouse' && shouldDrape(s.img) && (() => {
              const file = drapeForShape(s.img)
              if (!canDrapeOnCloud(file, s.img)) return null
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
              opacity: isEeSlot ? theme.shadeOpacity * 0.55 : theme.shadeOpacity,
              filter: theme.shadeFilter + shapeNormalizer,
            }} />
            <div ref={el => { glowRefs.current[idx] = el }} style={{
              ...layer,
              backgroundImage: url,
              mixBlendMode: 'screen',
              opacity: isEeSlot ? theme.glowOpacity * 1.15 : theme.glowOpacity,
              filter: theme.glowFilter + shapeNormalizer,
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
          zIndex: 9999,                // above lights toggle, top-right cluster, etc.
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
            EE Cycle · {eeCursor + 1}/{Math.ceil(CLOUD_SHAPES.length / EE_SLOT_COUNT)}
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
