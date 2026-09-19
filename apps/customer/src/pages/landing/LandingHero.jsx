// LandingHero — clean rebuild of the rotating room presentation.
// Every lesson from the previous 900-line mess applied here.
//
// Rules:
// 1. ONE geometry per wall (ExtrudeGeometry with Shape.holes for windows)
// 2. Palette boards use side:FrontSide FLUSH on wall — backface culling hides them
// 3. Colors update ONLY when backface-culled (invisible to camera)
// 4. Brand room is a SEPARATE component — no conditional flags in regular path
// 5. Minimal useFrame — only rotate + gate all work behind value-change thresholds
// 6. Pre-allocate everything — zero GC pressure

import { useRef, useState, useMemo, memo, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MOOD_SCENE_PRESETS } from '../../scene/RoomScene'
import { GlbModel } from '../../scene/Items'
import { ITEM_CATALOGUE } from '../../data/items'
import { getTexture } from '../../scene/textures'

// ── Constants ────────────────────────────────────────────────
const CAM_OFFSET = 18
const WALL_T = 0.28
const BRASS = { color: '#e8e0d0', emissive: '#a09078', emissiveIntensity: 0.25, roughness: 0.25, metalness: 0.75 }

function hex(css) { return css.match?.(/#[0-9a-f]{6}/i)?.[0] || '#888' }

// ── Camera — builder's isometric view ────────────────────────
function HeroCamera({ wallHeight }) {
  const { camera } = useThree()
  useMemo(() => {
    camera.position.set(CAM_OFFSET, 14, CAM_OFFSET)
    camera.lookAt(0, wallHeight * 0.45, 0)
    camera.zoom = 26
    camera.updateProjectionMatrix()
  }, [camera, wallHeight])
  return null
}

// ── Wall geometry factory ────────────────────────────────────
// Creates an ExtrudeGeometry with optional rectangular or D-shaped holes.
// ONE call per wall — no layered boxes, no z-fighting.
function makeWallGeo(wallW, wallH, holes = [], depth = WALL_T) {
  const shape = new THREE.Shape()
  shape.moveTo(-wallW / 2, 0)
  shape.lineTo(wallW / 2, 0)
  shape.lineTo(wallW / 2, wallH)
  shape.lineTo(-wallW / 2, wallH)
  shape.closePath()

  for (const hole of holes) {
    const h = new THREE.Path()
    if (hole.type === 'rect') {
      const { x, y, w, hh } = hole
      h.moveTo(x - w / 2, y - hh / 2)
      h.lineTo(x + w / 2, y - hh / 2)
      h.lineTo(x + w / 2, y + hh / 2)
      h.lineTo(x - w / 2, y + hh / 2)
      h.closePath()
    } else if (hole.type === 'd') {
      const { x, y, w, hh } = hole
      h.moveTo(x - w / 2, y - hh / 2)
      h.lineTo(x - w / 2, y + hh / 2)
      h.lineTo(x - w * 0.05, y + hh / 2)
      h.bezierCurveTo(x + w * 0.5, y + hh * 0.48, x + w * 0.5, y - hh * 0.48, x - w * 0.05, y - hh / 2)
      h.closePath()
    }
    shape.holes.push(h)
  }

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
  geo.computeVertexNormals()
  return geo
}

// ── Floor ────────────────────────────────────────────────────
function HeroFloor({ gridW, gridD, color, texType }) {
  const fw = gridW + WALL_T + 0.3, fd = gridD + WALL_T + 0.3
  const tex = useMemo(() => {
    const t = getTexture(texType, color)
    if (t?.map) t.map.repeat.set(fw / 3, fd / 3)
    return t
  }, [texType, color, fw, fd])
  return (
    <group position={[-WALL_T / 2, 0, -WALL_T / 2]}>
      {/* Brass slab */}
      <mesh position-y={-WALL_T / 2}>
        <boxGeometry args={[fw, WALL_T, fd]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {/* Textured top */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.005} receiveShadow>
        <planeGeometry args={[gridW + WALL_T, gridD + WALL_T]} />
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

// ── Regular room walls ───────────────────────────────────────
function RegularWalls({ room }) {
  const { gridW, gridD, wallHeight } = room
  const hw = gridW / 2, hd = gridD / 2

  // Wall textures
  const wallTex = useMemo(() => {
    const t = getTexture(room.wallTex, hex(room.wall))
    if (t?.map) t.map.repeat.set((gridW + WALL_T) / 4, wallHeight / 4)
    return t
  }, [room.wallTex, room.wall, gridW, wallHeight])

  // Back wall with rectangular window hole
  const winX = -1, winY = wallHeight * 0.55, winW = 3, winH = 4
  const backGeo = useMemo(() =>
    makeWallGeo(gridW + WALL_T, wallHeight, [{ type: 'rect', x: winX, y: winY, w: winW, hh: winH }])
  , [gridW, wallHeight])

  // Left wall — no holes
  const sideGeo = useMemo(() =>
    makeWallGeo(gridD, wallHeight)
  , [gridD, wallHeight])

  const wc = hex(room.wall), sc = hex(room.side)
  const wallMat = { roughness: wallTex ? 1.0 : 0.8, side: THREE.DoubleSide }
  if (wallTex) {
    wallMat.map = wallTex.map; wallMat.normalMap = wallTex.normalMap
    wallMat.roughnessMap = wallTex.roughnessMap; wallMat.color = '#fff'
    if (wallTex.normalMap) wallMat.normalScale = new THREE.Vector2(1.2, 1.2)
  }

  return (
    <group>
      {/* Back wall — single ExtrudeGeometry with window hole */}
      <mesh position={[0, 0, -hd - WALL_T]} geometry={backGeo}>
        <meshStandardMaterial {...wallMat} color={wallMat.color || wc} />
      </mesh>

      {/* Window frame — builder's real frame strips */}
      <group position={[winX, winY, -hd]}>
        {[
          [-(winW / 2 - 0.04), 0, 0, 0.08, winH, WALL_T],
          [winW / 2 - 0.04, 0, 0, 0.08, winH, WALL_T],
          [0, winH / 2 - 0.04, 0, winW, 0.08, WALL_T],
          [0, -(winH / 2 - 0.06), 0, winW + 0.06, 0.12, WALL_T * 1.25],
          [0, 0, 0, winW - 0.16, 0.056, WALL_T * 0.6], // horizontal mullion
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#d0c8b8" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Left wall — single ExtrudeGeometry, no holes */}
      <mesh position={[-hw - WALL_T, 0, 0]} rotation-y={Math.PI / 2} geometry={sideGeo}>
        <meshStandardMaterial color={sc} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ── Brand room walls (D windows) ─────────────────────────────
function BrandWalls({ room }) {
  const { gridW, gridD, wallHeight } = room
  const hw = gridW / 2, hd = gridD / 2
  const dw = 4.5, dh = 5.5, dy = wallHeight * 0.55

  const backGeo = useMemo(() =>
    makeWallGeo(gridW + WALL_T, wallHeight, [{ type: 'd', x: 0, y: dy, w: dw, hh: dh }])
  , [gridW, wallHeight, dy])

  const sideGeo = useMemo(() =>
    makeWallGeo(gridD, wallHeight, [{ type: 'd', x: 0, y: dy, w: dw, hh: dh }])
  , [gridD, wallHeight, dy])

  const wc = hex(room.wall), sc = hex(room.side)

  // Woven D rug texture
  const rugTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#c9a06a'; ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#dcbb8e'; ctx.fillRect(16, 16, 224, 224)
    ctx.strokeStyle = 'rgba(140,95,50,0.28)'; ctx.lineWidth = 1.5
    for (let i = 16; i < 240; i += 7) { ctx.beginPath(); ctx.moveTo(i, 16); ctx.lineTo(i, 240); ctx.stroke() }
    ctx.strokeStyle = 'rgba(140,95,50,0.24)'
    for (let i = 16; i < 240; i += 7) { ctx.beginPath(); ctx.moveTo(16, i); ctx.lineTo(240, i); ctx.stroke() }
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t
  }, [])

  // D shape for the rug
  const rugShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.5, -2.75); s.lineTo(-2.5, 2.75); s.lineTo(-0.1, 2.75)
    s.bezierCurveTo(2.5, 2.64, 2.5, -2.64, -0.1, -2.75); s.closePath()
    return s
  }, [])

  return (
    <group>
      {/* Back wall with D hole */}
      <mesh position={[0, 0, -hd - WALL_T]} geometry={backGeo}>
        <meshStandardMaterial color={wc} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall with D hole */}
      <mesh position={[-hw - WALL_T, 0, 0]} rotation-y={Math.PI / 2} geometry={sideGeo}>
        <meshStandardMaterial color={sc} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* D rug */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.5]}>
        <shapeGeometry args={[rugShape]} />
        <meshStandardMaterial map={rugTex} roughness={0.92}
          polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  )
}

// ── Single item ──────────────────────────────────────────────
const LAMP_TYPES = new Set(['floorLamp', 'tableLamp', 'deskLamp'])

const HeroItem = memo(function HeroItem({ typeKey, col, row, rotation, sizeIndex, swatchIndex, gridW, gridD }) {
  const def = ITEM_CATALOGUE[typeKey]
  if (!def?.sizes) return null
  const size = def.sizes[sizeIndex] ?? def.sizes[0]
  const fw = size.footprint?.[0] ?? 1, fd = size.footprint?.[1] ?? 1, fh = size.height ?? 1
  const rotated = rotation === 90 || rotation === 270
  const ew = rotated ? fd : fw, ed = rotated ? fw : fd
  const wx = (col + ew / 2) - gridW / 2
  const wz = (row + ed / 2) - gridD / 2
  const color = def.swatches?.[swatchIndex]?.hex ?? def.color ?? '#9a7aee'

  return (
    <group position={[wx, fh / 2, wz]} rotation={[0, -(rotation * Math.PI) / 180, 0]}>
      {def.modelUrl ? (
        <Suspense fallback={
          <mesh><boxGeometry args={[fw, fh, fd]} />
            <meshStandardMaterial color={color} roughness={0.76} opacity={0.4} transparent /></mesh>
        }>
          <GlbModel url={def.modelUrl} fw={fw} fh={fh} fd={fd}
            scale={def.scaleMultiplier ?? 1} rotationDeg={def.orientationOffsetDeg ?? 0}
            materialSheen={def.materialSheen ?? null} />
        </Suspense>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial color={color} roughness={0.76} />
        </mesh>
      )}
      {LAMP_TYPES.has(typeKey) && (
        <pointLight position={[0, fh * 0.2, 0]} color="#ffcc88" intensity={2.5} distance={10} decay={2} />
      )}
    </group>
  )
})

// ── Wall art (regular rooms only) ────────────────────────────
function WallArt({ room }) {
  const { gridW, gridD, wallHeight } = room
  const hw = gridW / 2, hd = gridD / 2
  const c1 = hex(room.art), c2 = hex(room.seat), accent = room.accent
  return (
    <group>
      {/* Large art on back wall */}
      <group position={[2, wallHeight * 0.55, -hd + 0.06]}>
        <mesh><boxGeometry args={[2.8, 2.2, 0.1]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.3} /></mesh>
        <mesh position={[0, 0.15, 0.04]}><planeGeometry args={[2.4, 0.8]} />
          <meshStandardMaterial color={c1} roughness={0.55} /></mesh>
        <mesh position={[0, -0.45, 0.04]}><planeGeometry args={[2.4, 0.8]} />
          <meshStandardMaterial color={c2} roughness={0.55} /></mesh>
      </group>
      {/* Gallery trio on side wall */}
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

// ── Palette boards (FrontSide, flush on wall exterior) ───────
// These are INVISIBLE when facing away from the camera (backface culled).
// Color updates happen ONLY during that invisible window.
function PaletteBack({ room, gridW, wallHeight }) {
  const p = room.palette, hd = (room.gridD || 10) / 2
  const z = -hd - WALL_T, rot = Math.PI
  const inset = 0.07
  const bw = gridW * (1 - inset * 2), bh = wallHeight * (1 - inset * 2)
  const margin = 0.08, gap = 0.04, cols = 3, rows = 3
  const sw = (bw - bw * margin * 2 - bw * gap * (cols - 1)) / cols
  const sh = (bh - bh * margin * 2 - bh * gap * (rows - 1)) / rows
  const sx = (c) => -bw / 2 + bw * margin + sw / 2 + c * (sw + bw * gap)
  const sy = (r) => bh / 2 - bh * margin - sh / 2 - r * (sh + bh * gap)
  const FS = THREE.FrontSide

  return (
    <group>
      {/* Paper backing */}
      <mesh position={[0, wallHeight / 2, z]} rotation-y={rot} userData={{ pt: 'paper' }}>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial color={hex(p.chips[0])} roughness={0.85} side={FS}
          polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>
      {/* Row 0: paint chips */}
      {[0, 1, 2].map(i => (
        <group key={i} position={[sx(i), wallHeight / 2 + sy(0), z - 0.005]} rotation-y={rot}>
          <mesh><planeGeometry args={[sw, sh]} />
            <meshStandardMaterial color="#fff" roughness={0.4} side={FS} /></mesh>
          <mesh position-z={-0.005} userData={{ pt: 'chip', idx: i }}>
            <planeGeometry args={[sw * 0.82, sh * 0.65]} />
            <meshStandardMaterial color={p.chips[i]} roughness={0.6} side={FS} /></mesh>
        </group>
      ))}
      {/* Row 1: fabric + dot */}
      {p.fab.slice(0, 2).map(([base], i) => (
        <group key={`f${i}`} position={[sx(i), wallHeight / 2 + sy(1), z - 0.005]} rotation-y={rot}>
          <mesh><planeGeometry args={[sw, sh]} />
            <meshStandardMaterial color="#fff" roughness={0.4} side={FS} /></mesh>
          <mesh position-z={-0.005} userData={{ pt: 'fab', idx: i }}>
            <planeGeometry args={[sw * 0.84, sh * 0.84]} />
            <meshStandardMaterial color={base} roughness={0.75} side={FS} /></mesh>
        </group>
      ))}
      <mesh position={[sx(2), wallHeight / 2 + sy(1), z - 0.005]} rotation-y={rot}
        userData={{ pt: 'dot', which: 'lamp' }}>
        <circleGeometry args={[Math.min(sw, sh) * 0.4, 24]} />
        <meshStandardMaterial color={hex(p.lamp)} roughness={0.5} side={FS} />
      </mesh>
      {/* Row 2: wood + dot */}
      <mesh position={[(sx(0) + sx(1)) / 2, wallHeight / 2 + sy(2), z - 0.005]} rotation-y={rot}
        userData={{ pt: 'wood' }}>
        <planeGeometry args={[sw * 2 + bw * gap, sh * 0.65]} />
        <meshStandardMaterial color={p.wood[0]} roughness={0.8} side={FS} />
      </mesh>
      <mesh position={[sx(2), wallHeight / 2 + sy(2), z - 0.005]} rotation-y={rot}
        userData={{ pt: 'dot', which: 'dot' }}>
        <circleGeometry args={[Math.min(sw, sh) * 0.4, 24]} />
        <meshStandardMaterial color={hex(p.dot)} roughness={0.5} side={FS} />
      </mesh>
    </group>
  )
}

function PaletteSide({ room, gridW, gridD, wallHeight }) {
  const p = room.palette, hw = gridW / 2
  const x = -hw - WALL_T, rot = -Math.PI / 2
  const inset = 0.07
  const bw = gridD * (1 - inset * 2), bh = wallHeight * (1 - inset * 2)
  const margin = 0.08, gap = 0.04, cols = 3, rows = 2
  const sw = (bw - bw * margin * 2 - bw * gap * (cols - 1)) / cols
  const sh = (bh - bh * margin * 2 - bh * gap * (rows - 1)) / rows
  const sz = (c) => -bw / 2 + bw * margin + sw / 2 + c * (sw + bw * gap)
  const sy = (r) => bh / 2 - bh * margin - sh / 2 - r * (sh + bh * gap)
  const FS = THREE.FrontSide

  return (
    <group>
      <mesh position={[x, wallHeight / 2, 0]} rotation-y={rot} userData={{ pt: 'paper_side' }}>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial color={hex(p.chips[0])} roughness={0.85} side={FS}
          polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>
      {p.fab.slice(0, 2).map(([base], i) => (
        <group key={`sf${i}`} position={[x - 0.005, wallHeight / 2 + sy(0), sz(i)]} rotation-y={rot}>
          <mesh><planeGeometry args={[sw, sh]} />
            <meshStandardMaterial color="#fff" roughness={0.4} side={FS} /></mesh>
          <mesh position-z={-0.005} userData={{ pt: 'fab', idx: 10 + i }}>
            <planeGeometry args={[sw * 0.84, sh * 0.84]} />
            <meshStandardMaterial color={base} roughness={0.75} side={FS} /></mesh>
        </group>
      ))}
      <mesh position={[x - 0.005, wallHeight / 2 + sy(0), sz(2)]} rotation-y={rot}
        userData={{ pt: 'dot', which: 's_dot' }}>
        <circleGeometry args={[Math.min(sw, sh) * 0.4, 24]} />
        <meshStandardMaterial color={hex(p.dot)} roughness={0.5} side={FS} />
      </mesh>
      {p.fab.map(([c], i) => (
        <group key={`sp${i}`} position={[x - 0.005, wallHeight / 2 + sy(1), sz(i)]} rotation-y={rot}>
          <mesh><planeGeometry args={[sw, sh]} />
            <meshStandardMaterial color="#fff" roughness={0.4} side={FS} /></mesh>
          <mesh position-z={-0.005} userData={{ pt: 'chip', idx: 10 + i }}>
            <planeGeometry args={[sw * 0.82, sh * 0.65]} />
            <meshStandardMaterial color={c} roughness={0.6} side={FS} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ── Brass gilding ────────────────────────────────────────────
function Gilding({ gridW, gridD, wallHeight }) {
  const hw = gridW / 2, hd = gridD / 2, T = 0.15
  const bwFull = gridW + WALL_T
  return (
    <group>
      {/* Top edges */}
      <mesh position={[-WALL_T / 2, wallHeight + T / 2, -hd - WALL_T / 2]}>
        <boxGeometry args={[bwFull, T, WALL_T]} />
        <meshStandardMaterial {...BRASS} /></mesh>
      <mesh position={[-hw - WALL_T / 2, wallHeight + T / 2, 0]}>
        <boxGeometry args={[WALL_T, T, gridD]} />
        <meshStandardMaterial {...BRASS} /></mesh>
      {/* Verticals */}
      <mesh position={[hw + T / 2, wallHeight / 2, -hd - WALL_T / 2]}>
        <boxGeometry args={[T, wallHeight, WALL_T]} />
        <meshStandardMaterial {...BRASS} /></mesh>
      <mesh position={[-hw - WALL_T / 2, wallHeight / 2, hd + T / 2]}>
        <boxGeometry args={[WALL_T, wallHeight, T]} />
        <meshStandardMaterial {...BRASS} /></mesh>
    </group>
  )
}

// ── Main scene ───────────────────────────────────────────────
const HEMI_BOOST = 1.6, KEY_BOOST = 1.4, FILL_BOOST = 1.5
const HEMI_MIN = 0.5, KEY_MIN = 0.85, FILL_MIN = 0.35
function mv(base, boost, min) { return Math.max(base * boost, min) }

export default function LandingHero({ rooms, dur = 30, tickRef }) {
  const L = rooms.length
  const groupRef = useRef()
  const itemsRef = useRef()
  const boardsRef = useRef()
  const hemiRef = useRef()
  const keyRef = useRef()
  const fillRef = useRef()
  const [idx, setIdx] = useState(0)

  // Pre-allocated — reused every frame
  const _cA = useMemo(() => new THREE.Color(), [])

  // Tracking for palette color swap
  const lastPaletteRoom = useRef(0)
  const prevCo = useRef(1)

  const reduced = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])

  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.getElapsedTime()
    const i = Math.floor(t / dur), p = (t % dur) / dur

    // ── Rotate ──
    if (groupRef.current) groupRef.current.rotation.y = (t / dur) * Math.PI * 2

    // ── Content opacity (items + wall art) ──
    const co = p < 0.30 ? 1 : p < 0.38 ? 1 - (p - 0.30) / 0.08 : p < 0.50 ? 0 : p < 0.60 ? (p - 0.50) / 0.10 : 1
    if (Math.abs(co - prevCo.current) > 0.01) {
      prevCo.current = co
      if (itemsRef.current) {
        itemsRef.current.traverse(c => {
          if (c.isMesh && c.material) { c.material.opacity = co; c.material.transparent = co < 1 }
        })
      }
    }

    // ── Interior swap (hidden behind walls) ──
    const interior = (p >= 0.42 ? i + 1 : i) % L
    if (interior !== idx) setIdx(interior)

    // ── Palette color swap — ONLY when backface-culled (invisible) ──
    // The palette planes face outward. At p≈0.00 the wall faces the camera,
    // so the palette faces AWAY → backface-culled → invisible. Update here.
    const nextPalette = (i + 1) % L
    if (nextPalette !== lastPaletteRoom.current && (p > 0.92 || p < 0.08)) {
      lastPaletteRoom.current = nextPalette
      const pal = rooms[nextPalette]?.palette
      if (pal && boardsRef.current) {
        boardsRef.current.traverse(c => {
          if (!c.isMesh || !c.userData?.pt) return
          const { pt, idx: ci, which } = c.userData
          if (pt === 'chip' && ci < 4) c.material.color.set(pal.chips[ci] || '#888')
          else if (pt === 'chip' && ci >= 10) c.material.color.set(pal.fab[ci - 10]?.[0] || '#888')
          else if (pt === 'fab' && ci < 4) c.material.color.set(pal.fab[ci]?.[0] || '#888')
          else if (pt === 'fab' && ci >= 10) c.material.color.set(pal.fab[ci - 10]?.[0] || '#888')
          else if (pt === 'dot') c.material.color.set(which === 'lamp' ? hex(pal.lamp) : hex(pal.dot))
          else if (pt === 'wood') c.material.color.set(pal.wood[0])
          else if (pt === 'paper' || pt === 'paper_side') c.material.color.set(pal.chips[0])
        })
      }
    }

    // ── Sky/caption/mood notifications ──
    const caption = (p >= 0.85 ? i + 1 : i) % L
    const front = (p >= 0.75 ? i + 1 : i) % L
    const key = `${caption}|${front}`
    if (key !== tickRef.current?.lastKey) {
      if (!tickRef.current) tickRef.current = {}
      tickRef.current.lastKey = key
      tickRef.current.onTick?.({ caption, front })
    }

    // ── Lighting lerp (only during transition window) ──
    const lb = p < 0.75 ? 0 : p > 0.95 ? 1 : (p - 0.75) / 0.20
    if (lb > 0 && lb < 1) {
      const mA = MOOD_SCENE_PRESETS[rooms[i % L]?.mood] || MOOD_SCENE_PRESETS['Bright Day']
      const mB = MOOD_SCENE_PRESETS[rooms[(i + 1) % L]?.mood] || MOOD_SCENE_PRESETS['Bright Day']
      const lerp = THREE.MathUtils.lerp
      if (hemiRef.current) {
        hemiRef.current.intensity = lerp(mv(mA.hemiI, HEMI_BOOST, HEMI_MIN), mv(mB.hemiI, HEMI_BOOST, HEMI_MIN), lb)
        hemiRef.current.color.set(mA.skyColor).lerp(_cA.set(mB.skyColor), lb)
        hemiRef.current.groundColor.set(mA.groundColor).lerp(_cA.set(mB.groundColor), lb)
      }
      if (keyRef.current) {
        keyRef.current.intensity = lerp(mv(mA.keyI, KEY_BOOST, KEY_MIN), mv(mB.keyI, KEY_BOOST, KEY_MIN), lb)
        keyRef.current.color.set(mA.keyC).lerp(_cA.set(mB.keyC), lb)
      }
      if (fillRef.current) {
        fillRef.current.intensity = lerp(mv(mA.fillI, FILL_BOOST, FILL_MIN), mv(mB.fillI, FILL_BOOST, FILL_MIN), lb)
        fillRef.current.color.set(mA.fillC).lerp(_cA.set(mB.fillC), lb)
      }
    } else if (lb >= 1) {
      const mF = MOOD_SCENE_PRESETS[rooms[(i + 1) % L]?.mood] || MOOD_SCENE_PRESETS['Bright Day']
      if (hemiRef.current) { hemiRef.current.intensity = mv(mF.hemiI, HEMI_BOOST, HEMI_MIN); hemiRef.current.color.set(mF.skyColor); hemiRef.current.groundColor.set(mF.groundColor) }
      if (keyRef.current) { keyRef.current.intensity = mv(mF.keyI, KEY_BOOST, KEY_MIN); keyRef.current.color.set(mF.keyC) }
      if (fillRef.current) { fillRef.current.intensity = mv(mF.fillI, FILL_BOOST, FILL_MIN); fillRef.current.color.set(mF.fillC) }
    }
  })

  const room = rooms[idx] || rooms[0]
  if (!room) return null
  const { gridW, gridD, wallHeight } = room

  return (
    <>
      <HeroCamera wallHeight={wallHeight} />
      <ambientLight intensity={0.5} />
      <hemisphereLight ref={hemiRef} />
      <directionalLight ref={keyRef} position={[16, 24, 12]}
        castShadow shadow-mapSize-width={512} shadow-mapSize-height={512}
        shadow-camera-near={0.5} shadow-camera-far={60}
        shadow-camera-left={-14} shadow-camera-right={14}
        shadow-camera-top={14} shadow-camera-bottom={-14}
        shadow-bias={-0.0008} />
      <directionalLight ref={fillRef} position={[-12, 14, -10]} />

      <group ref={groupRef} rotation={reduced ? [0, -Math.PI / 5, 0] : [0, 0, 0]}>
        <HeroFloor gridW={gridW} gridD={gridD} color={hex(room.floor)} texType={room.floorTex} />

        {room.brand ? <BrandWalls room={room} /> : <RegularWalls room={room} />}

        <group ref={itemsRef}>
          {!room.brand && <WallArt room={room} />}
          {(room.items || []).map((item, i) => (
            <HeroItem key={`${idx}-${i}`} {...item} gridW={gridW} gridD={gridD} />
          ))}
        </group>

        <group ref={boardsRef}>
          <PaletteBack room={rooms[0] || room} gridW={gridW} wallHeight={wallHeight} />
          <PaletteSide room={rooms[0] || room} gridW={gridW} gridD={gridD} wallHeight={wallHeight} />
        </group>

        <Gilding gridW={gridW} gridD={gridD} wallHeight={wallHeight} />
      </group>
    </>
  )
}
