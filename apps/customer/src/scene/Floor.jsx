import { useMemo } from 'react'
import { Grid } from '@react-three/drei'
import { getTexture, TEXTURE_ROUGHNESS } from './textures'

const WALL_T = 0.28  // must match Walls.jsx

/**
 * Floor renderer with per-cell material overrides.
 *
 * floorColor / floorTexture = global default for all cells.
 * floorOverrides = Map of "col,row" → { color, texture } for individually painted cells.
 *
 * When painting mode is active, onClickCell fires with (col, row) so the
 * parent can stamp the active brush material onto that cell.
 */
export default function Floor({
  cells, gridW, gridD,
  floorColor, floorTexture,
  floorOverrides,
  floorCutouts,
  showGrid, onClickFloor, onClickCell,
  ceilingView,
  paintMode = false,
}) {
  const activeCells = useMemo(
    () => [...cells].map(key => key.split(',').map(Number)).filter(([c, r]) => !floorCutouts?.has(`${c},${r}`)),
    [cells]
  )

  // Global default texture (used for cells with no override)
  const globalTexture = useMemo(
    () => getTexture(floorTexture, floorColor),
    [floorTexture, floorColor]
  )
  const globalRoughness = TEXTURE_ROUGHNESS[floorTexture] ?? 0.92

  if (ceilingView) return null

  return (
    <group>
      {activeCells.map(([col, row]) => {
        // Extend slab under any adjacent wall (border edge = no neighbour cell)
        const extL = cells.has(`${col - 1},${row}`) ? 0 : WALL_T / 2
        const extR = cells.has(`${col + 1},${row}`) ? 0 : WALL_T / 2
        const extB = cells.has(`${col},${row - 1}`) ? 0 : WALL_T / 2
        const extF = cells.has(`${col},${row + 1}`) ? 0 : WALL_T / 2

        const w  = 1 + extL + extR
        const d  = 1 + extB + extF
        const cx = (col + 0.5) - gridW / 2 + (extR - extL) / 2
        const cz = (row + 0.5) - gridD / 2 + (extF - extB) / 2

        // Per-cell override or global default
        const ov = floorOverrides?.get?.(`${col},${row}`)
        const cellColor   = ov?.color   ?? floorColor ?? '#cec5b8'
        const cellTexType = ov?.texture ?? floorTexture ?? 'flat'
        const cellTex     = ov ? getTexture(cellTexType, cellColor) : globalTexture
        const cellRough   = TEXTURE_ROUGHNESS[cellTexType] ?? globalRoughness

        const handleClick = (e) => {
          if (paintMode && onClickCell) {
            e.stopPropagation()
            onClickCell(col, row)
          } else {
            onClickFloor?.(e)
          }
        }

        return (
          <mesh
            key={`${col},${row}`}
            position={[cx, -WALL_T / 2, cz]}
            receiveShadow
            onClick={handleClick}
          >
            <boxGeometry args={[w, WALL_T, d]} />
            <meshStandardMaterial
              color={cellTex ? '#ffffff' : cellColor}
              map={cellTex || undefined}
              roughness={cellRough}
              metalness={0}
            />
          </mesh>
        )
      })}

      {showGrid && (
        <Grid
          args={[gridW, gridD]}
          position={[0, 0.002, 0]}
          cellSize={1}
          cellThickness={1.2}
          cellColor="#8a7e70"
          sectionSize={4}
          sectionThickness={2}
          sectionColor="#6a5e50"
          fadeStrength={0}
          infiniteGrid={false}
          opacity={0.45}
        />
      )}
    </group>
  )
}
