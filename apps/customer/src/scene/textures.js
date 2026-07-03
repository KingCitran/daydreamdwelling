/**
 * PBR texture system with adaptive quality.
 *
 * Three quality tiers based on device + connection:
 *   FULL  — color + normal + roughness maps (desktop / fast Wi-Fi)
 *   LITE  — color map only, no normal/roughness (mobile / slow connection)
 *   FLAT  — hex color fallback, no texture files (data saver / offline)
 *
 * Textures are CC0 from ambientcg.com, 512px JPGs, loaded on demand.
 */
import * as THREE from 'three'

const loader = new THREE.TextureLoader()
const CACHE = new Map()

// Subscribers get notified when any texture finishes loading so React
// components can re-render and show the newly loaded image.
const subscribers = new Set()
export function onTextureReady(fn) { subscribers.add(fn); return () => subscribers.delete(fn) }
function notifyReady() { subscribers.forEach(fn => fn()) }

// ── Quality detection ───────────────────────────────────────────
// Runs once on load. Checks: data saver, connection speed, device memory, touch screen.
function detectQuality() {
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection

  // User explicitly asked to save data
  if (conn?.saveData) return 'flat'

  // Slow connection (2G or slow 3G)
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return 'flat'
  if (conn?.effectiveType === '3g') return 'lite'

  // Low device memory (< 4GB)
  if (nav.deviceMemory && nav.deviceMemory < 4) return 'lite'

  // Touch device = probably mobile (load lite by default, fast mobile still gets color map)
  if ('ontouchstart' in globalThis && !matchMedia('(min-width: 1024px)').matches) return 'lite'

  return 'full'
}

const QUALITY = detectQuality()
if (typeof console !== 'undefined') console.log(`[textures] Quality tier: ${QUALITY}`)

// ── Texture loaders ─────────────────────────────────────────────
function loadTex(path) {
  if (CACHE.has(path)) return CACHE.get(path)
  const tex = loader.load(path, () => notifyReady(), undefined, () => {
    console.warn(`[textures] Failed to load: ${path}`)
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  CACHE.set(path, tex)
  return tex
}

function loadLinear(path) {
  if (CACHE.has(path)) return CACHE.get(path)
  const tex = loader.load(path, () => notifyReady(), undefined, () => {
    console.warn(`[textures] Failed to load: ${path}`)
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.LinearSRGBColorSpace
  CACHE.set(path, tex)
  return tex
}

// ── Texture registry ────────────────────────────────────────────
// Repeat values control how many times the texture tiles per wall/floor unit.
// Lower = bigger pattern (more realistic), higher = smaller/denser pattern.
// Each texture covers ~3ft of real-world surface, so repeat 0.33 = life-size.
const TEXTURE_REGISTRY = {
  brick:       { folder: 'Bricks076A',       repeat: [0.33, 0.33], roughnessVal: 0.92 },
  brickOld:    { folder: 'Bricks059',         repeat: [0.33, 0.33], roughnessVal: 0.94 },
  brickWhite:  { folder: 'PaintedBricks001',  repeat: [0.33, 0.33], roughnessVal: 0.88 },
  concrete:    { folder: 'Concrete034',       repeat: [0.25, 0.25], roughnessVal: 0.82 },
  plaster:     { folder: 'Plaster003',        repeat: [0.25, 0.25], roughnessVal: 0.90 },
  drywall:     { folder: 'PaintedPlaster017', repeat: [0.20, 0.20], roughnessVal: 0.88 },
  stone:       { folder: 'Rock049',           repeat: [0.33, 0.33], roughnessVal: 0.92 },
  marble:      { folder: 'Marble012',         repeat: [0.25, 0.25], roughnessVal: 0.35 },
  wood:        { folder: 'WoodFloor051',      repeat: [0.33, 0.33], roughnessVal: 0.78 },
  woodDark:    { folder: 'WoodFloor040',      repeat: [0.33, 0.33], roughnessVal: 0.78 },
  shiplap:     { folder: 'WoodSiding009',     repeat: [0.33, 0.33], roughnessVal: 0.80 },
  tile:        { folder: 'Tiles093',          repeat: [0.5, 0.5],   roughnessVal: 0.55 },
  carpet:      { folder: 'Fabric038',         repeat: [0.5, 0.5],   roughnessVal: 0.98 },
}

/**
 * Get a PBR texture set for a material type.
 * Returns quality-appropriate maps based on device/connection.
 *
 * @param {string} type - material type key
 * @param {string} _hex - fallback color (used when quality = 'flat')
 * @returns {{ map, normalMap, roughnessMap, repeat } | null}
 */
export function getTexture(type, _hex) {
  if (!type || type === 'flat') return null
  if (QUALITY === 'flat') return null  // Data saver — fall back to hex color

  const reg = TEXTURE_REGISTRY[type]
  if (!reg) return null

  const key = `pbr_${type}_${QUALITY}`
  if (CACHE.has(key)) return CACHE.get(key)

  const base = `/textures/${reg.folder}`
  console.log(`[textures] Loading ${type} from ${base}/color.jpg`)
  const colorMap = loadTex(`${base}/color.jpg`)
  colorMap.repeat.set(reg.repeat[0], reg.repeat[1])

  const result = { map: colorMap, normalMap: undefined, roughnessMap: undefined, repeat: reg.repeat }

  // Full quality: load normal + roughness maps for real surface depth
  if (QUALITY === 'full') {
    const nMap = loadLinear(`${base}/normal.jpg`)
    const rMap = loadLinear(`${base}/roughness.jpg`)
    nMap.repeat.set(reg.repeat[0], reg.repeat[1])
    rMap.repeat.set(reg.repeat[0], reg.repeat[1])
    result.normalMap = nMap
    result.roughnessMap = rMap
  }

  CACHE.set(key, result)
  return result
}

/** Current quality tier — exposed for UI indicators */
export const textureQuality = QUALITY

/**
 * Roughness value for paint finish types.
 */
export const PAINT_FINISH_ROUGHNESS = {
  flat:       0.95,
  eggshell:   0.85,
  satin:      0.70,
  semiGloss:  0.50,
  highGloss:  0.25,
}

/**
 * Fallback roughness per texture type.
 */
export const TEXTURE_ROUGHNESS = {
  wood:        0.78,
  woodDark:    0.78,
  tile:        0.55,
  carpet:      0.98,
  concrete:    0.82,
  marble:      0.35,
  brick:       0.92,
  brickOld:    0.94,
  brickWhite:  0.88,
  shiplap:     0.80,
  plaster:     0.90,
  drywall:     0.88,
  stone:       0.92,
  flat:        0.88,
}
