import { useRef, useEffect, useCallback } from 'react'

const SAVE_KEY = 'room-builder-v1'

export default function usePersistence({
  gridW, gridD, wallHeight, cells, items, cart,
  floorColor, wallColor, bgColor, musicStation, lightMood, roomNames,
  allRooms, currentRoomId,
  nextItemIdRef,
  setGridW, setGridD, setCells, setItems, setCart, setFloorColor, setWallColor, setSelectedId,
}) {
  const importRef = useRef(null)

  useEffect(() => {
    const serializedAllRooms = Object.fromEntries(
      Object.entries(allRooms ?? {}).map(([id, room]) => [
        id,
        { ...room, cells: [...(room.cells instanceof Set ? room.cells : new Set(room.cells))] },
      ])
    )
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 1, gridW, gridD, wallHeight,
      cells: [...cells],
      items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames,
      allRooms: serializedAllRooms, currentRoomId,
    }))
  }, [gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames, allRooms, currentRoomId])

  const exportRoom = useCallback(() => {
    const data = JSON.stringify({ version: 1, gridW, gridD, cells: [...cells], items, cart, floorColor, wallColor }, null, 2)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'my-room.json' })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [gridW, gridD, cells, items, cart, floorColor, wallColor])

  const importRoom = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.version !== 1) return
        setGridW(data.gridW)
        setGridD(data.gridD)
        setCells(new Set(data.cells))
        setItems(data.items ?? [])
        setCart(data.cart ?? [])
        if (data.items?.length > 0)
          nextItemIdRef.current = Math.max(...data.items.map(it => it.id)) + 1
        if (data.floorColor) setFloorColor(data.floorColor)
        if (data.wallColor)  setWallColor(data.wallColor)
        setSelectedId(null)
      } catch (err) { console.error('Failed to load room:', err) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [nextItemIdRef, setGridW, setGridD, setCells, setItems, setCart, setFloorColor, setWallColor, setSelectedId])

  return { importRef, exportRoom, importRoom }
}
