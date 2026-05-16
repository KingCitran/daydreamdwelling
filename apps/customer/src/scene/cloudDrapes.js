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

// ── Baked-in curated defaults (exported from the asset picker) ──────────
// Edits made in the asset picker live in localStorage on the editing
// machine. Once they're worth shipping, paste them here so every visitor
// gets the same curated set on first load (localStorage still wins when
// present — devs can keep iterating without rebuilds).
const DEFAULT_EXCLUDED_VINES = new Set([
  'AV_V024_19.png',
  'AV_V024_34.png',
  'AV_V024_35.png',
  'AV_V024_36.png',
  'AV_V024_37.png',
])
const DEFAULT_EXCLUDED_FLORALS = new Set()
const DEFAULT_ANCHORS = {
  'vines/AV_V024_01.png': { ax: 0.508939, ay: 0.005439, rot: 0,   flatBottom: false },
  'vines/AV_V024_02.png': { ax: 0.511297, ay: 0.002385, rot: 0,   flatBottom: false },
  'vines/AV_V024_03.png': { ax: 0.516794, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_04.png': { ax: 0.496947, ay: 0.104077, rot: 0,   flatBottom: false },
  'vines/AV_V024_05.png': { ax: 0.487786, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_06.png': { ax: 0.479248, ay: 0.005439, rot: 0,   flatBottom: false },
  'vines/AV_V024_07.png': { ax: 0.489313, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_08.png': { ax: 0.5,      ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_09.png': { ax: 0.496947, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_10.png': { ax: 0.463359, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_11.png': { ax: 0.489313, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_12.png': { ax: 0.470992, ay: 0.019787, rot: 0,   flatBottom: false },
  'vines/AV_V024_13.png': { ax: 0.489313, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_14.png': { ax: 0.498473, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_15.png': { ax: 0.492366, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_16.png': { ax: 0.492366, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_17.png': { ax: 0.498473, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_18.png': { ax: 0.498473, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_20.png': { ax: 0.512758, ay: 0.179485, rot: 180, flatBottom: false },
  'vines/AV_V024_21.png': { ax: 0.490840, ay: 0.054207, rot: 0,   flatBottom: false },
  'vines/AV_V024_22.png': { ax: 0.504580, ay: 0,        rot: 0,   flatBottom: false },
  'vines/AV_V024_23.png': { ax: 0.530843, ay: 0.104676, rot: 180, flatBottom: false },
  'vines/AV_V024_24.png': { ax: 0.564122, ay: 0.861565, rot: 0,   flatBottom: false },
  'vines/AV_V024_25.png': { ax: 0.439881, ay: 0.906202, rot: 0,   flatBottom: false },
  'vines/AV_V024_26.png': { ax: 0.397650, ay: 0.887882, rot: 0,   flatBottom: false },
  'vines/AV_V024_27.png': { ax: 0.503053, ay: 0.007500, rot: 0,   flatBottom: false },
  'vines/AV_V024_28.png': { ax: 0.463359, ay: 0.114867, rot: 0,   flatBottom: false },
  'vines/AV_V024_29.png': { ax: 0.529008, ay: 0.255891, rot: 0,   flatBottom: false },
  'vines/AV_V024_30.png': { ax: 0.572310, ay: 0.293989, rot: 0,   flatBottom: false },
  'vines/AV_V024_31.png': { ax: 0.489313, ay: 0.664343, rot: 0,   flatBottom: false },
  'vines/AV_V024_32.png': { ax: 0.498473, ay: 0.858431, rot: 0,   flatBottom: false },
  'vines/AV_V024_33.png': { ax: 0.521374, ay: 0.816736, rot: 0,   flatBottom: false },
  'vines/AV_V024_38.png': { ax: 0.632545, ay: 0.387118, rot: 90,  flatBottom: false },
  'vines/AV_V024_40.png': { ax: 0.533190, ay: 0.388645, rot: 270, flatBottom: false },
}

// Read user-saved anchors at module init (declared higher up below; we need
// the var available here for the active-pool filter). localStorage entries
// override the baked-in defaults, so devs/admins can keep iterating in the
// picker without redeploying.
let _anchors = { ...DEFAULT_ANCHORS }
if (typeof localStorage !== 'undefined') {
  try { Object.assign(_anchors, JSON.parse(localStorage.getItem('assetAnchors') || '{}')) } catch {}
}

// CURATION POLICY:
// The active drape pool is the set of files that have an anchor entry
// (either from DEFAULT_ANCHORS or localStorage) minus any explicit
// exclusions. Anchoring = curation: "I've vetted this asset for use."
function buildActivePool() {
  let exVines = [...DEFAULT_EXCLUDED_VINES]
  let exFlorals = [...DEFAULT_EXCLUDED_FLORALS]
  if (typeof localStorage !== 'undefined') {
    try { exVines    = JSON.parse(localStorage.getItem('vineExclude')   || JSON.stringify(exVines)) } catch {}
    try { exFlorals  = JSON.parse(localStorage.getItem('floralExclude') || JSON.stringify(exFlorals)) } catch {}
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
//
// Soft radial fade at the anchor — only covers the very immediate seam where
// the asset attaches, so the bulk of the drape stays fully visible. The cloud
// body painted on top via DOM order continues to do the heavy hiding of the
// asset's top edge.
export function drapeImgStyle(file) {
  const a = anchorFor(file)
  const axp = (a.ax * 100).toFixed(2)
  const ayp = (a.ay * 100).toFixed(2)
  const mask = `radial-gradient(circle at ${axp}% ${ayp}%, transparent 0%, rgba(0,0,0,0.5) 5%, #000 12%)`
  return {
    display: 'block',
    width: '140px',
    height: 'auto',                 // natural aspect ratio — no squashing
    transform: `translate(${-a.ax * 100}%, ${-a.ay * 100}%) rotate(${a.rot}deg) scale(clamp(0.6, calc(1 / var(--cs, 1)), 1.3))`,
    transformOrigin: `${a.ax * 100}% ${a.ay * 100}%`,
    filter: 'drop-shadow(0 8px 18px rgba(60,80,40,0.32))',
    WebkitMaskImage: mask,
    maskImage: mask,
    userSelect: 'none',
  }
}
