// GhostFloor — renders a non-interactive, translucent floor below the active level.
// Walls at half height, all materials at 25% opacity, no raycasting.
import { useRef, useEffect, useMemo } from 'react'
import Floor from './Floor'
import Items from './Items'
import { ITEM_CATALOGUE } from '../data/items'

import safeSet from '../utils/safeSet'

const noop = () => {}

export default function GhostFloor({
  roomData, yOffset = 0, wallHeight = 8,
  roomRotationRef, catalogue = ITEM_CATALOGUE,
  lowerFloorStairs,
}) {
  const groupRef = useRef()

  const cells = useMemo(
    () => (roomData.cells instanceof Set ? roomData.cells : safeSet(roomData.cells)),
    [roomData.cells]
  )

  const items = roomData.items ?? []
  const gridW = roomData.gridW ?? 10
  const gridD = roomData.gridD ?? 10
  const wh = roomData.wallHeight ?? wallHeight

  // Floor cutouts: returnStair items on this floor + stairs on the floor below
  const floorCutouts = useMemo(() => {
    const cuts = new Set()
    const addCuts = (it) => {
      const sw = it.stairW ?? 3, sd = it.stairD ?? 5
      const rotated = it.rotation === 90 || it.rotation === 270
      const ew = rotated ? sd : sw, ed = rotated ? sw : sd
      for (let dc = 0; dc < ew; dc++)
        for (let dr = 0; dr < ed; dr++) {
          const c = it.col + dc, r = it.row + dr
          if (c >= 0 && c < gridW && r >= 0 && r < gridD)
            cuts.add(`${c},${r}`)
        }
    }
    for (const it of items)
      if (it.stairs && it.returnStair) addCuts(it)
    if (lowerFloorStairs)
      for (const it of lowerFloorStairs)
        if (it.stairs && !it.returnStair) addCuts(it)
    return cuts
  }, [items, lowerFloorStairs, gridW, gridD])

  // After mount/update: make all materials transparent and disable raycasting
  // Use a small delay so child meshes are mounted before traversal
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
          child.material.opacity = 0.12
          child.material.depthWrite = false
        }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [roomData.items, roomData.cells, roomData.wallColor, roomData.floorColor])

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
      {/* No walls on ghost floor — just floor + items for clean look */}
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
