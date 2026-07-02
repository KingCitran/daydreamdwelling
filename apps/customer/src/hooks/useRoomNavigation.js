import { useCallback } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import { makeGrid, getParallelWallFaces } from '../utils/roomGeometry'
import { findSpatialNeighbors } from '../overview/layout'

const DEFAULT_wallHeight = 8
const ROOM_PALETTES = [
  { floorColor: '#cec5b8', wallColor: '#d8d0c6' },
  { floorColor: '#b8c8c4', wallColor: '#c6d4d0' },
  { floorColor: '#c4bece', wallColor: '#cfc9d9' },
  { floorColor: '#c8c0ae', wallColor: '#d6cbba' },
  { floorColor: '#b8c0cc', wallColor: '#c6cdd8' },
  { floorColor: '#c8c0c0', wallColor: '#d8cece' },
]

export default function useRoomNavigation({
  items, setItems,
  gridW, gridD, cells, setCells,
  wallHeight, setWallHeight,
  floorColor, setFloorColor,
  wallColor, setWallColor,
  targetRotation,
  currentRoomId, setCurrentRoomId,
  allRooms, setAllRooms,
  setGridW, setGridD,
  setRoomStack, roomStack,
  setTarget, setSelectedId,
  setDoorLinkPicker,
  nextItemIdRef, nextRoomIdRef,
  zoomRef,
  getRoomName, setRoomNamesState,
}) {
  const enterRoom = useCallback((doorId) => {
    const door = items.find(it => it.id === doorId)
    if (!door) return

    // ── Stairs navigation: go to the connected floor ──────────────
    if (door.stairs && door.topFloorRoomId != null) {
      const targetId = door.topFloorRoomId
      const targetRoom = allRooms[targetId]
      if (!targetRoom) return
      const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
      const sz = zoomRef.current
      zoomRef.current = Math.max(15, sz * 0.72)
      setTimeout(() => { zoomRef.current = sz }, 420)
      setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot }))
      setCurrentRoomId(targetId)
      setRoomStack(prev => [...prev, currentRoomId])
      setGridW(targetRoom.gridW); setGridD(targetRoom.gridD)
      setCells(new Set(targetRoom.cells))
      setItems([...targetRoom.items])
      setWallHeight(targetRoom.wallHeight ?? wallHeight)
      if (targetRoom.floorColor) setFloorColor(targetRoom.floorColor)
      if (targetRoom.wallColor) setWallColor(targetRoom.wallColor)
      setSelectedId(null)
      return
    }

    if (!door.wall) return
    if (ITEM_CATALOGUE[door.typeKey]?.entryway) return

    if (door.connectedRoomId === undefined || door.connectedRoomId === null) {
      const oppWall  = { N: 'S', S: 'N', W: 'E', E: 'W' }[door.wall]
      const candidates = []
      for (const [rid, room] of Object.entries(allRooms)) {
        const roomId = Number(rid)
        if (roomId === currentRoomId) continue
        const hasMatch = room.items.some(it =>
          it.wall === oppWall && ITEM_CATALOGUE[it.typeKey]?.door &&
          (it.connectedRoomId === currentRoomId ||
           (it.connectedRoomId == null && Math.abs((it.wallU ?? 0) - door.wallU) < 2.0))
        )
        if (hasMatch) candidates.push(roomId)
      }
      if (candidates.length === 0) {
        const layoutSnap = { gridW, gridD, cells, items, wallHeight, floorColor, wallColor }
        const layoutData = { ...allRooms, [currentRoomId]: layoutSnap }
        const spatial = findSpatialNeighbors(door.wall, currentRoomId, layoutData)
        for (const rid of spatial) if (!candidates.includes(rid)) candidates.push(rid)
      }
      if (candidates.length === 0) {
        confirmNewRoom(doorId)
      } else if (candidates.length === 1) {
        linkDoorToRoom(doorId, candidates[0])
      } else {
        setDoorLinkPicker({ doorId })
      }
      return
    }

    const targetId   = door.connectedRoomId
    const targetRoom = allRooms[targetId]
    if (!targetRoom) return
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const sz = zoomRef.current
    zoomRef.current = Math.max(15, sz * 0.72)
    setTimeout(() => { zoomRef.current = sz }, 420)
    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot }))
    setCurrentRoomId(targetId)
    setRoomStack(prev => [...prev, currentRoomId])
    setGridW(targetRoom.gridW); setGridD(targetRoom.gridD)
    setCells(new Set(targetRoom.cells))
    setItems([...targetRoom.items])
    setWallHeight(targetRoom.wallHeight)
    setFloorColor(targetRoom.floorColor); setWallColor(targetRoom.wallColor)
    setTarget(targetRoom.targetRotation ?? 0); setSelectedId(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, gridW, gridD, cells, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, allRooms, zoomRef])

  const confirmNewRoom = useCallback((doorId) => {
    setDoorLinkPicker(null)
    const door = items.find(it => it.id === doorId)
    if (!door || !door.wall) return
    const targetId = nextRoomIdRef.current++
    const snapshot = {
      gridW, gridD, cells: new Set(cells),
      items: items.map(it => it.id === doorId ? { ...it, connectedRoomId: targetId, locked: true, wasLinked: true } : it),
      wallHeight, floorColor, wallColor, targetRotation,
    }
    const oppWall  = { N: 'S', S: 'N', W: 'E', E: 'W' }[door.wall]
    const wallLen  = (door.wall === 'N' || door.wall === 'S') ? gridW : gridD
    const mirU     = wallLen - door.wallU
    const newCells = makeGrid(gridW, gridD)
    const faces    = getParallelWallFaces(oppWall, mirU, newCells, gridW, gridD)
    const def      = ITEM_CATALOGUE[door.typeKey]
    const linkedDoor = {
      id: nextItemIdRef.current++,
      typeKey: door.typeKey, sizeIndex: door.sizeIndex, swatchIndex: door.swatchIndex,
      col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
      wall: oppWall, wallU: mirU, wallH: door.wallH, wallAnchor: faces[0],
      connectedRoomId: currentRoomId, wasLinked: true,
      ...(door.customW !== undefined ? { customW: door.customW } : {}),
      ...(door.customH !== undefined ? { customH: door.customH } : {}),
    }
    const palette = ROOM_PALETTES[targetId % ROOM_PALETTES.length]
    const newRoom = { gridW, gridD, cells: newCells, items: [linkedDoor], wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor, targetRotation: 0 }
    const sz = zoomRef.current
    zoomRef.current = Math.max(15, sz * 0.72)
    setTimeout(() => { zoomRef.current = sz }, 420)
    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot, [targetId]: newRoom }))
    setCurrentRoomId(targetId)
    setRoomStack(prev => [...prev, currentRoomId])
    setGridW(gridW); setGridD(gridD); setCells(newCells)
    setItems([linkedDoor])
    setWallHeight(wallHeight); setFloorColor(palette.floorColor); setWallColor(palette.wallColor)
    setTarget(0); setSelectedId(null)
  }, [items, gridW, gridD, cells, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, zoomRef, nextRoomIdRef, nextItemIdRef, setDoorLinkPicker, setAllRooms, setCurrentRoomId, setRoomStack, setGridW, setGridD, setCells, setItems, setWallHeight, setFloorColor, setWallColor, setTarget, setSelectedId])

  const linkDoorToRoom = useCallback((doorId, targetId) => {
    setDoorLinkPicker(null)
    const door = items.find(it => it.id === doorId)
    if (!door || !door.wall) return
    const targetRoom = allRooms[targetId]
    if (!targetRoom) return
    const updatedItems = items.map(it =>
      it.id === doorId ? { ...it, connectedRoomId: targetId, locked: true, wasLinked: true } : it
    )
    const oppWall = { N: 'S', S: 'N', W: 'E', E: 'W' }[door.wall]
    const alreadyLinked = targetRoom.items.some(
      it => it.connectedRoomId === currentRoomId && ITEM_CATALOGUE[it.typeKey]?.door
    )
    let updatedTargetItems = targetRoom.items
    if (!alreadyLinked) {
      const wallLen  = (door.wall === 'N' || door.wall === 'S') ? gridW : gridD
      const mirU     = wallLen - door.wallU
      const tCells   = targetRoom.cells instanceof Set ? targetRoom.cells : new Set(targetRoom.cells)
      const faces    = getParallelWallFaces(oppWall, mirU, tCells, targetRoom.gridW, targetRoom.gridD)
      const def      = ITEM_CATALOGUE[door.typeKey]
      updatedTargetItems = [...targetRoom.items, {
        id: nextItemIdRef.current++,
        typeKey: door.typeKey, sizeIndex: door.sizeIndex, swatchIndex: door.swatchIndex,
        col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
        wall: oppWall, wallU: mirU, wallH: door.wallH, wallAnchor: faces[0],
        connectedRoomId: currentRoomId, wasLinked: true,
        ...(door.customW !== undefined ? { customW: door.customW } : {}),
        ...(door.customH !== undefined ? { customH: door.customH } : {}),
      }]
    }
    const snapshot = { gridW, gridD, cells: new Set(cells), items: updatedItems, wallHeight, floorColor, wallColor, targetRotation }
    const sz = zoomRef.current
    zoomRef.current = Math.max(15, sz * 0.72)
    setTimeout(() => { zoomRef.current = sz }, 420)
    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot, [targetId]: { ...targetRoom, items: updatedTargetItems } }))
    setCurrentRoomId(targetId)
    setRoomStack(prev => [...prev, currentRoomId])
    setGridW(targetRoom.gridW); setGridD(targetRoom.gridD)
    setCells(new Set(targetRoom.cells))
    setItems(updatedTargetItems)
    setWallHeight(targetRoom.wallHeight)
    setFloorColor(targetRoom.floorColor); setWallColor(targetRoom.wallColor)
    setTarget(targetRoom.targetRotation ?? 0); setSelectedId(null)
  }, [items, gridW, gridD, cells, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, allRooms, zoomRef, nextItemIdRef, setDoorLinkPicker, setAllRooms, setCurrentRoomId, setRoomStack, setGridW, setGridD, setCells, setItems, setWallHeight, setFloorColor, setWallColor, setTarget, setSelectedId])

  const goBack = useCallback(() => {
    if (roomStack.length === 0) return
    const prevId   = roomStack[roomStack.length - 1]
    const prevRoom = allRooms[prevId]
    if (!prevRoom) return
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const savedZoom = zoomRef.current
    zoomRef.current = Math.max(15, savedZoom * 0.72)
    setTimeout(() => { zoomRef.current = savedZoom }, 420)
    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot }))
    setCurrentRoomId(prevId)
    setRoomStack(prev => prev.slice(0, -1))
    setGridW(prevRoom.gridW); setGridD(prevRoom.gridD)
    setCells(new Set(prevRoom.cells))
    setItems([...prevRoom.items])
    setWallHeight(prevRoom.wallHeight)
    setFloorColor(prevRoom.floorColor); setWallColor(prevRoom.wallColor)
    setTarget(prevRoom.targetRotation ?? 0); setSelectedId(null)
  }, [roomStack, allRooms, currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, zoomRef, setAllRooms, setCurrentRoomId, setRoomStack, setGridW, setGridD, setCells, setItems, setWallHeight, setFloorColor, setWallColor, setTarget, setSelectedId])

  const jumpToRoom = useCallback((targetId) => {
    const tid = Number(targetId)
    if (tid === currentRoomId) return
    const targetRoom = allRooms[tid]
    if (!targetRoom) return
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot }))
    setCurrentRoomId(tid)
    setRoomStack(prev => [...prev, currentRoomId])
    setGridW(targetRoom.gridW); setGridD(targetRoom.gridD)
    setCells(new Set(targetRoom.cells))
    setItems([...targetRoom.items])
    setWallHeight(targetRoom.wallHeight)
    setFloorColor(targetRoom.floorColor); setWallColor(targetRoom.wallColor)
    setTarget(targetRoom.targetRotation ?? 0); setSelectedId(null)
  }, [currentRoomId, allRooms, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, setAllRooms, setCurrentRoomId, setRoomStack, setGridW, setGridD, setCells, setItems, setWallHeight, setFloorColor, setWallColor, setTarget, setSelectedId])

  const unlinkDoors = useCallback((unlinks) => {
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    setAllRooms(prev => {
      let updated = { ...prev, [currentRoomId]: snapshot }
      for (const { rid, doorId, connectedRoomId } of unlinks) {
        const room = updated[rid]
        if (room) updated = { ...updated, [rid]: { ...room, items: room.items.map(it => it.id === doorId ? { ...it, connectedRoomId: null, locked: false } : it) } }
        const targetRoom = updated[connectedRoomId]
        if (targetRoom) updated = { ...updated, [connectedRoomId]: { ...targetRoom, items: targetRoom.items.map(it => ITEM_CATALOGUE[it.typeKey]?.door && it.connectedRoomId === rid ? { ...it, connectedRoomId: null, locked: false } : it) } }
      }
      return updated
    })
    const currentUnlink = unlinks.find(u => u.rid === currentRoomId)
    if (currentUnlink) setItems(prev => prev.map(it => it.id === currentUnlink.doorId ? { ...it, connectedRoomId: null, locked: false } : it))
  }, [currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, setAllRooms, setItems])

  const deleteRoom = useCallback((roomId) => {
    if (roomId === currentRoomId) { window.alert('You are in this room. Navigate to another room before deleting it.'); return }
    const roomName = getRoomName(roomId)
    if (!window.confirm(`Delete "${roomName}"?\nAll doors connecting to it will be unlinked.`)) return
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    setAllRooms(prev => {
      const updated = { ...prev, [currentRoomId]: snapshot }
      delete updated[roomId]
      for (const [rid, room] of Object.entries(updated)) {
        if (room.items.some(it => it.connectedRoomId === roomId))
          updated[Number(rid)] = { ...room, items: room.items.filter(it => it.connectedRoomId !== roomId) }
      }
      return updated
    })
    setItems(prev => prev.filter(it => it.connectedRoomId !== roomId))
    setRoomStack(prev => prev.filter(id => id !== roomId))
  }, [currentRoomId, getRoomName, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, setAllRooms, setItems, setRoomStack])

  const addRoom = useCallback(({ gridW: rW, gridD: rD, cells: rCells, name, wallHeight: rWH, level }) => {
    const targetId = nextRoomIdRef.current++
    const palette  = ROOM_PALETTES[targetId % ROOM_PALETTES.length]
    const newRoom  = { gridW: rW, gridD: rD, cells: new Set(rCells), items: [], wallHeight: rWH ?? DEFAULT_wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor, targetRotation: 0, level: level ?? 0 }
    setAllRooms(prev => ({ ...prev, [targetId]: newRoom }))
    if (name) setRoomNamesState(prev => ({ ...prev, [targetId]: name }))
  }, [nextRoomIdRef, setAllRooms, setRoomNamesState]) // eslint-disable-line react-hooks/exhaustive-deps

  const addDoor = useCallback((fromRoomId, wall, wallU, toRoomId) => {
    const liveSnap = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const oppWall  = { N: 'S', S: 'N', W: 'E', E: 'W' }[wall]
    setAllRooms(prev => {
      const updated  = { ...prev, [currentRoomId]: liveSnap }
      const fromRoom = fromRoomId === currentRoomId ? liveSnap : updated[fromRoomId]
      const toRoom   = toRoomId   === currentRoomId ? liveSnap : updated[toRoomId]
      if (!fromRoom || !toRoom) return prev
      const wallLen   = (wall === 'N' || wall === 'S') ? fromRoom.gridW : fromRoom.gridD
      const u         = wallU ?? wallLen / 2
      const mirU      = wallLen - u
      const fromCells = fromRoom.cells instanceof Set ? fromRoom.cells : new Set(fromRoom.cells)
      const toCells   = toRoom.cells   instanceof Set ? toRoom.cells   : new Set(toRoom.cells)
      const fromFaces = getParallelWallFaces(wall,    u,    fromCells, fromRoom.gridW, fromRoom.gridD)
      const toFaces   = getParallelWallFaces(oppWall, mirU, toCells,   toRoom.gridW,   toRoom.gridD)
      const def = ITEM_CATALOGUE['door']
      const sz  = def.sizes[1]
      const idA = nextItemIdRef.current++
      const idB = nextItemIdRef.current++
      const doorA = { id: idA, typeKey: 'door', sizeIndex: 1, swatchIndex: 0, col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true, wall, wallU: u, wallH: sz.height / 2, wallAnchor: fromFaces[0] ?? 0, connectedRoomId: toRoomId, wasLinked: true }
      const doorB = { id: idB, typeKey: 'door', sizeIndex: 1, swatchIndex: 0, col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true, wall: oppWall, wallU: mirU, wallH: sz.height / 2, wallAnchor: toFaces[0] ?? 0, connectedRoomId: fromRoomId, wasLinked: true }
      return { ...updated, [fromRoomId]: { ...fromRoom, items: [...(fromRoom.items || []), doorA] }, [toRoomId]: { ...toRoom, items: [...(toRoom.items || []), doorB] } }
    })
    if (fromRoomId === currentRoomId || toRoomId === currentRoomId) {
      const isFrom   = fromRoomId === currentRoomId
      const myWall   = isFrom ? wall : oppWall
      const wallLen2 = (wall === 'N' || wall === 'S') ? gridW : gridD
      const myU      = isFrom ? (wallU ?? wallLen2 / 2) : wallLen2 - (wallU ?? wallLen2 / 2)
      const myTarget = isFrom ? toRoomId : fromRoomId
      const def2 = ITEM_CATALOGUE['door']
      const sz2  = def2.sizes[1]
      const faces2 = getParallelWallFaces(myWall, myU, cells, gridW, gridD)
      const newDoor = { id: nextItemIdRef.current - (isFrom ? 2 : 1), typeKey: 'door', sizeIndex: 1, swatchIndex: 0, col: 0, row: 0, rotation: 0, layer: def2.layer, owned: false, locked: true, wall: myWall, wallU: myU, wallH: sz2.height / 2, wallAnchor: faces2[0] ?? 0, connectedRoomId: myTarget, wasLinked: true }
      setItems(prev => [...prev, newDoor])
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, nextItemIdRef, setAllRooms, setItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const addExteriorDoor = useCallback((roomId, wall, wallU) => {
    const liveSnap = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const def     = ITEM_CATALOGUE['entryway_door']
    const sz      = def.sizes[0]
    const wallLen = (wall === 'N' || wall === 'S') ? gridW : gridD
    const u       = wallU ?? wallLen / 2
    if (roomId === currentRoomId) {
      const faces   = getParallelWallFaces(wall, u, cells, gridW, gridD)
      setItems(prev => [...prev, { id: nextItemIdRef.current++, typeKey: 'entryway_door', sizeIndex: 0, swatchIndex: 0, col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true, wall, wallU: u, wallH: sz.height / 2, wallAnchor: faces[0] ?? 0 }])
    } else {
      setAllRooms(prev => {
        const updated = { ...prev, [currentRoomId]: liveSnap }
        const room    = updated[roomId]
        if (!room) return prev
        const rCells  = room.cells instanceof Set ? room.cells : new Set(room.cells)
        const wallLen2 = (wall === 'N' || wall === 'S') ? room.gridW : room.gridD
        const u2       = wallU ?? wallLen2 / 2
        const faces    = getParallelWallFaces(wall, u2, rCells, room.gridW, room.gridD)
        const newDoor  = { id: nextItemIdRef.current++, typeKey: 'entryway_door', sizeIndex: 0, swatchIndex: 0, col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true, wall, wallU: u2, wallH: sz.height / 2, wallAnchor: faces[0] ?? 0 }
        return { ...updated, [roomId]: { ...room, items: [...(room.items || []), newDoor] } }
      })
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, nextItemIdRef, setItems, setAllRooms]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateRoomShape = useCallback((roomId, rW, rD, rCells) => {
    const liveSnap = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    if (roomId === currentRoomId) {
      setGridW(rW); setGridD(rD); setCells(new Set(rCells))
    } else {
      setAllRooms(prev => {
        const updated = { ...prev, [currentRoomId]: liveSnap }
        if (!updated[roomId]) return prev
        return { ...updated, [roomId]: { ...updated[roomId], gridW: rW, gridD: rD, cells: new Set(rCells) } }
      })
    }
  }, [currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, setGridW, setGridD, setCells, setAllRooms])

  const addStairs = useCallback((roomId, { bottomCells, stairCount, topCells, topW, topD }) => {
    const liveSnap = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const cols = [...bottomCells].map(k => Number(k.split(',')[0]))
    const rows = [...bottomCells].map(k => Number(k.split(',')[1]))
    if (cols.length === 0) return
    const col    = Math.min(...cols)
    const row    = Math.min(...rows)
    const stairW = Math.max(...cols) - col + 1
    const stairD = Math.max(...rows) - row + 1
    const topRoomId = nextRoomIdRef.current++
    const palette   = ROOM_PALETTES[topRoomId % ROOM_PALETTES.length]
    const stairItem = { id: nextItemIdRef.current++, typeKey: 'stairs', sizeIndex: 0, swatchIndex: 0, stairs: true, col, row, stairW, stairD, stairCount, topFloorRoomId: topRoomId, rotation: 0, layer: 0, locked: false, bottomCells: [...bottomCells], topCells: [...topCells] }
    // Place a matching "return stairs" in the upper room so the user
    // can double-click to go back down. topFloorRoomId points to the
    // LOWER room (the one we came from).
    const topCols = [...topCells].map(k => Number(k.split(',')[0]))
    const topRows = [...topCells].map(k => Number(k.split(',')[1]))
    const returnStair = { id: nextItemIdRef.current++, typeKey: 'stairs', sizeIndex: 0, swatchIndex: 0, stairs: true, col: Math.min(...topCols), row: Math.min(...topRows), stairW, stairD, stairCount, topFloorRoomId: roomId, rotation: 0, layer: 0, locked: false, bottomCells: [...topCells], topCells: [...bottomCells], returnStair: true }
    if (roomId === currentRoomId) {
      const topRoom = { gridW: topW, gridD: topD, cells: new Set(topCells), items: [returnStair], wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor, targetRotation: 0, level: 1 }
      setItems(prev => [...prev, stairItem])
      setAllRooms(prev => ({ ...prev, [currentRoomId]: liveSnap, [topRoomId]: topRoom }))
    } else {
      setAllRooms(prev => {
        const updated  = { ...prev, [currentRoomId]: liveSnap }
        const room     = updated[roomId]
        if (!room) return prev
        const level    = room.level ?? 0
        const topRoom  = { gridW: topW, gridD: topD, cells: new Set(topCells), items: [returnStair], wallHeight: room.wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor, targetRotation: 0, level: level + 1 }
        return { ...updated, [roomId]: { ...room, items: [...(room.items || []), stairItem] }, [topRoomId]: topRoom }
      })
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, nextRoomIdRef, nextItemIdRef, setItems, setAllRooms]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Quick-place stairs (no wizard) ──────────────────────────────
  // Drops a default 1×3 stair at position (0,0) in the current room,
  // creates the upper room automatically. Returns true if placed.
  const placeStairsQuick = useCallback(() => {
    if (gridW < 1 || gridD < 3) return false

    const stairW = 1, stairD = 3, stairCount = 12
    // Place near the center of the room
    const col = Math.max(0, Math.floor(gridW / 2) - Math.floor(stairW / 2))
    const row = Math.max(0, Math.floor(gridD / 2) - Math.floor(stairD / 2))
    const bottomCells = new Set()
    const topCells = new Set()
    for (let dc = 0; dc < stairW; dc++) {
      for (let dr = 0; dr < stairD; dr++) {
        bottomCells.add(`${col + dc},${row + dr}`)
        topCells.add(`${dc},${dr}`)
      }
    }
    addStairs(currentRoomId, {
      bottomCells, stairCount, topCells,
      topW: Math.max(gridW, stairW + 2),
      topD: Math.max(gridD, stairD + 2),
    })
    return true
  }, [gridW, gridD, items, currentRoomId, addStairs])

  return { enterRoom, confirmNewRoom, linkDoorToRoom, goBack, jumpToRoom, unlinkDoors, deleteRoom, addRoom, addDoor, addExteriorDoor, updateRoomShape, addStairs, placeStairsQuick }
}
