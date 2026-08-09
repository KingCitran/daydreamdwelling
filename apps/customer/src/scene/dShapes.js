// Shared D-shape geometry utilities — used by both the builder (Items.jsx)
// and the landing page (LandingRoomScene.jsx).

import * as THREE from 'three'

// D-shaped outline: straight left edge, curved right side.
// Matches Claude Design CSS: borderRadius '10px 46% 46% 10px / 10px 40% 40% 10px'
export function makeDShape(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -h / 2)
  s.lineTo(-w / 2, h / 2)
  s.lineTo(-w * 0.05, h / 2)
  s.bezierCurveTo(w * 0.5, h * 0.48, w * 0.5, -h * 0.48, -w * 0.05, -h / 2)
  s.closePath()
  return s
}

// Same D-shape as a Path (for punching holes in walls)
export function makeDHole(cx, cy, w, h) {
  const p = new THREE.Path()
  p.moveTo(cx - w / 2, cy - h / 2)
  p.lineTo(cx - w / 2, cy + h / 2)
  p.lineTo(cx - w * 0.05, cy + h / 2)
  p.bezierCurveTo(cx + w * 0.5, cy + h * 0.48, cx + w * 0.5, cy - h * 0.48, cx - w * 0.05, cy - h / 2)
  p.closePath()
  return p
}

// Canvas-based woven rug texture
export function weaveRugTexture(sz = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = sz; canvas.height = sz
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#c9a06a'
  ctx.fillRect(0, 0, sz, sz)
  const b = 16
  ctx.fillStyle = '#dcbb8e'
  ctx.fillRect(b, b, sz - b * 2, sz - b * 2)
  ctx.strokeStyle = 'rgba(140,95,50,0.28)'
  ctx.lineWidth = 1.5
  for (let i = b; i < sz - b; i += 7) {
    ctx.beginPath(); ctx.moveTo(i, b); ctx.lineTo(i, sz - b); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(140,95,50,0.24)'
  for (let i = b; i < sz - b; i += 7) {
    ctx.beginPath(); ctx.moveTo(b, i); ctx.lineTo(sz - b, i); ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
