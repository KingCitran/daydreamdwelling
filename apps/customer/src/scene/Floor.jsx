import { useMemo } from 'react'
import { Grid } from '@react-three/drei'

const WALL_T = 0.28  // must match Walls.jsx

export default function Floor({ cells, gridW, gridD, floorColor, showGrid, onClickFloor, ceilingView }) {
  const activeCells = useMemo(
    () => [...cells].map(key => key.split(',').map(Number)),
    [cells]
  )
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
        // Shift centre so the slab grows outward, not inward
        const cx = (col + 0.5) - gridW / 2 + (extR - extL) / 2
        const cz = (row + 0.5) - gridD / 2 + (extF - extB) / 2

        return (
          <mesh
            key={`${col},${row}`}
            position={[cx, -WALL_T / 2, cz]}
            receiveShadow
            onClick={onClickFloor}
          >
            <boxGeometry args={[w, WALL_T, d]} />
            <meshStandardMaterial color={floorColor || '#cec5b8'} roughness={0.92} metalness={0} />
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
