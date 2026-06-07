import { useCallback, useEffect, useRef } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import {
  isWallItem, isCeilingItem, isSurfaceItem, hasOverlap, hasWallOverlap,
  findFreePosition, findSurfaceAt, getSurfaceHeight, getParallelWallFaces,
} from '../utils/roomGeometry'

export default function useItemActions({
  items, setItems,
  gridW, gridD, cells, wallHeight,
  floorColor, wallColor, targetRotation, currentRoomId,
  allRooms, setAllRooms,
  setFloorColor, setWallColor,
  setSelectedId,
  wallPicker, setWallPicker,
  ceilingPicker, setCeilingPicker, setCeilingView,
  nextItemIdRef,
  selectedId,
  getRoomName,
  catalogue,
}) {
  // Keep a ref so callbacks always see the latest merged catalogue without re-creating
  const catalogueRef = useRef(catalogue ?? ITEM_CATALOGUE)
  useEffect(() => { catalogueRef.current = catalogue ?? ITEM_CATALOGUE }, [catalogue])

  // Resolve a def from merged catalogue (live products) or static catalogue (built-in items)
  const resolveDef = (typeKey) => catalogueRef.current[typeKey] ?? ITEM_CATALOGUE[typeKey]

  const placeItem = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0, wishlisted = false) => {
    const def = resolveDef(typeKey)
    if (!def) return
    if (def.isFloorFinish) {
      setFloorColor(def.swatches?.[swatchIndex]?.hex ?? def.surfaceHex)
      return
    }
    if (def.isWallFinish) {
      setWallColor(def.swatches?.[swatchIndex]?.hex ?? def.surfaceHex)
      return
    }
    if (isWallItem(def)) {
      setWallPicker({ typeKey, sizeIndex, swatchIndex, wishlisted })
      return
    }
    if (isCeilingItem(def)) {
      setCeilingPicker({ typeKey, sizeIndex, swatchIndex, wishlisted })
      setCeilingView(true)
      return
    }
    const id = nextItemIdRef.current++
    const template = {
      id, typeKey, sizeIndex, swatchIndex,
      col: 0, row: 0, rotation: 0,
      layer: def.layer, owned: false, locked: false, wishlisted,
    }
    const cat = catalogueRef.current
    setItems(prev => {
      const { col, row } = findFreePosition(prev, template, gridW, gridD, cat)
      return [...prev, { ...template, col, row }]
    })
    setSelectedId(id)
  }, [gridW, gridD, setFloorColor, setWallColor, setWallPicker, setCeilingPicker, setCeilingView, nextItemIdRef, setItems, setSelectedId])

  const placeItemOnWall = useCallback((wall) => {
    if (!wallPicker) return
    const { typeKey, sizeIndex, swatchIndex, wishlisted, customW, customH } = wallPicker
    const def      = resolveDef(typeKey)
    if (!def) return
    const id       = nextItemIdRef.current++
    const size     = def.sizes[sizeIndex]
    const fh       = customH ?? size.height
    const defaultH = def.door
      ? fh / 2
      : Math.min(wallHeight - fh / 2 - 0.05, wallHeight * 0.6)
    const wallLen  = (wall === 'N' || wall === 'S') ? gridW : gridD
    const u        = wallLen / 2
    const faces    = getParallelWallFaces(wall, u, cells, gridW, gridD)
    setItems(prev => [...prev, {
      id, typeKey, sizeIndex, swatchIndex,
      col: 0, row: 0, rotation: 0,
      layer: def.layer, owned: false, locked: false, wishlisted,
      wall, wallU: u, wallH: defaultH, wallAnchor: faces[0],
      ...(def.window ? { paneCols: 1, paneRows: 2 } : {}),
      ...(customW !== undefined ? { customW } : {}),
      ...(customH !== undefined ? { customH } : {}),
    }])
    setSelectedId(id)
    setWallPicker(null)
  }, [wallPicker, gridW, gridD, cells, wallHeight, nextItemIdRef, setItems, setSelectedId, setWallPicker])

  const placeCeilingItem = useCallback((col, row) => {
    if (!ceilingPicker) return
    const { typeKey, sizeIndex, swatchIndex, wishlisted } = ceilingPicker
    const def = resolveDef(typeKey)
    if (!def) return
    const id  = nextItemIdRef.current++
    const defaultDropLength = def.sizes[sizeIndex]?.defaultDropLength ?? 0.6
    setItems(prev => [...prev, {
      id, typeKey, sizeIndex, swatchIndex,
      col, row, rotation: 0,
      ceiling: true, dropLength: defaultDropLength,
      layer: def.layer, owned: false, locked: false, wishlisted,
    }])
    setSelectedId(id)
    setCeilingPicker(null)
  }, [ceilingPicker, nextItemIdRef, setItems, setSelectedId, setCeilingPicker])

  const moveItem = useCallback((id, col, row, forceOverlap = false) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item || item.locked) return prev
      if (item.col === col && item.row === row) return prev
      const cat = catalogueRef.current
      const updated = { ...item, col, row }

      // Check if this item is small enough to sit on a surface
      const def = resolveDef(item.typeKey)
      const size = def?.sizes?.[item.sizeIndex] ?? def?.sizes?.[0]
      const itemH = size?.height ?? 1
      const isSurfaceCandidate = itemH <= 1.5 && !isSurfaceItem(def) && !item.wall && !item.ceiling

      if (isSurfaceCandidate) {
        const surface = findSurfaceAt(prev, updated, cat)
        if (surface) {
          // Place on surface — skip floor collision, attach to parent
          updated.parentId = surface.id
          return prev.map(it => it.id === id ? updated : it)
        }
      }

      // Regular floor placement — clear parentId
      updated.parentId = null
      if (!forceOverlap && hasOverlap(prev, id, updated, cat)) return prev

      // Move children with parent (items sitting on this surface)
      const dx = col - item.col
      const dy = row - item.row
      return prev.map(it => {
        if (it.id === id) return updated
        if (it.parentId === id) return { ...it, col: it.col + dx, row: it.row + dy }
        return it
      })
    })
  }, [setItems])

  const moveCeilingItem = useCallback((id, col, row) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, col, row } : it))
  }, [setItems])

  const adjustDropLength = useCallback((id, dropLength) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, dropLength } : it))
  }, [setItems])

  const moveWallItem = useCallback((id, wallU, wallH, wallAnchor) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item || item.locked) return prev
      let anchor = wallAnchor
      if (anchor === undefined) {
        const faces = getParallelWallFaces(item.wall, wallU, cells, gridW, gridD)
        if (faces.length === 0) return prev
        anchor = faces.includes(item.wallAnchor) ? item.wallAnchor : faces[0]
      }
      if (item.wallU === wallU && item.wallH === wallH && item.wallAnchor === anchor) return prev
      const updated = { ...item, wallU, wallH, wallAnchor: anchor }
      if (hasWallOverlap(prev, id, updated)) return prev
      return prev.map(it => it.id === id ? updated : it)
    })
    const item = items.find(it => it.id === id)
    if (item && !item.locked && item.connectedRoomId != null && ITEM_CATALOGUE[item.typeKey]?.door) {
      const wallLen = (item.wall === 'N' || item.wall === 'S') ? gridW : gridD
      const mirU    = wallLen - wallU
      const oppWall = { N: 'S', S: 'N', W: 'E', E: 'W' }[item.wall]
      setAllRooms(prev => {
        const targetRoom = prev[item.connectedRoomId]
        if (!targetRoom) return prev
        const tCells = targetRoom.cells instanceof Set ? targetRoom.cells : new Set(targetRoom.cells)
        const updatedItems = targetRoom.items.map(rt => {
          if (!ITEM_CATALOGUE[rt.typeKey]?.door || rt.wall !== oppWall) return rt
          if (rt.connectedRoomId !== currentRoomId) return rt
          const tFaces = getParallelWallFaces(rt.wall, mirU, tCells, targetRoom.gridW, targetRoom.gridD)
          return { ...rt, wallU: mirU, wallH: wallH ?? rt.wallH,
                   wallAnchor: tFaces.length > 0 ? tFaces[0] : rt.wallAnchor }
        })
        return { ...prev, [item.connectedRoomId]: { ...targetRoom, items: updatedItems } }
      })
    }
  }, [cells, gridW, gridD, items, currentRoomId, setItems, setAllRooms])

  const changeItemWall = useCallback((id, requestedWall) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id || it.wall === requestedWall) return it
      const wallLen = (requestedWall === 'N' || requestedWall === 'S') ? gridW : gridD
      const fw      = it.customW ?? ITEM_CATALOGUE[it.typeKey].sizes[it.sizeIndex].footprint[0]
      if (fw > wallLen) return it
      const u     = wallLen / 2
      const faces = getParallelWallFaces(requestedWall, u, cells, gridW, gridD)
      return { ...it, wall: requestedWall, wallU: u, wallAnchor: faces[0] }
    }))
  }, [gridW, gridD, cells, setItems])

  const swapWallFace = useCallback((id) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id || !it.wall) return it
      const faces = getParallelWallFaces(it.wall, it.wallU, cells, gridW, gridD)
      if (faces.length <= 1) return it
      const currentAnchor = it.wallAnchor ?? faces[0]
      const idx = faces.indexOf(currentAnchor)
      return { ...it, wallAnchor: faces[(idx + 1) % faces.length] }
    }))
  }, [cells, gridW, gridD, setItems])

  const rotateItem = useCallback((id) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item) return prev
      const rotation = (item.rotation + 90) % 360
      if (hasOverlap(prev, id, { ...item, rotation })) return prev
      return prev.map(it => it.id === id ? { ...it, rotation } : it)
    })
  }, [setItems])

  const resizeItem = useCallback((id, sizeIndex) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, sizeIndex } : it))
    const item = items.find(it => it.id === id)
    if (item?.connectedRoomId != null && ITEM_CATALOGUE[item.typeKey]?.door) {
      const oppWall = { N: 'S', S: 'N', W: 'E', E: 'W' }[item.wall]
      setAllRooms(prev => {
        const tr = prev[item.connectedRoomId]
        if (!tr) return prev
        return { ...prev, [item.connectedRoomId]: {
          ...tr,
          items: tr.items.map(rt =>
            ITEM_CATALOGUE[rt.typeKey]?.door && rt.wall === oppWall && rt.connectedRoomId === currentRoomId
              ? { ...rt, sizeIndex } : rt
          )
        }}
      })
    }
  }, [items, currentRoomId, setItems, setAllRooms])

  const recolorItem = useCallback((id, swatchIndex) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, swatchIndex } : it))
    const item = items.find(it => it.id === id)
    if (item?.connectedRoomId != null && ITEM_CATALOGUE[item.typeKey]?.door) {
      const oppWall = { N: 'S', S: 'N', W: 'E', E: 'W' }[item.wall]
      setAllRooms(prev => {
        const tr = prev[item.connectedRoomId]
        if (!tr) return prev
        return { ...prev, [item.connectedRoomId]: {
          ...tr,
          items: tr.items.map(rt =>
            ITEM_CATALOGUE[rt.typeKey]?.door && rt.wall === oppWall && rt.connectedRoomId === currentRoomId
              ? { ...rt, swatchIndex } : rt
          )
        }}
      })
    }
  }, [items, currentRoomId, setItems, setAllRooms])

  const setPaneConfig = useCallback((id, paneCols, paneRows) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, paneCols, paneRows } : it))
  }, [setItems])

  const adjustWindowSize = useCallback((id, customW, customH) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, customW, customH } : it))
  }, [setItems])

  const toggleOwned = useCallback((id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, owned: !it.owned } : it))
  }, [setItems])

  const toggleLocked = useCallback((id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, locked: !it.locked } : it))
  }, [setItems])

  const deleteItem = useCallback((id) => {
    const item = items.find(it => it.id === id)
    if (item?.connectedRoomId != null && ITEM_CATALOGUE[item.typeKey]?.door) {
      const connName = getRoomName(item.connectedRoomId)
      if (!window.confirm(`This door connects to "${connName}". Deleting it will unlink the two rooms. Continue?`)) return
      setAllRooms(prev => {
        const targetRoom = prev[item.connectedRoomId]
        if (!targetRoom) return prev
        const updatedItems = targetRoom.items.filter(rt =>
          !(ITEM_CATALOGUE[rt.typeKey]?.door && rt.connectedRoomId === currentRoomId)
        )
        return { ...prev, [item.connectedRoomId]: { ...targetRoom, items: updatedItems } }
      })
    }
    setItems(prev => prev.filter(it => it.id !== id))
    setSelectedId(null)
  }, [items, currentRoomId, getRoomName, setItems, setAllRooms, setSelectedId])

  // Refs guarantee the keyboard handler always reads the current selectedId/items,
  // regardless of how often the deleteItem callback identity churns from items deps.
  const selectedIdRef = useRef(selectedId)
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  const deleteItemRef = useRef(deleteItem)
  useEffect(() => { deleteItemRef.current = deleteItem }, [deleteItem])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      const id = selectedIdRef.current
      if (!id) return
      e.preventDefault()
      deleteItemRef.current(id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return {
    placeItem, placeItemOnWall, placeCeilingItem,
    moveItem, moveCeilingItem, adjustDropLength,
    moveWallItem, changeItemWall, swapWallFace,
    rotateItem, resizeItem, recolorItem,
    setPaneConfig, adjustWindowSize,
    toggleOwned, toggleLocked, deleteItem,
  }
}
