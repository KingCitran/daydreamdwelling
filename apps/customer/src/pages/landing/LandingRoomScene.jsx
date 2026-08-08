// Landing room scene — uses the ACTUAL builder rendering (same orthographic
// camera, same lighting, same GlbModel) so it looks identical to the product.

import { useRef, useState, useMemo, memo, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOMS_WITH_BRAND as DEFAULT_ROOMS } from './endlessRooms'
import { MOOD_SCENE_PRESETS } from '../../scene/RoomScene'
import { GlbModel } from '../../scene/Items'
import { ITEM_CATALOGUE } from '../../data/items'
import { getTexture } from '../../scene/textures'

const DUR = 30
const CAM_OFFSET = 18 // same as builder
const WALL_T = 0.28   // same as builder
const EXT_C = '#eaf0f6' // cloud-white exterior
// Window cutout on back wall — position & size shared between wall + decor
const WIN_X = -2, WIN_Y_FRAC = 0.55, WIN_W = 3, WIN_H = 4

function hex(css) { return css.match?.(/#[0-9a-f]{6}/i)?.[0] || '#888' }

// ── Camera — matches the builder's isometric view ────────────
function LandingCamera({ gridW, gridD, wallHeight }) {
  const { camera } = useThree()
  useMemo(() => {
    // Lower Y than the builder (14 vs 18) so back walls are more visible during rotation
    camera.position.set(CAM_OFFSET, 14, CAM_OFFSET)
    camera.lookAt(0, wallHeight * 0.45, 0)
    camera.zoom = 26
    camera.updateProjectionMatrix()
  }, [camera, wallHeight])
  return null
}

// ── Floor — white slab + textured top surface ────────────────
function LandingFloor({ gridW, gridD, color, texType }) {
  const fw = gridW + WALL_T, fd = gridD + WALL_T
  const tex = useMemo(() => {
    const t = getTexture(texType, color)
    if (t?.map) { t.map.repeat.set(fw / 3, fd / 3) } // tile every 3ft
    return t
  }, [texType, color, fw, fd])
  return (
    <group position={[-WALL_T / 2, 0, -WALL_T / 2]}>
      {/* Brass floor slab — extends T (0.15) past all edges, matching wall gilding */}
      <mesh position-y={-WALL_T / 2}>
        <boxGeometry args={[fw + 0.15 * 2, WALL_T, fd + 0.15 * 2]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.005} receiveShadow>
        <planeGeometry args={[fw, fd]} />
        <meshStandardMaterial
          color={tex ? '#fff' : color}
          map={tex?.map || null}
          normalMap={tex?.normalMap || null}
          roughnessMap={tex?.roughnessMap || null}
          roughness={tex ? 1.0 : 0.75}
          normalScale={tex?.normalMap ? new THREE.Vector2(1.2, 1.2) : undefined}
        />
      </mesh>
    </group>
  )
}

// ── Walls — white box body + textured interior face ──────────
// Polished white gold — with darker edges for contrast/depth
const BRASS = { color: '#e8e0d0', emissive: '#a09078', emissiveIntensity: 0.25, roughness: 0.25, metalness: 0.75 }
const BRASS_SHADOW = { color: '#8a8070', roughness: 0.5, metalness: 0.6 } // inner shadow strip

// Miter geometries — created once at module level, reused by all instances
let _geoWallMiter = null, _geoTrimMiter = null
function getWallMiter(T) {
  if (!_geoWallMiter) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(T, 0); s.lineTo(0, T); s.closePath()
    _geoWallMiter = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: false })
    _geoWallMiter.translate(0, 0, -0.14)
  }
  return _geoWallMiter
}
function getTrimMiter(T) {
  if (!_geoTrimMiter) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(T, 0); s.lineTo(0, T); s.closePath()
    _geoTrimMiter = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false })
    _geoTrimMiter.translate(0, 0, -T / 2)
  }
  return _geoTrimMiter
}

function LandingWalls({ gridW, gridD, wallHeight, wallColor, sideColor, wallTexType, skipInteriorFaces = false }) {
  const hw = gridW / 2, hd = gridD / 2, hh = wallHeight / 2
  const bw = gridW + WALL_T
  const tex = useMemo(() => {
    const t = getTexture(wallTexType, wallColor)
    if (t?.map) { t.map.repeat.set(bw / 4, wallHeight / 4) }
    return t
  }, [wallTexType, wallColor, bw, wallHeight])
  const extTex = useMemo(() => {
    const t = getTexture('drywall', EXT_C)
    if (t?.map) { t.map.repeat.set(bw / 5, wallHeight / 5) }
    return t
  }, [bw, wallHeight])
  const intProps = {
    color: tex ? '#fff' : undefined,
    map: tex?.map || null, normalMap: tex?.normalMap || null,
    roughnessMap: tex?.roughnessMap || null, roughness: tex ? 1.0 : 0.8,
    normalScale: tex?.normalMap ? new THREE.Vector2(1.2, 1.2) : undefined,
  }
  const extProps = {
    color: extTex ? EXT_C : EXT_C,
    map: extTex?.map || null, normalMap: extTex?.normalMap || null,
    roughnessMap: extTex?.roughnessMap || null, roughness: extTex ? 1.0 : 0.5,
    normalScale: extTex?.normalMap ? new THREE.Vector2(0.8, 0.8) : undefined,
    // Push wall surfaces slightly back so brass gilding wins at shared edges
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  }
  return (
    <group>
      {/* Back wall — always renders a solid exterior box so it never disappears
          during transitions. Brand rooms layer D-hole walls on top via WallDecor.
          Regular rooms add window cutout pieces + interior faces. */}
      <mesh position={[-WALL_T / 2, hh, -hd - WALL_T / 2]} castShadow userData={{ wallBox: 'back' }}>
        <boxGeometry args={[gridW + WALL_T, wallHeight, WALL_T]} />
        <meshStandardMaterial {...extProps}
          {...(skipInteriorFaces ? { polygonOffsetFactor: 3, polygonOffsetUnits: 3 } : {})} />
      </mesh>
      {!skipInteriorFaces && (() => {
        const winY = wallHeight * WIN_Y_FRAC
        // Wall bounds — LEFT extends to -hw-WALL_T to fully cover the left wall edge (no spine)
        const wallL = -hw - WALL_T, wallR = hw
        const wL = WIN_X - WIN_W / 2, wR = WIN_X + WIN_W / 2
        const wB = winY - WIN_H / 2, wT = winY + WIN_H / 2
        const bz = -hd - WALL_T / 2, iz = -hd + 0.005
        const matColor = intProps.color || wallColor
        // Clone texture per piece with world-space UV offset so the pattern
        // tiles seamlessly across all pieces (no visible seams at the window)
        const TILE = 4
        function wallMat(pieceW, pieceH, worldX, worldY) {
          const props = { color: matColor, roughness: intProps.roughness }
          if (tex?.map) {
            const cloned = tex.map.clone()
            cloned.repeat.set(pieceW / TILE, pieceH / TILE)
            cloned.offset.set(worldX / TILE, worldY / TILE)
            props.map = cloned; props.color = '#fff'; props.roughness = 1.0
            if (tex.normalMap) {
              const n = tex.normalMap.clone()
              n.repeat.set(pieceW / TILE, pieceH / TILE)
              n.offset.set(worldX / TILE, worldY / TILE)
              props.normalMap = n; props.normalScale = new THREE.Vector2(1.2, 1.2)
            }
            if (tex.roughnessMap) {
              const r = tex.roughnessMap.clone()
              r.repeat.set(pieceW / TILE, pieceH / TILE)
              r.offset.set(worldX / TILE, worldY / TILE)
              props.roughnessMap = r
            }
          }
          return props
        }
        const leftW = wL - wallL, rightW = wallR - wR
        const aboveH = wallHeight - wT, belowH = wB
        return (<>
          {/* Left of window — full height */}
          <mesh position={[(wallL + wL) / 2, hh, bz]} castShadow>
            <boxGeometry args={[leftW, wallHeight, WALL_T]} />
            <meshStandardMaterial {...extProps} /></mesh>
          <mesh position={[(wallL + wL) / 2, hh, iz]} receiveShadow>
            <planeGeometry args={[leftW, wallHeight]} />
            <meshStandardMaterial {...wallMat(leftW, wallHeight, wallL, 0)} /></mesh>
          {/* Right of window — full height */}
          <mesh position={[(wR + wallR) / 2, hh, bz]} castShadow>
            <boxGeometry args={[rightW, wallHeight, WALL_T]} />
            <meshStandardMaterial {...extProps} /></mesh>
          <mesh position={[(wR + wallR) / 2, hh, iz]} receiveShadow>
            <planeGeometry args={[rightW, wallHeight]} />
            <meshStandardMaterial {...wallMat(rightW, wallHeight, wR, 0)} /></mesh>
          {/* Above window */}
          <mesh position={[WIN_X, (wT + wallHeight) / 2, bz]} castShadow>
            <boxGeometry args={[WIN_W, aboveH, WALL_T]} />
            <meshStandardMaterial {...extProps} /></mesh>
          <mesh position={[WIN_X, (wT + wallHeight) / 2, iz]} receiveShadow>
            <planeGeometry args={[WIN_W, aboveH]} />
            <meshStandardMaterial {...wallMat(WIN_W, aboveH, wL, wT)} /></mesh>
          {/* Below window */}
          <mesh position={[WIN_X, belowH / 2, bz]} castShadow>
            <boxGeometry args={[WIN_W, belowH, WALL_T]} />
            <meshStandardMaterial {...extProps} /></mesh>
          <mesh position={[WIN_X, belowH / 2, iz]} receiveShadow>
            <planeGeometry args={[WIN_W, belowH]} />
            <meshStandardMaterial {...wallMat(WIN_W, belowH, wL, 0)} /></mesh>
          {/* Paper backing in PaletteBack3D covers the window hole from the palette side */}
        </>)
      })()}

      {/* Left wall — box always renders, interior face only for regular rooms */}
      <mesh position={[-hw - WALL_T / 2, hh, 0]} castShadow userData={{ wallBox: 'side' }}>
        <boxGeometry args={[WALL_T, wallHeight, gridD]} />
        <meshStandardMaterial {...extProps}
          {...(skipInteriorFaces ? { polygonOffsetFactor: 3, polygonOffsetUnits: 3 } : {})} />
      </mesh>
      {!skipInteriorFaces && (
        <mesh position={[-hw + 0.005, hh, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[gridD, wallHeight]} />
          <meshStandardMaterial {...intProps} color={intProps.color || sideColor} />
        </mesh>
      )}

      {/* ── Brass gilding — 45° mitered corners ── */}
      {(() => {
        const T = 0.15
        const bwFull = gridW + WALL_T

        // Miter triangle — right triangle fills T×T gap at each corner
        // Shape in XY: (0,0)→(T,0)→(0,T)→close. Hypotenuse = 45° miter line.
        // Extruded along Z. Each corner gets its own rotated version.
        function miter(depth) {
          const s = new THREE.Shape()
          s.moveTo(0, 0); s.lineTo(T, 0); s.lineTo(0, T); s.closePath()
          const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false })
          g.translate(0, 0, -depth / 2)
          return g
        }

        const geoWall = getWallMiter(T)
        const geoTrim = getTrimMiter(T)
        const B = BRASS

        return (<>
          {/* ── Strips — stop at corners, gaps filled by miter triangles ── */}
          {/* Back wall top */}
          <mesh position={[-WALL_T / 2, wallHeight + T / 2, -hd - WALL_T / 2]}>
            <boxGeometry args={[bwFull, T, WALL_T]} />
            <meshStandardMaterial {...B} /></mesh>
          {/* Left wall top */}
          <mesh position={[-hw - WALL_T / 2, wallHeight + T / 2, 0]}>
            <boxGeometry args={[WALL_T, T, gridD]} />
            <meshStandardMaterial {...B} /></mesh>
          {/* Back wall right vertical — full height */}
          <mesh position={[hw + T / 2, hh, -hd - WALL_T / 2]}>
            <boxGeometry args={[T, wallHeight, WALL_T]} />
            <meshStandardMaterial {...B} /></mesh>
          {/* Left wall front vertical — full height */}
          <mesh position={[-hw - WALL_T / 2, hh, hd + T / 2]}>
            <boxGeometry args={[WALL_T, wallHeight, T]} />
            <meshStandardMaterial {...B} /></mesh>
          {/* Floor gilding — the brass slab in LandingFloor handles all 4 edges */}

          {/* ── Shadow lines — thin dark strips where gilding meets wall/floor ── */}
          {(() => {
            const S = 0.03 // shadow strip thickness
            const SH = BRASS_SHADOW
            return (<>
              {/* Under back wall top gilding */}
              <mesh position={[-WALL_T / 2, wallHeight - S / 2, -hd - WALL_T / 2]}>
                <boxGeometry args={[bwFull, S, WALL_T + 0.01]} />
                <meshStandardMaterial {...SH} /></mesh>
              {/* Under left wall top gilding */}
              <mesh position={[-hw - WALL_T / 2, wallHeight - S / 2, 0]}>
                <boxGeometry args={[WALL_T + 0.01, S, gridD]} />
                <meshStandardMaterial {...SH} /></mesh>
              {/* Left of back wall right vertical */}
              <mesh position={[hw - S / 2, hh, -hd - WALL_T / 2]}>
                <boxGeometry args={[S, wallHeight, WALL_T + 0.01]} />
                <meshStandardMaterial {...SH} /></mesh>
              {/* Right of left wall front vertical */}
              <mesh position={[-hw - WALL_T / 2, hh, hd - S / 2]}>
                <boxGeometry args={[WALL_T + 0.01, wallHeight, S]} />
                <meshStandardMaterial {...SH} /></mesh>
            </>)
          })()}

          {/* ── Miter corners — triangle fills each T×T gap ── */}
          {/* Top-right of back wall: top H meets right V (XY plane, extrude Z) */}
          <mesh geometry={geoWall} position={[hw, wallHeight, -hd - WALL_T / 2]}>
            <meshStandardMaterial {...B} /></mesh>

          {/* Top-left L-corner: back top meets left top (XZ plane, extrude Y) */}
          <mesh geometry={geoTrim} position={[-hw - WALL_T / 2, wallHeight, -hd - WALL_T / 2]}
            rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial {...B} /></mesh>

          {/* Top-front-left: left top meets left front V (YZ plane, extrude X) */}
          <mesh geometry={geoWall} position={[-hw - WALL_T / 2, wallHeight, hd]}
            rotation={[0, -Math.PI / 2, 0]}><meshStandardMaterial {...B} /></mesh>

          {/* ── Bottom miter corners — where vertical strips meet the floor slab ── */}
          {/* Bottom-right of back wall: right V meets floor slab (XY plane, extrude Z) */}
          <mesh geometry={geoWall} position={[hw, 0, -hd - WALL_T / 2]}
            rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial {...B} /></mesh>

          {/* Bottom-left L-corner: back bottom meets left bottom (XZ plane, extrude Y) */}
          <mesh geometry={geoTrim} position={[-hw - WALL_T / 2, 0, -hd - WALL_T / 2]}
            rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial {...B} /></mesh>

          {/* Bottom-front-left: left front V meets floor slab (YZ plane, extrude X) */}
          <mesh geometry={geoWall} position={[-hw - WALL_T / 2, 0, hd]}
            rotation={[0, -Math.PI / 2, -Math.PI / 2]}><meshStandardMaterial {...B} /></mesh>

        </>)
      })()}
    </group>
  )
}

// ── D-shape geometry for brand room ──────────────────────────
// Matches Claude Design's CSS: borderRadius '10px 46% 46% 10px / 10px 40% 40% 10px'
// Straight left edge, heavily curved right side
function makeDShape(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -h / 2)
  s.lineTo(-w / 2, h / 2)
  s.lineTo(-w * 0.05, h / 2)
  s.bezierCurveTo(w * 0.5, h * 0.48, w * 0.5, -h * 0.48, -w * 0.05, -h / 2)
  s.closePath()
  return s
}

// D-shaped hole path (for punching out of a wall)
function makeDHole(cx, cy, w, h) {
  const p = new THREE.Path()
  p.moveTo(cx - w / 2, cy - h / 2)
  p.lineTo(cx - w / 2, cy + h / 2)
  p.lineTo(cx - w * 0.05, cy + h / 2)
  p.bezierCurveTo(cx + w * 0.5, cy + h * 0.48, cx + w * 0.5, cy - h * 0.48, cx - w * 0.05, cy - h / 2)
  p.closePath()
  return p
}

// Wall face with a D-shaped hole cut out
function makeWallWithDHole(wallW, wallH, dx, dy, dw, dh) {
  const s = new THREE.Shape()
  s.moveTo(-wallW / 2, 0)
  s.lineTo(wallW / 2, 0)
  s.lineTo(wallW / 2, wallH)
  s.lineTo(-wallW / 2, wallH)
  s.closePath()
  s.holes.push(makeDHole(dx, dy, dw, dh))
  return new THREE.ShapeGeometry(s)
}

// Woven crosshatch texture for the D rug — includes border in the texture
function weaveRugTexture(sz = 256) {
  return makeCanvas(sz, sz, (ctx, w, h) => {
    // Border
    ctx.fillStyle = '#c9a06a'
    ctx.fillRect(0, 0, w, h)
    // Inner rug area
    const b = 16 // border width in pixels
    ctx.fillStyle = '#dcbb8e'
    ctx.fillRect(b, b, w - b * 2, h - b * 2)
    // Crosshatch weave
    ctx.strokeStyle = 'rgba(140,95,50,0.28)'
    ctx.lineWidth = 1.5
    for (let i = b; i < w - b; i += 7) {
      ctx.beginPath(); ctx.moveTo(i, b); ctx.lineTo(i, h - b); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(140,95,50,0.24)'
    for (let i = b; i < h - b; i += 7) {
      ctx.beginPath(); ctx.moveTo(b, i); ctx.lineTo(w - b, i); ctx.stroke()
    }
  })
}

// ── Wall decor — window + art (or D windows for brand room) ──
function WallDecor({ room }) {
  const { gridW, gridD, wallHeight } = room
  const hw = gridW / 2, hd = gridD / 2
  const c1 = hex(room.art), c2 = hex(room.seat), accent = room.accent

  // Brand room — full wall geometry with D holes punched through
  const dw = 4.5, dh = 5.5
  const dCenterY = wallHeight * 0.55

  // Extruded walls with D holes (full thickness — sky visible through the hole)
  const backWallGeo = useMemo(() => {
    if (!room.brand) return null
    const s = new THREE.Shape()
    s.moveTo(-(gridW + WALL_T) / 2, 0)
    s.lineTo((gridW + WALL_T) / 2, 0)
    s.lineTo((gridW + WALL_T) / 2, wallHeight)
    s.lineTo(-(gridW + WALL_T) / 2, wallHeight)
    s.closePath()
    s.holes.push(makeDHole(0, dCenterY, dw, dh))
    const g = new THREE.ExtrudeGeometry(s, { depth: WALL_T, bevelEnabled: false })
    g.computeVertexNormals()
    return g
  }, [room.brand, gridW, wallHeight])

  const sideWallGeo = useMemo(() => {
    if (!room.brand) return null
    const s = new THREE.Shape()
    s.moveTo(-gridD / 2, 0)
    s.lineTo(gridD / 2, 0)
    s.lineTo(gridD / 2, wallHeight)
    s.lineTo(-gridD / 2, wallHeight)
    s.closePath()
    s.holes.push(makeDHole(0, dCenterY, dw, dh))
    const g = new THREE.ExtrudeGeometry(s, { depth: WALL_T, bevelEnabled: false })
    g.computeVertexNormals()
    return g
  }, [room.brand, gridD, wallHeight])

  const rugTex = useMemo(() => room.brand ? weaveRugTexture() : null, [room.brand])

  // D frame ring geometry — created unconditionally to respect hooks rules
  const dFrameGeo = useMemo(() => {
    if (!room.brand) return null
    const outer = makeDShape(dw + 0.5, dh + 0.5)
    const innerHole = makeDHole(0, 0, dw - 0.3, dh - 0.3)
    outer.holes.push(innerHole)
    const g = new THREE.ExtrudeGeometry(outer, { depth: WALL_T * 1.5, bevelEnabled: false })
    g.translate(0, 0, -WALL_T * 0.75) // center the depth
    return g
  }, [room.brand, dw, dh])

  if (room.brand) {
    const wc = hex(room.wall), sc = hex(room.side)
    return (
      <group>
        {/* ── Back wall with D hole ── */}
        <mesh position={[0, 0, -hd - WALL_T]} geometry={backWallGeo}>
          <meshStandardMaterial color={wc} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Wooden D frame ring around the hole */}
        <mesh position={[0, dCenterY, -hd]} geometry={dFrameGeo}>
          <meshStandardMaterial color="#c08a4e" roughness={0.6}
            emissive="#604020" emissiveIntensity={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* ── Left wall with D hole ── */}
        <mesh position={[-hw - WALL_T, 0, 0]} rotation-y={Math.PI / 2} geometry={sideWallGeo}>
          <meshStandardMaterial color={sc} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Wooden D frame ring on left wall */}
        <mesh position={[-hw, dCenterY, 0]} rotation-y={Math.PI / 2} geometry={dFrameGeo}>
          <meshStandardMaterial color="#c08a4e" roughness={0.6}
            emissive="#604020" emissiveIntensity={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* ── D-shaped woven rug ── */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.5]}>
          <shapeGeometry args={[makeDShape(5, 5.5)]} />
          <meshStandardMaterial map={rugTex} roughness={0.92}
            polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      {/* ── Back wall: window (left) + large art (right) ── */}
      {/* Window — exact builder code, positioned IN the wall opening */}
      {(() => {
        const fw = WIN_W, fh = WIN_H, fd = WALL_T
        const FRAME = 0.08, MULL = FRAME * 0.7
        const frameColor = '#d0c8b8', glassHex = '#c0e8ff'
        const cols = 1, rows = 2
        const gxL = -(fw / 2 - FRAME), gxR = fw / 2 - FRAME
        const gyT = fh / 2 - FRAME, gyB = -(fh / 2 - FRAME * 1.5)
        const gW = gxR - gxL, gH = gyT - gyB
        const pW = (gW - (cols - 1) * MULL) / cols
        const pH = (gH - (rows - 1) * MULL) / rows
        const panes = []
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            panes.push({ px: gxL + (c + 0.5) * pW + c * MULL, py: gyT - (r + 0.5) * pH - r * MULL })
        const hMulls = Array.from({ length: rows - 1 }, (_, r) => gyT - (r + 1) * pH - r * MULL - MULL / 2)
        return (
          <group position={[WIN_X, wallHeight * WIN_Y_FRAC, -hd]}>
            {/* Frame — box pieces, same as builder. Exterior cover hides from palette side. */}
            <mesh position={[-(fw / 2 - FRAME / 2), 0, 0]}>
              <boxGeometry args={[FRAME, fh, fd]} />
              <meshStandardMaterial color={frameColor} roughness={0.85} /></mesh>
            <mesh position={[fw / 2 - FRAME / 2, 0, 0]}>
              <boxGeometry args={[FRAME, fh, fd]} />
              <meshStandardMaterial color={frameColor} roughness={0.85} /></mesh>
            <mesh position={[0, fh / 2 - FRAME / 2, 0]}>
              <boxGeometry args={[fw, FRAME, fd]} />
              <meshStandardMaterial color={frameColor} roughness={0.85} /></mesh>
            <mesh position={[0, -(fh / 2 - FRAME * 0.75), 0]}>
              <boxGeometry args={[fw + 0.06, FRAME * 1.5, fd * 1.25]} />
              <meshStandardMaterial color={frameColor} roughness={0.85} /></mesh>
            {hMulls.map((my, i) => (
              <mesh key={`hm${i}`} position={[0, my, 0]}>
                <boxGeometry args={[gW, MULL, fd * 0.6]} />
                <meshStandardMaterial color={frameColor} roughness={0.85} /></mesh>
            ))}
            {/* No glass panes — sky shows through the frame opening cleanly */}
          </group>
        )
      })()}
      {/* Large art piece */}
      <group position={[2, wallHeight * 0.55, -hd + 0.06]}>
        <mesh><boxGeometry args={[2.8, 2.2, 0.1]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.3} /></mesh>
        <mesh position={[0, 0.15, 0.04]}><planeGeometry args={[2.4, 0.8]} />
          <meshStandardMaterial color={c1} roughness={0.55} /></mesh>
        <mesh position={[0, -0.45, 0.04]}><planeGeometry args={[2.4, 0.8]} />
          <meshStandardMaterial color={c2} roughness={0.55} /></mesh>
      </group>

      {/* ── Side wall: gallery trio, all rotated as one group ── */}
      <group position={[-hw + 0.06, 0, 0]} rotation-y={Math.PI / 2}>
        {[[-2.5, c1], [0, accent], [2.5, c2]].map(([xOff, color], i) => (
          <group key={i} position={[xOff, wallHeight * 0.55, 0]}>
            <mesh><boxGeometry args={[1.5, 1.9, 0.1]} />
              <meshStandardMaterial color="#f0ece4" roughness={0.3} /></mesh>
            <mesh position-z={0.04}><planeGeometry args={[1.1, 1.5]} />
              <meshStandardMaterial color={color} roughness={0.55} /></mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ── Canvas texture helpers ───────────────────────────────────
function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}
function weaveTexture(base, weave, sz = 128) {
  return makeCanvas(sz, sz, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = weave; ctx.lineWidth = 2
    for (let i = 0; i < w; i += 12) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke()
    }
  })
}
function woodTexture(from, to, w = 256, h = 64) {
  return makeCanvas(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, from); g.addColorStop(1, to)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1.5
    for (let x = 0; x < w; x += 14) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  })
}
function gradientTexture(str, sz = 64) {
  const colors = str.match(/#[0-9a-f]{6}/gi) || ['#888', '#666']
  return makeCanvas(sz, sz, (ctx, w, h) => {
    const isRadial = str.includes('radial')
    const g = isRadial
      ? ctx.createRadialGradient(w * 0.35, h * 0.3, 0, w / 2, h / 2, w / 2)
      : ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1] || colors[0])
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  })
}
function stripeTexture(c1, c2, sz = 128) {
  return makeCanvas(sz, sz, (ctx, w, h) => {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = c2
    for (let y = 0; y < h; y += 14) ctx.fillRect(0, y + 12, w, 2)
  })
}
function polkaTexture(bg, dot, sz = 128) {
  return makeCanvas(sz, sz, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = dot
    for (let y = 0; y < h; y += 22) for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.arc(x + 7, y + 8, 3, 0, Math.PI * 2); ctx.fill()
    }
  })
}

// ── 3D palette board pieces ─────────────────────────────────
// Each piece looks like a real interior-designer sample card.
const CARD_T = 0.04 // card thickness for depth

function PaintChip3D({ x, y, z, w, h, color, rot, chipIdx = -1 }) {
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      {/* White card — plane so it's one-sided (invisible from inside room) */}
      <mesh position-z={0.005}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#fff" roughness={0.4} side={THREE.FrontSide} />
      </mesh>
      {/* Color well inset */}
      <mesh position-z={0.01} userData={{ pt: 'chip', idx: chipIdx }}>
        <planeGeometry args={[w * 0.82, h * 0.65]} />
        <meshStandardMaterial color={color} roughness={0.6} side={THREE.FrontSide} />
      </mesh>
      {/* Label line 1 */}
      <mesh position={[-(w * 0.1), -(h * 0.38), CARD_T + 0.005]}>
        <planeGeometry args={[w * 0.5, h * 0.02]} />
        <meshBasicMaterial color="#1a2a48" transparent opacity={0.28} />
      </mesh>
      {/* Label line 2 */}
      <mesh position={[-(w * 0.18), -(h * 0.42), CARD_T + 0.005]}>
        <planeGeometry args={[w * 0.34, h * 0.015]} />
        <meshBasicMaterial color="#1a2a48" transparent opacity={0.16} />
      </mesh>
    </group>
  )
}

function FabricSwatch3D({ x, y, z, s, base, weave, rot, fabIdx = -1 }) {
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      <mesh position-z={0.005}>
        <planeGeometry args={[s, s]} />
        <meshStandardMaterial color="#fff" roughness={0.4} side={THREE.FrontSide} />
      </mesh>
      <mesh position-z={0.01} userData={{ pt: 'fab', idx: fabIdx }}>
        <planeGeometry args={[s * 0.84, s * 0.84]} />
        <meshStandardMaterial color={base} roughness={0.75} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

function WoodPlank3D({ x, y, z, w, h, from, to, rot }) {
  return (
    <mesh position={[x, y, z]} rotation-y={rot} userData={{ pt: 'wood' }}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={from} roughness={0.8} side={THREE.FrontSide} />
    </mesh>
  )
}

function GradientDot3D({ x, y, z, r, gradient, rot, dotId = '' }) {
  const dotColor = hex(gradient)
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      <mesh position-z={0.005}>
        <circleGeometry args={[r, 24]} />
        <meshStandardMaterial color="#fff" roughness={0.4} side={THREE.FrontSide} />
      </mesh>
      <mesh position-z={0.01} userData={{ pt: 'dot', which: dotId }}>
        <circleGeometry args={[r * 0.8, 24]} />
        <meshStandardMaterial color={dotColor} roughness={0.5} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

function WallpaperSheet3D({ x, y, z, w, h, tex, rot }) {
  return (
    <group position={[x, y, z]} rotation-y={rot}>
      <mesh position-z={0.005}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#fff" roughness={0.4} side={THREE.FrontSide} />
      </mesh>
      <mesh position-z={0.01}>
        <planeGeometry args={[w * 0.88, h * 0.92]} />
        <meshStandardMaterial map={tex} roughness={0.6} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

// ── Full palette board layouts ──────────────────────────────
// Professional interior-designer material board: color strip at top,
// even grid of material samples below. All swatches same size.

// ── Palette boards — vision board / designer file feel ───────
// Warm paper backing tinted to the room's mood, with curated swatches.

const PaletteBack3D = memo(function PaletteBack3D({ room, gridW, wallHeight }) {
  const p = room.palette, hd = room.gridD / 2, hw = gridW / 2
  const z = -hd - WALL_T - 0.06, rot = Math.PI
  // Board dimensions (inset 7% from wall edges)
  const inset = 0.07
  const bw = gridW * (1 - inset * 2), bh = wallHeight * (1 - inset * 2)
  const bcx = 0, bcy = wallHeight / 2
  // Paper tint: mix room's dominant color 30% with cream
  const paperColor = hex(p.chips[0])

  // Swatch grid on the paper
  const margin = 0.08, gap = 0.04
  const cols = 3, rows = 3
  const sw = (bw - bw * margin * 2 - bw * gap * (cols - 1)) / cols
  const sh = (bh - bh * margin * 2 - bh * gap * (rows - 1)) / rows
  const sx = (c) => -bw / 2 + bw * margin + sw / 2 + c * (sw + bw * gap)
  const sy = (r) => bh / 2 - bh * margin - sh / 2 - r * (sh + bh * gap)

  return (
    <group>
      {/* Warm paper backing — behind the swatches (z+0.02 = closer to wall = behind) */}
      <mesh position={[bcx, bcy, z + 0.02]} rotation-y={rot} userData={{ pt: 'paper' }}>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial color={paperColor} roughness={0.85} side={THREE.FrontSide} />
      </mesh>

      {/* Row 0: 3 paint chips — the room's hero colors */}
      {[0, 1, 2].map(i => (
        <PaintChip3D key={i} x={bcx + sx(i)} y={bcy + sy(0)} z={z}
          w={sw} h={sh} color={p.chips[i]} rot={rot} chipIdx={i} />
      ))}
      {/* Row 1: large fabric swatch (2 cols) + accent dot */}
      <FabricSwatch3D key="f0" x={bcx + (sx(0) + sx(1)) / 2} y={bcy + sy(1)} z={z}
        s={sh} base={p.fab[0][0]} weave={p.fab[0][1]} rot={rot} fabIdx={0} />
      <PaintChip3D x={bcx + sx(2)} y={bcy + sy(1)} z={z}
        w={sw} h={sh} color={p.chips[3]} rot={rot} chipIdx={3} />
      {/* Row 2: wood plank (2 cols) + lamp dot */}
      <WoodPlank3D x={bcx + (sx(0) + sx(1)) / 2} y={bcy + sy(2)} z={z}
        w={sw * 2 + bw * gap} h={sh * 0.65} from={p.wood[0]} to={p.wood[1]} rot={rot} />
      <GradientDot3D x={bcx + sx(2)} y={bcy + sy(2)} z={z}
        r={sw * 0.4} gradient={p.lamp} rot={rot} dotId="lamp" />
    </group>
  )
})

const PaletteSide3D = memo(function PaletteSide3D({ room, gridW, gridD, wallHeight }) {
  const p = room.palette, hw = gridW / 2, hdd = gridD / 2
  const x = -hw - WALL_T - 0.06, rot = -Math.PI / 2
  const inset = 0.07
  const bw = gridD * (1 - inset * 2), bh = wallHeight * (1 - inset * 2)
  const bcy = wallHeight / 2, bcz = 0
  const paperColor = hex(p.chips[0])

  const margin = 0.08, gap = 0.04
  const cols = 3, rows = 2
  const sw = (bw - bw * margin * 2 - bw * gap * (cols - 1)) / cols
  const sh = (bh - bh * margin * 2 - bh * gap * (rows - 1)) / rows
  const sz = (c) => -bw / 2 + bw * margin + sw / 2 + c * (sw + bw * gap)
  const sy = (r) => bh / 2 - bh * margin - sh / 2 - r * (sh + bh * gap)

  return (
    <group>
      {/* Warm paper backing — behind swatches */}
      <mesh position={[x + 0.02, bcy, bcz]} rotation-y={rot} userData={{ pt: 'paper_side' }}>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial color={paperColor} roughness={0.85} side={THREE.FrontSide} />
      </mesh>

      {/* Row 0: 2 fabric swatches + material dot */}
      {p.fab.slice(0, 2).map(([base, weave], i) => (
        <FabricSwatch3D key={`sf${i}`} x={x} y={bcy + sy(0)} z={bcz + sz(i)}
          s={Math.min(sw, sh)} base={base} weave={weave} rot={rot} fabIdx={10 + i} />
      ))}
      <GradientDot3D x={x} y={bcy + sy(0)} z={bcz + sz(2)}
        r={Math.min(sw, sh) * 0.4} gradient={p.dot} rot={rot} dotId="dot" />
      {/* Row 1: 3 paint chips */}
      {p.fab.map(([c], i) => (
        <PaintChip3D key={`sp${i}`} x={x} y={bcy + sy(1)} z={bcz + sz(i)}
          w={sw} h={sh} color={c} rot={rot} chipIdx={10 + i} />
      ))}
    </group>
  )
})

// ── Single item — reuses the builder's GlbModel ─────────────
// Lamp items also emit a warm point light for mood lighting.
const LAMP_TYPES = new Set(['floorLamp', 'tableLamp', 'deskLamp'])

const LandingItem = memo(function LandingItem({ typeKey, col, row, rotation, sizeIndex, swatchIndex, gridW, gridD }) {
  const def = ITEM_CATALOGUE[typeKey]
  if (!def?.sizes) return null
  const size = def.sizes[sizeIndex] ?? def.sizes[0]
  const fw = size.footprint?.[0] ?? 1, fd = size.footprint?.[1] ?? 1, fh = size.height ?? 1
  const rotated = rotation === 90 || rotation === 270
  const ew = rotated ? fd : fw, ed = rotated ? fw : fd
  const wx = (col + ew / 2) - gridW / 2
  const wz = (row + ed / 2) - gridD / 2
  const color = def.swatches?.[swatchIndex]?.hex ?? def.color ?? '#9a7aee'
  const modelUrl = def.modelUrl || null
  const isLamp = LAMP_TYPES.has(typeKey)

  return (
    <group position={[wx, fh / 2, wz]} rotation={[0, -(rotation * Math.PI) / 180, 0]}>
      {modelUrl ? (
        <Suspense fallback={
          <mesh><boxGeometry args={[fw, fh, fd]} />
            <meshStandardMaterial color={color} roughness={0.76} opacity={0.4} transparent />
          </mesh>
        }>
          <GlbModel url={modelUrl} fw={fw} fh={fh} fd={fd}
            scale={def.scaleMultiplier ?? 1} rotationDeg={def.orientationOffsetDeg ?? 0}
            materialSheen={def.materialSheen ?? null} />
        </Suspense>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial color={color} roughness={0.76} />
        </mesh>
      )}
      {/* Lamps emit a warm point light */}
      {isLamp && (
        <pointLight position={[0, fh * 0.2, 0]} color="#ffcc88"
          intensity={2.5} distance={10} decay={2} />
      )}
    </group>
  )
})

// ── Main scene ───────────────────────────────────────────────
// Boost + floor for landing page brightness
const HEMI_BOOST = 1.6, KEY_BOOST = 1.4, FILL_BOOST = 1.5
const HEMI_MIN = 0.5, KEY_MIN = 0.85, FILL_MIN = 0.35
function moodVal(base, boost, min) { return Math.max(base * boost, min) }

export default function LandingRoomScene({ tickRef, rooms: ROOMS = DEFAULT_ROOMS, startDelay = 0, initialAngle = 0 }) {
  const angleOffset = (initialAngle * Math.PI) / 180
  const L = ROOMS.length
  const groupRef = useRef()
  const itemsRef = useRef()
  const wallGroupRef = useRef()   // LandingWalls + Floor — for color lerping
  const wallDecorRef = useRef()   // WallDecor (D-walls, window frames) — also lerped
  const boardBackRef = useRef()  // back wall palette group
  const boardSideRef = useRef()  // side wall palette group
  const hemiRef = useRef()
  const keyRef = useRef()
  const fillRef = useRef()
  const [idx, setIdx] = useState(0)
  const coRef = useRef(1)
  const prevColors = useRef(null)  // colors before transition
  const boardBackRoom = useRef(0)  // which room the back palette currently shows
  const boardSideRoom = useRef(0)  // which room the side palette currently shows
  const lastKey = useRef('')
  const lightFrom = useRef(0)
  const lightTo = useRef(0)
  // Pre-allocated — reused every frame, zero GC pressure
  const _cA = useMemo(() => new THREE.Color(), [])
  const _cB = useMemo(() => new THREE.Color(), [])
  const reduced = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])

  useFrame(({ clock }) => {
    if (reduced) return
    const raw = clock.getElapsedTime()
    const t = Math.max(0, raw - startDelay)
    const i = Math.floor(t / DUR), p = (t % DUR) / DUR

    // Spin
    if (groupRef.current) groupRef.current.rotation.y = (t / DUR) * Math.PI * 2 + angleOffset

    // ── The Magician's Misdirection ──
    // All swaps happen at p≈0.50 (180°) when the L-walls maximally block
    // the interior from the isometric camera. Nothing changes while visible.
    //
    // ── Timeline (pushed late — L-walls stay visible longer than a box) ──
    // 0.00-0.40: Room faces viewer — fully visible, enjoy the scene
    // 0.40-0.48: Items fade out (walls occluding interior)
    // 0.48-0.68: HIDDEN WINDOW — walls fully block interior
    //   0.50: interior items + wall colors swap (dead center, 180°)
    // 0.62-0.70: Items fade back in (still behind walls)
    // 0.70-0.92: Sky + lighting cross-fade
    // 0.85: Caption flips
    // 0.92+: Room swings back into view with new room

    // Content opacity — furniture + wall decor (fade out before swap, fade in well after)
    const co = p < 0.42 ? 1 : p < 0.50 ? 1 - (p - 0.42) / 0.08 : p < 0.68 ? 0 : p < 0.78 ? (p - 0.68) / 0.10 : 1
    coRef.current = co
    const fadeContent = (ref) => ref?.current?.traverse(c => {
      if (c.isMesh && c.material) { c.material.opacity = co; c.material.transparent = co < 1 }
    })
    fadeContent(itemsRef)
    fadeContent(wallDecorRef)
    // Palette boards stay at full opacity — backface culling handles visibility

    // Swap indices — interior changes at center of hidden window
    const interior = (p >= 0.61 ? i + 1 : i) % L
    const caption  = (p >= 0.61 ? i + 1 : i) % L
    const front    = (p >= 0.61 ? i + 1 : i) % L

    // ── Per-wall palette board visibility ──
    // Each board shows when its wall's EXTERIOR faces the camera (palette side),
    // and hides when the INTERIOR faces the camera (window/room side).
    // Snap at the exact edge-on moment — neither side visible during the swap.
    //
    // With -40° offset, camera at 45° isometric:
    // Back wall exterior visible: visual θ ∈ (135°, 315°) → p ∈ (0.486, 0.986)
    // Side wall exterior visible: visual θ ∈ (45°, 225°)  → p ∈ (0.236, 0.736)
    if (boardBackRef.current) boardBackRef.current.visible = p >= 0.486 && p <= 0.986
    if (boardSideRef.current) boardSideRef.current.visible = p >= 0.236 && p <= 0.736

    // ── Wall box visibility — INVERSE of palette boards ──
    // Wall boxes hide when interior faces camera (so windows/D-holes show sky),
    // and show when exterior faces camera (backing for palette boards).
    // Geometry stays mounted — only visibility toggles, no React unmounting.
    wallGroupRef.current?.traverse(c => {
      if (c.userData?.wallBox === 'back') c.visible = p >= 0.486 && p <= 0.986
      else if (c.userData?.wallBox === 'side') c.visible = p >= 0.236 && p <= 0.736
    })

    if (interior !== idx) {
      // Save current colors before swap for lerping
      prevColors.current = {
        wall: hex(ROOMS[idx]?.wall), side: hex(ROOMS[idx]?.side),
        floor: hex(ROOMS[idx]?.floor),
      }
      setIdx(interior)
    }

    // ── Wall/floor color lerp — smooth cross-fade during hidden window ──
    // Both interiors hidden: visual θ ∈ (135°, 225°) → p ∈ (0.486, 0.736)
    // Lerp all interior mesh colors from current room to next room.
    // By the time walls reappear, colors are fully transitioned.
    const fromIdx = (i) % L, toIdx = (i + 1) % L
    if (p >= 0.49 && p <= 0.73) {
      const blend = Math.min(1, (p - 0.49) / 0.24)
      const fromC = new THREE.Color(hex(ROOMS[fromIdx].wall))
      const toC = new THREE.Color(hex(ROOMS[toIdx].wall))
      const lerped = fromC.clone().lerp(toC, blend)
      const fromF = new THREE.Color(hex(ROOMS[fromIdx].floor))
      const toF = new THREE.Color(hex(ROOMS[toIdx].floor))
      const lerpedF = fromF.clone().lerp(toF, blend)
      // Lerp walls + floor + wall decor (D-walls, window frames) — NOT furniture
      const lerpSurface = (ref) => ref?.current?.traverse(c => {
        if (c.isMesh && c.material && !c.material.metalness) {
          if (c.rotation?.x < -1) c.material.color.copy(lerpedF)
          else c.material.color.copy(lerped)
        }
      })
      lerpSurface(wallGroupRef)
      lerpSurface(wallDecorRef)
    }

    // ── Palette swap — at p=0.15 (early in cycle, room front-facing) ──

    // ── Palette swap — at p=0.15 (early in cycle, room front-facing) ──
    // With the -40° initialAngle offset, palette boards are fully hidden
    // when the room faces forward. Swap early in the cycle while the
    // interior is on display and boards are backface-culled.
    const palTarget = (p >= 0.15 ? i : (i + L - 1) % L) % L
    if (palTarget !== boardBackRoom.current) {
      boardBackRoom.current = palTarget
      boardSideRoom.current = palTarget
      const pal = ROOMS[palTarget]?.palette
      if (pal) {
        const snap = (ref) => ref?.current?.traverse(c => {
          if (!c.isMesh || !c.userData?.pt) return
          const { pt, idx: ci, which } = c.userData
          if (pt === 'chip' && ci < 4) c.material.color.set(pal.chips[ci] || '#888')
          else if (pt === 'chip' && ci >= 10) c.material.color.set(pal.fab[ci-10]?.[0] || '#888')
          else if (pt === 'fab' && ci < 4) c.material.color.set(pal.fab[ci]?.[0] || '#888')
          else if (pt === 'fab' && ci >= 10) c.material.color.set(pal.fab[ci-10]?.[0] || '#888')
          else if (pt === 'dot') c.material.color.set(which === 'lamp' ? hex(pal.lamp) : hex(pal.dot))
          else if (pt === 'wood') c.material.color.set(pal.wood[0])
          else if (pt === 'paper' || pt === 'paper_side') c.material.color.set(pal.chips[0])
        })
        snap(boardBackRef)
        snap(boardSideRef)
      }
    }

    // Lighting lerp — cross-fade during hidden window (0.48-0.70)
    // so new room's lighting is set when it swings back into view
    if (p < 0.48) { lightFrom.current = i % L; lightTo.current = i % L }
    else { lightFrom.current = i % L; lightTo.current = (i + 1) % L }
    const lb = p < 0.48 ? 0 : p > 0.70 ? 1 : (p - 0.48) / 0.22
    if (lb > 0 && lb < 1) {
      // Only lerp during the active transition
      const mA = MOOD_SCENE_PRESETS[ROOMS[lightFrom.current].mood] || MOOD_SCENE_PRESETS['Bright Day']
      const mB = MOOD_SCENE_PRESETS[ROOMS[lightTo.current].mood] || MOOD_SCENE_PRESETS['Bright Day']
      const lerp = THREE.MathUtils.lerp
      if (hemiRef.current) {
        hemiRef.current.intensity = lerp(moodVal(mA.hemiI, HEMI_BOOST, HEMI_MIN), moodVal(mB.hemiI, HEMI_BOOST, HEMI_MIN), lb)
        hemiRef.current.color.set(mA.skyColor).lerp(_cA.set(mB.skyColor), lb)
        hemiRef.current.groundColor.set(mA.groundColor).lerp(_cA.set(mB.groundColor), lb)
      }
      if (keyRef.current) {
        keyRef.current.intensity = lerp(moodVal(mA.keyI, KEY_BOOST, KEY_MIN), moodVal(mB.keyI, KEY_BOOST, KEY_MIN), lb)
        keyRef.current.color.set(mA.keyC).lerp(_cB.set(mB.keyC), lb)
      }
      if (fillRef.current) {
        fillRef.current.intensity = lerp(moodVal(mA.fillI, FILL_BOOST, FILL_MIN), moodVal(mB.fillI, FILL_BOOST, FILL_MIN), lb)
        fillRef.current.color.set(mA.fillC).lerp(_cA.set(mB.fillC), lb)
      }
    } else if (lb >= 1) {
      // Snap to final values once transition completes
      const mF = MOOD_SCENE_PRESETS[ROOMS[lightTo.current].mood] || MOOD_SCENE_PRESETS['Bright Day']
      if (hemiRef.current) { hemiRef.current.intensity = moodVal(mF.hemiI, HEMI_BOOST, HEMI_MIN); hemiRef.current.color.set(mF.skyColor); hemiRef.current.groundColor.set(mF.groundColor) }
      if (keyRef.current) { keyRef.current.intensity = moodVal(mF.keyI, KEY_BOOST, KEY_MIN); keyRef.current.color.set(mF.keyC) }
      if (fillRef.current) { fillRef.current.intensity = moodVal(mF.fillI, FILL_BOOST, FILL_MIN); fillRef.current.color.set(mF.fillC) }
    }

    const key = `${caption}|${front}`
    if (key !== lastKey.current) {
      lastKey.current = key
      tickRef.current?.({ caption, front })
    }
  })

  const room = ROOMS[idx]
  const { gridW, gridD, wallHeight } = room

  return (
    <>
      <LandingCamera gridW={gridW} gridD={gridD} wallHeight={wallHeight} />

      {/* Lighting — lerped per-frame between moods, boosted with brightness floor */}
      <ambientLight intensity={0.5} />
      <hemisphereLight ref={hemiRef} />
      <directionalLight ref={keyRef} position={[16, 24, 12]}
        castShadow shadow-mapSize-width={512} shadow-mapSize-height={512}
        shadow-camera-near={0.5} shadow-camera-far={60}
        shadow-camera-left={-14} shadow-camera-right={14}
        shadow-camera-top={14} shadow-camera-bottom={-14}
        shadow-bias={-0.0008} />
      <directionalLight ref={fillRef} position={[-12, 14, -10]} />

      <group ref={groupRef}
        rotation={reduced ? [0, -Math.PI / 5, 0] : [0, 0, 0]}>
        <group ref={wallGroupRef}>
          <LandingFloor gridW={gridW} gridD={gridD} color={hex(room.floor)} texType={room.floorTex} />
          <LandingWalls gridW={gridW} gridD={gridD} wallHeight={wallHeight}
            wallColor={hex(room.wall)} sideColor={hex(room.side)} wallTexType={room.wallTex}
            skipInteriorFaces={!!room.brand} />
        </group>

        {/* Wall decor — separate ref so wall color lerp can target it without hitting furniture */}
        <group ref={wallDecorRef}>
          <WallDecor room={room} />
        </group>

        {/* Furniture items — fades independently, never color-lerped */}
        <group ref={itemsRef}>
          {room.items.map((item, i) => (
            <LandingItem key={`${idx}-${i}`} {...item} gridW={gridW} gridD={gridD} />
          ))}
        </group>

        {/* Palette boards — each wall swaps independently when backface-culled */}
        <group ref={boardBackRef}>
          <PaletteBack3D room={ROOMS[0]} gridW={gridW} wallHeight={wallHeight} />
        </group>
        <group ref={boardSideRef}>
          <PaletteSide3D room={ROOMS[0]} gridW={gridW} gridD={gridD} wallHeight={wallHeight} />
        </group>
      </group>
    </>
  )
}
