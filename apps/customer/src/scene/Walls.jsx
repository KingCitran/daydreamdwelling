import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ITEM_CATALOGUE } from '../data/items'

const WALL_T = 0.28

const DIRECTIONS = [
  { dc:  0, dr: -1, normal: [0, 0,  1], axis: 'z' }, // -Z edge of cell
  { dc:  0, dr:  1, normal: [0, 0, -1], axis: 'z' }, // +Z edge
  { dc: -1, dr:  0, normal: [1, 0,  0], axis: 'x' }, // -X edge
  { dc:  1, dr:  0, normal: [-1, 0,  0], axis: 'x' }, // +X edge
]

const VISIBLE_NORMALS = [
  [[0, 0,  1], [ 1, 0, 0]], // q0  0°
  [[0, 0,  1], [-1, 0, 0]], // q1 90°
  [[0, 0, -1], [-1, 0, 0]], // q2 180°
  [[0, 0, -1], [ 1, 0, 0]], // q3 270°
]

function getQuadrant(ry) {
  const r = ((ry % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return Math.floor((r + Math.PI / 4) / (Math.PI / 2)) % 4
}

function normalMatches(n, visibles) {
  return visibles.some(v => v[0] === n[0] && v[2] === n[2])
}

function buildWalls(cells, gridW, gridD) {
  const walls = []
  for (const key of cells) {
    const [col, row] = key.split(',').map(Number)
    for (const { dc, dr, normal, axis } of DIRECTIONS) {
      if (!cells.has(`${col + dc},${row + dr}`)) {
        const cx = (col + 0.5) - gridW / 2
        const cz = (row + 0.5) - gridD / 2
        walls.push({
          id: `${key}:${dc},${dr}`,
          x:  cx + dc * 0.5,
          z:  cz + dr * 0.5,
          normal,
          axis,
        })
      }
    }
  }
  return walls
}

// ── Hole detection and wall splitting ───────────────────────────────
function findHoles(items, x, z, normal, axis, gridW, gridD, wallHeight) {
  const holes = []
  const segW = 1 + WALL_T
  const uCenter = axis === 'z' ? x : z

  for (const it of items) {
    if (!it.wall) continue
    const def = ITEM_CATALOGUE[it.typeKey]
    if (!def || (!def.window && !def.door)) continue
    if (it.wallAnchor === undefined || it.wallAnchor === null) continue

    // Axis match
    const isNS = it.wall === 'N' || it.wall === 'S'
    if (axis === 'z' && !isNS) continue
    if (axis === 'x' && isNS) continue

    // Normal/face direction match
    const nMap = { N: [0,0,1], S: [0,0,-1], W: [1,0,0], E: [-1,0,0] }
    const en = nMap[it.wall]
    if (en[0] !== normal[0] || en[2] !== normal[2]) continue

    // Face position match
    let expectedFacePos
    if (it.wall === 'N') expectedFacePos = it.wallAnchor - gridD / 2
    else if (it.wall === 'S') expectedFacePos = it.wallAnchor + 1 - gridD / 2
    else if (it.wall === 'W') expectedFacePos = it.wallAnchor - gridW / 2
    else /* E */              expectedFacePos = it.wallAnchor + 1 - gridW / 2

    const segFacePos = axis === 'z' ? z : x
    if (Math.abs(segFacePos - expectedFacePos) > 0.05) continue

    // U overlap
    const size = def.sizes[it.sizeIndex]
    const fw = it.customW ?? size.footprint[0]
    const fh = it.customH ?? size.height
    const wCenter = isNS ? (it.wallU - gridW / 2) : (it.wallU - gridD / 2)
    const uLo = uCenter - segW / 2
    const uHi = uCenter + segW / 2
    const wLo = wCenter - fw / 2
    const wHi = wCenter + fw / 2
    if (wLo >= uHi || wHi <= uLo) continue

    // Y extent
    const isDoor = !!def.door
    const wh = it.wallH ?? (isDoor ? fh / 2 : wallHeight * 0.5)
    const yLo = isDoor ? 0 : Math.max(0, wh - fh / 2)
    const yHi = isDoor ? fh : Math.min(wallHeight, wh + fh / 2)

    holes.push({
      uLo: Math.max(uLo, wLo),
      uHi: Math.min(uHi, wHi),
      yLo, yHi,
    })
  }
  return holes
}

function computeWallPieces(uLo, uHi, wallHeight, holes) {
  if (!holes.length) return [{ uL: uLo, uR: uHi, yL: 0, yH: wallHeight }]
  const sorted = holes.slice().sort((a, b) => a.uLo - b.uLo)
  const pieces = []
  let prevU = uLo
  for (const h of sorted) {
    const hL = Math.max(uLo, h.uLo)
    const hR = Math.min(uHi, h.uHi)
    if (hL > prevU) pieces.push({ uL: prevU, uR: hL, yL: 0, yH: wallHeight })
    if (h.yLo > 0.01) pieces.push({ uL: hL, uR: hR, yL: 0, yH: h.yLo })
    if (h.yHi < wallHeight - 0.01) pieces.push({ uL: hL, uR: hR, yL: h.yHi, yH: wallHeight })
    prevU = hR
  }
  if (prevU < uHi) pieces.push({ uL: prevU, uR: uHi, yL: 0, yH: wallHeight })
  return pieces.filter(p => p.uR - p.uL > 0.001 && p.yH - p.yL > 0.001)
}

function lightenHex(hex, amt) {
  const n = parseInt((hex || '#d8d0c6').replace('#', ''), 16)
  const r = Math.min(255, (n >> 16) + amt)
  const g = Math.min(255, ((n >> 8) & 0xff) + amt)
  const b = Math.min(255, (n & 0xff) + amt)
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

// ── Wall grid using LineSegments placed directly in 3D space ───────
// Draws grid lines only within the supplied piece bounds [uLo,uHi]×[yLo,yHi]
// so the grid shows on every solid wall piece, including pieces beside/above doors.
// Global integer indices keep section lines (every SEC_N steps) visually consistent
// across adjacent pieces that share the same wall segment.
function WallGrid({ x, z, normal, axis, wallHeight, uLo, uHi, yLo, yHi }) {
  const { cellGeo, secGeo } = useMemo(() => {
    // Height lines: 1 ft steps for tall walls, 0.5 ft for short
    const STEP_Y = wallHeight > 5 ? 1.0 : 0.5
    // Width lines: always 0.5 ft so cell edges are always shown
    const STEP_U = 0.5
    // Every 2 steps = "section" (brighter)
    const SEC_N  = 2

    const gx = x + normal[0] * (WALL_T / 2 + 0.015)
    const gz = z + normal[2] * (WALL_T / 2 + 0.015)

    const cell = [], sec = []
    const push = (arr, ax, ay, az, bx, by, bz) => arr.push(ax, ay, az, bx, by, bz)

    // Use global indices so section lines stay consistent across pieces
    const iYStart = Math.ceil(yLo / STEP_Y)
    const iYEnd   = Math.floor(yHi / STEP_Y + 0.001)
    const iUStart = Math.ceil(uLo / STEP_U)
    const iUEnd   = Math.floor(uHi / STEP_U + 0.001)

    if (axis === 'z') {
      for (let i = iYStart; i <= iYEnd; i++) {
        const y = i * STEP_Y
        push(i % SEC_N === 0 ? sec : cell, uLo, y, gz, uHi, y, gz)
      }
      for (let i = iUStart; i <= iUEnd; i++) {
        const xi = i * STEP_U
        push(i % SEC_N === 0 ? sec : cell, xi, yLo, gz, xi, yHi, gz)
      }
    } else {
      for (let i = iYStart; i <= iYEnd; i++) {
        const y = i * STEP_Y
        push(i % SEC_N === 0 ? sec : cell, gx, y, uLo, gx, y, uHi)
      }
      for (let i = iUStart; i <= iUEnd; i++) {
        const zi = i * STEP_U
        push(i % SEC_N === 0 ? sec : cell, gx, yLo, zi, gx, yHi, zi)
      }
    }

    return { cellGeo: new Float32Array(cell), secGeo: new Float32Array(sec) }
  }, [x, z, normal, axis, wallHeight, uLo, uHi, yLo, yHi])

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={cellGeo} count={cellGeo.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#7878aa" transparent opacity={0.35} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={secGeo} count={secGeo.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#9898cc" transparent opacity={0.55} />
      </lineSegments>
    </>
  )
}

export default function Walls({ cells, gridW, gridD, wallHeight, wallColor, currentRotationRef, showGrid, items }) {
  const walls = useMemo(
    () => buildWalls(cells, gridW, gridD),
    [cells, gridW, gridD]
  )

  const [quadrant, setQuadrant] = useState(0)
  const prevQ = useRef(0)

  useFrame(() => {
    const q = getQuadrant(currentRotationRef.current)
    if (q !== prevQ.current) {
      prevQ.current = q
      setQuadrant(q)
    }
  })

  const visibles = VISIBLE_NORMALS[quadrant]

  return (
    <group>
      {walls.map(({ id, x, z, normal, axis }) => {
        const w         = axis === 'z' ? 1 + WALL_T : WALL_T
        const d         = axis === 'z' ? WALL_T     : 1 + WALL_T
        const base      = wallColor || '#d8d0c6'
        const color     = normal[0] !== 0 ? base : lightenHex(base, 14)
        const isVisible = normalMatches(normal, visibles)

        const segW2   = 1 + WALL_T
        const uCtr    = axis === 'z' ? x : z
        const uLo2    = uCtr - segW2 / 2
        const uHi2    = uCtr + segW2 / 2
        const holes   = findHoles(items ?? [], x, z, normal, axis, gridW, gridD, wallHeight)
        const pieces  = computeWallPieces(uLo2, uHi2, wallHeight, holes)

        return (
          <group key={id}>
            {pieces.map((p, pi) => {
              const uw   = p.uR - p.uL
              const ph   = p.yH - p.yL
              const uCen = (p.uL + p.uR) / 2
              const yCen = (p.yL + p.yH) / 2
              const pos  = axis === 'z' ? [uCen, yCen, z] : [x, yCen, uCen]
              const geom = axis === 'z' ? [uw, ph, WALL_T] : [WALL_T, ph, uw]
              return (
                <mesh key={pi} position={pos} visible={isVisible} castShadow receiveShadow>
                  <boxGeometry args={geom} />
                  <meshStandardMaterial color={color} roughness={0.88} metalness={0} />
                </mesh>
              )
            })}
            {showGrid && isVisible && pieces.map((p) =>
              // Skip grid on strips above holes (door/window transoms) — they look like floating pieces
              p.yL < 0.01 && (
                <WallGrid
                  key={`grid_${p.uL.toFixed(2)}_${p.uR.toFixed(2)}_${p.yL.toFixed(2)}_${p.yH.toFixed(2)}`}
                  x={x} z={z} normal={normal} axis={axis} wallHeight={wallHeight}
                  uLo={p.uL} uHi={p.uR} yLo={p.yL} yHi={p.yH}
                />
              )
            )}
          </group>
        )
      })}
    </group>
  )
}
