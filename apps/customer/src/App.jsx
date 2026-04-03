import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import RoomScene from './scene/RoomScene'
import Panel from './ui/Panel'
import StylePanel from './ui/StylePanel'
import ShopDrawer, { ProductModal } from './ui/ShopDrawer'
import { ITEM_CATALOGUE } from './data/items'
import { computeRoomLayout, findSpatialNeighbors } from './overview/layout'
import RoomOverview from './overview/RoomOverview'
import { styles } from './ui/styles/appStyles'
import MusicPanel from './ui/MusicPanel'
import WallPicker from './ui/WallPicker'
import WindowSizePicker from './ui/WindowSizePicker'
import DoorLinkPicker from './ui/DoorLinkPicker'
import ArchSizePicker from './ui/ArchSizePicker'
import SelectedControls from './ui/SelectedControls'
import HubPanel from './ui/HubPanel'
import RoomPanel from './ui/RoomPanel'
import RoomBanner from './ui/RoomBanner'

import {
  makeGrid,
  getItemCells,
  isWallItem,
  isCeilingItem,
  hasOverlap,
  hasWallOverlap,
  findFreePosition,
  getParallelWallFaces,
} from './utils/roomGeometry'

const DEFAULT_wallHeight = 8
const SAVE_KEY     = 'room-builder-v1'
const MAX_HISTORY  = 50

// Distinct floor/wall color palettes for each room so navigation is obvious
const ROOM_PALETTES = [
  { floorColor: '#cec5b8', wallColor: '#d8d0c6' }, // default beige
  { floorColor: '#b8c8c4', wallColor: '#c6d4d0' }, // sage
  { floorColor: '#c4bece', wallColor: '#cfc9d9' }, // lavender
  { floorColor: '#c8c0ae', wallColor: '#d6cbba' }, // warm sand
  { floorColor: '#b8c0cc', wallColor: '#c6cdd8' }, // steel blue
  { floorColor: '#c8c0c0', wallColor: '#d8cece' }, // rose
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.version === 1 ? data : null
  } catch { return null }
}

export default function App() {
  const [initSave] = useState(loadSaved)

  // Stable counter for item IDs — useRef so Strict Mode's double-invoke of
  // state updaters can't cause the counter to jump by 2 per placement.
  // null sentinel = "not yet initialized on this render cycle".
  const nextItemIdRef = useRef(null)
  if (nextItemIdRef.current === null) {
    nextItemIdRef.current = initSave?.items?.length > 0
      ? Math.max(...initSave.items.map(it => it.id)) + 1
      : 1
  }

  const [gridW, setGridW]             = useState(initSave?.gridW ?? 12)
  const [gridD, setGridD]             = useState(initSave?.gridD ?? 12)
  const [cells, setCells]             = useState(() =>
    initSave?.cells ? new Set(initSave.cells) : makeGrid(initSave?.gridW ?? 12, initSave?.gridD ?? 12)
  )

const [targetRotation, setTarget]   = useState(0)
  const [panelOpen, setPanelOpen]     = useState(false)
  const [drawerOpen, setDrawerOpen]   = useState(true)
  const [drawerTab,  setDrawerTab]    = useState('shop') // 'shop' | 'wishlist' | 'cart'
  const [roomPanelOpen, setRoomPanelOpen] = useState(false)
  const [hubOpen,       setHubOpen]       = useState(false)
  const [styleOpen,     setStyleOpen]     = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  const [wallHeight, setWallHeight] = useState(initSave?.wallHeight ?? DEFAULT_wallHeight)
  const [floorColor, setFloorColor] = useState(initSave?.floorColor ?? '#cec5b8')
  const [wallColor,  setWallColor]  = useState(initSave?.wallColor  ?? '#d8d0c6')
  const [bgColor,    setBgColor]    = useState(initSave?.bgColor    ?? '#1a1a2e')
  const [lightMood,  setLightMood]  = useState(initSave?.lightMood  ?? 'day')

  const [items,      setItems]      = useState(initSave?.items ?? [])
  const [selectedId, setSelectedId] = useState(null)

  // ── Cart ────────────────────────────────────────────────────────
  const [cart, setCart] = useState(initSave?.cart ?? [])

  // ── Cart highlight (show matching placed items in 3D scene) ─────
  const [cartHighlight, setCartHighlight] = useState(null)

  const [musicStation, setMusicStation] = useState(initSave?.musicStation ?? null)
  const [musicOpen,    setMusicOpen]    = useState(false)
  const [wallPicker,      setWallPicker]      = useState(null) // { typeKey, sizeIndex, swatchIndex, wishlisted }
  const [windowPickerOpen, setWindowPickerOpen] = useState(false)
  const [doorPickerOpen,   setDoorPickerOpen]   = useState(false)
  const [doorLinkPicker,   setDoorLinkPicker]   = useState(null) // { doorId } — shown when unlinked door is activated
  const [ceilingView,  setCeilingView]  = useState(false)
  const [ceilingPicker, setCeilingPicker] = useState(null) // { typeKey, sizeIndex, swatchIndex, wishlisted }

  // ── Multi-room navigation (session-only, not persisted) ─────────
  const [allRooms,     setAllRooms]     = useState({}) // id → room snapshot
  const [currentRoomId, setCurrentRoomId] = useState(0)
  const [roomStack,    setRoomStack]    = useState([]) // back-navigation stack
  const nextRoomIdRef = useRef(1)

  // ── Room labels (persisted) ──────────────────────────────────────
  const [roomNames, setRoomNamesState] = useState(initSave?.roomNames ?? {})
  const setRoomName = useCallback((id, name) => {
    setRoomNamesState(prev => ({ ...prev, [id]: name }))
  }, [])
  const getRoomName = useCallback((id) => roomNames[Number(id)] || `Room ${Number(id) + 1}`, [roomNames])

  // ── Overview UI ──────────────────────────────────────────────────
  const [overviewOpen,        setOverviewOpen]        = useState(false)
  const [showOverviewLabels,  setShowOverviewLabels]  = useState(true)
  const [layoutOverrides,     setLayoutOverrides]     = useState({})

  // Compute overview positions (BFS + manual overrides) for neighbor cell blocking
  const overviewPositions = useMemo(() => {
    const snap = { gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation }
    const allData = { ...allRooms, [currentRoomId]: snap }
    const { positions, totalW, totalH } = computeRoomLayout(allData, 1, 0)
    const result = {}
    for (const [idStr, pos] of Object.entries(positions)) {
      const rid = Number(idStr)
      result[rid] = layoutOverrides[rid] ?? {
        ox: pos.x - totalW / 2 + pos.w / 2,
        oz: pos.y - totalH / 2 + pos.h / 2,
      }
    }
    return result
  }, [allRooms, currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, layoutOverrides])

  const neighborCells = useMemo(() => {
    const blocked = new Set()
    const myPos = overviewPositions[currentRoomId]
    if (!myPos) return blocked
    for (const [ridStr, room] of Object.entries(allRooms)) {
      const rid = Number(ridStr)
      if (rid === currentRoomId) continue
      const pos = overviewPositions[rid]
      if (!pos) continue
      const bCells = room.cells instanceof Set ? room.cells : new Set(room.cells)
      for (const key of bCells) {
        const [col_B, row_B] = key.split(',').map(Number)
        const worldX = pos.ox - room.gridW / 2 + col_B + 0.5
        const worldZ = pos.oz - room.gridD / 2 + row_B + 0.5
        const col_A_f = worldX - (myPos.ox - gridW / 2) - 0.5
        const row_A_f = worldZ - (myPos.oz - gridD / 2) - 0.5
        const col_A = Math.round(col_A_f)
        const row_A = Math.round(row_A_f)
        if (col_A >= 0 && col_A < gridW && row_A >= 0 && row_A < gridD &&
            Math.abs(col_A_f - col_A) < 0.15 && Math.abs(row_A_f - row_A) < 0.15) {
          blocked.add(`${col_A},${row_A}`)
        }
      }
    }
    return blocked
  }, [overviewPositions, allRooms, currentRoomId, gridW, gridD])

  // ── Viewport width (for responsive panel sizing) ─────────────────
  const [vw, setVw] = useState(() => window.innerWidth)
  useEffect(() => {
    const h = () => setVw(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  const compact     = vw < 700
  const drawerWidth = compact ? Math.min(vw - 100, 320) : 360

  // ── History Bookmark (in-memory, not persisted) ──────────────────
  const [bookmark, setBookmark] = useState(null)

  const saveBookmark = useCallback(() => {
    setBookmark({ gridW, gridD, cells: new Set(cells), items: [...items], cart: [...cart], floorColor, wallColor })
  }, [gridW, gridD, cells, items, cart, floorColor, wallColor])

  const restoreBookmark = useCallback(() => {
    if (!bookmark) return
    setGridW(bookmark.gridW)
    setGridD(bookmark.gridD)
    setCells(new Set(bookmark.cells))
    setItems([...bookmark.items])
    setCart([...bookmark.cart])
    setFloorColor(bookmark.floorColor)
    setWallColor(bookmark.wallColor)
    setSelectedId(null)
  }, [bookmark])

  const addToCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => {
      const idx = prev.findIndex(
        c => c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { typeKey, sizeIndex, swatchIndex, qty: 1 }]
    })
  }, [])

  const decrementCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => {
      const idx = prev.findIndex(
        c => c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex
      )
      if (idx < 0) return prev
      if (prev[idx].qty <= 1) return prev.filter((_, i) => i !== idx)
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty - 1 }
      return next
    })
  }, [])

  const removeFromCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => prev.filter(
      c => !(c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex)
    ))
    const matches = items.filter(
      it => it.typeKey === typeKey && it.sizeIndex === sizeIndex && it.swatchIndex === swatchIndex
    )
    if (matches.length > 0 && window.confirm(
      `Remove ${matches.length === 1 ? 'this item' : `all ${matches.length} copies`} from your room too?`
    )) {
      const ids = new Set(matches.map(it => it.id))
      setItems(prev => prev.filter(it => !ids.has(it.id)))
      setSelectedId(prev => (ids.has(prev) ? null : prev))
    }
  }, [items])

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

  // ── Persist to localStorage on every meaningful change ──────────
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 1, gridW, gridD, wallHeight,
      cells: [...cells],
      items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames,
    }))
  }, [gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames])

  // ── Undo / Redo ─────────────────────────────────────────────────
  const historyRef  = useRef([])
  const histIdx     = useRef(-1)
  const skipHist    = useRef(false)
  const isDragging  = useRef(false)
  const [histTrigger, setHistTrigger] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Only push a snapshot when NOT mid-drag; drag end fires histTrigger to flush final position.
  useEffect(() => {
    const refreshFlags = () => {
      setCanUndo(histIdx.current > 0)
      setCanRedo(histIdx.current < historyRef.current.length - 1)
    }
    if (skipHist.current) { skipHist.current = false; refreshFlags(); return }
    if (isDragging.current) return // skip every intermediate drag move
    const snap = { gridW, gridD, cells: [...cells], items: [...items], floorColor, wallColor }
    let hist = historyRef.current.slice(0, histIdx.current + 1)
    hist.push(snap)
    if (hist.length > MAX_HISTORY) hist = hist.slice(-MAX_HISTORY)
    historyRef.current = hist
    histIdx.current    = hist.length - 1
    refreshFlags()
  }, [gridW, gridD, cells, items, floorColor, wallColor, histTrigger])

  const onDragStart = useCallback(() => { isDragging.current = true  }, [])
  const onDragEnd   = useCallback(() => {
    isDragging.current = false
    setHistTrigger(v => v + 1) // triggers the effect above with final drag position
  }, [])

  const undo = useCallback(() => {
    if (histIdx.current <= 0) return
    isDragging.current = false
    histIdx.current--
    const snap = historyRef.current[histIdx.current]
    skipHist.current = true
    setGridW(snap.gridW); setGridD(snap.gridD)
    setCells(new Set(snap.cells)); setItems(snap.items)
    setFloorColor(snap.floorColor); setWallColor(snap.wallColor)
    setSelectedId(null)
  }, [])

  const redo = useCallback(() => {
    if (histIdx.current >= historyRef.current.length - 1) return
    isDragging.current = false
    histIdx.current++
    const snap = historyRef.current[histIdx.current]
    skipHist.current = true
    setGridW(snap.gridW); setGridD(snap.gridD)
    setCells(new Set(snap.cells)); setItems(snap.items)
    setFloorColor(snap.floorColor); setWallColor(snap.wallColor)
    setSelectedId(null)
  }, [])

  // Subtle zoom nudge when the shop drawer opens/closes to re-orient the view
  useEffect(() => {
    const target = drawerOpen
      ? Math.max(15, zoomRef.current * 0.88)
      : Math.min(120, zoomRef.current / 0.88)
    const prev = zoomRef.current
    zoomRef.current = target
    // After the camera has eased in, restore so subsequent manual zooms aren't biased
    const t = setTimeout(() => { zoomRef.current = prev }, 600)
    return () => clearTimeout(t)
  }, [drawerOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // ── File export / import ────────────────────────────────────────
  const importRef    = useRef(null)
  const zoomRef      = useRef(32)
  const screenshotRef = useRef(null)

  const [showMeasurements, setShowMeasurements] = useState(false)
  const [showGrid,         setShowGrid]         = useState(true)

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
  }, [])

  // ── Floor plan editing ──────────────────────────────────────────
  const toggleCell = useCallback((col, row) => {
    const key = `${col},${row}`
    setCells(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  // When the floor plan changes, re-validate all wall item anchors.
  // If an item's anchor row/col no longer has a valid face (e.g. the cell was removed),
  // snap it to the nearest valid face so it doesn't float in empty space.
  useEffect(() => {
    setItems(prev => {
      let changed = false
      const next = prev.map(item => {
        if (!item.wall) return item
        const faces = getParallelWallFaces(item.wall, item.wallU, cells, gridW, gridD)
        if (faces.length === 0) return item  // wallU itself invalid — leave for applyGrid/user
        if (item.wallAnchor !== undefined && !faces.includes(item.wallAnchor)) {
          changed = true
          return { ...item, wallAnchor: faces[0] }
        }
        return item
      })
      return changed ? next : prev
    })
  }, [cells, gridW, gridD])  // eslint-disable-line react-hooks/exhaustive-deps

  const applyGrid = useCallback((w, d) => {
    setGridW(w); setGridD(d); setCells(makeGrid(w, d))
    setItems(prev => prev.map(it => {
      if (!it.wall) return it
      const def     = ITEM_CATALOGUE[it.typeKey]
      const size    = def.sizes[it.sizeIndex]
      const fw      = size.footprint[0]
      const wallLen = (it.wall === 'N' || it.wall === 'S') ? w : d
      const wallU   = Math.max(fw / 2, Math.min(wallLen - fw / 2, it.wallU ?? wallLen / 2))
      // For a fresh rectangular grid the outermost face anchors are always known
      const anchor = it.wall === 'N' ? 0 : it.wall === 'S' ? d - 1 : it.wall === 'W' ? 0 : w - 1
      return { ...it, wallU, wallAnchor: anchor }
    }))
  }, [])

  // ── Item actions ────────────────────────────────────────────────
  const placeItem = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0, wishlisted = false) => {
    const def = ITEM_CATALOGUE[typeKey]

    // Finish items update the room surface color — no 3D object placed
    if (def.isFloorFinish) {
      setFloorColor(def.swatches?.[swatchIndex]?.hex ?? def.surfaceHex)
      return
    }
    if (def.isWallFinish) {
      setWallColor(def.swatches?.[swatchIndex]?.hex ?? def.surfaceHex)
      return
    }

    if (isWallItem(def)) {
      // Show wall-picker instead of auto-placing
      setWallPicker({ typeKey, sizeIndex, swatchIndex, wishlisted })
      return
    }

    if (isCeilingItem(def)) {
      // Enter ceiling view so user can click a grid cell to place
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
    setItems(prev => {
      const { col, row } = findFreePosition(prev, template, gridW, gridD)
      return [...prev, { ...template, col, row }]
    })
    setSelectedId(id)
  }, [gridW, gridD])

  const placeAndWishlist = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0) => {
    placeItem(typeKey, sizeIndex, swatchIndex, true)
  }, [placeItem])

  // Smart "Add to Cart" for the product modal:
  // - Always adds to cart
  // - If item already exists in the room, asks before placing another copy
  // - If not in room, places it automatically (same as current behaviour)
  const handleModalAddToCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    addToCart(typeKey, sizeIndex, swatchIndex)
    const inRoom = items.some(
      it => it.typeKey === typeKey && it.sizeIndex === sizeIndex && it.swatchIndex === swatchIndex
    )
    if (!inRoom || window.confirm(`You already have a ${ITEM_CATALOGUE[typeKey]?.label} in your room. Add another copy to the room?`)) {
      placeItem(typeKey, sizeIndex, swatchIndex)
    }
  }, [items, addToCart, placeItem])

  const moveItem = useCallback((id, col, row) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item || item.locked || hasOverlap(prev, id, { ...item, col, row })) return prev
      return prev.map(it => it.id === id ? { ...it, col, row } : it)
    })
  }, [])

  const placeItemOnWall = useCallback((wall) => {
    if (!wallPicker) return
    const { typeKey, sizeIndex, swatchIndex, wishlisted, customW, customH } = wallPicker
    const def      = ITEM_CATALOGUE[typeKey]
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
  }, [wallPicker, gridW, gridD, cells, wallHeight])

  const placeCeilingItem = useCallback((col, row) => {
    if (!ceilingPicker) return
    const { typeKey, sizeIndex, swatchIndex, wishlisted } = ceilingPicker
    const def = ITEM_CATALOGUE[typeKey]
    const id  = nextItemIdRef.current++
    const defaultDropLength = def.sizes[sizeIndex].defaultDropLength ?? 0.6
    setItems(prev => [...prev, {
      id, typeKey, sizeIndex, swatchIndex,
      col, row, rotation: 0,
      ceiling: true, dropLength: defaultDropLength,
      layer: def.layer, owned: false, locked: false, wishlisted,
    }])
    setSelectedId(id)
    setCeilingPicker(null)
    // Stay in ceiling view so user can see/adjust the placed item
  }, [ceilingPicker])

  const moveCeilingItem = useCallback((id, col, row) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, col, row } : it))
  }, [])

  const adjustDropLength = useCallback((id, dropLength) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, dropLength } : it))
  }, [])

  const moveWallItem = useCallback((id, wallU, wallH, wallAnchor) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item || item.locked) return prev
      // wallAnchor is provided directly by pointerToWall's 2-phase projection (drag path).
      // Fall back to recomputing from wallU for the control-panel path (no anchor passed).
      let anchor = wallAnchor
      if (anchor === undefined) {
        const faces = getParallelWallFaces(item.wall, wallU, cells, gridW, gridD)
        if (faces.length === 0) return prev
        anchor = faces.includes(item.wallAnchor) ? item.wallAnchor : faces[0]
      }
      const updated = { ...item, wallU, wallH, wallAnchor: anchor }
      if (hasWallOverlap(prev, id, updated)) return prev
      return prev.map(it => it.id === id ? updated : it)
    })
    // Sync linked return door in connected room
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
  }, [cells, gridW, gridD, items, currentRoomId])

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
  }, [gridW, gridD, cells])

  // Cycles the item to the next parallel wall face (interior ↔ outer) along the same axis.
  const swapWallFace = useCallback((id) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id || !it.wall) return it
      const faces = getParallelWallFaces(it.wall, it.wallU, cells, gridW, gridD)
      if (faces.length <= 1) return it
      const currentAnchor = it.wallAnchor ?? faces[0]
      const idx = faces.indexOf(currentAnchor)
      const nextAnchor = faces[(idx + 1) % faces.length]
      return { ...it, wallAnchor: nextAnchor }
    }))
  }, [cells, gridW, gridD])

  const rotateItem = useCallback((id) => {
    setItems(prev => {
      const item = prev.find(it => it.id === id)
      if (!item) return prev
      const rotation = (item.rotation + 90) % 360
      if (hasOverlap(prev, id, { ...item, rotation })) return prev
      return prev.map(it => it.id === id ? { ...it, rotation } : it)
    })
  }, [])

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
  }, [items, currentRoomId])

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
  }, [items, currentRoomId])

  const setPaneConfig = useCallback((id, paneCols, paneRows) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, paneCols, paneRows } : it
    ))
  }, [])

  const adjustWindowSize = useCallback((id, customW, customH) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, customW, customH } : it))
  }, [])

  // ── Room navigation ──────────────────────────────────────────────
  const enterRoom = useCallback((doorId) => {
    const door = items.find(it => it.id === doorId)
    if (!door || !door.wall) return
    if (ITEM_CATALOGUE[door.typeKey]?.entryway) return  // entryway leads outside, no room navigation

    if (door.connectedRoomId === undefined || door.connectedRoomId === null) {
      // Auto-detect: search other rooms for a compatible return door on the opposite wall.
      // Candidates: rooms that have an unlinked door on the mirroring wall, or a door
      // already linked back to us (reconnect after a stale state).
      const oppWall  = { N: 'S', S: 'N', W: 'E', E: 'W' }[door.wall]
      const candidates = []
      for (const [rid, room] of Object.entries(allRooms)) {
        const roomId = Number(rid)
        if (roomId === currentRoomId) continue
        const hasMatch = room.items.some(it =>
          it.wall === oppWall &&
          ITEM_CATALOGUE[it.typeKey]?.door &&
          (it.connectedRoomId === currentRoomId ||
           (it.connectedRoomId == null && Math.abs((it.wallU ?? 0) - door.wallU) < 2.0))
        )
        if (hasMatch) candidates.push(roomId)
      }
      // Spatial fallback: if no door-match found, check whether a room is
      // physically adjacent on this wall side in the current map layout.
      // This catches ring layouts where Room N's return door to Room 0
      // doesn't exist yet on Room 0's side.
      if (candidates.length === 0) {
        const layoutSnap = { gridW, gridD, cells, items, wallHeight, floorColor, wallColor }
        const layoutData = { ...allRooms, [currentRoomId]: layoutSnap }
        const spatial = findSpatialNeighbors(door.wall, currentRoomId, layoutData)
        for (const rid of spatial) if (!candidates.includes(rid)) candidates.push(rid)
      }

      if (candidates.length === 0) {
        confirmNewRoom(doorId)          // truly nothing nearby → new room
      } else if (candidates.length === 1) {
        linkDoorToRoom(doorId, candidates[0])  // one clear match → auto-link
      } else {
        setDoorLinkPicker({ doorId })   // ambiguous → let user pick
      }
      return
    }

    // Already linked — navigate directly
    const targetId   = door.connectedRoomId
    const targetRoom = allRooms[targetId]
    if (!targetRoom) return

    const snapshot = {
      gridW, gridD, cells: new Set(cells), items: [...items],
      wallHeight, floorColor, wallColor, targetRotation,
    }
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

  // Called from DoorLinkPicker: open a brand-new room from the chosen door
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
      col: 0, row: 0, rotation: 0, layer: def.layer,
      owned: false, locked: true,
      wall: oppWall, wallU: mirU, wallH: door.wallH, wallAnchor: faces[0],
      connectedRoomId: currentRoomId,
      wasLinked: true,
      ...(door.customW !== undefined ? { customW: door.customW } : {}),
      ...(door.customH !== undefined ? { customH: door.customH } : {}),
    }

    const palette = ROOM_PALETTES[targetId % ROOM_PALETTES.length]
    const newRoom = {
      gridW, gridD, cells: newCells, items: [linkedDoor],
      wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor, targetRotation: 0,
    }

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
  }, [items, gridW, gridD, cells, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, zoomRef])

  // Called from DoorLinkPicker: connect this door to an existing room
  const linkDoorToRoom = useCallback((doorId, targetId) => {
    setDoorLinkPicker(null)
    const door = items.find(it => it.id === doorId)
    if (!door || !door.wall) return
    const targetRoom = allRooms[targetId]
    if (!targetRoom) return

    // Update this door's connectedRoomId and lock it
    const updatedItems = items.map(it =>
      it.id === doorId ? { ...it, connectedRoomId: targetId, locked: true, wasLinked: true } : it
    )

    // Add a linked return door to the target room (on the opposite wall) if none exists
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
      updatedTargetItems = [
        ...targetRoom.items,
        {
          id: nextItemIdRef.current++,
          typeKey: door.typeKey, sizeIndex: door.sizeIndex, swatchIndex: door.swatchIndex,
          col: 0, row: 0, rotation: 0, layer: def.layer,
          owned: false, locked: true,
          wall: oppWall, wallU: mirU, wallH: door.wallH, wallAnchor: faces[0],
          connectedRoomId: currentRoomId,
          wasLinked: true,
          ...(door.customW !== undefined ? { customW: door.customW } : {}),
          ...(door.customH !== undefined ? { customH: door.customH } : {}),
        },
      ]
    }

    const snapshot = {
      gridW, gridD, cells: new Set(cells),
      items: updatedItems,
      wallHeight, floorColor, wallColor, targetRotation,
    }
    const updatedTarget = { ...targetRoom, items: updatedTargetItems }

    const sz = zoomRef.current
    zoomRef.current = Math.max(15, sz * 0.72)
    setTimeout(() => { zoomRef.current = sz }, 420)

    setAllRooms(prev => ({ ...prev, [currentRoomId]: snapshot, [targetId]: updatedTarget }))
    setCurrentRoomId(targetId)
    setRoomStack(prev => [...prev, currentRoomId])
    setGridW(targetRoom.gridW); setGridD(targetRoom.gridD)
    setCells(new Set(targetRoom.cells))
    setItems(updatedTargetItems)
    setWallHeight(targetRoom.wallHeight)
    setFloorColor(targetRoom.floorColor); setWallColor(targetRoom.wallColor)
    setTarget(targetRoom.targetRotation ?? 0); setSelectedId(null)
  }, [items, gridW, gridD, cells, wallHeight, floorColor, wallColor, targetRotation, currentRoomId, allRooms, zoomRef])

  const goBack = useCallback(() => {
    if (roomStack.length === 0) return
    const prevId   = roomStack[roomStack.length - 1]
    const prevRoom = allRooms[prevId]
    if (!prevRoom) return
    const snapshot = {
      gridW, gridD, cells: new Set(cells), items: [...items],
      wallHeight, floorColor, wallColor, targetRotation,
    }
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
  }, [roomStack, allRooms, currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, zoomRef])

  // Direct room jump (from overview or dropdown — bypasses door animation)
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
  }, [currentRoomId, allRooms, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation])

  // Unlink specific doors (called when rooms are dragged apart in overview)
  const unlinkDoors = useCallback((unlinks) => {
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    setAllRooms(prev => {
      let updated = { ...prev, [currentRoomId]: snapshot }
      for (const { rid, doorId, connectedRoomId } of unlinks) {
        // Unlink in the dragged room (rid)
        const room = updated[rid]
        if (room) {
          updated = { ...updated, [rid]: {
            ...room,
            items: room.items.map(it => it.id === doorId ? { ...it, connectedRoomId: null, locked: false } : it)
          }}
        }
        // Also unlink the return door in connectedRoomId
        const targetRoom = updated[connectedRoomId]
        if (targetRoom) {
          updated = { ...updated, [connectedRoomId]: {
            ...targetRoom,
            items: targetRoom.items.map(it =>
              ITEM_CATALOGUE[it.typeKey]?.door && it.connectedRoomId === rid
                ? { ...it, connectedRoomId: null, locked: false } : it
            )
          }}
        }
      }
      return updated
    })
    // If current room is involved, update live items too
    const currentUnlink = unlinks.find(u => u.rid === currentRoomId)
    if (currentUnlink) {
      setItems(prev => prev.map(it =>
        it.id === currentUnlink.doorId ? { ...it, connectedRoomId: null, locked: false } : it
      ))
    }
  }, [currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation])

  // Delete a room from the session.  Cannot delete the currently active room.
  const deleteRoom = useCallback((roomId) => {
    if (roomId === currentRoomId) {
      window.alert('You are in this room. Navigate to another room before deleting it.')
      return
    }
    const roomName = getRoomName(roomId)
    if (!window.confirm(`Delete "${roomName}"?\nAll doors connecting to it will be unlinked.`)) return
    // Save current room state, then remove target room + unlink its doors
    const snapshot = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    setAllRooms(prev => {
      const updated = { ...prev, [currentRoomId]: snapshot }
      delete updated[roomId]
      for (const [rid, room] of Object.entries(updated)) {
        const hasLink = room.items.some(it => it.connectedRoomId === roomId)
        if (hasLink) updated[Number(rid)] = { ...room, items: room.items.filter(it => it.connectedRoomId !== roomId) }
      }
      return updated
    })
    // Unlink doors in the live (current) room pointing to deleted room
    setItems(prev => prev.filter(it => it.connectedRoomId !== roomId))
    // Clean up nav stack
    setRoomStack(prev => prev.filter(id => id !== roomId))
  }, [currentRoomId, getRoomName, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation])

  // ── Overview-driven room/door/stairs creation ─────────────────────────────

  const addRoom = useCallback(({ gridW: rW, gridD: rD, cells: rCells, name, wallHeight: rWH, level }) => {
    const targetId = nextRoomIdRef.current++
    const palette  = ROOM_PALETTES[targetId % ROOM_PALETTES.length]
    const newRoom  = {
      gridW: rW, gridD: rD,
      cells: new Set(rCells),
      items: [],
      wallHeight: rWH ?? DEFAULT_wallHeight,
      floorColor: palette.floorColor,
      wallColor:  palette.wallColor,
      targetRotation: 0,
      level: level ?? 0,
    }
    setAllRooms(prev => ({ ...prev, [targetId]: newRoom }))
    if (name) setRoomNamesState(prev => ({ ...prev, [targetId]: name }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      const def       = ITEM_CATALOGUE['door']
      const sz        = def.sizes[1]
      const idA = nextItemIdRef.current++
      const idB = nextItemIdRef.current++
      const doorA = {
        id: idA, typeKey: 'door', sizeIndex: 1, swatchIndex: 0,
        col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
        wall, wallU: u, wallH: sz.height / 2, wallAnchor: fromFaces[0] ?? 0,
        connectedRoomId: toRoomId, wasLinked: true,
      }
      const doorB = {
        id: idB, typeKey: 'door', sizeIndex: 1, swatchIndex: 0,
        col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
        wall: oppWall, wallU: mirU, wallH: sz.height / 2, wallAnchor: toFaces[0] ?? 0,
        connectedRoomId: fromRoomId, wasLinked: true,
      }
      const updatedFrom = { ...fromRoom, items: [...(fromRoom.items || []), doorA] }
      const updatedTo   = { ...toRoom,   items: [...(toRoom.items   || []), doorB] }
      return { ...updated, [fromRoomId]: updatedFrom, [toRoomId]: updatedTo }
    })
    // Sync live items if current room is involved
    if (fromRoomId === currentRoomId || toRoomId === currentRoomId) {
      const isFrom   = fromRoomId === currentRoomId
      const myWall   = isFrom ? wall : oppWall
      const wallLen2 = (wall === 'N' || wall === 'S') ? gridW : gridD
      const myU      = isFrom ? (wallU ?? wallLen2 / 2) : wallLen2 - (wallU ?? wallLen2 / 2)
      const myTarget = isFrom ? toRoomId : fromRoomId
      const def2     = ITEM_CATALOGUE['door']
      const sz2      = def2.sizes[1]
      const faces2   = getParallelWallFaces(myWall, myU, cells, gridW, gridD)
      const newDoor  = {
        id: nextItemIdRef.current - (isFrom ? 2 : 1),
        typeKey: 'door', sizeIndex: 1, swatchIndex: 0,
        col: 0, row: 0, rotation: 0, layer: def2.layer, owned: false, locked: true,
        wall: myWall, wallU: myU, wallH: sz2.height / 2, wallAnchor: faces2[0] ?? 0,
        connectedRoomId: myTarget, wasLinked: true,
      }
      setItems(prev => [...prev, newDoor])
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addExteriorDoor = useCallback((roomId, wall, wallU) => {
    const liveSnap = { gridW, gridD, cells: new Set(cells), items: [...items], wallHeight, floorColor, wallColor, targetRotation }
    const def     = ITEM_CATALOGUE['entryway_door']
    const sz      = def.sizes[0]
    const wallLen = (wall === 'N' || wall === 'S') ? gridW : gridD
    const u       = wallU ?? wallLen / 2
    if (roomId === currentRoomId) {
      const faces   = getParallelWallFaces(wall, u, cells, gridW, gridD)
      const newDoor = {
        id: nextItemIdRef.current++,
        typeKey: 'entryway_door', sizeIndex: 0, swatchIndex: 0,
        col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
        wall, wallU: u, wallH: sz.height / 2, wallAnchor: faces[0] ?? 0,
      }
      setItems(prev => [...prev, newDoor])
    } else {
      setAllRooms(prev => {
        const updated  = { ...prev, [currentRoomId]: liveSnap }
        const room     = updated[roomId]
        if (!room) return prev
        const rCells   = room.cells instanceof Set ? room.cells : new Set(room.cells)
        const wallLen2 = (wall === 'N' || wall === 'S') ? room.gridW : room.gridD
        const u2       = wallU ?? wallLen2 / 2
        const faces    = getParallelWallFaces(wall, u2, rCells, room.gridW, room.gridD)
        const newDoor  = {
          id: nextItemIdRef.current++,
          typeKey: 'entryway_door', sizeIndex: 0, swatchIndex: 0,
          col: 0, row: 0, rotation: 0, layer: def.layer, owned: false, locked: true,
          wall, wallU: u2, wallH: sz.height / 2, wallAnchor: faces[0] ?? 0,
        }
        return { ...updated, [roomId]: { ...room, items: [...(room.items || []), newDoor] } }
      })
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId]) // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation])

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

    const stairItem = {
      id: nextItemIdRef.current++,
      typeKey: 'stairs', sizeIndex: 0, swatchIndex: 0,
      stairs: true, col, row, stairW, stairD, stairCount,
      topFloorRoomId: topRoomId,
      rotation: 0, layer: 0, locked: true,
      bottomCells: [...bottomCells],
      topCells:    [...topCells],
    }

    if (roomId === currentRoomId) {
      const topRoom = {
        gridW: topW, gridD: topD, cells: new Set(topCells), items: [],
        wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor,
        targetRotation: 0, level: 1,
      }
      setItems(prev => [...prev, stairItem])
      setAllRooms(prev => ({ ...prev, [currentRoomId]: liveSnap, [topRoomId]: topRoom }))
    } else {
      setAllRooms(prev => {
        const updated  = { ...prev, [currentRoomId]: liveSnap }
        const room     = updated[roomId]
        if (!room) return prev
        const level    = room.level ?? 0
        const topRoom  = {
          gridW: topW, gridD: topD, cells: new Set(topCells), items: [],
          wallHeight: room.wallHeight, floorColor: palette.floorColor, wallColor: palette.wallColor,
          targetRotation: 0, level: level + 1,
        }
        return { ...updated, [roomId]: { ...room, items: [...(room.items || []), stairItem] }, [topRoomId]: topRoom }
      })
    }
  }, [gridW, gridD, cells, items, wallHeight, floorColor, wallColor, targetRotation, currentRoomId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOwned = useCallback((id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, owned: !it.owned } : it
    ))
  }, [])

  const toggleLocked = useCallback((id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, locked: !it.locked } : it
    ))
  }, [])

  const toggleWishlist = useCallback((id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, wishlisted: !it.wishlisted } : it
    ))
  }, [])

  const deleteItem = useCallback((id) => {
    const item = items.find(it => it.id === id)
    if (item?.connectedRoomId != null && ITEM_CATALOGUE[item.typeKey]?.door) {
      const connName = getRoomName(item.connectedRoomId)
      if (!window.confirm(`This door connects to "${connName}". Deleting it will unlink the two rooms. Continue?`)) return
      // Remove the return door from the connected room's snapshot
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
  }, [items, currentRoomId, getRoomName])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      if (!selectedId) return
      e.preventDefault()
      deleteItem(selectedId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, deleteItem])

  // All rooms (including current live state) — used for overview and banner dropdown
  const allRoomsData = useMemo(() => {
    const currentSnap = { gridW, gridD, cells, items, wallHeight, floorColor, wallColor }
    return { ...allRooms, [currentRoomId]: currentSnap }
  }, [allRooms, currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor])

  const selectedItem = items.find(it => it.id === selectedId) ?? null

  // These callbacks need selectedItem in scope — must be declared after it

  const resizeSelectedItem = useCallback((newSizeIndex) => {
    if (!selectedItem) return
    if (newSizeIndex === selectedItem.sizeIndex) return

    const cartMatch = cart.find(
      c => c.typeKey === selectedItem.typeKey && c.swatchIndex === selectedItem.swatchIndex
    )

    if (cartMatch && cartMatch.sizeIndex !== newSizeIndex) {
      const def = ITEM_CATALOGUE[selectedItem.typeKey]
      const from = def.sizes[cartMatch.sizeIndex].label
      const to   = def.sizes[newSizeIndex].label
      const ok = window.confirm(
        `Changing from "${from}" to "${to}" will also update this item in your cart.\n\nAdditional charges may apply. Continue?`
      )
      if (!ok) return
      setCart(prev => prev.map(c =>
        c.typeKey === selectedItem.typeKey && c.swatchIndex === selectedItem.swatchIndex
          ? { ...c, sizeIndex: newSizeIndex }
          : c
      ))
    }

    resizeItem(selectedItem.id, newSizeIndex)
  }, [selectedItem, cart, resizeItem])

  const recolorSelectedItem = useCallback((newSwatchIndex) => {
    if (!selectedItem) return
    if (newSwatchIndex === selectedItem.swatchIndex) return

    const cartMatch = cart.find(
      c => c.typeKey === selectedItem.typeKey && c.sizeIndex === selectedItem.sizeIndex
    )

    if (cartMatch && cartMatch.swatchIndex !== newSwatchIndex) {
      const def  = ITEM_CATALOGUE[selectedItem.typeKey]
      const from = def.swatches[cartMatch.swatchIndex].name
      const to   = def.swatches[newSwatchIndex].name
      const ok = window.confirm(
        `Changing color from "${from}" to "${to}" will also update this item in your cart.\n\nAdditional charges may apply. Continue?`
      )
      if (!ok) return
      setCart(prev => prev.map(c =>
        c.typeKey === selectedItem.typeKey && c.sizeIndex === selectedItem.sizeIndex
          ? { ...c, swatchIndex: newSwatchIndex }
          : c
      ))
    }

    recolorItem(selectedItem.id, newSwatchIndex)
  }, [selectedItem, cart, recolorItem])

  // Group qty — how many placed items share the selected item's type/size/color
  const selectedGroupQty = selectedItem
    ? items.filter(it =>
        it.typeKey    === selectedItem.typeKey &&
        it.sizeIndex  === selectedItem.sizeIndex &&
        it.swatchIndex === selectedItem.swatchIndex
      ).length
    : 0

  const incrementGroupQty = useCallback(() => {
    if (!selectedItem) return
    placeItem(selectedItem.typeKey, selectedItem.sizeIndex, selectedItem.swatchIndex)
  }, [selectedItem, placeItem])

  const decrementGroupQty = useCallback(() => {
    if (!selectedItem || selectedGroupQty <= 0) return
    // Remove the most recently placed item in the group (highest id)
    const group = items.filter(it =>
      it.typeKey    === selectedItem.typeKey &&
      it.sizeIndex  === selectedItem.sizeIndex &&
      it.swatchIndex === selectedItem.swatchIndex
    )
    const last = group.reduce((max, it) => it.id > max.id ? it : max)
    deleteItem(last.id)
  }, [selectedItem, selectedGroupQty, items, deleteItem])

  const wishlistedItems = items.filter(it => it.wishlisted)


  return (
    <div style={{ ...styles.app, background: bgColor, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* ── Canvas area (takes all space not used by shop drawer) ── */}
      <div style={{ flex: 1, position: 'relative', height: '100%', minWidth: 0, overflow: 'hidden' }}>
      <Canvas orthographic shadows="percentage" gl={{ preserveDrawingBuffer: true, alpha: true }}>
        <RoomScene
          targetRotation={targetRotation}
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wallHeight}
          floorColor={floorColor}
          wallColor={wallColor}
          zoomRef={zoomRef}
          items={items}
          selectedId={selectedId}
          onSelectItem={setSelectedId}
          onMoveItem={moveItem}
          onMoveWallItem={moveWallItem}
          onDoubleClickItem={setActiveModal}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          screenshotRef={screenshotRef}
          showMeasurements={showMeasurements}
          showGrid={showGrid}
          lightMood={lightMood}
          ceilingView={ceilingView}
          ceilingPicker={ceilingPicker}
          onPlaceCeilingItem={placeCeilingItem}
          onMoveCeilingItem={moveCeilingItem}
          onEnterRoom={enterRoom}
          cartHighlight={cartHighlight}
        />
      </Canvas>

      {/* ── Room name banner — top center ── */}
      <RoomBanner
        currentRoomId={currentRoomId}
        roomName={getRoomName(currentRoomId)}
        allRoomsData={allRoomsData}
        roomNames={roomNames}
        onOpenOverview={() => setOverviewOpen(true)}
        onNavigate={jumpToRoom}
        onRename={setRoomName}
      />

      {/* ── Room overview overlay ── */}
      {overviewOpen && (
        <RoomOverview
          allRoomsData={allRoomsData}
          currentRoomId={currentRoomId}
          roomNames={roomNames}
          showLabels={showOverviewLabels}
          onToggleLabels={() => setShowOverviewLabels(v => !v)}
          onNavigate={(id) => { jumpToRoom(id); setOverviewOpen(false) }}
          onRename={setRoomName}
          onDeleteRoom={deleteRoom}
          onClose={() => setOverviewOpen(false)}
          layoutOverrides={layoutOverrides}
          onSetLayoutOverrides={setLayoutOverrides}
          onUnlinkDoors={unlinkDoors}
          onAddRoom={addRoom}
          onAddDoor={addDoor}
          onAddExteriorDoor={addExteriorDoor}
          onUpdateRoomShape={updateRoomShape}
          onAddStairs={addStairs}
        />
      )}

      {panelOpen && (
        <Panel
          gridW={gridW}
          gridD={gridD}
          cells={cells}
          onCellToggle={toggleCell}
          onApplyGrid={applyGrid}
          wallHeight={wallHeight}
          onSetWallHeight={setWallHeight}
          neighborCells={neighborCells}
        />
      )}

      {styleOpen && (
        <StylePanel
          floorColor={floorColor}
          wallColor={wallColor}
          onFloorColor={setFloorColor}
          onWallColor={setWallColor}
        />
      )}

      {activeModal && (
        <ProductModal
          typeKey={activeModal}
          onPlace={placeItem}
          onAddToCart={handleModalAddToCart}
          onWishlist={placeAndWishlist}
          onClose={() => setActiveModal(null)}
        />
      )}

      {selectedItem && (
        <SelectedControls
          item={selectedItem}
          drawerOpen={drawerOpen}
          roomRotation={targetRotation}
          onShowDetails={() => setActiveModal(selectedItem.typeKey)}
          onRotate={() => rotateItem(selectedItem.id)}
          onDelete={() => deleteItem(selectedItem.id)}
          onResize={resizeSelectedItem}
          onRecolor={recolorSelectedItem}
          onToggleOwned={() => toggleOwned(selectedItem.id)}
          onToggleLocked={() => toggleLocked(selectedItem.id)}
          onToggleWishlist={() => toggleWishlist(selectedItem.id)}
          onAddToCart={() => addToCart(selectedItem.typeKey, selectedItem.sizeIndex, selectedItem.swatchIndex)}
          groupQty={selectedGroupQty}
          onIncrementQty={incrementGroupQty}
          onDecrementQty={decrementGroupQty}
          onMoveWall={(wu, wh) => moveWallItem(selectedItem.id, wu, wh)}
          onChangeWall={(wall) => changeItemWall(selectedItem.id, wall)}
          parallelFaces={selectedItem.wall
            ? getParallelWallFaces(selectedItem.wall, selectedItem.wallU, cells, gridW, gridD).length
            : 0}
          onSwapWallFace={() => swapWallFace(selectedItem.id)}
          wallHeight={wallHeight}
          onAdjustDropLength={(len) => adjustDropLength(selectedItem.id, len)}
          onSetPaneConfig={(cols, rows) => setPaneConfig(selectedItem.id, cols, rows)}
          onAdjustWindowSize={(w, h) => adjustWindowSize(selectedItem.id, w, h)}
          onEnterRoom={() => enterRoom(selectedItem.id)}
        />
      )}

      {windowPickerOpen && (
        <WindowSizePicker
          onPick={(sizeIndex, customW, customH) => {
            setWindowPickerOpen(false)
            setWallPicker({
              typeKey: 'window', sizeIndex: sizeIndex < 0 ? 0 : sizeIndex,
              swatchIndex: 0, wishlisted: false,
              ...(sizeIndex < 0 ? { customW, customH } : {}),
            })
          }}
          onCancel={() => setWindowPickerOpen(false)}
        />
      )}

      {doorPickerOpen && (
        <ArchSizePicker
          typeKey="door"
          onPick={(sizeIndex) => {
            setDoorPickerOpen(false)
            setWallPicker({ typeKey: 'door', sizeIndex, swatchIndex: 0, wishlisted: false })
          }}
          onCancel={() => setDoorPickerOpen(false)}
        />
      )}

      {doorLinkPicker && (
        <DoorLinkPicker
          doorId={doorLinkPicker.doorId}
          allRoomsData={allRoomsData}
          currentRoomId={currentRoomId}
          getRoomName={getRoomName}
          onNewRoom={confirmNewRoom}
          onLinkRoom={linkDoorToRoom}
          onCancel={() => setDoorLinkPicker(null)}
        />
      )}

      {wallPicker && (
        <WallPicker
          def={ITEM_CATALOGUE[wallPicker.typeKey]}
          onPick={placeItemOnWall}
          onCancel={() => setWallPicker(null)}
          roomRotation={targetRotation}
        />
      )}

      {ceilingPicker && (
        <div style={styles.ceilingBanner}>
          <span style={styles.ceilingBannerText}>
            Click a ceiling cell to place {ITEM_CATALOGUE[ceilingPicker.typeKey].label}
          </span>
          <button style={styles.ceilingBannerCancel}
            onClick={() => { setCeilingPicker(null); setCeilingView(false) }}>
            Cancel
          </button>
        </div>
      )}

      {musicOpen && (
        <MusicPanel
          station={musicStation}
          onStation={setMusicStation}
          onClose={() => setMusicOpen(false)}
          drawerOpen={drawerOpen}
        />
      )}

      <div style={styles.leftColumn}>
        {roomPanelOpen && (
          <RoomPanel
            items={items}
            onSelectItem={setSelectedId}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {hubOpen && (
          <HubPanel
            compact={compact} vw={vw}
            zoomRef={zoomRef}
            showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}
            showGrid={showGrid} setShowGrid={setShowGrid}
            panelOpen={panelOpen} setPanelOpen={setPanelOpen}
            styleOpen={styleOpen} setStyleOpen={setStyleOpen}
            setHubOpen={setHubOpen}
            roomPanelOpen={roomPanelOpen} setRoomPanelOpen={setRoomPanelOpen}
            itemCount={items.length}
            windowPickerOpen={windowPickerOpen} setWindowPickerOpen={setWindowPickerOpen}
            doorPickerOpen={doorPickerOpen} setDoorPickerOpen={setDoorPickerOpen}
            wallPickerTypeKey={wallPicker?.typeKey}
            canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo}
            saveBookmark={saveBookmark} bookmark={bookmark} restoreBookmark={restoreBookmark}
            exportRoom={exportRoom} importRef={importRef} importRoom={importRoom}
            screenshotRef={screenshotRef}
            bgColor={bgColor} setBgColor={setBgColor}
            lightMood={lightMood} setLightMood={setLightMood}
          />
        )}

        <div style={styles.bottomBar}>
          {roomStack.length > 0 && (
            <button style={{ ...styles.bottomBtn, borderColor: '#6090ff', color: '#a0c0ff' }} onClick={goBack}>
              ← Back
            </button>
          )}
          <button
            style={{ ...styles.bottomBtn, ...(drawerOpen ? styles.bottomBtnActive : {}) }}
            onClick={() => setDrawerOpen(v => !v)}
          >{drawerOpen ? '✕' : '🛍'} Shop</button>
          <button
            style={{ ...styles.bottomBtn, ...(hubOpen ? styles.bottomBtnActive : {}) }}
            onClick={() => setHubOpen(v => !v)}
          >{hubOpen ? '✕' : '🛠'} Tools</button>
          <button
            style={{ ...styles.bottomBtn, ...(musicOpen ? styles.bottomBtnActive : {}) }}
            onClick={() => setMusicOpen(v => !v)}
          >🎵</button>
          <button style={styles.bottomBtn} onClick={() => setTarget(r => r - Math.PI / 2)}>↻</button>
          <button
            style={{ ...styles.bottomBtn, ...(ceilingView ? styles.bottomBtnActive : {}) }}
            onClick={() => { setCeilingView(v => !v); setCeilingPicker(null) }}
            title={ceilingView ? 'Floor view' : 'Ceiling view'}
          >{ceilingView ? '▾ Floor' : '▴ Ceiling'}</button>
          <button style={styles.bottomBtn} onClick={() => setTarget(r => r + Math.PI / 2)}>↺</button>
          {cartCount > 0 && (
            <button
              style={{ ...styles.bottomBtn, ...styles.bottomCartBtn }}
              onClick={() => { setDrawerOpen(true); setDrawerTab('cart') }}
            >🛒 <span style={styles.cartBadge}>{cartCount}</span></button>
          )}
        </div>
      </div>
      </div>{/* end canvas area */}
      {/* ── Shop drawer flex sibling (takes real space, no canvas overlap) ── */}
      <div style={{
        width: drawerOpen ? drawerWidth : 0,
        flexShrink: 0, height: '100%',
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ width: drawerWidth, height: '100%' }}>
          <ShopDrawer
            open={drawerOpen}
            activeTab={drawerTab}
            onTabChange={setDrawerTab}
            onPlace={placeItem}
            onOpenModal={setActiveModal}
            cart={cart}
            onIncrementCart={addToCart}
            onDecrementCart={decrementCart}
            onRemoveFromCart={removeFromCart}
            wishlistedItems={wishlistedItems}
            onToggleWishlist={toggleWishlist}
            gridW={gridW}
            gridD={gridD}
            cartHighlight={cartHighlight}
            onCartHighlight={setCartHighlight}
            drawerWidth={drawerWidth}
          />
        </div>
      </div>
    </div>
  )
}

