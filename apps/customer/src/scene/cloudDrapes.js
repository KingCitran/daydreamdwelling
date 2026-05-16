// Greenhouse mood drapes — vines and floral cascades that hang from cloud
// bottoms. Each cloud has a deterministic chance of getting a drape, and a
// deterministic drape assignment, so the same cloud always looks the same.
// Drape rendering only kicks in when mood === 'Greenhouse'.

export const DRAPE_SPAWN_RATE = 0.22  // ~22% of clouds get a drape (reduced from 30%)

// Full pool of all known drape sprites on disk. Includes all 3 vine
// volumes (V024 + V025 + V026) plus florals = 250 total. The ACTIVE pool
// used at render time is a curated subset (see buildActivePool below).
const VINES = []
for (let n = 1; n <= 60; n++) VINES.push(`vines/AV_V024_${String(n).padStart(2,'0')}.png`)
for (let n = 1; n <= 80; n++) VINES.push(`vines/AV_V025_${String(n).padStart(2,'0')}.png`)
for (let n = 1; n <= 80; n++) VINES.push(`vines/AV_V026_${String(n).padStart(2,'0')}.png`)

const FLORALS = []
for (let n = 1; n <= 30; n++) FLORALS.push(`florals/Floral_${n}.png`)

const FULL_POOL = [...VINES, ...FLORALS]

// Read user-saved anchors at module init (declared higher up below; we need
// the var available here for the active-pool filter).
let _anchors = {}
if (typeof localStorage !== 'undefined') {
  try { _anchors = JSON.parse(localStorage.getItem('assetAnchors') || '{}') } catch {}
}

// CURATION POLICY:
// If the user has saved ANY anchor entries via the asset picker editor, the
// active drape pool is restricted to ONLY those anchored files. This makes
// anchoring also serve as inclusion — "I've vetted these for drape rendering."
// If no anchors are saved yet, fall back to the full pool minus exclusions
// (less curated; useful before the user has started curating).
function buildActivePool() {
  let exVines = [], exFlorals = []
  if (typeof localStorage !== 'undefined') {
    try { exVines    = JSON.parse(localStorage.getItem('vineExclude') || '[]') } catch {}
    try { exFlorals  = JSON.parse(localStorage.getItem('floralExclude') || '[]') } catch {}
  }
  const excludedSet = new Set([
    ...exVines.map(f => `vines/${f}`),
    ...exFlorals.map(f => `florals/${f}`),
  ])
  const anchoredKeys = Object.keys(_anchors)
  if (anchoredKeys.length > 0) {
    return anchoredKeys.filter(f => !excludedSet.has(f))
  }
  return FULL_POOL.filter(p => !excludedSet.has(p))
}

export const DRAPE_POOL = buildActivePool()

// Deterministic: same `shape` number always gives same drape + same spawn
// decision. Golden-ratio multiplier spreads selections evenly across the pool.
const PHI = 0.6180339887
const PHI2 = 0.7548776662  // independent seed for spawn decision

export function shouldDrape(shape) {
  if (typeof shape !== 'number') return false
  return ((shape * PHI2) % 1) < DRAPE_SPAWN_RATE
}

// Stricter variant: also requires the cloud's vertical position to leave room
// for the drape to be visible (i.e. cloud isn't too close to the bottom edge
// where the drape would just hang off-screen). Pass the cloud's y and the
// maximum y that still leaves enough vertical space.
export function shouldDrapeAt(shape, y, maxY) {
  if (!shouldDrape(shape)) return false
  if (typeof y === 'number' && typeof maxY === 'number' && y > maxY) return false
  return true
}

export function drapeForShape(shape) {
  if (typeof shape !== 'number') return null
  const idx = Math.floor(((shape * PHI) % 1) * DRAPE_POOL.length)
  return DRAPE_POOL[idx]
}

export function drapeUrl(shape) {
  const file = drapeForShape(shape)
  return file ? `/${file}` : null
}

// Kept as an empty export for backward compat — no animation, drapes hang static.
export const DRAPE_KEYFRAMES = ''

// Per-asset anchor metadata (from asset picker editor). Each entry:
//   { ax, ay, rot }
//   ax, ay — 0..1 position of the hook point on the PNG (where to attach to cloud)
//   rot    — 0/90/180/270 degrees, rotates around the anchor
// Defaults if no entry: top-center, no rotation.
// (_anchors is declared earlier — referenced here for clarity.)

export function anchorFor(file) {
  const a = _anchors[file]
  return {
    ax:  typeof a?.ax  === 'number' ? a.ax  : 0.5,
    ay:  typeof a?.ay  === 'number' ? a.ay  : 0,
    rot: typeof a?.rot === 'number' ? a.rot : 0,
    flatBottom: !!a?.flatBottom,
  }
}

// Read the cloud picker's flat-bottom cloud list (set of cloud sprite numbers).
let _flatBottoms = new Set()
if (typeof localStorage !== 'undefined') {
  try { _flatBottoms = new Set(JSON.parse(localStorage.getItem('flatBottomClouds') || '[]')) } catch {}
}

export function isFlatBottomCloud(shape) {
  return _flatBottoms.has(shape)
}

// Compatibility check: an asset that requires a flat-bottom cloud can only
// hang from a cloud marked as a flat-bottom candidate. Other assets pair freely.
export function canDrapeOnCloud(file, shape) {
  const a = anchorFor(file)
  if (!a.flatBottom) return true            // asset has no flat-bottom requirement
  return isFlatBottomCloud(shape)            // asset requires it — cloud must qualify
}

// Wrapper style — positions the cloud anchor target at the middle of the
// cloud's bounding box (50% / 50%). The drape extends down from there, and
// because the wrapper is rendered BEFORE the cloud's tint/shade/glow layers
// in JSX, the cloud body paints on top of the drape's upper half — naturally
// hiding the cut top inside the most opaque part of the cloud.
export const DRAPE_WRAPPER_STYLE = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  pointerEvents: 'none',
}

// Inner image style — shifts the image by (-ax, -ay) percent of its own size so
// the asset's anchor point lands at the wrapper's origin (cloud anchor target),
// then rotates around that anchor. The trailing `scale(...)` counter-scales the
// drape so its on-screen size stays roughly uniform across clouds of different
// depths. The parent cloud wrapper is responsible for setting `--cs` to its
// current scale factor each frame; clamp() keeps the drape size bounded so
// tiny back-clouds don't get giant drapes and huge front-clouds don't get
// micro drapes. Base width shrunk to 140px so even at max counter-scale the
// drape doesn't overflow the cloud.
export function drapeImgStyle(file) {
  const a = anchorFor(file)
  return {
    display: 'block',
    width: '140px',
    height: 'auto',                 // natural aspect ratio — no squashing
    transform: `translate(${-a.ax * 100}%, ${-a.ay * 100}%) rotate(${a.rot}deg) scale(clamp(0.6, calc(1 / var(--cs, 1)), 1.3))`,
    transformOrigin: `${a.ax * 100}% ${a.ay * 100}%`,
    filter: 'drop-shadow(0 8px 18px rgba(60,80,40,0.32))',
    userSelect: 'none',
  }
}
