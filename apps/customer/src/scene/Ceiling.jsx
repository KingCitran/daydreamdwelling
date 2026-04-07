import { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ITEM_CATALOGUE } from '../data/items'

const WALL_T = 0.28
const DISC_R = 0.18

const CEILING_LIGHT_CONFIG = {
  recessedLight: { color: '#fff8f0', intensity: 2.5, distance: 10 },
  chandelier:    { color: '#fff8e0', intensity: 3.5, distance: 14 },
  pendant:       { color: '#fff8e0', intensity: 2.0, distance: 8  },
  ceilingFan:    { color: '#fff8e0', intensity: 1.5, distance: 8  },
}
const DEFAULT_CEILING_LIGHT = { color: '#fff8e0', intensity: 1.4, distance: 6 }

const _ray = new THREE.Raycaster()
const _ptr = new THREE.Vector2()
const _hit = new THREE.Vector3()
const snapF = v => Math.round(v * 2) / 2   // 0.5 ft grid

// ── Draggable disc marker for a single ceiling item ─────────────────
function CeilingItemMarker({
  it, def, size, mx, mz, cy, dropLength, isSelected, isCartHighlighted,
  ceilingView, onSelectItem, onMoveCeilingItem,
  gridW, gridD, roomRotationRef, lightsOff = false,
}) {
  const lightCfg = CEILING_LIGHT_CONFIG[it.typeKey] ?? DEFAULT_CEILING_LIGHT
  const { camera, gl } = useThree()
  // Ceiling plane lives at Y = cy in local (room) space.
  // Since only the camera moves (no room X-rotation), world Y = cy always.
  const ceilPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -cy))
  ceilPlane.current.constant = -cy   // keep in sync if wallHeight changes

  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelectItem(it.id)
    if (it.locked) return

    gl.domElement.style.cursor = 'grabbing'
    const capturedId = it.id
    const [fp0, fp1] = size.footprint

    const handleMove = (ev) => {
      _ptr.set(
         (ev.clientX / gl.domElement.clientWidth)  *  2 - 1,
        -(ev.clientY / gl.domElement.clientHeight) *  2 + 1,
      )
      _ray.setFromCamera(_ptr, camera)
      if (!_ray.ray.intersectPlane(ceilPlane.current, _hit)) return
      // Rotate world hit back into room-local space (inverse of group Y-rotation)
      const ry = roomRotationRef.current
      const lx = Math.cos(ry) * _hit.x - Math.sin(ry) * _hit.z
      const lz = Math.sin(ry) * _hit.x + Math.cos(ry) * _hit.z
      const col = Math.max(0, Math.min(gridW - fp0, snapF(lx + gridW / 2 - fp0 / 2)))
      const row = Math.max(0, Math.min(gridD - fp1, snapF(lz + gridD / 2 - fp1 / 2)))
      onMoveCeilingItem(capturedId, col, row)
    }

    const handleUp = () => {
      gl.domElement.style.cursor = ''
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <group position={[mx, 0, mz]}>
      {/* Cart highlight ring — always visible */}
      {isCartHighlighted && !isSelected && (
        <mesh position={[0, cy - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(DISC_R, size.footprint[0] * 0.4), Math.max(DISC_R, size.footprint[0] * 0.4) + 0.18, 32]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
        </mesh>
      )}
      {!lightsOff && (
        <pointLight
          position={[0, cy - dropLength, 0]}
          intensity={lightCfg.intensity}
          distance={lightCfg.distance}
          decay={2}
          color={lightCfg.color}
        />
      )}

      {ceilingView && (
        <>
          {/* Drop cord */}
          <mesh position={[0, cy - dropLength / 2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, dropLength, 6]} />
            <meshStandardMaterial color="#888888" />
          </mesh>

          {/* Disc marker — draggable. Transparent when idle so it doesn't
              look like a physical canopy; full opacity + highlight when selected. */}
          <mesh
            position={[0, cy - 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={onPointerDown}
            onClick={e => e.stopPropagation()}
          >
            <circleGeometry args={[Math.max(DISC_R, size.footprint[0] * 0.35), 24]} />
            <meshStandardMaterial
              color={isSelected ? '#c0a0ff' : def.color}
              roughness={0.5}
              emissive={isSelected ? '#6040c0' : '#000000'}
              emissiveIntensity={isSelected ? 0.5 : 0}
              transparent
              opacity={isSelected ? 1.0 : 0.18}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

// ── Ceiling slab + all ceiling items ────────────────────────────────
export default function Ceiling({
  cells, gridW, gridD, wallHeight,
  items, selectedId, onClickCell, onSelectItem,
  ceilingPicker, ceilingView,
  onMoveCeilingItem, roomRotationRef, cartHighlight = null, lightsOff = false,
}) {
  const activeCells = [...cells].map(key => key.split(',').map(Number))
  const ceilingItems = items.filter(it => it.ceiling)
  const cy = wallHeight

  return (
    <group>
      {/* Ceiling slab — only rendered in ceiling view */}
      {ceilingView && activeCells.map(([col, row]) => {
        const extL = cells.has(`${col - 1},${row}`) ? 0 : WALL_T / 2
        const extR = cells.has(`${col + 1},${row}`) ? 0 : WALL_T / 2
        const extB = cells.has(`${col},${row - 1}`) ? 0 : WALL_T / 2
        const extF = cells.has(`${col},${row + 1}`) ? 0 : WALL_T / 2
        const w  = 1 + extL + extR
        const d  = 1 + extB + extF
        const cx = (col + 0.5) - gridW / 2 + (extR - extL) / 2
        const cz = (row + 0.5) - gridD / 2 + (extF - extB) / 2

        return (
          <mesh
            key={`ceil-${col},${row}`}
            position={[cx, cy + WALL_T / 2, cz]}
            onClick={ceilingPicker
              ? (e) => { e.stopPropagation(); onClickCell(col, row) }
              : (e) => { e.stopPropagation(); onSelectItem(null) }}
          >
            <boxGeometry args={[w, WALL_T, d]} />
            <meshStandardMaterial color="#e8e0d8" roughness={0.92} metalness={0} />
          </mesh>
        )
      })}

      {/* Ceiling items */}
      {ceilingItems.map(it => {
        const def        = ITEM_CATALOGUE[it.typeKey]
        const size       = def.sizes[it.sizeIndex]
        const mx         = (it.col + size.footprint[0] / 2) - gridW / 2
        const mz         = (it.row + size.footprint[1] / 2) - gridD / 2
        const dropLength = it.dropLength ?? size.defaultDropLength ?? 0.6
        const isCartHighlighted = !!(cartHighlight &&
          it.typeKey === cartHighlight.typeKey &&
          it.sizeIndex === cartHighlight.sizeIndex &&
          it.swatchIndex === cartHighlight.swatchIndex)

        return (
          <CeilingItemMarker
            key={it.id}
            it={it}
            def={def}
            size={size}
            mx={mx}
            mz={mz}
            cy={cy}
            dropLength={dropLength}
            isSelected={it.id === selectedId}
            isCartHighlighted={isCartHighlighted}
            ceilingView={ceilingView}
            onSelectItem={onSelectItem}
            onMoveCeilingItem={onMoveCeilingItem}
            gridW={gridW}
            gridD={gridD}
            roomRotationRef={roomRotationRef}
            lightsOff={lightsOff}
          />
        )
      })}
    </group>
  )
}
