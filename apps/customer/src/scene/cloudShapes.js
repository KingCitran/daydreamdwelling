// Cloud-shape Easter-egg sprites. Rare-spawn clouds (~1.5% probability) shaped
// like castles, teddy bears, sailboats, etc. that drift through the cloud
// field as a "look, a cloud animal!" delight moment.
//
// PNG files live in `apps/customer/public/clouds-shapes/`. Each entry below
// references a file there. The `moods` array limits which moods this shape
// can spawn in — use '*' (or omit) for any-mood shapes.
//
// To add a new shape:
//   1. Drop the PNG into /public/clouds-shapes/
//   2. Add an entry below with id / filename / label / moods
//   3. (Optional) Tune SHAPE_SPAWN_RATE if you want more or fewer easter eggs

export const SHAPE_SPAWN_RATE = 0.015  // 1.5% of cloud spawns are a shape

// Each shape: { id, filename, label, moods? }
// 70 PNGs available in /clouds-shapes/. Mood arrays decide where each can spawn —
// '*' or omitted means any mood. Edit/extend freely.
export const CLOUD_SHAPES = [
  // Romantic — Blush Hour + Dream State
  { id: 'heart-1',     filename: 'Heart 1.png',     label: 'Heart',         moods: ['Blush Hour', 'Dream State'] },
  { id: 'heart-2',     filename: 'Heart 5.png',     label: 'Heart',         moods: ['Blush Hour'] },
  { id: 'love',        filename: 'Love.png',        label: 'Love',          moods: ['Blush Hour'] },
  { id: 'cupid-1',     filename: 'Cupid 1.png',     label: 'Cupid',         moods: ['Blush Hour'] },
  { id: 'ring',        filename: 'Ring.png',        label: 'Ring',          moods: ['Blush Hour'] },

  // Celestial / night — Moonlight + Dream State
  { id: 'angel-1',     filename: 'Angel 1.png',     label: 'Angel',         moods: ['Moonlight', 'Dream State'] },
  { id: 'angel-2',     filename: 'Angel 2.png',     label: 'Angel',         moods: ['Dream State'] },
  { id: 'moon',        filename: 'Moon.png',        label: 'Moon',          moods: ['Moonlight'] },
  { id: 'star',        filename: 'Star.png',        label: 'Star',          moods: ['Moonlight', 'Dream State', 'Vivid Sunset'] },
  { id: 'crown',       filename: 'Crown.png',       label: 'Crown',         moods: ['Moonlight', 'Dream State'] },
  { id: 'cat-1',       filename: 'Cat 1.png',       label: 'Cat',           moods: ['Moonlight'] },

  // Fantasy — Dream State + Vivid Sunset
  { id: 'unicorn-1',   filename: 'Unicorn 1.png',   label: 'Unicorn',       moods: ['Dream State'] },
  { id: 'unicorn-2',   filename: 'Unicorn 3.png',   label: 'Unicorn',       moods: ['Dream State', 'Blush Hour'] },
  { id: 'castle-1',    filename: 'Castle 1.png',    label: 'Castle',        moods: ['Dream State', 'Moonlight'] },
  { id: 'castle-2',    filename: 'Castle 2.png',    label: 'Castle',        moods: ['Vivid Sunset'] },
  { id: 'dinosaur-1',  filename: 'Dinosaur 1.png',  label: 'Dinosaur',      moods: ['Vivid Sunset'] },
  { id: 'carriage-1',  filename: 'Carriage 1.png',  label: 'Carriage',      moods: ['Dream State', 'Vivid Sunset'] },

  // Coastal / sky travel — Coastal Morning + Bright Day
  { id: 'boat',        filename: 'Boat.png',        label: 'Sailboat',      moods: ['Coastal Morning'] },
  { id: 'dolphin',     filename: 'Dolphin.png',     label: 'Dolphin',       moods: ['Coastal Morning'] },
  { id: 'whale-1',     filename: 'Whale 1.png',     label: 'Whale',         moods: ['Coastal Morning'] },
  { id: 'butterfly-1', filename: 'Butterfly 1.png', label: 'Butterfly',     moods: ['Coastal Morning', 'Greenhouse'] },
  { id: 'butterfly-2', filename: 'Butterfly 2.png', label: 'Butterfly',     moods: ['Greenhouse', 'Blush Hour'] },
  { id: 'pigeon-1',    filename: 'Pigeon 1.png',    label: 'Bird',          moods: ['Coastal Morning', 'Greenhouse'] },
  { id: 'balloon',     filename: 'Balloon.png',     label: 'Hot Air Balloon', moods: ['Coastal Morning'] },
  { id: 'paper-plane', filename: 'Paper airplane.png', label: 'Paper Plane', moods: ['*'] },
  { id: 'plane',       filename: 'Plane.png',       label: 'Plane',         moods: ['Coastal Morning'] },

  // Greenhouse — garden creatures
  { id: 'rabbit-1',    filename: 'Rabbit 1.png',    label: 'Rabbit',        moods: ['Greenhouse', 'Blush Hour'] },
  { id: 'bear-1',      filename: 'Bear 1.png',      label: 'Bear',          moods: ['Greenhouse'] },

  // Neon Nights — futuristic / energetic
  { id: 'rocket',      filename: 'Rocket.png',      label: 'Rocket',        moods: ['Neon Nights'] },
  { id: 'car',         filename: 'Car.png',         label: 'Car',           moods: ['Neon Nights'] },
  { id: 'music-1',     filename: 'Music 1.png',     label: 'Music Note',    moods: ['Neon Nights'] },
  { id: 'music-2',     filename: 'Music 3.png',     label: 'Music Note',    moods: ['Neon Nights'] },

  // Cross-mood ambient
  { id: 'sun',         filename: 'Sun.png',         label: 'Sun',           moods: ['Bright Day', 'Golden Hour'] },
  { id: 'rainbow',     filename: 'Rainbow.png',     label: 'Rainbow',       moods: ['Bright Day', 'Dream State'] },
  { id: 'swan-1',      filename: 'Swan 1.png',      label: 'Swan',          moods: ['Dream State', 'Coastal Morning'] },
]

// Shape filenames the user has excluded via /asset-picker.html → "Shape Clouds"
// tab. Read from localStorage at module init; the customer app's Supabase
// boot sync (App.jsx → syncCurationFromSupabase) refreshes this key from the
// scene_curation table so the deployed app sees the same exclusions across
// browsers/devices. We also seed defaults so brand-new visitors get the
// curated pool from frame 0.
const DEFAULT_EXCLUDED_SHAPES = new Set([
  'Angel 1.png', 'Angel 2.png', 'Angel 3.png',
  'Bear 1.png',  'Bear 2.png',
  'Carriage 2.png',
  'Cupid 2.png',
  'Elephant 1.png',
  'Heart 6.png',
  'Pigeon 3.png',
])
function readShapeExcludes() {
  let local = []
  if (typeof localStorage !== 'undefined') {
    try { local = JSON.parse(localStorage.getItem('shapeExclude') || '[]') } catch {}
  }
  // localStorage takes precedence: if the picker has explicitly written a
  // list (even empty), trust that — otherwise fall back to baked defaults.
  if (local.length || (typeof localStorage !== 'undefined' && localStorage.getItem('shapeExclude') !== null)) {
    return new Set(local)
  }
  return new Set(DEFAULT_EXCLUDED_SHAPES)
}
export const EXCLUDED_SHAPES = readShapeExcludes()

// ── Per-shape behavior config ───────────────────────────────────────────
// Default clearance radius (in vw) that regular clouds get pushed out of
// around any Easter-egg cloud. Per-shape overrides live in SHAPE_CONFIG
// (eeShapeConfig localStorage / Supabase) — leave clearance undefined to
// use the default.
export const DEFAULT_CLEARANCE_VW = 18

// Baked defaults for shapes that have a clear intrinsic behavior:
// - text/word shapes should NEVER mirror-flip (reads backward)
// - Happy birthday is reserved for triggered spawns (customer's birthday)
//   so it's marked specialOnly and stays out of the normal cycle pool
const DEFAULT_SHAPE_CONFIG = {
  'Love.png':              { noFlip: true },
  'Music 1.png':           { noFlip: true },
  'Music 2.png':           { noFlip: true },
  'Music 3.png':           { noFlip: true },
  'Music 4.png':           { noFlip: true },
  'Happy birthday 1.png':  { noFlip: true, specialOnly: true },
  'Happy birthday 2.png':  { noFlip: true, specialOnly: true },
}

function readShapeConfig() {
  let user = {}
  if (typeof localStorage !== 'undefined') {
    try { user = JSON.parse(localStorage.getItem('eeShapeConfig') || '{}') } catch {}
  }
  // Merge: bake defaults first, then layer the user-edited values on top so
  // anything explicitly set in the picker wins.
  const merged = {}
  for (const key of Object.keys(DEFAULT_SHAPE_CONFIG)) merged[key] = { ...DEFAULT_SHAPE_CONFIG[key] }
  for (const [key, val] of Object.entries(user)) {
    merged[key] = { ...(merged[key] || {}), ...val }
  }
  return merged
}
export const SHAPE_CONFIG = readShapeConfig()

export function getShapeConfig(filename) {
  return SHAPE_CONFIG[filename] || {}
}
export function shapeNoFlip(filename) {
  return !!getShapeConfig(filename).noFlip
}
export function shapeClearanceVw(filename) {
  const v = getShapeConfig(filename).clearance
  return typeof v === 'number' ? v : DEFAULT_CLEARANCE_VW
}
export function shapeSpecialOnly(filename) {
  return !!getShapeConfig(filename).specialOnly
}

// Filter the shape pool to those allowed in the current mood AND not in the
// shape-picker's exclusion list AND not flagged specialOnly.
export function shapesForMood(mood) {
  return CLOUD_SHAPES.filter(s =>
    !EXCLUDED_SHAPES.has(s.filename) &&
    !shapeSpecialOnly(s.filename) &&
    (!s.moods || s.moods.includes('*') || s.moods.includes(mood))
  )
}

// Cycle/dev tool pool — all manifest entries minus excluded + specialOnly.
export function availableShapes() {
  return CLOUD_SHAPES.filter(s =>
    !EXCLUDED_SHAPES.has(s.filename) &&
    !shapeSpecialOnly(s.filename)
  )
}

// Pick a random shape from the pool allowed in this mood, or null if no
// shapes are available for this mood (in which case spawn a regular cloud).
export function pickShape(mood) {
  const pool = shapesForMood(mood)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

// URL helper — uses the public folder so it works in dev + production.
export function shapeUrl(shape) {
  return `/clouds-shapes/${shape.filename}`
}

// Check whether the manifest is currently empty (no entries) so we can fall
// back gracefully if user hasn't added shapes yet.
export const HAS_SHAPES = CLOUD_SHAPES.length > 0
