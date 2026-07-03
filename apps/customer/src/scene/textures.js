/**
 * Real PBR texture system — loads photographic CC0 textures from ambientCG.
 * Each material has color + normal + roughness maps at 512px, ~120KB each.
 * Textures are loaded on demand and cached permanently.
 *
 * CC0 license — no attribution required. Source: ambientcg.com
 */
import * as THREE from 'three'

const loader = new THREE.TextureLoader()
const CACHE = new Map()

function loadTex(path) {
  if (CACHE.has(path)) return CACHE.get(path)
  const tex = loader.load(path)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  CACHE.set(path, tex)
  return tex
}

function loadNormal(path) {
  if (CACHE.has(path)) return CACHE.get(path)
  const tex = loader.load(path)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  // Normal maps should stay in linear color space
  tex.colorSpace = THREE.LinearSRGBColorSpace
  CACHE.set(path, tex)
  return tex
}

function loadRoughness(path) {
  if (CACHE.has(path)) return CACHE.get(path)
  const tex = loader.load(path)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.LinearSRGBColorSpace
  CACHE.set(path, tex)
  return tex
}

// ── Texture registry ────────────────────────────────────────────
// Maps material type → ambientCG folder name + repeat scale.
// Repeat controls how many times the texture tiles per foot of wall/floor.
const TEXTURE_REGISTRY = {
  // Brick
  brick:       { folder: 'Bricks076A',       repeat: [1.0, 1.0], roughnessVal: 0.92 },
  brickOld:    { folder: 'Bricks059',         repeat: [1.0, 1.0], roughnessVal: 0.94 },
  brickWhite:  { folder: 'PaintedBricks001',  repeat: [1.0, 1.0], roughnessVal: 0.88 },
  // Concrete
  concrete:    { folder: 'Concrete034',       repeat: [1.0, 1.0], roughnessVal: 0.82 },
  // Plaster
  plaster:     { folder: 'Plaster003',        repeat: [1.0, 1.0], roughnessVal: 0.90 },
  drywall:     { folder: 'PaintedPlaster017', repeat: [1.0, 1.0], roughnessVal: 0.88 },
  // Stone
  stone:       { folder: 'Rock049',           repeat: [1.0, 1.0], roughnessVal: 0.92 },
  marble:      { folder: 'Marble012',         repeat: [1.0, 1.0], roughnessVal: 0.35 },
  // Wood
  wood:        { folder: 'WoodFloor051',      repeat: [1.0, 1.0], roughnessVal: 0.78 },
  woodDark:    { folder: 'WoodFloor040',      repeat: [1.0, 1.0], roughnessVal: 0.78 },
  shiplap:     { folder: 'WoodSiding009',     repeat: [1.0, 1.0], roughnessVal: 0.80 },
  // Tile
  tile:        { folder: 'Tiles093',          repeat: [1.0, 1.0], roughnessVal: 0.55 },
  // Carpet / Fabric
  carpet:      { folder: 'Fabric038',         repeat: [2.0, 2.0], roughnessVal: 0.98 },
}

/**
 * Get a real PBR texture set for a material type.
 * @param {string} type - material type key (e.g. 'brick', 'wood', 'concrete')
 * @param {string} _hex - Base color hex (used as tint for flat types, ignored for photo textures)
 * @returns {{ map, normalMap, roughnessMap, repeat } | null} null for 'flat'
 */
export function getTexture(type, _hex) {
  if (!type || type === 'flat') return null
  const reg = TEXTURE_REGISTRY[type]
  if (!reg) return null

  const base = `/textures/${reg.folder}`
  const key = `pbr_${type}`
  if (CACHE.has(key)) return CACHE.get(key)

  const result = {
    map: loadTex(`${base}/color.jpg`),
    normalMap: loadNormal(`${base}/normal.jpg`),
    roughnessMap: loadRoughness(`${base}/roughness.jpg`),
    repeat: reg.repeat,
  }

  // Set repeat on all maps
  for (const tex of [result.map, result.normalMap, result.roughnessMap]) {
    if (tex) tex.repeat.set(reg.repeat[0], reg.repeat[1])
  }

  CACHE.set(key, result)
  return result
}

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
 * Fallback roughness per texture type (used when no roughness map loaded yet).
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
