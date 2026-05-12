import { useEffect, useMemo, useRef } from 'react'

const CLOUD_COUNT = 28
const SLOT_COUNT = 110              // densely packed sea — layers nearly touch
const TRAVEL_SECONDS = 240          // 4 minutes per cycle — barely-perceptible roll
const BAND_HEIGHT_VH = 55           // up to the halfway point — clouds can rise this high
const IMG_WIDTH_VW = 250            // huge, bleeds far past both screen edges
const IMG_ASPECT_HW = 0.62          // image height/width (avg of cloud3d set)
//
// Original lifecycle (depth counts down from 1 → 0 → past, like in the puffs version):
//   depth=1     spawn at the back (horizon), small, faded out
//   depth=0.85  fade-in done; cloud creeping up from the horizon
//   depth=0     reached the camera — biggest scale, peak at the bottom edge
//   depth<-0.20 recycled to a new random image at a new random X position
//
// Each cloud spawns at a RANDOM X across the full viewport width (no center
// clustering) and stays at that X as it advances forward.
const SCALE_BACK = 6.0              // scale at depth=1 (newly spawned, far horizon) — 5× bigger
const SCALE_FRONT = 16.0            // scale at depth=0 (under camera) — 5× bigger
const PEAK_TOP_BACK_VH = 50         // farthest cloud peak — at the halfway point
const PEAK_TOP_PAST_VH = -22        // peak slides this far below the screen as cloud passes
const FADE_IN_RANGE = 0.14
const FADE_OUT_RANGE = 0.14
const RECYCLE_AT_DEPTH = -0.20
const X_SPREAD_FRAC = 0.45          // ±45% of viewport width — wide spread, no center clustering
const ROLL_SWAY_PX_MIN = 12         // gentle horizontal roll
const ROLL_SWAY_PX_MAX = 32

function rand(min, max) { return min + Math.random() * (max - min) }
function pick(notMatching) {
  for (let i = 0; i < 8; i++) {
    const n = Math.floor(Math.random() * CLOUD_COUNT) + 1
    if (n !== notMatching) return n
  }
  return Math.floor(Math.random() * CLOUD_COUNT) + 1
}
function pad(n) { return String(n).padStart(2, '0') }

/**
 * Cloud lifecycle, per slot:
 *   depth=1.0  → spawned at the back, faded out, smallest scale
 *   depth=0.8  → fade-in done; far cloud peaks rising at horizon
 *   depth=0.0  → "under camera" — biggest scale, top of cloud reaches highest in band
 *   depth=-0.15→ recycled: depth=1, new random image
 *
 * Position math runs in pixels at runtime (against window.innerWidth / .innerHeight)
 * because vw and vh resolve differently on different viewport aspect ratios — using
 * vh constants for image positioning miscalculates how much cloud is visible vs
 * clipped. The bottom of every sprite is always pushed below the screen edge by
 * (1 - VISIBLE_TOP_FRAC) of its current scaled height, so only the top fluffy peaks
 * ever show.
 *
 * Container sits at the bottom of its parent with overflow:hidden, height set so the
 * room area above stays clear.
 *
 * Renders BEFORE the room canvas in App.jsx — opaque room pixels paint over cloud
 * sprites, transparent sky portions of the canvas let the clouds show through.
 */
export default function CloudConveyor() {
  const refs = useRef([])
  const stateRef = useRef(null)

  const initial = useMemo(() => {
    const arr = []
    let lastImg = -1
    for (let i = 0; i < SLOT_COUNT; i++) {
      const depth = 1 - (i + 0.5) / SLOT_COUNT
      const img = pick(lastImg)
      lastImg = img
      const vwForSpawn = typeof window !== 'undefined' ? window.innerWidth : 1920
      arr.push({
        depth,
        img,
        speed: 1 / (TRAVEL_SECONDS * rand(0.85, 1.15)),
        xOffset: rand(-X_SPREAD_FRAC * vwForSpawn, X_SPREAD_FRAC * vwForSpawn),
        xPhase: rand(0, Math.PI * 2),
        xSwayHz: rand(0.05, 0.10),
        xSwayPx: rand(8, 22),
      })
    }
    return arr
  }, [])

  useEffect(() => {
    stateRef.current = initial.map(s => ({ ...s, t0: performance.now() / 1000 }))
    let raf
    let last = performance.now()

    const apply = (i, s, now, vw, vh) => {
      const node = refs.current[i]
      if (!node) return
      const t = 1 - s.depth                                 // 0=back, 1=front, >1=past camera
      const scale = SCALE_BACK + t * (SCALE_FRONT - SCALE_BACK)

      // Image's natural rendered size in px (before scale)
      const imgWidthPx = (IMG_WIDTH_VW / 100) * vw
      const imgHeightPx = imgWidthPx * IMG_ASPECT_HW
      const scaledHeightPx = imgHeightPx * scale

      // Where the visible peak of THIS cloud should sit, in px above screen bottom.
      // Lerps from PEAK_TOP_BACK_VH (high horizon) at the back, through the screen,
      // to PEAK_TOP_PAST_VH (below screen) when it has passed the camera. The cloud
      // physically slides off the bottom as it advances.
      const peakTopVh = PEAK_TOP_BACK_VH + t * (PEAK_TOP_PAST_VH - PEAK_TOP_BACK_VH)
      const peakTopPx = (peakTopVh / 100) * vh
      // Compute Y offset entirely in transform space (no `bottom` mutation
      // — that triggers layout each frame and gets expensive at 100+ sprites).
      // CSS bottom is fixed at 0 (image bottom at container bottom). To push
      // the image's bottom edge to bottomPx (in our up-positive coords),
      // CSS translateY = -bottomPx (CSS Y positive = down).
      const bottomPx = peakTopPx - scaledHeightPx
      const tyPx = -bottomPx

      // Horizontal sway
      const time = now / 1000 - s.t0
      const xSway = Math.sin(s.xPhase + time * s.xSwayHz * 2 * Math.PI) * s.xSwayPx
      const xPx = s.xOffset + xSway

      const fadeIn  = Math.min(1, Math.max(0, (1 - s.depth) / FADE_IN_RANGE))
      const fadeOut = Math.min(1, Math.max(0, (s.depth + 0.05) / FADE_OUT_RANGE))
      const opacity = fadeIn * fadeOut

      node.style.transform =
        `translate3d(calc(-50% + ${xPx}px), ${tyPx}px, 0) scale(${scale})`
      node.style.opacity = String(opacity)
      node.style.zIndex = String(Math.floor(t * 1000))
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
          s.img = pick(s.img)
          s.speed = 1 / (TRAVEL_SECONDS * rand(0.85, 1.15))
          s.t0 = now / 1000
          s.xOffset = rand(-X_SPREAD_FRAC * vw, X_SPREAD_FRAC * vw)
          s.xPhase = rand(0, Math.PI * 2)
          s.xSwayHz = rand(0.05, 0.10)
          s.xSwayPx = rand(8, 22)
          const node = refs.current[i]
          if (node) node.src = `/clouds3d/cloud3d-${pad(s.img)}.webp`
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
      overflow: 'hidden',
      zIndex: 0,
    }}>
      {initial.map((s, idx) => (
        <img
          key={idx}
          ref={el => { refs.current[idx] = el }}
          src={`/clouds3d/cloud3d-${pad(s.img)}.webp`}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            width: `${IMG_WIDTH_VW}vw`,
            maxWidth: 'none',
            height: 'auto',
            transformOrigin: 'center bottom',
            willChange: 'transform, opacity',
            userSelect: 'none',
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
