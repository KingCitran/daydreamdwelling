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

function makeGrid(w, d) {
  const s = new Set()
  for (let c = 0; c < w; c++)
    for (let r = 0; r < d; r++)
      s.add(`${c},${r}`)
  return s
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.version === 1 ? data : null
  } catch { return null }
}

// All occupied cells for an item, in ½-ft integer units
function getItemCells(item) {
  const def  = ITEM_CATALOGUE[item.typeKey]
  const size = def.sizes[item.sizeIndex]
  const [fw, fd] = size.footprint
  const rotated  = item.rotation === 90 || item.rotation === 270
  const ew = rotated ? fd : fw
  const ed = rotated ? fw : fd
  const cells = new Set()
  const c0 = Math.round(item.col * 2)
  const r0 = Math.round(item.row * 2)
  for (let c = c0; c < c0 + Math.max(1, Math.round(ew * 2)); c++)
    for (let r = r0; r < r0 + Math.max(1, Math.round(ed * 2)); r++)
      cells.add(`${c},${r}`)
  return cells
}

function isWallItem(def) {
  return def.category === 'Wall Decor' || def.subcategory === 'Wall Sconces' || def.category === 'Windows' || def.category === 'Doors'
}

function isCeilingItem(def) {
  return !!def.ceiling
}

function hasOverlap(items, testId, testItem) {
  const testCells = getItemCells(testItem)
  for (const other of items) {
    if (other.id === testId) continue
    if (other.wall) continue  // wall items don't occupy floor space
    for (const cell of getItemCells(other))
      if (testCells.has(cell)) return true
  }
  return false
}

function hasWallOverlap(items, testId, testItem) {
  const def  = ITEM_CATALOGUE[testItem.typeKey]
  const size = def.sizes[testItem.sizeIndex]
  const fw   = testItem.customW ?? size.footprint[0]
  const fh   = testItem.customH ?? size.height
  for (const other of items) {
    if (other.id === testId || !other.wall || other.wall !== testItem.wall) continue
    // Items on different physical faces (different anchor) cannot collide
    if (testItem.wallAnchor !== undefined && other.wallAnchor !== undefined &&
        testItem.wallAnchor !== other.wallAnchor) continue
    const oDef  = ITEM_CATALOGUE[other.typeKey]
    const oSize = oDef.sizes[other.sizeIndex]
    const oFw   = other.customW ?? oSize.footprint[0]
    const oFh   = other.customH ?? oSize.height
    const uClear = Math.abs(testItem.wallU - other.wallU) >= (fw + oFw) / 2
    const hClear = Math.abs(testItem.wallH - other.wallH) >= (fh + oFh) / 2
    if (!uClear && !hClear) return true
  }
  return false
}

// Spiral search for the nearest free grid position near the center.
// Rotation is always 0 on initial placement, so we use raw footprint.
function findFreePosition(existingItems, templateItem, gridW, gridD) {
  const def  = ITEM_CATALOGUE[templateItem.typeKey]
  const size = def.sizes[templateItem.sizeIndex]
  const [fw, fd] = size.footprint
  const maxCol = gridW - fw
  const maxRow = gridD - fd
  const cx = Math.floor(maxCol / 2)
  const cy = Math.floor(maxRow / 2)

  for (let dist = 0; dist <= Math.max(gridW, gridD); dist++) {
    for (let dc = -dist; dc <= dist; dc++) {
      for (let dr = -dist; dr <= dist; dr++) {
        if (Math.abs(dc) !== dist && Math.abs(dr) !== dist) continue // shell only
        const col = Math.max(0, Math.min(maxCol, cx + dc))
        const row = Math.max(0, Math.min(maxRow, cy + dr))
        if (!hasOverlap(existingItems, templateItem.id, { ...templateItem, col, row }))
          return { col, row }
      }
    }
  }
  return { col: cx, row: cy } // room full — fall back to centre
}


// All wall-face anchor values of the given direction accessible from an item's column/row.
// For N/S walls: returns row indices (ascending for N, descending for S so [0] = outermost).
// For W/E walls: returns col indices (ascending for W, descending for E so [0] = outermost).
function getParallelWallFaces(wall, wallU, cells, gridW, gridD) {
  const faces = []
  if (wall === 'N' || wall === 'S') {
    const col = Math.max(0, Math.min(gridW - 1, Math.floor(wallU)))
    if (wall === 'N') {
      for (let r = 0; r < gridD; r++)
        if (cells.has(`${col},${r}`) && !cells.has(`${col},${r - 1}`)) faces.push(r)
    } else {
      for (let r = gridD - 1; r >= 0; r--)
        if (cells.has(`${col},${r}`) && !cells.has(`${col},${r + 1}`)) faces.push(r)
    }
  } else {
    const row = Math.max(0, Math.min(gridD - 1, Math.floor(wallU)))
    if (wall === 'W') {
      for (let c = 0; c < gridW; c++)
        if (cells.has(`${c},${row}`) && !cells.has(`${c - 1},${row}`)) faces.push(c)
    } else {
      for (let c = gridW - 1; c >= 0; c--)
        if (cells.has(`${c},${row}`) && !cells.has(`${c + 1},${row}`)) faces.push(c)
    }
  }
  return faces
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
          <div style={styles.roomPanel}>
            <div style={styles.roomPanelHeader}>
              <span style={styles.roomPanelTitle}>In Room</span>
              <span style={styles.roomPanelCount}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={styles.roomPanelList}>
              {items.length === 0
                ? <p style={styles.roomPanelEmpty}>No items placed yet.</p>
                : items.map(it => {
                    const def = ITEM_CATALOGUE[it.typeKey]
                    return (
                      <div key={it.id} style={styles.roomPanelItem} onClick={() => setSelectedId(it.id)}>
                        <div style={{ ...styles.roomPanelThumb, background: def.gradient }} />
                        <div style={styles.roomPanelInfo}>
                          <p style={styles.roomPanelName}>{def.label}</p>
                          <p style={styles.roomPanelMeta}>
                            {def.sizes[it.sizeIndex].label} · {def.swatches[it.swatchIndex].name}
                          </p>
                        </div>
                        {it.locked     && <span style={styles.roomPanelIcon}>🔒</span>}
                        {it.wishlisted && (
                          <button style={styles.roomPanelUnwish}
                            onClick={e => { e.stopPropagation(); toggleWishlist(it.id) }}
                            title="Remove from wishlist"
                          >♥</button>
                        )}
                      </div>
                    )
                  })
              }
            </div>
          </div>
        )}

        {hubOpen && (
          <div style={{ ...styles.hubPanel, width: compact ? Math.min(220, vw - 60) : 234 }}>
            <p style={styles.hubSectionLabel}>View</p>
            <div style={styles.hubBtnRow}>
              <button style={styles.hubBtn} onClick={() => { zoomRef.current = Math.min(120, zoomRef.current + 10) }}>＋ Zoom In</button>
              <button style={styles.hubBtn} onClick={() => { zoomRef.current = Math.max(15, zoomRef.current - 10) }}>－ Zoom Out</button>
            </div>
            <div style={styles.hubBtnRow}>
              <button
                style={{ ...styles.hubBtn, ...(showMeasurements ? styles.hubBtnActive : {}) }}
                onClick={() => setShowMeasurements(v => !v)}
              >📐 Measure</button>
              <button
                style={{ ...styles.hubBtn, ...(showGrid ? styles.hubBtnActive : {}) }}
                onClick={() => setShowGrid(v => !v)}
              >{showGrid ? '▦ Grid On' : '▢ Grid Off'}</button>
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>Panels</p>
            <div style={styles.hubBtnRow}>
              <button
                style={{ ...styles.hubBtn, ...(panelOpen ? styles.hubBtnActive : {}) }}
                onClick={() => { setPanelOpen(p => !p); setStyleOpen(false); setHubOpen(false) }}
              >⚙ Layout</button>
              <button
                style={{ ...styles.hubBtn, ...(styleOpen ? styles.hubBtnActive : {}) }}
                onClick={() => { setStyleOpen(p => !p); setPanelOpen(false); setHubOpen(false) }}
              >🎨 Style</button>
              <button
                style={{ ...styles.hubBtn, ...(roomPanelOpen ? styles.hubBtnActive : {}) }}
                onClick={() => { setRoomPanelOpen(v => !v); setHubOpen(false) }}
              >🏠 Room{items.length > 0 ? ` (${items.length})` : ''}</button>
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>Place</p>
            <div style={styles.hubBtnRow}>
              <button
                style={{ ...styles.hubBtn, ...(windowPickerOpen || wallPicker?.typeKey === 'window' ? styles.hubBtnActive : {}) }}
                onClick={() => { setWindowPickerOpen(v => !v); setDoorPickerOpen(false); setHubOpen(false) }}
              >🪟 Window</button>
              <button
                style={{ ...styles.hubBtn, ...(doorPickerOpen || wallPicker?.typeKey === 'door' ? styles.hubBtnActive : {}) }}
                onClick={() => { setDoorPickerOpen(v => !v); setWindowPickerOpen(false); setHubOpen(false) }}
              >🚪 Door</button>
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>History</p>
            <div style={styles.hubBtnRow}>
              <button
                style={{ ...styles.hubBtn, ...(!canUndo ? styles.hubBtnDisabled : {}) }}
                onClick={undo} disabled={!canUndo}
              >↩ Undo</button>
              <button
                style={{ ...styles.hubBtn, ...(!canRedo ? styles.hubBtnDisabled : {}) }}
                onClick={redo} disabled={!canRedo}
              >↪ Redo</button>
            </div>
            <div style={styles.hubBtnRow}>
              <button style={styles.hubBtn} onClick={saveBookmark}>📌 Bookmark</button>
              {bookmark && (
                <button style={{ ...styles.hubBtn, ...styles.hubRestoreBtn }} onClick={restoreBookmark}>↺ Restore</button>
              )}
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>File</p>
            <div style={styles.hubBtnRow}>
              <button style={styles.hubBtn} onClick={exportRoom}>💾 Save</button>
              <label style={{ ...styles.hubBtn, ...styles.hubLabel }}>
                📂 Load
                <input ref={importRef} type="file" accept=".json"
                  style={{ display: 'none' }} onChange={importRoom} />
              </label>
            </div>
            <div style={styles.hubBtnRow}>
              <button style={styles.hubBtn} onClick={() => screenshotRef.current?.()}>📷 Screenshot</button>
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>Background</p>
            <div style={styles.hubBgRow}>
              {['#1a1a2e','#0a0a0a','#2a1e1a','#1a2e1a','#f5f0e8','#e8ecf0'].map(c => (
                <button key={c} title={c}
                  style={{ ...styles.hubBgSwatch, background: c, ...(bgColor === c ? styles.hubBgSwatchActive : {}) }}
                  onClick={() => setBgColor(c)}
                />
              ))}
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={styles.hubBgPicker} title="Custom colour" />
            </div>

            <div style={styles.hubDivider} />
            <p style={styles.hubSectionLabel}>Lighting Mood</p>
            <div style={styles.hubBtnRow}>
              {[
                { id: 'bright',  label: '☀ Bright'  },
                { id: 'day',     label: '🌤 Day'     },
                { id: 'evening', label: '🌆 Evening' },
                { id: 'cozy',    label: '🕯 Cozy'    },
              ].map(({ id, label }) => (
                <button key={id}
                  style={{ ...styles.hubBtn, ...(lightMood === id ? styles.hubBtnActive : {}) }}
                  onClick={() => setLightMood(id)}
                >{label}</button>
              ))}
            </div>
          </div>
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

// ── Small number stepper (text box + ▲/▼) ───────────────────────────
function Stepper({ value, min, max, step, onChange, unit = "'" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <button style={styles.paneStep} onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}>▼</button>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v))) }}
        style={{ width: 40, textAlign: 'center', background: '#2a2a3e', border: '1px solid #4a4a6a', color: '#e0d8ff', borderRadius: 4, padding: '3px 2px', fontSize: 12 }}
      />
      <span style={{ color: '#9090b8', fontSize: 11 }}>{unit}</span>
      <button style={styles.paneStep} onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))}>▲</button>
    </div>
  )
}

// ── Window size picker overlay ───────────────────────────────────────
function WindowSizePicker({ onPick, onCancel }) {
  const [customMode, setCustomMode] = useState(false)
  const [customW, setCustomW] = useState(3)
  const [customH, setCustomH] = useState(4)
  const sizes = ITEM_CATALOGUE.window.sizes

  if (customMode) {
    return (
      <div style={styles.wallPickerOverlay} onClick={onCancel}>
        <div style={styles.wallPickerPanel} onClick={e => e.stopPropagation()}>
          <p style={styles.wallPickerTitle}>Custom Window</p>
          <p style={styles.wallPickerSub}>Then choose which wall</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#9090b8', fontSize: 12, minWidth: 46 }}>Width</span>
              <Stepper min={1} max={8} step={0.5} value={customW} onChange={setCustomW} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#9090b8', fontSize: 12, minWidth: 46 }}>Height</span>
              <Stepper min={1} max={6} step={0.5} value={customH} onChange={setCustomH} />
            </div>
            {/* Mini preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: Math.round(customW * 14), height: Math.round(customH * 14),
                background: '#c8a870', border: '2px solid #8a6840', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '70%', height: '80%', background: '#a8d8f8', opacity: 0.7, borderRadius: 1 }} />
              </div>
            </div>
          </div>
          <button
            style={{ ...styles.actionBtn, width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px 14px', boxSizing: 'border-box' }}
            onClick={() => onPick(-1, customW, customH)}
          >
            🪟 Place {customW}' × {customH}' →
          </button>
          <button style={styles.wallPickerCancel} onClick={() => setCustomMode(false)}>← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wallPickerOverlay} onClick={onCancel}>
      <div style={styles.wallPickerPanel} onClick={e => e.stopPropagation()}>
        <p style={styles.wallPickerTitle}>Window Size</p>
        <p style={styles.wallPickerSub}>Then choose which wall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {sizes.map((size, i) => (
            <button
              key={i}
              style={{ ...styles.actionBtn, justifyContent: 'space-between', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}
              onClick={() => onPick(i)}
            >
              <span>🪟 {size.label}</span>
              <span style={{ color: '#9090cc', fontSize: 11 }}>${size.price}</span>
            </button>
          ))}
          <button
            style={{ ...styles.actionBtn, justifyContent: 'center', padding: '10px 14px', width: '100%', boxSizing: 'border-box', borderStyle: 'dashed', color: '#9090cc' }}
            onClick={() => setCustomMode(true)}
          >
            ✏️ Custom size…
          </button>
        </div>
        <button style={styles.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Door link picker — new room vs. connect to existing room ──────────
function DoorLinkPicker({ doorId, allRoomsData, currentRoomId, getRoomName, onNewRoom, onLinkRoom, onCancel }) {
  const otherRooms = Object.keys(allRoomsData)
    .map(Number)
    .filter(id => id !== currentRoomId)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
    }} onClick={onCancel}>
      <div style={{
        background: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: 12,
        padding: '22px 26px', minWidth: 260, maxWidth: 340,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        fontFamily: 'system-ui, sans-serif',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e0d9ff', marginBottom: 14 }}>
          🚪 Where does this door lead?
        </div>

        {/* New room */}
        <button
          style={{
            display: 'block', width: '100%', marginBottom: 8,
            padding: '9px 14px', textAlign: 'left',
            background: '#2a2a45', border: '1px solid #6060a0',
            borderRadius: 7, color: '#c0b8ff', fontSize: 13, cursor: 'pointer',
          }}
          onClick={() => onNewRoom(doorId)}
        >
          ✦ New Room
        </button>

        {/* Existing rooms */}
        {otherRooms.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: '#6868a0', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Connect to existing
            </div>
            {otherRooms.map(rid => (
              <button
                key={rid}
                style={{
                  display: 'block', width: '100%', marginBottom: 6,
                  padding: '9px 14px', textAlign: 'left',
                  background: '#222238', border: '1px solid #3a3a5a',
                  borderRadius: 7, color: '#a8a0cc', fontSize: 13, cursor: 'pointer',
                }}
                onClick={() => onLinkRoom(doorId, rid)}
              >
                → {getRoomName(rid)}
              </button>
            ))}
          </>
        )}

        <button
          style={{
            display: 'block', width: '100%', marginTop: 12,
            padding: '7px 14px', textAlign: 'center',
            background: 'transparent', border: '1px solid #3a3a5a',
            borderRadius: 7, color: '#5a5a7a', fontSize: 12, cursor: 'pointer',
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Architectural size picker (doors, used for both doors and future items) ──
function ArchSizePicker({ typeKey, onPick, onCancel }) {
  const def = ITEM_CATALOGUE[typeKey]
  return (
    <div style={styles.wallPickerOverlay} onClick={onCancel}>
      <div style={styles.wallPickerPanel} onClick={e => e.stopPropagation()}>
        <p style={styles.wallPickerTitle}>{def.label} Size</p>
        <p style={styles.wallPickerSub}>Then choose which wall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {def.sizes.map((size, i) => (
            <button
              key={i}
              style={{ ...styles.actionBtn, justifyContent: 'space-between', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}
              onClick={() => onPick(i)}
            >
              <span>{def.label === 'Door' ? '🚪' : '🪟'} {size.label}</span>
              <span style={{ color: '#9090cc', fontSize: 11 }}>${size.price}</span>
            </button>
          ))}
        </div>
        <button style={styles.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Wall picker overlay — same diamond as the "Switch wall" control ──
function WallPicker({ def, onPick, onCancel, roomRotation }) {
  const [hovered, setHovered] = useState(null)
  const dmap  = DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)]
  const label = { N: 'Back', S: 'Front', W: 'Left', E: 'Right' }

  const segs = [
    { pos: 'tl', pts: '13,55 55,13 55,27 27,55'  },
    { pos: 'tr', pts: '55,13 97,55 83,55 55,27'  },
    { pos: 'br', pts: '97,55 55,97 55,83 83,55' },
    { pos: 'bl', pts: '55,97 13,55 27,55 55,83'  },
  ]
  // Label anchor: midpoint of each outer triangle face
  const labelPos = { tl: [28,33], tr: [82,33], br: [82,77], bl: [28,77] }

  return (
    <div style={styles.wallPickerOverlay}>
      <div style={styles.wallPickerPanel}>
        <p style={styles.wallPickerTitle}>Which wall?</p>
        <p style={styles.wallPickerSub}>
          <span style={{ color: def.color ?? '#c4a8ff' }}>■</span>{' '}
          {def.label}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <svg width="110" height="110" style={{ display: 'block' }}>
            {segs.map(({ pos, pts }) => {
              const wall = dmap[pos]
              const active = hovered === wall
              return (
                <polygon key={pos} points={pts}
                  fill={active ? '#4a4a8a' : '#2a2a4a'}
                  stroke={active ? '#a0a0ff' : '#5050a0'}
                  strokeWidth="1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPick(wall)}
                  onMouseEnter={() => setHovered(wall)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
            {/* Labels inside each segment */}
            {segs.map(({ pos }) => {
              const wall = dmap[pos]
              const [lx, ly] = labelPos[pos]
              return (
                <text key={pos} x={lx} y={ly}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={hovered === wall ? '#e0e0ff' : '#8080bb'}
                  fontSize="9" style={{ pointerEvents: 'none', userSelect: 'none' }}
                >{label[wall]}</text>
              )
            })}
            <path d="M 55,13 L 97,55 L 55,97 L 13,55 Z"
              fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="round"
              style={{ pointerEvents: 'none' }} />
            <path d="M 55,27 L 83,55 L 55,83 L 27,55 Z"
              fill="#1a1a2e" stroke="#2a2a50" strokeWidth="1"
              style={{ pointerEvents: 'none' }} />
            <text x="55" y="55" textAnchor="middle" dominantBaseline="middle"
              fill="#6060a0" fontSize="8" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {hovered ? label[hovered] : ''}
            </text>
          </svg>
        </div>

        <button style={styles.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Music player panel ───────────────────────────────────────────
// TODO: Replace url: null entries with real embed URLs when stations are ready
const STATIONS = [
  { id: 'cozy',    label: 'Cozy Vibes',   emoji: '🏡', desc: 'Acoustic & soft indie',    url: null },
  { id: 'jazz',    label: 'Jazz Lounge',  emoji: '🎷', desc: 'Smooth jazz & bossa nova', url: null },
  { id: 'lofi',    label: 'Lo-fi Study',  emoji: '📚', desc: 'Chill beats to focus',     url: null },
  { id: 'upbeat',  label: 'Upbeat',       emoji: '✨', desc: 'Pop & feel-good',           url: null },
  { id: 'ambient', label: 'Ambient',      emoji: '🌌', desc: 'Atmospheric & spacious',   url: null },
  { id: 'nature',  label: 'Nature',       emoji: '🌿', desc: 'Rain, forest & calm',      url: null },
]

function MusicPanel({ station, onStation, onClose, drawerOpen }) {
  const active = STATIONS.find(s => s.id === station) ?? null

  return (
    <div style={{ ...styles.musicPanel, right: drawerOpen ? 376 : 16 }}>
      <div style={styles.musicHeader}>
        <span style={styles.musicTitle}>🎵 Music</span>
        <button style={styles.musicClose} onClick={onClose}>✕</button>
      </div>

      <div style={styles.stationGrid}>
        {STATIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onStation(station === s.id ? null : s.id)}
            style={{
              ...styles.stationCard,
              ...(station === s.id ? styles.stationCardActive : {}),
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{s.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: station === s.id ? '#c4a8ff' : '#e0d9ff' }}>{s.label}</span>
            <span style={{ fontSize: 10, color: '#7878aa', lineHeight: 1.3 }}>{s.desc}</span>
          </button>
        ))}
      </div>

      {active?.url ? (
        <iframe
          key={active.url}
          src={active.url}
          width="100%"
          height={152}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ borderRadius: 8, display: 'block', border: 'none' }}
        />
      ) : active ? (
        <div style={styles.stationComingSoon}>
          <p style={{ margin: 0, fontSize: 12, color: '#9898cc' }}>🚧 Coming soon</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6666aa' }}>{active.label} station launching soon</p>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 11, color: '#6666aa', textAlign: 'center' }}>Pick a station above to start playing</p>
      )}
    </div>
  )
}

const DIAMOND_MAP = [
  { tl: 'W', tr: 'N', br: 'E', bl: 'S' }, // q0 — default view
  { tl: 'N', tr: 'E', br: 'S', bl: 'W' }, // q1 — 90°
  { tl: 'E', tr: 'S', br: 'W', bl: 'N' }, // q2 — 180°
  { tl: 'S', tr: 'W', br: 'N', bl: 'E' }, // q3 — 270°
]
function roomQuadrant(ry) {
  const r = ((ry % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return Math.floor((r + Math.PI / 4) / (Math.PI / 2)) % 4
}

function SelectedControls({
  item, drawerOpen, roomRotation,
  onShowDetails, onRotate, onDelete,
  onResize, onRecolor,
  onToggleOwned, onToggleLocked,
  onToggleWishlist, onAddToCart,
  groupQty, onIncrementQty, onDecrementQty,
  onMoveWall, onChangeWall,
  parallelFaces, onSwapWallFace,
  wallHeight, onAdjustDropLength, onSetPaneConfig, onAdjustWindowSize, onEnterRoom,
}) {
  const def        = ITEM_CATALOGUE[item.typeKey]
  const totalSizes = def.sizes.length
  const curSize    = def.sizes[item.sizeIndex]
  const isWall     = !!item.wall
  const isCeiling  = !!item.ceiling
  const isWindow   = !!def.window
  const isDoor     = !!def.door
  const dmap       = DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)]

  const maxW = 'calc(100% - 40px)'
  return (
    <div style={{
      position: 'absolute', bottom: 20,
      left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{ ...styles.controls, pointerEvents: 'auto', maxWidth: maxW, minWidth: 0 }}>

        {/* ── Row 1: Name / brand (left)  ·  Rating + badges (right) ── */}
        <div style={styles.ctrlNameRow}>
          <div style={styles.ctrlNameLeft}>
            <span style={styles.controlsTitle}>{def.label}</span>
            {def.brand && <span style={styles.controlsBrand}>{def.brand}</span>}
          </div>
          <div style={styles.ctrlNameRight}>
            {def.rating && (
              <span style={styles.ctrlRating}>
                ★ {def.rating}
                {def.reviewCount && <span style={styles.ctrlRatingCount}> ({def.reviewCount})</span>}
              </span>
            )}
            {(item.owned || item.wishlisted || item.locked) && (
              <div style={styles.badgeRow}>
                {item.owned      && <span style={styles.badgeOwned}  title="You own this">✓ owned</span>}
                {item.wishlisted && <span style={styles.badgeWish}   title="On wishlist">♥ wishlist</span>}
                {item.locked     && <span style={styles.badgeLocked} title="Position locked">🔒 locked</span>}
              </div>
            )}
          </div>
        </div>

        <div style={styles.ctrlHDivider} />

        {/* ── Row 2: Position controls  +  Own / Lock / Delete ── */}
        <div style={styles.ctrlRow}>

          {/* Wall: SVG cross D-pad */}
          {isWall && !item.locked && (
            <>
              <div style={styles.wallNudgeGroup}>
                <span style={styles.sizeLabel}>Move item</span>
                <div style={styles.diamondWrap}>
                  <svg width="70" height="70" style={{ display: 'block' }}>
                    {[
                      { dir: 'up',    pts: '22,22 48,22 35,8',  cb: () => onMoveWall(item.wallU, item.wallH + 0.25), hide: isDoor },
                      { dir: 'right', pts: '48,22 48,48 62,35', cb: () => onMoveWall(item.wallU + 0.25, item.wallH) },
                      { dir: 'down',  pts: '48,48 22,48 35,62', cb: () => onMoveWall(item.wallU, item.wallH - 0.25), hide: isDoor },
                      { dir: 'left',  pts: '22,48 22,22 8,35',  cb: () => onMoveWall(item.wallU - 0.25, item.wallH) },
                    ].map(({ dir, pts, cb, hide }) => (
                      <polygon key={dir} points={pts}
                        fill={hide ? '#1a1a2e' : '#2a2a4a'} stroke="none"
                        style={{ cursor: hide ? 'default' : 'pointer', pointerEvents: hide ? 'none' : 'auto' }}
                        onClick={hide ? undefined : cb} />
                    ))}
                    {/* Outer octagon — uniform 2.5px, sharp miter corners */}
                    <path d="M 35,8 L 48,22 L 62,35 L 48,48 L 35,62 L 22,48 L 8,35 L 22,22 Z"
                      fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="miter"
                      style={{ pointerEvents: 'none' }} />
                    {/* Inner square — same 2.5px, straight corners */}
                    <rect x="22" y="22" width="26" height="26"
                      fill="#1a1a2e" stroke="#2a2a50" strokeWidth="2.5"
                      style={{ pointerEvents: 'none' }} />
                  </svg>
                </div>
              </div>

              <div style={styles.ctrlDivider} />

              {/* Diamond wall switcher — segments map to whichever wall is visually there at the current camera angle */}
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Switch wall</span>
                <div style={styles.diamondWrap}>
                  <svg width="70" height="70" style={{ display: 'block' }}>
                    {[
                      { pos: 'tl', pts: '8,35 35,8 35,17 17,35' },
                      { pos: 'tr', pts: '35,8 62,35 53,35 35,17' },
                      { pos: 'br', pts: '62,35 35,62 35,53 53,35' },
                      { pos: 'bl', pts: '35,62 8,35 17,35 35,53' },
                    ].map(({ pos, pts }) => {
                      const wall = dmap[pos]
                      const active = item.wall === wall
                      return (
                        <polygon key={pos} points={pts}
                          fill={active ? '#5050aa' : '#2a2a4a'}
                          stroke={active ? '#9898ff' : '#3a3a6a'}
                          strokeWidth="0.75"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onChangeWall(wall)} />
                      )
                    })}
                    <path d="M 35,8 L 62,35 L 35,62 L 8,35 Z"
                      fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }} />
                    <path d="M 35,17 L 53,35 L 35,53 L 17,35 Z"
                      fill="#1a1a2e" stroke="#2a2a50" strokeWidth="0.75"
                      style={{ pointerEvents: 'none' }} />
                  </svg>
                </div>
              </div>

              <div style={styles.ctrlDivider} />

              {/* S = swap between parallel wall faces (interior ↔ outer) */}
              {parallelFaces > 1 && (
                <>
                  <div style={styles.wallSideGroup}>
                    <span style={styles.sizeLabel}>Swap face</span>
                    <button style={styles.swapFaceBtn} onClick={onSwapWallFace}
                      title={`${parallelFaces} parallel faces — cycle between them`}>
                      S
                    </button>
                  </div>
                  <div style={styles.ctrlDivider} />
                </>
              )}
            </>
          )}

          {/* Window pane config + size */}
          {isWindow && (
            <>
              <div style={styles.ctrlDivider} />
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Panes</span>
                {/* Crosshair layout: rows controls on top/bottom, cols on left/right */}
                <div style={{ display: 'grid', gridTemplateColumns: '26px 48px 26px', gridTemplateRows: '20px 56px 20px', gap: 2, alignItems: 'center', justifyItems: 'center' }}>
                  {/* [0,0] empty */}
                  <div />
                  {/* [0,1] rows+ */}
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.min(4, (item.paneRows ?? 2) + 1))}>▲</button>
                  {/* [0,2] row count label */}
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneRows ?? 2}r</span>
                  {/* [1,0] cols- */}
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(Math.max(1, (item.paneCols ?? 1) - 1), item.paneRows ?? 2)}>◀</button>
                  {/* [1,1] Preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.paneCols ?? 1}, 1fr)`, gridTemplateRows: `repeat(${item.paneRows ?? 2}, 1fr)`, gap: 2, width: 44, height: 52, background: '#c8a870', padding: 3, borderRadius: 3, border: '1.5px solid #8a6840' }}>
                    {Array.from({ length: (item.paneCols ?? 1) * (item.paneRows ?? 2) }).map((_, i) => (
                      <div key={i} style={{ background: '#a8d8f8', opacity: 0.75, borderRadius: 1 }} />
                    ))}
                  </div>
                  {/* [1,2] cols+ */}
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(Math.min(4, (item.paneCols ?? 1) + 1), item.paneRows ?? 2)}>▶</button>
                  {/* [2,0] col count label */}
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneCols ?? 1}c</span>
                  {/* [2,1] rows- */}
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.max(1, (item.paneRows ?? 2) - 1))}>▼</button>
                  {/* [2,2] empty */}
                  <div />
                </div>
              </div>
              <div style={styles.ctrlDivider} />
              {/* Window size steppers */}
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Size</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#7070a0', minWidth: 14 }}>W</span>
                    <Stepper min={1} max={8} step={0.5}
                      value={item.customW ?? curSize.footprint[0]}
                      onChange={v => onAdjustWindowSize(v, item.customH ?? curSize.height)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#7070a0', minWidth: 14 }}>H</span>
                    <Stepper min={1} max={6} step={0.5}
                      value={item.customH ?? curSize.height}
                      onChange={v => onAdjustWindowSize(item.customW ?? curSize.footprint[0], v)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ceiling: drop length slider */}
          {isCeiling && !item.locked && (
            <>
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Drop length</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="range"
                    min={0.05} max={wallHeight - 0.1} step={0.05}
                    value={item.dropLength ?? curSize.defaultDropLength ?? 0.6}
                    onChange={e => onAdjustDropLength(parseFloat(e.target.value))}
                    style={{ width: 90 }}
                  />
                  <span style={styles.sizeLabel}>{(item.dropLength ?? curSize.defaultDropLength ?? 0.6).toFixed(2)} ft</span>
                </div>
              </div>
              <div style={styles.ctrlDivider} />
            </>
          )}

          {/* Floor: rotate button */}
          {!isWall && !isCeiling && !item.locked && (
            <>
              <button style={styles.rotateBtn} onClick={onRotate} title="Rotate 90°">↻ Rotate</button>
              <div style={styles.ctrlDivider} />
            </>
          )}

          {/* Own / Lock / Delete — grouped with position controls */}
          <div style={styles.actionRow}>
            <button style={{ ...styles.actionBtn, ...(item.owned ? styles.iconOwned : {}) }}
              onClick={onToggleOwned}
              title={item.owned ? 'Unmark as owned' : 'Mark as owned'}>✓ Own</button>
            <button style={{ ...styles.actionBtn, ...(item.locked ? styles.iconLocked : styles.iconUnlocked) }}
              onClick={onToggleLocked}
              title={item.locked ? 'Click to unlock' : 'Click to lock position'}>
              {item.locked ? '🔒 Locked' : '🔓 Unlocked'}
            </button>
            {!item.owned && (
              <button style={{ ...styles.actionBtn, ...styles.iconDelete }}
                onClick={onDelete} title="Delete">🗑 Delete</button>
            )}
          </div>
          {/* Enter Room button — any wall door */}
          {isDoor && isWall && (
            <button
              style={{ ...styles.actionBtn, borderColor: '#6090ff', color: '#a0c0ff', marginTop: 4 }}
              onClick={onEnterRoom}
              title="Double-click door to enter connected room"
            >
              → Enter Room
            </button>
          )}
        </div>

        <div style={styles.ctrlHDivider} />

        {/* ── Row 3: Color  ·  Size  ·  Qty  ·  Wish  ·  Cart  ·  Details ── */}
        <div style={styles.ctrlRow}>
          <div style={styles.swatchRow}>
            {def.swatches.map((sw, i) => (
              <button key={sw.name} title={sw.name}
                style={{
                  ...styles.swatchBtn,
                  background: sw.hex,
                  ...(i === item.swatchIndex ? styles.swatchBtnActive : {}),
                }}
                onClick={() => onRecolor(i)} />
            ))}
          </div>

          {!item.locked && totalSizes > 1 && (
            <>
              <div style={styles.ctrlDivider} />
              <div style={styles.sizeCycle}>
                <span style={styles.sizeLabel}>Size</span>
                <button style={styles.cycleArrow}
                  onClick={() => onResize((item.sizeIndex - 1 + totalSizes) % totalSizes)}>‹</button>
                <span style={styles.cycleLabel}>{curSize.label}<span style={styles.cyclePrice}> ${curSize.price}</span></span>
                <button style={styles.cycleArrow}
                  onClick={() => onResize((item.sizeIndex + 1) % totalSizes)}>›</button>
              </div>
            </>
          )}

          <div style={styles.ctrlDivider} />
          <div style={styles.qtyRow}>
            <span style={styles.sizeLabel}>Qty</span>
            <button style={styles.qtyBtn} onClick={onDecrementQty} title="Remove one">−</button>
            <span style={styles.qtyNum}>{groupQty}</span>
            <button style={styles.qtyBtn} onClick={onIncrementQty} title="Add one">+</button>
          </div>

          <div style={styles.ctrlDivider} />
          {!item.owned && (
            <button style={{ ...styles.actionBtn, ...styles.iconWish }}
              onClick={onToggleWishlist}
              title={item.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >{item.wishlisted ? '♥' : '♡'} Wish</button>
          )}
          {!item.owned && (
            <button style={{ ...styles.actionBtn, ...styles.iconCart }}
              onClick={onAddToCart} title="Add to cart">🛒 Cart</button>
          )}
          <button style={{ ...styles.actionBtn, ...styles.iconInfo }}
            onClick={onShowDetails} title="View details">ℹ Details</button>
        </div>

      </div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  app: {
    width: '100vw', height: '100vh',
    background: '#1a1a2e',
    fontFamily: 'system-ui, sans-serif',
    overflow: 'hidden',
  },
  leftColumn: {
    position: 'absolute', bottom: 28, left: 28,
    display: 'flex', flexDirection: 'column', gap: 8,
    alignItems: 'flex-start',
  },
  bottomBar: {
    display: 'flex', flexDirection: 'row', gap: 8,
  },
  bottomBtn: {
    padding: '10px 18px',
    background: '#2a2a3d', color: '#e0d9ff',
    border: '1px solid #4a4a6a', borderRadius: 8,
    cursor: 'pointer', fontSize: 14,
  },
  bottomBtnActive: {
    background: '#1e1e30', borderColor: '#6a6a9a',
  },
  bottomCartBtn: {
    background: '#3a2a5a', borderColor: '#7a5aaa', color: '#e0d9ff',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  bottomSellBtn: {
    background: '#1a3a2a', borderColor: '#3a8a5a', color: '#a0ffcc',
  },
  hubPanel: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 10, padding: '12px 14px 14px',
    width: 234, display: 'flex', flexDirection: 'column', gap: 7,
  },
  hubSectionLabel: {
    margin: '2px 0 2px', fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa',
  },
  hubDivider: {
    height: 1, background: '#3a3a5a', margin: '1px 0',
  },
  hubBtnRow: {
    display: 'flex', gap: 6,
  },
  hubBtn: {
    flex: 1, padding: '7px 0',
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a', borderRadius: 6,
    cursor: 'pointer', fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  hubBtnActive: {
    background: '#2a3a4a', borderColor: '#5a8aaa', color: '#a0d0ff',
  },
  hubBtnDisabled: {
    opacity: 0.3, cursor: 'not-allowed',
  },
  hubLabel: {
    cursor: 'pointer',
  },
  hubRestoreBtn: {
    background: '#2a3a4a', borderColor: '#5a8aaa', color: '#a0d0ff',
  },
  hubBgRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
  hubBgSwatch: {
    width: 22, height: 22, borderRadius: 5,
    border: '2px solid transparent', cursor: 'pointer', flexShrink: 0,
  },
  hubBgSwatchActive: { border: '2px solid #fff' },
  hubBgPicker: {
    width: 28, height: 28, padding: 0,
    border: '1px solid #4a4a6a', borderRadius: 5,
    cursor: 'pointer', background: 'transparent',
  },
  roomPanel: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 10, width: 280, maxHeight: 320,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  roomPanelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px 8px',
    borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  roomPanelTitle: { fontSize: 13, fontWeight: 700, color: '#e0d9ff' },
  roomPanelCount: { fontSize: 11, color: '#7878aa' },
  roomPanelList: { overflowY: 'auto', flex: 1 },
  roomPanelEmpty: { color: '#7878aa', fontSize: 12, padding: 16, textAlign: 'center', margin: 0 },
  roomPanelItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderBottom: '1px solid #2a2a3a',
    cursor: 'pointer',
  },
  roomPanelThumb: { width: 36, height: 36, borderRadius: 6, flexShrink: 0 },
  roomPanelInfo: { flex: 1, minWidth: 0 },
  roomPanelName: { margin: 0, fontSize: 12, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roomPanelMeta: { margin: 0, fontSize: 10, color: '#7878aa' },
  roomPanelIcon: { fontSize: 12, flexShrink: 0 },
  roomPanelUnwish: {
    fontSize: 12, color: '#ff7aa0', flexShrink: 0,
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  cartBadge: {
    background: '#9a7aee', color: '#fff',
    borderRadius: '50%', width: 20, height: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  controls: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 12, padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: 8,
    minWidth: 600, maxWidth: 'calc(100vw - 40px)',
  },
  ctrlRow:     { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  ctrlNameRow:      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ctrlNameLeft:     { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1 },
  ctrlNameRight:    { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  ctrlRating:       { fontSize: 11, color: '#f0c060', fontWeight: 600, whiteSpace: 'nowrap' },
  ctrlRatingCount:  { fontSize: 10, color: '#9090b8', fontWeight: 400 },
  ctrlHDivider: { height: 1, background: '#3a3a5a' },
  controlsLeft: { display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 },
  controlsTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: '#e0d9ff' },
  controlsBrand: { margin: 0, fontSize: 10, color: '#7878aa', letterSpacing: '0.3px' },
  badgeRow: { display: 'flex', gap: 6, alignItems: 'center' },
  wallNudgeGroup: { display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' },
  wallNudgeRow:   { display: 'flex', gap: 3 },


  // Diamond switcher — 70×70 rounded-square container.
  // Tips at r=23 from center (35,35): T=(35,12) R=(58,35) B=(35,58) L=(12,35)
  // Edge length = 23√2 ≈ 32.5 px → bars are 33 px wide so endpoints meet.
  // Edge midpoints: tl=(24,24) tr=(46,24) br=(46,46) bl=(24,46)
  // Bar positions: left = midX − 16.5, top = midY − 4
  diamondWrap: {
    position: 'relative', width: 70, height: 70, flexShrink: 0,
    background: '#1a1a2e', border: '1.5px solid #3a3a5a', borderRadius: 10,
    overflow: 'hidden',
  },
  diamondBg: { display: 'none' }, // container itself is the rounded square
  dBarTL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 20, transform: 'rotate(-45deg)', cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarTR: { position: 'absolute', width: 33, height: 8, left: 31, top: 20, transform: 'rotate(45deg)',  cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarBR: { position: 'absolute', width: 33, height: 8, left: 31, top: 43, transform: 'rotate(-45deg)', cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarBL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 43, transform: 'rotate(45deg)',  cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarActive: { background: '#5050aa', borderColor: '#9898ff' },

  swapFaceBtn: {
    width: 70, height: 70, cursor: 'pointer', flexShrink: 0,
    background: '#1a1a2e', border: '1.5px solid #3a3a5a', borderRadius: 10,
    color: '#c0b8ff', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s, border-color 0.15s',
  },
  // Mini wall diagram (in SelectedControls)
  wallSideGroup:    { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
  miniWallDiagram:  { display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' },
  miniWallRow:      { display: 'flex', gap: 2, alignItems: 'center' },
  miniWallRoom:     { width: 30, height: 22, background: '#1e1e2e', border: '1px solid #2a2a4a', borderRadius: 2 },
  miniWallTop:    { width: 50, height: 8, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '3px 3px 0 0', padding: 0 },
  miniWallBottom: { width: 50, height: 8, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '0 0 3px 3px', padding: 0 },
  miniWallLeft:   { width: 8, height: 22, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '3px 0 0 3px', padding: 0 },
  miniWallRight:  { width: 8, height: 22, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '0 3px 3px 0', padding: 0 },
  miniWallActive: { background: '#5050aa', borderColor: '#9898ff' },

  wallBtnGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gridTemplateRows: 'repeat(2, 32px)', gap: 4,
  },
  wallNudgeBtn:      { width: 28, height: 24, borderRadius: 5, border: '1px solid #4a4a6a', background: '#2a2a3d', color: '#c0b8e8', cursor: 'pointer', fontSize: 12 },
  wallSideBtn: {
    width: 32, height: 32, borderRadius: 6, border: '1px solid #4a4a6a',
    background: '#2a2a3d', color: '#9898cc', cursor: 'pointer', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  wallSideBtnActive: { background: '#3a2a5a', borderColor: '#9a7aee', color: '#c4a8ff' },
  badgeOwned:  { fontSize: 10, color: '#70c070', fontWeight: 600 },
  badgeLocked: { fontSize: 10, color: '#f0c060', fontWeight: 600 },
  badgeWish:   { fontSize: 10, color: '#ff7aa0', fontWeight: 600 },
  ctrlDivider: { width: 1, height: 32, background: '#3a3a5a', flexShrink: 0 },
  rotateBtn: {
    padding: '6px 14px', borderRadius: 7,
    background: '#3a3a55', color: '#c0b8ff',
    border: '1px solid #5a5a8a',
    cursor: 'pointer', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
  },
  sizeLabel: { fontSize: 10, color: '#7878aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  swatchRow: { display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' },
  swatchBtn: {
    width: 22, height: 22, borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer', flexShrink: 0,
    transition: 'border-color 0.15s, transform 0.15s',
  },
  swatchBtnActive: { border: '2px solid #fff', transform: 'scale(1.3)' },
  sizeCycle: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  cycleArrow: {
    width: 24, height: 24, borderRadius: 5,
    background: '#3a3a55', color: '#c0b8ff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1, padding: 0,
  },
  cycleLabel: { fontSize: 12, color: '#e0d9ff', fontWeight: 600, whiteSpace: 'nowrap', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' },
  cyclePrice: { fontWeight: 400, color: '#9898cc' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  paneStep: {
    background: 'transparent', border: '1px solid #4a4a6a',
    color: '#9090cc', fontSize: 10, padding: '1px 5px',
    cursor: 'pointer', borderRadius: 3, lineHeight: 1,
  },
  qtyNum: { fontSize: 14, fontWeight: 700, color: '#e0d9ff', minWidth: 20, textAlign: 'center' },
  actionRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
  actionBtn: {
    padding: '5px 10px', borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4,
    transition: 'background 0.15s', flexShrink: 0,
  },
  iconRow: { display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 },
  iconBtn: {
    width: 28, height: 28, borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  iconWish:   { color: '#ff7aa0', borderColor: '#6a4a6a' },
  iconCart:   { background: '#3a2a5a', borderColor: '#7a5aaa', color: '#c0a8ff' },
  iconOwned:    { background: '#2a4a2a', borderColor: '#3a7a3a', color: '#70c070' },
  iconUnlocked: { color: '#a090cc', borderColor: '#4a4a6a' },
  iconLocked:   { background: '#3a2a08', borderColor: '#d4a020', color: '#f0c060', boxShadow: '0 0 0 1.5px #d4a02050' },
  iconInfo:   { color: '#9878cc' },
  iconDelete: { background: '#4a2a35', borderColor: '#7a3a4a', color: '#ffaaaa' },
  // ── Wall picker ───────────────────────────────────────────────────
  wallPickerOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
  },
  wallPickerPanel: {
    background: '#1e1e2e', border: '1px solid #3a3a5a', borderRadius: 14,
    padding: '22px 26px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  wallPickerTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e0d8ff' },
  wallPickerSub:   { margin: 0, fontSize: 12, color: '#9090b8', textAlign: 'center' },
  wallPickerCancel: {
    marginTop: 4, padding: '6px 20px', cursor: 'pointer',
    background: 'transparent', border: '1px solid #4a4a6a',
    borderRadius: 6, color: '#7070a0', fontSize: 12,
  },
  musicPanel: {
    position: 'absolute', top: 16,
    width: 300,
    background: '#1e1e30', border: '1px solid #3a3a5a',
    borderRadius: 12, padding: 12,
    display: 'flex', flexDirection: 'column', gap: 8,
    zIndex: 30, fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  musicHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  musicTitle: { fontSize: 13, fontWeight: 700, color: '#e0d9ff' },
  musicClose: {
    background: 'transparent', border: 'none',
    color: '#7878aa', cursor: 'pointer', fontSize: 14, lineHeight: 1,
  },
  stationGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
  },
  stationCard: {
    padding: '8px 10px', borderRadius: 8,
    border: '1px solid #3a3a5a', background: '#252538',
    cursor: 'pointer', textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 3,
  },
  stationCardActive: {
    border: '1px solid #9a7aee', background: '#2d2250',
  },
  stationComingSoon: {
    textAlign: 'center', padding: '12px 8px',
    background: '#252538', borderRadius: 8, border: '1px solid #3a3a5a',
  },
  sectionLabel: {
    margin: 0, fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa',
  },
  ceilingBanner: {
    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
    background: '#1e1e30', border: '1px solid #6060aa',
    borderRadius: 10, padding: '10px 18px',
    display: 'flex', alignItems: 'center', gap: 14,
    zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  ceilingBannerText: { fontSize: 13, color: '#c0b8ff', fontWeight: 500 },
  ceilingBannerCancel: {
    padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
    background: 'transparent', border: '1px solid #5a5a8a', color: '#8888b8', fontSize: 12,
  },
  // ── Room banner ──────────────────────────────────────────────────
  roomBannerWrap: {
    position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 2, zIndex: 45,
  },
  roomBannerBtn: {
    padding: '10px 20px', borderRadius: '10px 0 0 10px',
    background: 'rgba(20,18,40,0.88)', border: '1.5px solid #6a6acc',
    color: '#d8d4ff', fontSize: 17, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    letterSpacing: '0.2px',
  },
  roomBannerEdit: {
    padding: '4px 8px', borderRadius: 6,
    background: 'transparent', border: '1px solid #5a5a8a',
    color: '#9090c0', fontSize: 12, cursor: 'pointer',
    marginLeft: 2,
  },
  roomBannerInput: {
    padding: '10px 14px', borderRadius: '10px 0 0 10px',
    background: 'rgba(20,18,40,0.92)', border: '1.5px solid #9a7aee',
    color: '#e8e4ff', fontSize: 17, fontWeight: 700,
    outline: 'none', minWidth: 140, boxSizing: 'border-box',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  roomBannerDrop: {
    padding: '10px 10px', borderRadius: '0 10px 10px 0',
    background: 'rgba(20,18,40,0.88)', border: '1.5px solid #6a6acc', borderLeft: 'none',
    color: '#9090c0', fontSize: 13, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
  },
  roomDropdown: {
    position: 'absolute', top: '100%', left: 0, marginTop: 4,
    background: '#1e1e30', border: '1px solid #4a4a6a',
    borderRadius: 8, padding: '4px 0', minWidth: 160,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 200,
    display: 'flex', flexDirection: 'column',
  },
  roomDropItem: {
    padding: '8px 14px', background: 'transparent', border: 'none',
    color: '#c0b8ff', fontSize: 12, cursor: 'pointer', textAlign: 'left',
  },
  roomDropItemActive: { color: '#9a7aee', fontWeight: 700 },
  // ── Room overview ────────────────────────────────────────────────
  overviewOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  overviewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  overviewTitle: { fontSize: 16, fontWeight: 700, color: '#e0d9ff' },
  overviewHeaderBtn: {
    padding: '6px 14px', borderRadius: 6,
    background: '#3a3a55', border: '1px solid #5a5a8a', color: '#c0b8ff',
    fontSize: 12, cursor: 'pointer',
  },
  overviewClose: {
    padding: '6px 12px', borderRadius: 6,
    background: 'transparent', border: '1px solid #5a5a8a', color: '#8888bb',
    fontSize: 14, cursor: 'pointer', marginLeft: 8,
  },
  overviewCanvas: {
    flex: 1, overflow: 'auto',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: 40,
  },
}

// ── Room Banner (top-center name badge + dropdown) ───────────────────
function RoomBanner({ currentRoomId, roomName, allRoomsData, roomNames, onOpenOverview, onNavigate, onRename }) {
  const [dropOpen,  setDropOpen]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [draft,     setDraft]     = useState(roomName)
  const roomIds   = Object.keys(allRoomsData).map(Number)
  const hasMultiple = roomIds.length > 1

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed) onRename(currentRoomId, trimmed)
    setEditing(false)
  }

  return (
    <div style={styles.roomBannerWrap}>
      {editing ? (
        <input
          style={styles.roomBannerInput}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter')  commitRename()
            if (e.key === 'Escape') { setEditing(false); setDraft(roomName) }
          }}
          autoFocus
        />
      ) : (
        <button style={styles.roomBannerBtn} onClick={onOpenOverview} title="Click to open overview · double-click to rename">
          🏠 <span onDoubleClick={e => { e.stopPropagation(); setDraft(roomName); setEditing(true) }}>{roomName}</span>
        </button>
      )}
      {!editing && (
        <button style={styles.roomBannerEdit}
          onClick={() => { setDraft(roomName); setEditing(true) }}
          title="Rename room">✏</button>
      )}
      {!editing && hasMultiple && (
        <div style={{ position: 'relative' }}>
          <button style={styles.roomBannerDrop} onClick={() => setDropOpen(v => !v)} title="Switch room">▾</button>
          {dropOpen && (
            <div style={styles.roomDropdown}>
              {roomIds.map(id => {
                const name = roomNames[id] || `Room ${id + 1}`
                const isActive = id === currentRoomId
                return (
                  <button key={id} style={{ ...styles.roomDropItem, ...(isActive ? styles.roomDropItemActive : {}) }}
                    onClick={() => { onNavigate(id); setDropOpen(false) }}
                  >
                    {isActive ? '● ' : '○ '}{name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}