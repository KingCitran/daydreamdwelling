// NeighborRoom — renders an adjacent room on the same floor at semi-opacity.
// Shows walls + floor + items so the user can see the layout.
// Clickable — clicking switches focus to this room.
import { useRef, useEffect, useMemo } from 'react'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import { ITEM_CATALOGUE } from '../data/items'

const noop = () => {}

export default function NeighborRoom({
  roomData, xOffset = 0, zOffset = 0, wallHeight = 8,
  roomRotationRef, catalogue = ITEM_CATALOGUE,
  onClick,
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

  // After mount: semi-transparent materials, keep raycasting for click detection
  const appliedRef = useRef(false)
  useEffect(() => {
    appliedRef.current = false
    const timer = setTimeout(() => {
      if (!groupRef.current || appliedRef.current) return
      appliedRef.current = true
      groupRef.current.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.material.opacity = 0.45
          child.material.depthWrite = false
        }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [roomData.items, roomData.cells, roomData.wallColor, roomData.floorColor])

  return (
    <group
      ref={groupRef}
      position={[xOffset, 0, zOffset]}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = '' }}
    >
      <Floor
        cells={cells}
        gridW={gridW}
        gridD={gridD}
        floorColor={roomData.floorColor ?? '#cec5b8'}
        floorTexture={roomData.floorTexture ?? 'flat'}
        floorOverrides={roomData.floorOverrides}
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
