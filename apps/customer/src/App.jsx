import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import RoomScene from './scene/RoomScene'
import Panel from './ui/Panel'
import StylePanel from './ui/StylePanel'
import ShopDrawer, { ProductModal } from './ui/ShopDrawer'
import { ITEM_CATALOGUE } from './data/items'
import { computeRoomLayout } from './overview/layout'
import RoomOverview from './overview/RoomOverview'
import { useBuilderStyles } from './ui/styles/appStyles'
import MusicPanel from './ui/MusicPanel'
import WallPicker from './ui/WallPicker'
import WindowSizePicker from './ui/WindowSizePicker'
import DoorLinkPicker from './ui/DoorLinkPicker'
import ArchSizePicker from './ui/ArchSizePicker'
import SelectedControls from './ui/SelectedControls'
import HubPanel from './ui/HubPanel'
import RoomPanel from './ui/RoomPanel'
import RoomBanner from './ui/RoomBanner'
import { makeGrid, getParallelWallFaces } from './utils/roomGeometry'
import useHistoryUndo from './hooks/useHistoryUndo'
import usePersistence from './hooks/usePersistence'
import useCartWishlist from './hooks/useCartWishlist'
import useItemActions from './hooks/useItemActions'
import useRoomNavigation from './hooks/useRoomNavigation'
import useShopProducts from './hooks/useShopProducts'
import useOwnedItems from './hooks/useOwnedItems'
import { AuthProvider, useAuth } from '@shared/auth/AuthContext'
import { ThemeProvider, useTheme } from '@shared/ThemeProvider'
import AuthModal from './ui/AuthModal'
import AccountModal from './ui/AccountModal'
import SaveRoomModal from './ui/SaveRoomModal'
import LoadRoomModal from './ui/LoadRoomModal'
import useCloudSave from './hooks/useCloudSave'
import CheckoutModal from './ui/CheckoutModal'
import OrderSuccessBanner from './ui/OrderSuccessBanner'
import Wispy from './ui/Wispy'
import useWispy from './hooks/useWispy'
import WispyCashier from './ui/WispyCashier'
import useSellerCatalogue from './hooks/useSellerCatalogue'
import LandingPage from './pages/LandingPage'
import WispyPreview from './pages/WispyPreview'
import CommunityFeed from './pages/CommunityFeed'
import ProfilePage from './pages/ProfilePage'
import BuilderMoodPicker from './ui/BuilderMoodPicker'
import QuizPage from './ui/onboarding/QuizPage'
import NotificationBell from './ui/NotificationBell'
import { useMoodControl } from '@shared/ThemeProvider'
import { MOOD_TO_TAGS } from '@shared/moodTags'
import { supabase } from '@shared/supabase'

const DEFAULT_wallHeight = 8

function loadSaved() {
  try {
    const raw = localStorage.getItem('room-builder-v1')
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.version === 1 ? data : null
  } catch { return null }
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider appKey="customer">
        <Gate />
      </ThemeProvider>
    </AuthProvider>
  )
}

function Gate() {
  const params                     = new URLSearchParams(window.location.search)
  const isCheckoutRedirect         = params.get('checkout') != null
  const shopBuilderSellerId        = params.get('shopBuilder') === 'true' ? params.get('sellerId') : null
  const [inBuilder, setInBuilder]  = useState(isCheckoutRedirect || !!shopBuilderSellerId)
  const quizDone                   = !!localStorage.getItem('ddd_quiz_done')
  const { setMood }                = useMoodControl()
  const { user }                   = useAuth()

  async function completeQuiz(mood) {
    setMood(mood)
    localStorage.setItem('ddd_quiz_done', '1')
    localStorage.setItem('ddd_style_tags', JSON.stringify(MOOD_TO_TAGS[mood] ?? []))
    if (user) {
      await supabase.from('profiles').update({ style_tags: MOOD_TO_TAGS[mood] ?? [] }).eq('id', user.id)
    }
    setInBuilder(true)
  }

  function skipQuiz() {
    localStorage.setItem('ddd_quiz_done', '1')
    setInBuilder(true)
  }

  if (params.get('preview') === 'wispy') return <WispyPreview />
  if (params.get('profile')) return <ProfilePage userId={params.get('profile')} onEnterBuilder={() => setInBuilder(true)} />
  if (inBuilder) return <AppInner shopBuilderSellerId={shopBuilderSellerId} />
  if (!quizDone) return <QuizPage onComplete={completeQuiz} onSkip={skipQuiz} />
  return <LandingPage onEnter={() => setInBuilder(true)} onBrowseShop={() => { localStorage.setItem('ddd_open_shop', '1'); setInBuilder(true) }} />
}

function AppInner({ shopBuilderSellerId = null }) {
  const t = useTheme()
  const s = useBuilderStyles()
  const catalogue       = useShopProducts()
  const sellerCatalogue = useSellerCatalogue(shopBuilderSellerId)
  // In shop builder mode the shop panel shows only the seller's products.
  // Room rendering (Items, SelectedControls) uses the full catalogue so any
  // static items already in the layout still render correctly.
  const shopPanelCatalogue = shopBuilderSellerId ? (sellerCatalogue ?? {}) : catalogue
  const [initSave] = useState(loadSaved)
  const [lightsOff, setLightsOff] = useState(false)

  const nextItemIdRef = useRef(null)
  if (nextItemIdRef.current === null) {
    nextItemIdRef.current = initSave?.items?.length > 0
      ? Math.max(...initSave.items.map(it => it.id)) + 1
      : 1
  }

  // ── Core room state ──────────────────────────────────────────────
  const [gridW,      setGridW]      = useState(initSave?.gridW ?? 12)
  const [gridD,      setGridD]      = useState(initSave?.gridD ?? 12)
  const [cells,      setCells]      = useState(() =>
    initSave?.cells ? new Set(initSave.cells) : makeGrid(initSave?.gridW ?? 12, initSave?.gridD ?? 12)
  )
  const [wallHeight, setWallHeight] = useState(initSave?.wallHeight ?? DEFAULT_wallHeight)
  const [targetRotation, setTarget] = useState(0)
  const [floorColor, setFloorColor] = useState(initSave?.floorColor ?? '#cec5b8')
  const [wallColor,  setWallColor]  = useState(initSave?.wallColor  ?? '#d8d0c6')
  const [bgColor,    setBgColor]    = useState(initSave?.bgColor    ?? '#1a1a2e')
  const [lightMood,  setLightMood]  = useState(initSave?.lightMood  ?? 'day')
  const [items,      setItems]      = useState(initSave?.items ?? [])
  const { wispyMessage, dismissWispy, showWispy } = useWispy({ itemCount: items.length })
  const [selectedId, setSelectedId] = useState(null)
  const roomItemKeys = useMemo(() => new Set(items.map(i => i.typeKey)), [items])

  // ── UI state ─────────────────────────────────────────────────────
  const [panelOpen,        setPanelOpen]        = useState(false)
  const [drawerOpen,       setDrawerOpen]       = useState(() => {
    if (localStorage.getItem('ddd_open_shop')) { localStorage.removeItem('ddd_open_shop'); return true }
    return true
  })
  const [drawerTab,        setDrawerTab]        = useState('shop')
  const [roomPanelOpen,    setRoomPanelOpen]    = useState(false)
  const [hubOpen,          setHubOpen]          = useState(false)
  const [styleOpen,        setStyleOpen]        = useState(false)
  const [activeModal,      setActiveModal]      = useState(null)
  const [cartHighlight,    setCartHighlight]    = useState(null)
  const [musicStation,     setMusicStation]     = useState(initSave?.musicStation ?? null)
  const [musicOpen,        setMusicOpen]        = useState(false)
  const [wallPicker,       setWallPicker]       = useState(null)
  const [windowPickerOpen, setWindowPickerOpen] = useState(false)
  const [doorPickerOpen,   setDoorPickerOpen]   = useState(false)
  const [doorLinkPicker,   setDoorLinkPicker]   = useState(null)
  const [ceilingView,      setCeilingView]      = useState(false)
  const [ceilingPicker,    setCeilingPicker]    = useState(null)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [showGrid,         setShowGrid]         = useState(true)
  const [overviewOpen,        setOverviewOpen]        = useState(false)
  const [showOverviewLabels,  setShowOverviewLabels]  = useState(true)
  const [layoutOverrides,     setLayoutOverrides]     = useState({})
  const [bookmark,        setBookmark]        = useState(null)
  const [authModalOpen,    setAuthModalOpen]    = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [communityOpen,    setCommunityOpen]    = useState(false)
  const [saveModalOpen,   setSaveModalOpen]   = useState(false)
  const [loadModalOpen,   setLoadModalOpen]   = useState(false)
  const [cloudRoomId,     setCloudRoomId]     = useState(null) // id of the last saved cloud room (for overwrite)
  const [checkoutOpen,    setCheckoutOpen]    = useState(false)
  const [orderSuccess,    setOrderSuccess]    = useState(false)
  const { user } = useAuth()
  const ownedKeys = useOwnedItems(user?.id)

  // ── Multi-room state ─────────────────────────────────────────────
  const [allRooms,      setAllRooms]      = useState(() => {
    if (!initSave?.allRooms) return {}
    return Object.fromEntries(
      Object.entries(initSave.allRooms).map(([id, room]) => [id, { ...room, cells: new Set(room.cells) }])
    )
  })
  const [currentRoomId, setCurrentRoomId] = useState(initSave?.currentRoomId ?? 0)
  const [roomStack,     setRoomStack]     = useState([])
  const nextRoomIdRef = useRef(1)
  const [roomNames, setRoomNamesState] = useState(initSave?.roomNames ?? {})
  const setRoomName = useCallback((id, name) => {
    setRoomNamesState(prev => ({ ...prev, [id]: name }))
  }, [])
  const getRoomName = useCallback((id) => roomNames[Number(id)] || `Room ${Number(id) + 1}`, [roomNames])

  const zoomRef       = useRef(32)
  const screenshotRef = useRef(null)

  // ── Viewport width ───────────────────────────────────────────────
  const [vw, setVw] = useState(() => window.innerWidth)
  useEffect(() => {
    const h = () => setVw(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  const compact     = vw < 700
  const drawerWidth = compact ? Math.min(vw - 100, 320) : 360

  // ── Hooks ────────────────────────────────────────────────────────
  const { undo, redo, onDragStart, onDragEnd, canUndo, canRedo } = useHistoryUndo({
    gridW, gridD, cells, items, floorColor, wallColor,
    setGridW, setGridD, setCells, setItems, setFloorColor, setWallColor, setSelectedId,
  })

  // cart must come before usePersistence so importRoom can call setCart
  const { cart, setCart, cartCount, addToCart, decrementCart, removeFromCart, toggleWishlist, wishlistedItems } =
    useCartWishlist({ initSave, items, setItems })

  const { importRef, exportRoom, importRoom } = usePersistence({
    gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames,
    allRooms, currentRoomId,
    nextItemIdRef,
    setGridW, setGridD, setCells, setItems, setCart, setFloorColor, setWallColor, setSelectedId,
  })

  const {
    placeItem, placeItemOnWall, placeCeilingItem,
    moveItem, moveCeilingItem, adjustDropLength,
    moveWallItem, changeItemWall, swapWallFace,
    rotateItem, resizeItem, recolorItem,
    setPaneConfig, adjustWindowSize,
    toggleOwned, toggleLocked, deleteItem,
  } = useItemActions({
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
  })

  const cloudSave = useCloudSave({
    user, gridW, gridD, wallHeight, cells, items, cart,
    floorColor, wallColor, bgColor, musicStation, lightMood, roomNames,
    allRooms, currentRoomId,
  })

  const handleLoadRoom = useCallback(async (roomId) => {
    const { data, error } = await cloudSave.loadRoom(roomId)
    if (error || !data) return
    setGridW(data.gridW); setGridD(data.gridD)
    if (data.wallHeight) setWallHeight(data.wallHeight)
    setCells(new Set(data.cells))
    setItems(data.items ?? [])
    setCart(data.cart ?? [])
    if (data.floorColor) setFloorColor(data.floorColor)
    if (data.wallColor)  setWallColor(data.wallColor)
    if (data.bgColor)    setBgColor(data.bgColor)
    if (data.musicStation !== undefined) setMusicStation(data.musicStation)
    if (data.lightMood)  setLightMood(data.lightMood)
    if (data.roomNames)  setRoomNamesState(data.roomNames)
    if (data.allRooms) {
      const restored = Object.fromEntries(
        Object.entries(data.allRooms).map(([id, room]) => [id, { ...room, cells: new Set(room.cells) }])
      )
      setAllRooms(restored)
    }
    if (data.items?.length > 0) nextItemIdRef.current = Math.max(...data.items.map(it => it.id)) + 1
    setSelectedId(null)
    setCloudRoomId(roomId)
    setLoadModalOpen(false)
  }, [cloudSave]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shop builder mode: load existing layout + save helpers ───────
  const [shopSaving,   setShopSaving]   = useState(false)
  const [wispyGreeting, setWispyGreeting] = useState(null) // null = use DB default

  useEffect(() => {
    if (!shopBuilderSellerId) return
    supabase
      .from('seller_shops')
      .select('layout, wispy_greeting')
      .eq('seller_id', shopBuilderSellerId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.wispy_greeting) setWispyGreeting(data.wispy_greeting)
        const d = data.layout
        if (!d) return
        if (d.gridW)  setGridW(d.gridW)
        if (d.gridD)  setGridD(d.gridD)
        if (d.wallHeight) setWallHeight(d.wallHeight)
        if (d.cells)  setCells(new Set(d.cells))
        if (d.items)  setItems(d.items)
        if (d.floorColor) setFloorColor(d.floorColor)
        if (d.wallColor)  setWallColor(d.wallColor)
        if (d.bgColor)    setBgColor(d.bgColor)
        if (d.lightMood)  setLightMood(d.lightMood)
        if (d.items?.length > 0)
          nextItemIdRef.current = Math.max(...d.items.map(it => it.id)) + 1
        setSelectedId(null)
      })
  }, [shopBuilderSellerId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveShopLayout = useCallback(async () => {
    if (!shopBuilderSellerId || shopSaving) return
    setShopSaving(true)
    const layout = {
      version: 1, gridW, gridD, wallHeight,
      cells: [...cells], items, floorColor, wallColor, bgColor, lightMood,
    }
    await supabase.from('seller_shops').upsert({
      seller_id: shopBuilderSellerId, layout,
      updated_at: new Date().toISOString(),
    })
    setShopSaving(false)
  }, [shopBuilderSellerId, shopSaving, gridW, gridD, wallHeight, cells, items, floorColor, wallColor, bgColor, lightMood])

  const {
    enterRoom, confirmNewRoom, linkDoorToRoom, goBack, jumpToRoom,
    unlinkDoors, deleteRoom, addRoom, addDoor, addExteriorDoor, updateRoomShape, addStairs,
  } = useRoomNavigation({
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
  })

  // ── Floor plan editing ───────────────────────────────────────────
  const toggleCell = useCallback((col, row) => {
    const key = `${col},${row}`
    setCells(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  useEffect(() => {
    setItems(prev => {
      let changed = false
      const next = prev.map(item => {
        if (!item.wall) return item
        const faces = getParallelWallFaces(item.wall, item.wallU, cells, gridW, gridD)
        if (faces.length === 0) return item
        if (item.wallAnchor !== undefined && !faces.includes(item.wallAnchor)) {
          changed = true
          return { ...item, wallAnchor: faces[0] }
        }
        return item
      })
      return changed ? next : prev
    })
  }, [cells, gridW, gridD]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyGrid = useCallback((w, d) => {
    setGridW(w); setGridD(d); setCells(makeGrid(w, d))
    setItems(prev => prev.map(it => {
      if (!it.wall) return it
      const def     = catalogue[it.typeKey] ?? ITEM_CATALOGUE[it.typeKey]
      const size    = def?.sizes?.[it.sizeIndex] ?? def?.sizes?.[0]
      const fw      = size?.footprint?.[0] ?? 1
      const wallLen = (it.wall === 'N' || it.wall === 'S') ? w : d
      const wallU   = Math.max(fw / 2, Math.min(wallLen - fw / 2, it.wallU ?? wallLen / 2))
      const anchor  = it.wall === 'N' ? 0 : it.wall === 'S' ? d - 1 : it.wall === 'W' ? 0 : w - 1
      return { ...it, wallU, wallAnchor: anchor }
    }))
  }, [])

  // ── History bookmark (in-memory, not persisted) ──────────────────
  const saveBookmark = useCallback(() => {
    setBookmark({ gridW, gridD, cells: new Set(cells), items: [...items], cart: [...cart], floorColor, wallColor })
  }, [gridW, gridD, cells, items, cart, floorColor, wallColor])

  const restoreBookmark = useCallback(() => {
    if (!bookmark) return
    setGridW(bookmark.gridW); setGridD(bookmark.gridD)
    setCells(new Set(bookmark.cells)); setItems([...bookmark.items])
    setCart([...bookmark.cart])
    setFloorColor(bookmark.floorColor); setWallColor(bookmark.wallColor)
    setSelectedId(null)
  }, [bookmark, setCart])

  // ── Stripe redirect handler ──────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('checkout')
    if (status === 'success') {
      setCart([])
      setDrawerTab('shop')
      setOrderSuccess(true)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (status === 'cancelled') {
      setDrawerOpen(true)
      setDrawerTab('cart')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drawer zoom nudge ────────────────────────────────────────────
  useEffect(() => {
    const target = drawerOpen
      ? Math.max(15, zoomRef.current * 0.88)
      : Math.min(120, zoomRef.current / 0.88)
    const prev = zoomRef.current
    zoomRef.current = target
    const t = setTimeout(() => { zoomRef.current = prev }, 600)
    return () => clearTimeout(t)
  }, [drawerOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Selection-dependent helpers ──────────────────────────────────
  const selectedItem = items.find(it => it.id === selectedId) ?? null

  const placeAndWishlist = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0) => {
    placeItem(typeKey, sizeIndex, swatchIndex, true)
  }, [placeItem])

  const handleModalAddToCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    addToCart(typeKey, sizeIndex, swatchIndex)
    const inRoom = items.some(
      it => it.typeKey === typeKey && it.sizeIndex === sizeIndex && it.swatchIndex === swatchIndex
    )
    if (!inRoom || window.confirm(`You already have a ${ITEM_CATALOGUE[typeKey]?.label} in your room. Add another copy to the room?`)) {
      placeItem(typeKey, sizeIndex, swatchIndex)
    }
  }, [items, addToCart, placeItem])

  const resizeSelectedItem = useCallback((newSizeIndex) => {
    if (!selectedItem || newSizeIndex === selectedItem.sizeIndex) return
    const cartMatch = cart.find(
      c => c.typeKey === selectedItem.typeKey && c.swatchIndex === selectedItem.swatchIndex
    )
    if (cartMatch && cartMatch.sizeIndex !== newSizeIndex) {
      const def  = ITEM_CATALOGUE[selectedItem.typeKey]
      const from = def.sizes[cartMatch.sizeIndex].label
      const to   = def.sizes[newSizeIndex].label
      if (!window.confirm(`Changing from "${from}" to "${to}" will also update this item in your cart.\n\nAdditional charges may apply. Continue?`)) return
      setCart(prev => prev.map(c =>
        c.typeKey === selectedItem.typeKey && c.swatchIndex === selectedItem.swatchIndex
          ? { ...c, sizeIndex: newSizeIndex } : c
      ))
    }
    resizeItem(selectedItem.id, newSizeIndex)
  }, [selectedItem, cart, setCart, resizeItem])

  const recolorSelectedItem = useCallback((newSwatchIndex) => {
    if (!selectedItem || newSwatchIndex === selectedItem.swatchIndex) return
    const cartMatch = cart.find(
      c => c.typeKey === selectedItem.typeKey && c.sizeIndex === selectedItem.sizeIndex
    )
    if (cartMatch && cartMatch.swatchIndex !== newSwatchIndex) {
      const def  = ITEM_CATALOGUE[selectedItem.typeKey]
      const from = def.swatches[cartMatch.swatchIndex].name
      const to   = def.swatches[newSwatchIndex].name
      if (!window.confirm(`Changing color from "${from}" to "${to}" will also update this item in your cart.\n\nAdditional charges may apply. Continue?`)) return
      setCart(prev => prev.map(c =>
        c.typeKey === selectedItem.typeKey && c.sizeIndex === selectedItem.sizeIndex
          ? { ...c, swatchIndex: newSwatchIndex } : c
      ))
    }
    recolorItem(selectedItem.id, newSwatchIndex)
  }, [selectedItem, cart, setCart, recolorItem])

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
    const group = items.filter(it =>
      it.typeKey    === selectedItem.typeKey &&
      it.sizeIndex  === selectedItem.sizeIndex &&
      it.swatchIndex === selectedItem.swatchIndex
    )
    const last = group.reduce((max, it) => it.id > max.id ? it : max)
    deleteItem(last.id)
  }, [selectedItem, selectedGroupQty, items, deleteItem])

  // ── Overview memos ───────────────────────────────────────────────
  const allRoomsData = useMemo(() => {
    const currentSnap = { gridW, gridD, cells, items, wallHeight, floorColor, wallColor }
    return { ...allRooms, [currentRoomId]: currentSnap }
  }, [allRooms, currentRoomId, gridW, gridD, cells, items, wallHeight, floorColor, wallColor])

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

  const hasLightFixtures = items.some(it => ITEM_CATALOGUE[it.typeKey]?.category === 'Lighting')

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ ...s.app, display: 'flex', flexDirection: 'row', overflow: 'hidden', height: '100vh', position: 'fixed', inset: 0 }}>
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
          lightsOff={lightsOff}
          catalogue={catalogue}
        />
      </Canvas>

      <RoomBanner
        currentRoomId={currentRoomId}
        roomName={getRoomName(currentRoomId)}
        allRoomsData={allRoomsData}
        roomNames={roomNames}
        onOpenOverview={() => setOverviewOpen(true)}
        onNavigate={jumpToRoom}
        onRename={setRoomName}
      />

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
          catalogue={catalogue}
          onPlace={placeItem}
          onAddToCart={handleModalAddToCart}
          onWishlist={placeAndWishlist}
          onClose={() => setActiveModal(null)}
          onOpenModal={setActiveModal}
        />
      )}

      {selectedItem && (
        <SelectedControls
          item={selectedItem}
          catalogue={catalogue}
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
        <div style={s.ceilingBanner}>
          <span style={s.ceilingBannerText}>
            Click a ceiling cell to place {ITEM_CATALOGUE[ceilingPicker.typeKey].label}
          </span>
          <button style={s.ceilingBannerCancel}
            onClick={() => { setCeilingPicker(null); setCeilingView(false) }}>
            Cancel
          </button>
        </div>
      )}

      {authModalOpen    && <AuthModal    onClose={() => setAuthModalOpen(false)} />}
      {accountModalOpen && <AccountModal onClose={() => setAccountModalOpen(false)} onLoadRoom={handleLoadRoom} />}
      {communityOpen && <CommunityFeed onClose={() => setCommunityOpen(false)} />}
      {checkoutOpen  && <CheckoutModal cart={cart} catalogue={catalogue} onClose={() => setCheckoutOpen(false)} />}
      {orderSuccess  && <OrderSuccessBanner onClose={() => setOrderSuccess(false)} />}
      {wispyMessage  && <Wispy message={wispyMessage} onDismiss={dismissWispy} />}
      {shopBuilderSellerId && (
        <WispyCashier greeting={wispyGreeting ?? 'Welcome to my shop! ☁'} />
      )}

      {saveModalOpen && (
        <SaveRoomModal
          existingName={cloudRoomId ? cloudSave.rooms.find(r => r.id === cloudRoomId)?.name : ''}
          saving={cloudSave.saving}
          onClose={() => setSaveModalOpen(false)}
          onSave={async (name) => {
            const { error } = cloudRoomId
              ? await cloudSave.updateRoom(cloudRoomId, name)
              : await cloudSave.saveRoom(name)
            if (!error) { setSaveModalOpen(false); cloudSave.fetchRooms() }
            return { error }
          }}
        />
      )}

      {loadModalOpen && (
        <LoadRoomModal
          rooms={cloudSave.rooms}
          loading={cloudSave.loading}
          onFetch={cloudSave.fetchRooms}
          onClose={() => setLoadModalOpen(false)}
          onDelete={cloudSave.deleteRoom}
          onLoad={handleLoadRoom}
        />
      )}

      {musicOpen && (
        <MusicPanel
          station={musicStation}
          onStation={setMusicStation}
          onClose={() => setMusicOpen(false)}
          drawerOpen={drawerOpen}
        />
      )}

      <div style={s.leftColumn}>
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
            onCloudSave={() => user ? setSaveModalOpen(true) : setAuthModalOpen(true)}
            onCloudLoad={() => user ? setLoadModalOpen(true) : setAuthModalOpen(true)}
            isSignedIn={!!user}
            screenshotRef={screenshotRef}
          />
        )}

        <div style={s.bottomBar}>
          {shopBuilderSellerId && (
            <button
              style={{ ...s.bottomBtn, borderColor: '#3a8a5a', color: '#a0ffcc', background: '#1a3a2a' }}
              onClick={saveShopLayout}
            >{shopSaving ? '…' : '💾'}{compact ? '' : (shopSaving ? ' Saving' : ' Save Shop')}</button>
          )}
          {shopBuilderSellerId && (
            <button
              style={{ ...s.bottomBtn, borderColor: '#7a5a9a', color: '#d0b0ff', background: '#2a1a3a' }}
              onClick={() => window.close()}
            >✕{compact ? '' : ' Exit Builder'}</button>
          )}
          {roomStack.length > 0 && (
            <button style={{ ...s.bottomBtn, borderColor: '#6090ff', color: '#a0c0ff' }} onClick={goBack}>
              ← Back
            </button>
          )}
          <button
            style={{ ...s.bottomBtn, ...(drawerOpen ? s.bottomBtnActive : {}) }}
            onClick={() => setDrawerOpen(v => !v)}
          >{drawerOpen ? '✕' : '🛍'}{compact ? '' : ' Shop'}</button>
          <button
            style={{ ...s.bottomBtn, ...(hubOpen ? s.bottomBtnActive : {}) }}
            onClick={() => setHubOpen(v => !v)}
          >{hubOpen ? '✕' : '🛠'}{compact ? '' : ' Tools'}</button>
          <button
            style={{ ...s.bottomBtn, ...(musicOpen ? s.bottomBtnActive : {}) }}
            onClick={() => setMusicOpen(v => !v)}
          >🎵</button>
          <button
            style={{ ...s.bottomBtn, ...(lightsOff ? s.bottomBtnActive : {}), ...(hasLightFixtures ? {} : { opacity: 0.35, cursor: 'default' }) }}
            onClick={() => hasLightFixtures && setLightsOff(v => !v)}
            title={!hasLightFixtures ? 'Place a lamp or ceiling light first' : lightsOff ? 'Lights on' : 'Lights off'}
          >{lightsOff ? '☀' : '💡'}</button>
          <BuilderMoodPicker />
          <NotificationBell btnStyle={s.bottomBtn} />
          <button
            style={{ ...s.bottomBtn, ...(wispyMessage ? s.bottomBtnActive : {}) }}
            onClick={showWispy}
            title="Wispy"
          >☁</button>
          <button
            style={{ ...s.bottomBtn, ...(communityOpen ? s.bottomBtnActive : {}) }}
            onClick={() => setCommunityOpen(v => !v)}
            title="Community"
          >🌐</button>
          <button style={s.bottomBtn}
            onClick={() => user ? setAccountModalOpen(true) : setAuthModalOpen(true)}
            title={user ? user.email : 'Sign in'}>
            {user ? '👤' : '🔑'}
          </button>
          <button style={s.bottomBtn} onClick={() => setTarget(r => r - Math.PI / 2)}>↻</button>
          <button
            style={{ ...s.bottomBtn, ...(ceilingView ? s.bottomBtnActive : {}) }}
            onClick={() => { setCeilingView(v => !v); setCeilingPicker(null) }}
            title={ceilingView ? 'Floor view' : 'Ceiling view'}
          >{ceilingView ? '▾ Floor' : '▴ Ceiling'}</button>
          <button style={s.bottomBtn} onClick={() => setTarget(r => r + Math.PI / 2)}>↺</button>
          {cartCount > 0 && (
            <button
              style={{ ...s.bottomBtn, ...s.bottomCartBtn }}
              onClick={() => { setDrawerOpen(true); setDrawerTab('cart') }}
            >🛒 <span style={s.cartBadge}>{cartCount}</span></button>
          )}
        </div>
      </div>
      </div>
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
            catalogue={shopPanelCatalogue}
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
            onCheckout={() => setCheckoutOpen(true)}
            drawerWidth={drawerWidth}
            roomItemKeys={roomItemKeys}
            ownedKeys={ownedKeys}
          />
        </div>
      </div>
    </div>
  )
}
