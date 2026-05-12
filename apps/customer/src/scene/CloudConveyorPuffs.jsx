import { useEffect, useMemo, useRef } from 'react'

const CLOUD_COUNT = 150
const EXCLUDED = new Set([37, 49, 59, 68, 104])  // matches landing-page exclusions
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
const X_OUTWARD_DRIFT = 0.55       // closer puffs drift outward from center as they advance

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
export default function CloudConveyorPuffs() {
  const refs = useRef([])
  const stateRef = useRef(null)

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
      const depth = ((i + 0.5) / PUFF_COUNT + rand(-0.01, 0.01)) % 1
      const img = pickPuff(lastImg)
      lastImg = img
      const xVw = X_SPAWN_MIN_VW + (xSlots[i] + 0.5) / PUFF_COUNT * xRange + rand(-2, 2)
      arr.push({
        depth,
        img,
        speed: 1 / (TRAVEL_SECONDS * rand(0.99, 1.015)),
        xVw,                                                   // FIXED for lifetime — see tick recycle
        ySkewVh: rand(-38, 11),                                // very wide Y stagger — breaks up piled-up rows of puffs
        sizeJitter: rand(0.25, 2.10),                          // wide variety — tiny trailing puffs through big foreground clouds
        xPhase: rand(0, Math.PI * 2),
        xSwayHz: rand(0.04, 0.09),
        xSwayPx: rand(SWAY_PX_MIN, SWAY_PX_MAX),
      })
    }
    return arr
  }, [])

  useEffect(() => {
    const mountSecs = performance.now() / 1000
    stateRef.current = initial.map(s => ({ ...s, t0: mountSecs }))
    let raf
    let last = performance.now()

    // CSS width is fixed at PUFF_WIDTH_FRONT_VW; we shrink via transform scale.
    // Animation only mutates `transform` and `opacity` — both compositor-only,
    // no layout. With 240 sprites this keeps things smooth and flicker-free.
    const apply = (i, s, now, vw, vh) => {
      const node = refs.current[i]
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
      const opacity = fadeIn * fadeOut * introRamp

      node.style.transform = `translate3d(${txPx}px, ${tyPx}px, 0) scale(${widthScale})`
      node.style.opacity = String(opacity)
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

    const tick = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000)
      last = now
      const arr = stateRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight
      for (let i = 0; i < arr.length; i++) {
        const s = arr[i]
        s.depth -= s.speed * delta
        if (s.depth < RECYCLE_AT_DEPTH) {
          s.depth = 1.0
          s.img = pickPuff(s.img)
          s.speed = 1 / (TRAVEL_SECONDS * rand(0.99, 1.015))
          s.t0 = now / 1000
          // KEEP s.xVw — each puff stays at its assigned lateral slot across
          // recycles. This is what prevents horizontal gaps from emerging
          // between waves over time (random re-rolling causes clusters/gaps).
          s.ySkewVh = rand(-38, 10)
          s.sizeJitter = rand(0.25, 2.10)
          s.xPhase = rand(0, Math.PI * 2)
          s.xSwayHz = rand(0.04, 0.09)
          s.xSwayPx = rand(SWAY_PX_MIN, SWAY_PX_MAX)
          const node = refs.current[i]
          if (node) node.src = `/clouds/cloud-${pad(s.img)}.webp`
        }
        apply(i, s, now, vw, vh)
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
      {initial.map((s, idx) => (
        <img
          key={idx}
          ref={el => { refs.current[idx] = el }}
          src={`/clouds/cloud-${pad(s.img)}.webp`}
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
            userSelect: 'none',
            opacity: 0,
            filter: 'drop-shadow(0 8px 18px rgba(40,70,120,0.26))',
          }}
        />
      ))}
    </div>
  )
}
