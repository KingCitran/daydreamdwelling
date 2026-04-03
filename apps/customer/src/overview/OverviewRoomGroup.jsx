import { useState, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { buildMiniWalls, buildOpeningMarkers, MINI_WH } from './layout'

export default function OverviewRoomGroup({ room, ox, oz, isActive, name, onSelect, onDelete, rid, editMode, onDrag, onDragEnd, allRoomsData, finalOxOz, onEditShape }) {
  const cells   = useMemo(() => room.cells instanceof Set ? room.cells : new Set(room.cells), [room.cells])
  const { gridW, gridD } = room
  const fc      = room.floorColor || '#cec5b8'
  const wc      = room.wallColor  || '#d8d0c6'
  const WT      = 0.28
  const cellArr = useMemo(() => [...cells], [cells])
  const wallArr = useMemo(() => buildMiniWalls(room.cells, gridW, gridD), [room.cells, gridW, gridD])
  const markers = useMemo(() => buildOpeningMarkers(room), [room])

  // Shared wall segments: wall segs of THIS room that are flush against another room's opposite wall.
  // We skip rendering these to avoid z-fighting / double walls.
  const sharedWallKeys = useMemo(() => {
    const shared = new Set()
    if (!allRoomsData || !finalOxOz) return shared
    const myPos = finalOxOz[rid]
    if (!myPos) return shared
    const EPS_Z = 0.05  // face-plane tolerance (ft)
    const EPS_U = 1.0   // lateral overlap tolerance

    for (const w of wallArr) {
      // World position of this wall segment's center
      const wx_world = myPos.ox + w.x
      const wz_world = myPos.oz + w.z
      for (const [bRidStr, bRoom] of Object.entries(allRoomsData)) {
        const bRid = Number(bRidStr)
        if (bRid === rid) continue
        const bPos = finalOxOz[bRid]
        if (!bPos) continue
        const bWalls = buildMiniWalls(bRoom.cells, bRoom.gridW, bRoom.gridD)
        for (const bw of bWalls) {
          if (bw.face !== w.oppFace) continue  // must be opposite direction
          const bx_world = bPos.ox + bw.x
          const bz_world = bPos.oz + bw.z
          if (w.axis === 'z') {
            if (Math.abs(wz_world - bz_world) < EPS_Z && Math.abs(wx_world - bx_world) < EPS_U) {
              shared.add(`${w.x.toFixed(3)},${w.z.toFixed(3)}`)
            }
          } else {
            if (Math.abs(wx_world - bx_world) < EPS_Z && Math.abs(wz_world - bz_world) < EPS_U) {
              shared.add(`${w.x.toFixed(3)},${w.z.toFixed(3)}`)
            }
          }
        }
      }
    }
    return shared
  }, [wallArr, allRoomsData, finalOxOz, rid])

  // Cells of NEIGHBORING rooms that fall within this room's grid coordinate space.
  // These are shown grey + unclickable to indicate the space is taken.
  const neighborOverlayCells = useMemo(() => {
    const out = new Set()
    if (!allRoomsData || !finalOxOz) return out
    const myPos = finalOxOz[rid]
    if (!myPos) return out
    for (const [bRidStr, bRoom] of Object.entries(allRoomsData)) {
      const bRid = Number(bRidStr)
      if (bRid === rid) continue
      const bPos = finalOxOz[bRid]
      if (!bPos) continue
      const bCells = bRoom.cells instanceof Set ? bRoom.cells : new Set(bRoom.cells)
      for (const key of bCells) {
        const [col_B, row_B] = key.split(',').map(Number)
        const worldX = bPos.ox - bRoom.gridW / 2 + col_B + 0.5
        const worldZ = bPos.oz - bRoom.gridD / 2 + row_B + 0.5
        const col_A_f = worldX - (myPos.ox - gridW / 2) - 0.5
        const row_A_f = worldZ - (myPos.oz - gridD / 2) - 0.5
        const col_A = Math.round(col_A_f)
        const row_A = Math.round(row_A_f)
        if (col_A >= 0 && col_A < gridW && row_A >= 0 && row_A < gridD &&
            Math.abs(col_A_f - col_A) < 0.15 && Math.abs(row_A_f - row_A) < 0.15) {
          out.add(`${col_A},${row_A}`)
        }
      }
    }
    return out
  }, [allRoomsData, finalOxOz, rid, gridW, gridD])

  const [hovered, setHovered] = useState(false)
  const wallMatRefs = useRef([])
  const clickAmt    = useRef(0)
  const glowColor   = isActive ? '#b090ff' : (editMode ? '#ffcc44' : '#88b8ff')

  const { camera, gl } = useThree()
  const _ray = useRef(new THREE.Raycaster())
  const _ptr = useRef(new THREE.Vector2())
  const _hit = useRef(new THREE.Vector3())
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useFrame((_, delta) => {
    clickAmt.current = Math.max(0, clickAmt.current - delta * 2.5)
    const t         = performance.now() / 1000
    const pulse     = hovered ? 0.50 + 0.35 * Math.sin(t * 1.7) : 0
    const base      = isActive ? 0.40 : (editMode ? 0.15 : 0)
    const intensity = Math.min(1.2, pulse + clickAmt.current * 0.90 + base)
    for (const mat of wallMatRefs.current) {
      if (mat) mat.emissiveIntensity = intensity
    }
  })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (!editMode) {
      clickAmt.current = 1
      onSelect()
      return
    }
    const startClientX = e.clientX, startClientY = e.clientY
    let moved = false
    _ptr.current.set(
      (e.clientX / gl.domElement.clientWidth)  *  2 - 1,
      -(e.clientY / gl.domElement.clientHeight) *  2 + 1,
    )
    _ray.current.setFromCamera(_ptr.current, camera)
    if (!_ray.current.ray.intersectPlane(groundPlane.current, _hit.current)) return
    const startHitX = _hit.current.x, startHitZ = _hit.current.z
    const startOx = ox, startOz = oz
    gl.domElement.style.cursor = 'grabbing'

    const handleMove = (ev) => {
      const dx = ev.clientX - startClientX, dy = ev.clientY - startClientY
      if (!moved && Math.sqrt(dx * dx + dy * dy) > 5) moved = true
      _ptr.current.set(
        (ev.clientX / gl.domElement.clientWidth)  *  2 - 1,
        -(ev.clientY / gl.domElement.clientHeight) *  2 + 1,
      )
      _ray.current.setFromCamera(_ptr.current, camera)
      if (!_ray.current.ray.intersectPlane(groundPlane.current, _hit.current)) return
      onDrag(rid, startOx + _hit.current.x - startHitX, startOz + _hit.current.z - startHitZ)
    }
    const handleUp = (ev) => {
      _ptr.current.set(
        (ev.clientX / gl.domElement.clientWidth)  *  2 - 1,
        -(ev.clientY / gl.domElement.clientHeight) *  2 + 1,
      )
      _ray.current.setFromCamera(_ptr.current, camera)
      if (!moved && onEditShape) {
        onEditShape(rid)
      } else if (_ray.current.ray.intersectPlane(groundPlane.current, _hit.current)) {
        onDragEnd(rid, startOx + _hit.current.x - startHitX, startOz + _hit.current.z - startHitZ)
      }
      gl.domElement.style.cursor = 'grab'
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <group position={[ox, 0, oz]}>
      {/* Invisible capture plane — sits above floor, handles hover + click/drag for whole room */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerEnter={() => { setHovered(true); if (editMode) gl.domElement.style.cursor = 'grab' }}
        onPointerLeave={() => { setHovered(false); if (editMode) gl.domElement.style.cursor = '' }}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[gridW + 0.4, gridD + 0.4]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      {/* Floor tiles */}
      {cellArr.map(key => {
        const [c, r] = key.split(',').map(Number)
        const x = (c + 0.5) - gridW / 2
        const z = (r + 0.5) - gridD / 2
        return (
          <mesh key={key} position={[x, 0, z]}>
            <boxGeometry args={[1.01, 0.05, 1.01]} />
            <meshStandardMaterial color={fc} roughness={0.82} />
          </mesh>
        )
      })}
      {/* Walls — emissive intensity driven by useFrame for hover/click glow */}
      {wallArr.map((w, i) => {
        if (sharedWallKeys.has(`${w.x.toFixed(3)},${w.z.toFixed(3)}`)) return null
        return (
          <mesh key={i} position={[w.x, MINI_WH / 2, w.z]}>
            <boxGeometry args={w.axis === 'z' ? [1 + WT, MINI_WH, WT] : [WT, MINI_WH, 1 + WT]} />
            <meshStandardMaterial
              ref={el => { wallMatRefs.current[i] = el }}
              color={wc}
              roughness={0.72}
              emissive={glowColor}
            />
          </mesh>
        )
      })}
      {/* Grey overlay for cells occupied by neighboring rooms */}
      {[...neighborOverlayCells].map(key => {
        const [c, r] = key.split(',').map(Number)
        const cx = (c + 0.5) - gridW / 2
        const cz = (r + 0.5) - gridD / 2
        return (
          <mesh key={`nb_${key}`} position={[cx, 0.04, cz]}>
            <boxGeometry args={[1.0, 0.06, 1.0]} />
            <meshBasicMaterial color="#333355" transparent opacity={0.7} />
          </mesh>
        )
      })}
      {/* Door / window opening indicators */}
      {markers.map(({ wx, wz, fw, horiz, isDoor, isUnlinked, isEntryway }, i) => {
        const color = isEntryway ? '#2a5a1a'
                    : isUnlinked ? '#222222'
                    : isDoor     ? '#5a3010'
                    : '#88c0d4'
        const markerH = isDoor ? MINI_WH + 0.02 : MINI_WH * 0.38
        const markerY = isDoor ? MINI_WH * 0.5  : MINI_WH * 0.62
        return (
          <group key={`op${i}`} position={[wx, markerY, wz]}>
            <mesh>
              <boxGeometry args={[
                horiz ? fw : WT + 0.06,
                markerH,
                horiz ? WT + 0.06 : fw,
              ]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Unlinked door: red X indicator above the opening */}
            {isUnlinked && (
              <mesh position={[0, markerH * 0.5 + 0.12, 0]}>
                <boxGeometry args={[fw * 0.55, 0.08, 0.08]} />
                <meshBasicMaterial color="#ff3333" />
              </mesh>
            )}
            {isUnlinked && (
              <mesh position={[0, markerH * 0.5 + 0.12, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[fw * 0.55, 0.08, 0.08]} />
                <meshBasicMaterial color="#ff3333" />
              </mesh>
            )}
            {/* Entryway: small green triangle marker */}
            {isEntryway && (
              <mesh position={[0, markerH * 0.5 + 0.12, 0]}>
                <boxGeometry args={[fw * 0.4, 0.1, 0.1]} />
                <meshBasicMaterial color="#44bb44" />
              </mesh>
            )}
          </group>
        )
      })}
      {/* Inline label */}
      {name && (
        <Html position={[0, MINI_WH + 0.18, 0]} center zIndexRange={[10, 100]}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '1px 4px 2px 7px',
            background: isActive ? 'rgba(80,45,140,0.92)' : 'rgba(12,12,24,0.84)',
            border: `1px solid ${isActive ? '#9a7aee' : '#3a3a58'}`,
            borderRadius: 4,
            fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap', userSelect: 'none',
          }}>
            <span style={{ color: isActive ? '#e0d9ff' : '#a8a0c4', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); onSelect() }}>{name}</span>
            {!isActive && (
              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                title="Delete room"
                style={{
                  background: 'none', border: 'none', color: '#7a5a7a', fontSize: 10,
                  cursor: 'pointer', padding: '0 2px', lineHeight: 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ff6680' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7a5a7a' }}
              >✕</button>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
