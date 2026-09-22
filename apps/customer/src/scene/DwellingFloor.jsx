// DwellingFloor — renders a complete floor (floor tiles + walls + items)
// at a given yOffset for the dwelling overview. Non-interactive, with
// slightly translucent materials so you can see through the building.
import { useRef, useEffect, useMemo } from 'react'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import { ITEM_CATALOGUE } from '../data/items'

const noop = () => {}
function safeSet(v) {
  if (v instanceof Set) return v
  if (Array.isArray(v)) return new Set(v)
  if (v && typeof v[Symbol.iterator] === 'function') return new Set(v)
  return new Set()
}

export default function DwellingFloor({
  roomData, yOffset = 0, wallHeight = 8,
  roomRotationRef, catalogue = ITEM_CATALOGUE,
  isActive = false, // true = the floor the user was editing
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

  // After mount: make materials semi-transparent and disable raycasting.
  // Active floor is more opaque, other floors more see-through.
  const appliedRef = useRef(false)
  useEffect(() => {
    appliedRef.current = false
    const timer = setTimeout(() => {
      if (!groupRef.current || appliedRef.current) return
      appliedRef.current = true
      groupRef.current.traverse(child => {
        child.raycast = noop
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.material.opacity = isActive ? 0.85 : 0.55
          child.material.depthWrite = isActive
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
        floorTexture={roomData.floorTexture ?? 'flat'}
        floorOverrides={roomData.floorOverrides}
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
        items={items}
        paintMode={false}
        onClickWall={noop}
        internalWalls={internalWalls}
      />
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
    </group>
  )
}
