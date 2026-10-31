// DwellingFloor — renders a complete floor (floor tiles + walls + optionally items)
// at a given yOffset for the dwelling overview. Non-interactive, with
// slightly translucent materials so you can see through the building.
import { useRef, useEffect, useMemo } from 'react'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import { ITEM_CATALOGUE } from '../data/items'

import safeSet from '../utils/safeSet'

const noop = () => {}

// Cutaway normals based on camera rotation angle
// Removes the wall(s) facing the camera so you can see inside
function getCutawayNormals(angle) {
  // Camera orbits around the building. Determine which quadrant it's in
  // and remove the walls facing that direction
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  if (a < Math.PI / 2) return [[0, 0, 1]]         // camera at +X,+Z → remove south wall
  if (a < Math.PI)     return [[-1, 0, 0]]         // camera at -X,+Z → remove east wall
  if (a < 3 * Math.PI / 2) return [[0, 0, -1]]     // camera at -X,-Z → remove north wall
  return [[1, 0, 0]]                                 // camera at +X,-Z → remove west wall
}

export default function DwellingFloor({
  roomData, yOffset = 0, wallHeight = 8,
  roomRotationRef, catalogue = ITEM_CATALOGUE,
  isActive = false,
  showItems = true,
  floorLabel,
}) {
  const groupRef = useRef()

  const cells = useMemo(
    () => (roomData.cells instanceof Set ? roomData.cells : safeSet(roomData.cells)),
    [roomData.cells]
  )
  const internalWalls = useMemo(
    () => (roomData.internalWalls instanceof Set ? roomData.internalWalls : safeSet(roomData.internalWalls)),
    [roomData.internalWalls]
  )

  const items = roomData.items ?? []
  const gridW = roomData.gridW ?? 10
  const gridD = roomData.gridD ?? 10
  const wh = roomData.wallHeight ?? wallHeight

  // Compute floor cutouts from returnStair items
  const floorCutouts = useMemo(() => {
    const cuts = new Set()
    for (const it of items) {
      if (!it.stairs || !it.returnStair) continue
      const sw = it.stairW ?? 3, sd = it.stairD ?? 5
      const rotated = it.rotation === 90 || it.rotation === 270
      const ew = rotated ? sd : sw, ed = rotated ? sw : sd
      for (let dc = 0; dc < ew; dc++)
        for (let dr = 0; dr < ed; dr++)
          cuts.add(`${it.col + dc},${it.row + dr}`)
    }
    return cuts
  }, [items])

  // After mount: make materials semi-transparent and disable raycasting
  const appliedRef = useRef(false)
  useEffect(() => {
    appliedRef.current = false
    const timer = setTimeout(() => {
      if (!groupRef.current || appliedRef.current) return
      appliedRef.current = true
      groupRef.current.traverse(child => {
        child.raycast = noop
        child.castShadow = false
        child.receiveShadow = false
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.material.opacity = 0.92
          child.material.depthWrite = true
        }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [roomData.items, roomData.cells, roomData.wallColor, roomData.floorColor, isActive])

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      <Floor
        cells={cells}
        gridW={gridW}
        gridD={gridD}
        floorColor={roomData.floorColor ?? '#cec5b8'}
        floorTexture={'flat'}
        floorCutouts={floorCutouts}
        showGrid={false}
        paintMode={false}
      />
      <Walls
        cells={cells}
        gridW={gridW}
        gridD={gridD}
        wallHeight={wh}
        wallColor={roomData.wallColor ?? '#d8d0c6'}
        wallTexture={roomData.wallTexture ?? 'flat'}
        wallFinish={roomData.wallFinish ?? 'eggshell'}
        wallOverrides={roomData.wallOverrides}
        showGrid={false}
        items={showItems ? items : []}
        paintMode={false}
        onClickWall={noop}
        internalWalls={internalWalls}
        cutawayNormals={[[0, 0, -1]]}
      />
      {showItems && (
        <Items
          items={items}
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wh}
          onSelectItem={noop}
          onMoveItem={noop}
          onMoveWallItem={noop}
          onDoubleClickItem={noop}
          onDragStart={noop}
          onDragEnd={noop}
          roomRotationRef={roomRotationRef}
          catalogue={catalogue}
        />
      )}
      {/* Floor edge highlight — colored bar on the front edge */}
      {floorLabel && (
        <mesh position={[0, 0.05, gridD / 2 + 0.3]}>
          <boxGeometry args={[gridW * 0.8, 0.1, 0.3]} />
          <meshBasicMaterial color={isActive ? '#60d888' : '#8080c0'} />
        </mesh>
      )}
    </group>
  )
}
