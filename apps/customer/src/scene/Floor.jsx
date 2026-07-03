import { useMemo, useState, useEffect, useRef } from 'react'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'
import { getTexture, TEXTURE_ROUGHNESS, onTextureReady } from './textures'

const WALL_T = 0.28

// Scale: how many feet of real surface one texture tile covers.
// The texture repeat in the registry is ignored here — we control
// tiling via UV coordinates so the pattern flows continuously.
const TEX_SCALE = {
  wood: 3, woodDark: 3, shiplap: 3,
  brick: 3, brickOld: 3, brickWhite: 3,
  tile: 2, carpet: 2,
  concrete: 4, marble: 3, stone: 3,
  plaster: 4, drywall: 5,
}

// Build a plane geometry with UVs mapped to world-space so the texture
// tiles continuously across all cells. The top face (Y+) gets real UVs;
// other faces keep 0 UVs (invisible on a floor slab).
function makeFloorGeom(w, d, col, row, scale) {
  const geom = new THREE.PlaneGeometry(w, d)
  geom.rotateX(-Math.PI / 2) // lay flat
  // Map UVs to world position so texture flows across room
  const uv = geom.attributes.uv
  for (let i = 0; i < uv.count; i++) {
    // PlaneGeometry verts go from -w/2..w/2 and -d/2..d/2
    // Map to world: col + local offset
    const localX = geom.attributes.position.getX(i)
    const localZ = geom.attributes.position.getZ(i)
    uv.setXY(i, (col + localX + 0.5) / scale, (row - localZ + 0.5) / scale)
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

        // World-space UV geometry so texture flows continuously
        const geom = useMemo(
          () => pbr ? makeFloorGeom(w, d, col, row, scale) : undefined,
          [w, d, col, row, scale, !!pbr]
        )

        return (
          <group key={`${col},${row}`}>
            {/* Slab body (thin box for shadow receiving + thickness) */}
            <mesh position={[cx, -WALL_T / 2, cz]} receiveShadow onClick={handleClick}>
              <boxGeometry args={[w, WALL_T, d]} />
              <meshStandardMaterial
                color={pbr ? '#ffffff' : cellColor}
                roughness={cellRough}
                metalness={0}
              />
            </mesh>
            {/* Textured top surface with world-space UVs */}
            {pbr && geom && (
              <mesh position={[cx, 0.003, cz]} receiveShadow onClick={handleClick} geometry={geom}>
                <meshStandardMaterial
                  key={`floor_mat_${texVer}`}
                  color="#ffffff"
                  map={pbr.map || undefined}
                  normalMap={pbr.normalMap || undefined}
                  normalScale={new THREE.Vector2(1.2, 1.2)}
                  roughnessMap={pbr.roughnessMap || undefined}
                  roughness={pbr.roughnessMap ? 1.0 : cellRough}
                  metalness={0}
                />
              </mesh>
            )}
          </group>
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
