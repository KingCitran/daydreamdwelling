// GhostFloor — renders a non-interactive, translucent floor below the active level.
// Walls at half height, all materials at 25% opacity, no raycasting.
import { useRef, useEffect, useMemo } from 'react'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import { ITEM_CATALOGUE } from '../data/items'

const noop = () => {}

export default function GhostFloor({
  roomData, yOffset = 0, wallHeight = 8,
  roomRotationRef, catalogue = ITEM_CATALOGUE,
}) {
  const groupRef = useRef()

  const cells = useMemo(
    () => (roomData.cells instanceof Set ? roomData.cells : new Set(roomData.cells ?? [])),
    [roomData.cells]
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

  // After mount/update: make all materials transparent and disable raycasting
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.traverse(child => {
      // Disable all raycasting so ghost floor can't intercept clicks
      child.raycast = noop
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.transparent = true
        child.material.opacity = 0.18
        child.material.depthWrite = false
      }
    })
  })

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
        currentRotationRef={roomRotationRef}
        showGrid={false}
        items={items}
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
