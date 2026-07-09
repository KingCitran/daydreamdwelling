import { useMemo, useState, useEffect } from 'react'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'
import { getTexture, TEXTURE_ROUGHNESS, onTextureReady } from './textures'

const WALL_T = 0.28

// How many feet one texture tile covers. Larger = less obvious repeat.
const TEX_SCALE = {
  wood: 5, woodDark: 5, shiplap: 5,
  brick: 6, brickOld: 6, brickWhite: 6, brickBrown: 6, brickTan: 6,
  tile: 4, carpet: 6, carpetFine: 6,
  concrete: 8, marble: 6, stone: 6,
  plaster: 8, drywall: 10,
}

// Remap boxGeometry UVs to world-space on the top face (+Y) so the
// texture tiles continuously across the room. All faces get the same
// mapping so the thin slab sides also look correct.
function remapFloorUVs(geom, w, d, col, row, scale) {
  const uv = geom.attributes.uv
  const pos = geom.attributes.position
  for (let i = 0; i < uv.count; i++) {
    const lx = pos.getX(i)
    const lz = pos.getZ(i)
    uv.setXY(i, (col + 0.5 + lx) / scale, (row + 0.5 + lz) / scale)
  }
  uv.needsUpdate = true
  return geom
}

export default function Floor({
  cells, gridW, gridD,
  floorColor, floorTexture,
  floorOverrides,
  floorCutouts,
  showGrid, onClickFloor, onClickCell,
  ceilingView,
  paintMode = false,
}) {
  const [texVer, setTexVer] = useState(0)
  useEffect(() => onTextureReady(() => setTexVer(v => v + 1)), [])

  const activeCells = useMemo(
    () => [...cells].map(key => key.split(',').map(Number)).filter(([c, r]) => !floorCutouts?.has(`${c},${r}`)),
    [cells, floorCutouts]
  )

  const globalPBR = useMemo(
    () => getTexture(floorTexture, floorColor),
    [floorTexture, floorColor]
  )
  const globalRoughness = TEXTURE_ROUGHNESS[floorTexture] ?? 0.92
  const globalScale = TEX_SCALE[floorTexture] ?? 3

  if (ceilingView) return null

  return (
    <group>
      {activeCells.map(([col, row]) => {
        const extL = cells.has(`${col - 1},${row}`) ? 0 : WALL_T / 2
        const extR = cells.has(`${col + 1},${row}`) ? 0 : WALL_T / 2
        const extB = cells.has(`${col},${row - 1}`) ? 0 : WALL_T / 2
        const extF = cells.has(`${col},${row + 1}`) ? 0 : WALL_T / 2

        const w  = 1 + extL + extR
        const d  = 1 + extB + extF
        const cx = (col + 0.5) - gridW / 2 + (extR - extL) / 2
        const cz = (row + 0.5) - gridD / 2 + (extF - extB) / 2

        const ov = floorOverrides?.get?.(`${col},${row}`)
        const cellColor   = ov?.color   ?? floorColor ?? '#cec5b8'
        const cellTexType = ov?.texture ?? floorTexture ?? 'flat'
        const pbr = ov ? getTexture(cellTexType, cellColor) : globalPBR
        const cellRough = TEXTURE_ROUGHNESS[cellTexType] ?? globalRoughness
        const scale = TEX_SCALE[cellTexType] ?? globalScale

        const handleClick = (e) => {
          if (paintMode && onClickCell) {
            e.stopPropagation()
            onClickCell(col, row)
          } else {
            onClickFloor?.(e)
          }
        }

        // Single box with world-space UVs when textured
        const boxGeom = new THREE.BoxGeometry(w, WALL_T, d)
        if (pbr) remapFloorUVs(boxGeom, w, d, col, row, scale)

        return (
          <mesh
            key={`${col},${row}`}
            position={[cx, -WALL_T / 2, cz]}
            receiveShadow
            onClick={handleClick}
            geometry={boxGeom}
          >
            <meshStandardMaterial
              key={`floor_mat_${texVer}`}
              color={cellColor}
              map={pbr?.map || undefined}
              normalMap={pbr?.normalMap || undefined}
              roughnessMap={pbr?.roughnessMap || undefined}
              roughness={pbr?.roughnessMap ? 1.0 : cellRough}
              metalness={0}
            />
          </mesh>
        )
      })}

      {showGrid && (
        <Grid
          args={[Math.min(gridW, 40), Math.min(gridD, 40)]}
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
