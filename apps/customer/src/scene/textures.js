/**
 * Procedural tileable textures for floors and walls.
 * Uses CanvasTexture with RepeatWrapping — no external image files.
 * Each generator returns a THREE.CanvasTexture ready for meshStandardMaterial.
 */
import * as THREE from 'three'

const CACHE = new Map()
const TEX_SIZE = 256

function cached(key, genFn) {
  if (CACHE.has(key)) return CACHE.get(key)
  const tex = genFn()
  CACHE.set(key, tex)
  return tex
}

// Parse hex to {r, g, b} 0-255
function parseHex(hex) {
  const n = parseInt((hex || '#888888').replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

// Seeded pseudo-random (simple LCG) for deterministic textures
function seededRng(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

// ── Wood grain ──────────────────────────────────────────────────
function generateWood(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 1000 + g * 100 + b)

  // Base color
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Draw vertical planks
  const plankW = TEX_SIZE / 4
  for (let p = 0; p < 4; p++) {
    const px = p * plankW
    // Plank gap
    ctx.fillStyle = `rgba(0,0,0,0.12)`
    ctx.fillRect(px, 0, 1.5, TEX_SIZE)

    // Wood grain lines — horizontal, irregular
    for (let y = 0; y < TEX_SIZE; y += 2) {
      const drift = Math.sin(y * 0.03 + p * 2) * 3 + rng() * 2
      const alpha = 0.04 + rng() * 0.06
      const dark = rng() > 0.5
      ctx.fillStyle = dark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.5})`
      ctx.fillRect(px + 2 + drift, y, plankW - 4, 1.5)
    }

    // Occasional knot
    if (rng() > 0.6) {
      const kx = px + plankW * 0.3 + rng() * plankW * 0.4
      const ky = rng() * TEX_SIZE
      const kr = 4 + rng() * 6
      ctx.beginPath()
      ctx.arc(kx, ky, kr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,0,0,0.08)`
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Tile grid ───────────────────────────────────────────────────
function generateTile(hex, groutHex = '#c8c4bc') {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(parseHex(hex).r * 7 + parseHex(hex).b)

  const tileSize = TEX_SIZE / 4
  const grout = 3

  // Grout background
  ctx.fillStyle = groutHex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Draw tiles
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      // Subtle per-tile color variation
      const { r, g, b } = parseHex(hex)
      const v = Math.round((rng() - 0.5) * 12)
      ctx.fillStyle = `rgb(${r + v},${g + v},${b + v})`
      ctx.fillRect(
        tx * tileSize + grout / 2,
        ty * tileSize + grout / 2,
        tileSize - grout,
        tileSize - grout,
      )
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Carpet weave ────────────────────────────────────────────────
function generateCarpet(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r + g * 3 + b * 7)

  // Base fill
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Tiny fiber dots for weave texture
  for (let i = 0; i < 8000; i++) {
    const fx = rng() * TEX_SIZE
    const fy = rng() * TEX_SIZE
    const dark = rng() > 0.5
    const alpha = 0.03 + rng() * 0.05
    ctx.fillStyle = dark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    ctx.fillRect(fx, fy, 1.5, 1.5)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Concrete / polished ─────────────────────────────────────────
function generateConcrete(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 13 + g * 7 + b)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Subtle aggregate speckles
  for (let i = 0; i < 3000; i++) {
    const x = rng() * TEX_SIZE
    const y = rng() * TEX_SIZE
    const s = 1 + rng() * 3
    const dark = rng() > 0.4
    ctx.fillStyle = dark ? `rgba(0,0,0,${0.02 + rng() * 0.04})` : `rgba(255,255,255,${0.02 + rng() * 0.03})`
    ctx.fillRect(x, y, s, s)
  }

  // A few hairline cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.04)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(rng() * TEX_SIZE, rng() * TEX_SIZE)
    ctx.lineTo(rng() * TEX_SIZE, rng() * TEX_SIZE)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Brick ───────────────────────────────────────────────────────
function generateBrick(hex, mortarHex = '#d0c8bc') {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(parseHex(hex).r * 11 + parseHex(hex).g)

  const brickH = TEX_SIZE / 8
  const mortar = 3

  ctx.fillStyle = mortarHex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  for (let row = 0; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : TEX_SIZE / 2
    const brickW = TEX_SIZE / 2
    for (let col = -1; col < 2; col++) {
      const bx = col * brickW + offset
      const by = row * brickH
      const { r, g, b } = parseHex(hex)
      const v = Math.round((rng() - 0.5) * 20)
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r + v))},${Math.max(0, Math.min(255, g + v))},${Math.max(0, Math.min(255, b + v))})`
      ctx.fillRect(bx + mortar / 2, by + mortar / 2, brickW - mortar, brickH - mortar)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Shiplap (horizontal planks) ─────────────────────────────────
function generateShiplap(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r + g * 5 + b * 3)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  const plankH = TEX_SIZE / 6
  for (let i = 0; i < 6; i++) {
    const py = i * plankH
    // Gap line
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    ctx.fillRect(0, py, TEX_SIZE, 1.5)
    // Shadow below gap
    ctx.fillStyle = 'rgba(0,0,0,0.03)'
    ctx.fillRect(0, py + 1.5, TEX_SIZE, 3)
    // Subtle grain
    for (let x = 0; x < TEX_SIZE; x += 3) {
      const alpha = 0.01 + rng() * 0.02
      ctx.fillStyle = rng() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
      ctx.fillRect(x, py + 4, 2, plankH - 6)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Marble (veined) ─────────────────────────────────────────────
function generateMarble(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 3 + g + b * 11)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Veins
  for (let v = 0; v < 6; v++) {
    ctx.strokeStyle = `rgba(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 30)},${0.08 + rng() * 0.08})`
    ctx.lineWidth = 0.5 + rng() * 2
    ctx.beginPath()
    let vx = rng() * TEX_SIZE, vy = rng() * TEX_SIZE
    ctx.moveTo(vx, vy)
    for (let seg = 0; seg < 8; seg++) {
      vx += (rng() - 0.5) * 80
      vy += (rng() - 0.5) * 60
      ctx.lineTo(vx, vy)
    }
    ctx.stroke()
  }

  // Soft blotches
  for (let i = 0; i < 12; i++) {
    const bx = rng() * TEX_SIZE, by = rng() * TEX_SIZE
    const br = 10 + rng() * 30
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br)
    grad.addColorStop(0, `rgba(255,255,255,${0.03 + rng() * 0.04})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(bx - br, by - br, br * 2, br * 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Cinder block / CMU ───────────────────────────────────────────
function generateCinderBlock(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 5 + g * 3 + b)

  const blockH = TEX_SIZE / 4
  const blockW = TEX_SIZE / 2
  const mortar = 4

  // Mortar background
  ctx.fillStyle = `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 25)})`
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : blockW / 2
    for (let col = -1; col < 3; col++) {
      const bx = col * blockW + offset
      const by = row * blockH
      const v = Math.round((rng() - 0.5) * 10)
      ctx.fillStyle = `rgb(${r + v},${g + v},${b + v})`
      ctx.fillRect(bx + mortar / 2, by + mortar / 2, blockW - mortar, blockH - mortar)
      // Subtle aggregate texture on each block
      for (let i = 0; i < 40; i++) {
        const sx = bx + mortar + rng() * (blockW - mortar * 2)
        const sy = by + mortar + rng() * (blockH - mortar * 2)
        ctx.fillStyle = rng() > 0.5 ? `rgba(0,0,0,${0.02 + rng() * 0.04})` : `rgba(255,255,255,${0.02 + rng() * 0.03})`
        ctx.fillRect(sx, sy, 1 + rng() * 2, 1 + rng() * 2)
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Plaster (rough, textured) ───────────────────────────────────
function generatePlaster(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 7 + g * 2 + b * 5)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Trowel marks — broad sweeping strokes
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = rng() > 0.5
      ? `rgba(255,255,255,${0.03 + rng() * 0.05})`
      : `rgba(0,0,0,${0.02 + rng() * 0.04})`
    ctx.lineWidth = 3 + rng() * 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    const sx = rng() * TEX_SIZE, sy = rng() * TEX_SIZE
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(
      sx + (rng() - 0.5) * 120, sy + (rng() - 0.5) * 60,
      sx + (rng() - 0.5) * 160, sy + (rng() - 0.5) * 80,
    )
    ctx.stroke()
  }

  // Fine sand-grain noise
  for (let i = 0; i < 5000; i++) {
    const x = rng() * TEX_SIZE, y = rng() * TEX_SIZE
    ctx.fillStyle = rng() > 0.5 ? `rgba(0,0,0,${0.02 + rng() * 0.03})` : `rgba(255,255,255,${0.02 + rng() * 0.03})`
    ctx.fillRect(x, y, 1, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Drywall (smooth with subtle orange-peel texture) ────────────
function generateDrywall(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r + g * 9 + b * 4)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Orange-peel bumps — small circular highlights
  for (let i = 0; i < 800; i++) {
    const x = rng() * TEX_SIZE, y = rng() * TEX_SIZE
    const rad = 1 + rng() * 3
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
    const bright = rng() > 0.5
    grad.addColorStop(0, bright ? `rgba(255,255,255,${0.03 + rng() * 0.03})` : `rgba(0,0,0,${0.02 + rng() * 0.02})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Log cabin (horizontal round logs) ───────────────────────────
function generateLog(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 2 + g * 7 + b)

  const logH = TEX_SIZE / 4
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  for (let i = 0; i < 4; i++) {
    const cy = i * logH + logH / 2
    // Dark chinking/mortar gap between logs
    ctx.fillStyle = `rgba(0,0,0,0.2)`
    ctx.fillRect(0, i * logH, TEX_SIZE, 2)

    // Log roundness — gradient from highlight center to dark edges
    const grad = ctx.createLinearGradient(0, i * logH + 3, 0, (i + 1) * logH - 1)
    grad.addColorStop(0, `rgba(0,0,0,0.12)`)
    grad.addColorStop(0.3, `rgba(255,255,255,0.06)`)
    grad.addColorStop(0.5, `rgba(255,255,255,0.08)`)
    grad.addColorStop(0.7, `rgba(255,255,255,0.04)`)
    grad.addColorStop(1, `rgba(0,0,0,0.15)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, i * logH + 2, TEX_SIZE, logH - 3)

    // Wood grain — horizontal lines within each log
    for (let y = i * logH + 4; y < (i + 1) * logH - 2; y += 2) {
      const drift = Math.sin(y * 0.05 + i * 3) * 2
      const alpha = 0.02 + rng() * 0.03
      ctx.fillStyle = `rgba(0,0,0,${alpha})`
      ctx.fillRect(drift, y, TEX_SIZE, 1)
    }

    // Occasional knot
    if (rng() > 0.5) {
      const kx = rng() * TEX_SIZE
      const ky = cy
      ctx.beginPath()
      ctx.arc(kx, ky, 5 + rng() * 8, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,0,0,0.06)`
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Stone wall (irregular natural stone) ────────────────────────
function generateStone(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 4 + g + b * 8)

  // Mortar base
  ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 20)},${Math.min(255, b + 15)})`
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Irregular stones
  for (let i = 0; i < 18; i++) {
    const sx = rng() * TEX_SIZE
    const sy = rng() * TEX_SIZE
    const sw = 30 + rng() * 60
    const sh = 20 + rng() * 40
    const v = Math.round((rng() - 0.5) * 25)
    ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r + v))},${Math.max(0, Math.min(255, g + v))},${Math.max(0, Math.min(255, b + v))})`
    // Rounded rectangle for organic stone shape
    const rad = 4 + rng() * 6
    ctx.beginPath()
    ctx.moveTo(sx + rad, sy)
    ctx.lineTo(sx + sw - rad, sy)
    ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + rad)
    ctx.lineTo(sx + sw, sy + sh - rad)
    ctx.quadraticCurveTo(sx + sw, sy + sh, sx + sw - rad, sy + sh)
    ctx.lineTo(sx + rad, sy + sh)
    ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - rad)
    ctx.lineTo(sx, sy + rad)
    ctx.quadraticCurveTo(sx, sy, sx + rad, sy)
    ctx.fill()
    // Edge shadow
    ctx.strokeStyle = `rgba(0,0,0,0.08)`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Stucco (rough exterior texture) ─────────────────────────────
function generateStucco(hex) {
  const { r, g, b } = parseHex(hex)
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE; canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const rng = seededRng(r * 6 + g * 4 + b * 2)

  ctx.fillStyle = hex
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Heavy random texture — rough stucco finish
  for (let i = 0; i < 4000; i++) {
    const x = rng() * TEX_SIZE, y = rng() * TEX_SIZE
    const s = 1 + rng() * 4
    const dark = rng() > 0.45
    ctx.fillStyle = dark ? `rgba(0,0,0,${0.03 + rng() * 0.06})` : `rgba(255,255,255,${0.03 + rng() * 0.05})`
    ctx.fillRect(x, y, s, s)
  }

  // Larger aggregate lumps
  for (let i = 0; i < 60; i++) {
    const x = rng() * TEX_SIZE, y = rng() * TEX_SIZE
    const rad = 2 + rng() * 5
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
    grad.addColorStop(0, `rgba(${rng() > 0.5 ? '255,255,255' : '0,0,0'},${0.04 + rng() * 0.04})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Get a procedural floor/wall texture.
 * @param {string} type - construction material type
 * @param {string} hex - Base color hex
 * @returns {THREE.CanvasTexture | null} null for 'flat' (use hex color directly)
 */
export function getTexture(type, hex) {
  if (!type || type === 'flat') return null
  const key = `${type}_${hex}`
  switch (type) {
    case 'wood':        return cached(key, () => generateWood(hex))
    case 'tile':        return cached(key, () => generateTile(hex))
    case 'carpet':      return cached(key, () => generateCarpet(hex))
    case 'concrete':    return cached(key, () => generateConcrete(hex))
    case 'marble':      return cached(key, () => generateMarble(hex))
    case 'brick':       return cached(key, () => generateBrick(hex))
    case 'shiplap':     return cached(key, () => generateShiplap(hex))
    case 'cinderblock': return cached(key, () => generateCinderBlock(hex))
    case 'plaster':     return cached(key, () => generatePlaster(hex))
    case 'drywall':     return cached(key, () => generateDrywall(hex))
    case 'log':         return cached(key, () => generateLog(hex))
    case 'stone':       return cached(key, () => generateStone(hex))
    case 'stucco':      return cached(key, () => generateStucco(hex))
    default:            return null
  }
}

/**
 * Roughness value for paint finish types.
 * Higher = more matte, lower = more shiny/reflective.
 */
export const PAINT_FINISH_ROUGHNESS = {
  flat:       0.95,
  eggshell:   0.85,
  satin:      0.70,
  semiGloss:  0.50,
  highGloss:  0.25,
}

/**
 * Material roughness per texture type (floors and walls).
 */
export const TEXTURE_ROUGHNESS = {
  wood:        0.78,
  tile:        0.55,
  carpet:      0.98,
  concrete:    0.82,
  marble:      0.35,
  brick:       0.92,
  shiplap:     0.80,
  cinderblock: 0.95,
  plaster:     0.90,
  drywall:     0.88,
  log:         0.85,
  stone:       0.92,
  stucco:      0.95,
  flat:        0.88,
}
