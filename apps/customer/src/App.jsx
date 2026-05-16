import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import RoomScene from './scene/RoomScene'
import CloudConveyorPuffs from './scene/CloudConveyorPuffs'
import CloudConveyorDrift from './scene/CloudConveyorDrift'
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
import { MusicPlayerProvider, useMusicPlayer } from './contexts/MusicPlayerContext'
import TopMusicButton from './ui/TopMusicButton'
import MusicPlayerBar from './ui/MusicPlayerBar'
import MusicPlayerSidebar from './ui/MusicPlayerSidebar'
import MusicPlayerFloating from './ui/MusicPlayerFloating'
import { SideTabProvider, dispatchTogglePanel, dispatchOpenPanel } from './contexts/SideTabContext'
import SideTabStrip from './ui/SideTabStrip'
import DockablePanel from './ui/DockablePanel'
import MusicTabPanel from './ui/MusicTabPanel'
import PlaceTabPanel from './ui/PlaceTabPanel'
import SocialTabPanel from './ui/SocialTabPanel'
import PlanTabPanel from './ui/PlanTabPanel'
import ViewTabPanel from './ui/ViewTabPanel'
import BuildTabPanel from './ui/BuildTabPanel'
import BottomTabCluster from './ui/BottomTabCluster'
import TopRightCluster from './ui/TopRightCluster'
import { useIsDragging } from './contexts/dragSignal'
import { useShopRail, openShop, closeShop, toggleShop } from './contexts/shopRailSignal'
import { Lightbulb, LightbulbOff } from 'lucide-react'
import AuthModal from './ui/AuthModal'
import AccountModal from './ui/AccountModal'
import SaveRoomModal from './ui/SaveRoomModal'
import LoadRoomModal from './ui/LoadRoomModal'
import useCloudSave from './hooks/useCloudSave'
import CheckoutModal from './ui/CheckoutModal'
import OrderSuccessBanner from './ui/OrderSuccessBanner'
import Wispy from './ui/Wispy'
import useWispy from './hooks/useWispy'
import useWaitingInventory from './hooks/useWaitingInventory'
import WispyCashier from './ui/WispyCashier'
import useSellerCatalogue from './hooks/useSellerCatalogue'
import useProductAnalytics from './hooks/useProductAnalytics'
import LandingPage from './pages/LandingPage'
import LandingPageV1 from './pages/_archive/LandingPageV1'
import WispyPreview from './pages/WispyPreview'
import OrderHistoryPage from './pages/OrderHistoryPage'
import CommunityFeed from './pages/CommunityFeed'
import ContestsPage from './pages/ContestsPage'
import ProfilePage from './pages/ProfilePage'
import MarketplacePage from './pages/MarketplacePage'
import BuilderMoodPicker from './ui/BuilderMoodPicker'
import SkyBackdrop from './scene/SkyBackdrop'
import FeedbackButton from './ui/FeedbackButton'
import ExploreBanner from './ui/ExploreBanner'
import WaitingInventoryAlert from './ui/WaitingInventoryAlert'
import ShareToCommunityModal from './ui/ShareToCommunityModal'
import CommunityApp from './pages/CommunityApp'
import QuizPage from './ui/onboarding/QuizPage'
import NotificationBell from './ui/NotificationBell'
import { useMoodControl } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import { MOOD_TO_TAGS } from '@shared/moodTags'
import { supabase } from '@shared/supabase'
import { WispyProvider } from '@shared/wispy'
import { syncCurationFromSupabase } from './scene/cloudDrapes'

const DEFAULT_wallHeight = 8
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isUUID = (s) => typeof s === 'string' && UUID_RE.test(s)

function loadSaved() {
  try {
    const raw = localStorage.getItem('room-builder-v1')
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.version === 1 ? data : null
  } catch { return null }
}

export default function App() {
  // Pull shared scene-curation (drape anchors, exclusion lists, flat-bottom
  // clouds) from Supabase on every boot so the deployed app picks up edits
  // made in /asset-picker.html or /clouds-picker.html without redeploys.
  // Writes to localStorage; cloudDrapes' DRAPE_POOL already initialized from
  // the previous boot's localStorage, so changes show up next reload — fine
  // for a dev curation flow.
  useEffect(() => {
    syncCurationFromSupabase(supabase)
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider appKey="customer">
        <MusicPlayerProvider appKey="customer">
          <WispyProvider>
            <Gate />
            <GlobalMusicWidgets />
          </WispyProvider>
        </MusicPlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Mounts the music UI globally so it follows the user across builder, community,
// marketplace, contests, etc. Variant 'none' means the music UI is owned by
// another surface (currently: the builder's Music side-tab) — the global
// floating widget + top button stay hidden to avoid duplicate controls.
function GlobalMusicWidgets() {
  const { widgetOpen, widgetVariant } = useMusicPlayer()
  if (widgetVariant === 'none') return null
  if (!widgetOpen) return <TopMusicButton />
  return (
    <>
      <TopMusicButton />
      {widgetVariant === 'sidebar'  && <MusicPlayerSidebar />}
      {widgetVariant === 'floating' && <MusicPlayerFloating />}
      {widgetVariant === 'bar'      && <MusicPlayerBar />}
    </>
  )
}

function Gate() {
  const params                     = new URLSearchParams(window.location.search)
  const isCheckoutRedirect         = params.get('checkout') != null
  const shopBuilderSellerId        = params.get('shopBuilder') === 'true' ? params.get('sellerId') : null
  const exploreRoomId              = params.get('exploreRoom') || null
  const [inBuilder, setInBuilder]  = useState(isCheckoutRedirect || !!shopBuilderSellerId || !!exploreRoomId)
  const [inMarketplace, setInMarketplace] = useState(params.get('shop') === '1')
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
  if (params.get('legacy') === 'v1') return <LandingPageV1 onEnter={() => setInBuilder(true)} onBrowseShop={() => setInMarketplace(true)} />
  if (window.location.pathname.startsWith('/community')) return <CommunityApp />

  let page
  if (params.get('orders') === '1') page = <OrderHistoryPage onBack={() => { window.location.search = '' }} />
  else if (params.get('profile')) page = <ProfilePage userId={params.get('profile')} onEnterBuilder={() => setInBuilder(true)} />
  else if (inBuilder) page = <AppInner shopBuilderSellerId={shopBuilderSellerId} exploreRoomId={exploreRoomId} />
  else if (inMarketplace) page = <MarketplacePage onEnterBuilder={() => { setInMarketplace(false); setInBuilder(true) }} onBack={() => setInMarketplace(false)} />
  else if (!quizDone) page = <QuizPage onComplete={completeQuiz} onSkip={skipQuiz} />
  else page = <LandingPage onEnter={() => setInBuilder(true)} onBrowseShop={() => setInMarketplace(true)} />

  return <>{page}<FeedbackButton /></>
}

function AppInner({ shopBuilderSellerId = null, exploreRoomId = null }) {
  const t = useTheme()
  const s = useBuilderStyles()

  // Builder mounts the music player inside the Music side-tab (M8). Hide the
  // global TopMusicButton + floating widget so we don't duplicate controls.
  const { setWidgetVariant } = useMusicPlayer()
  useEffect(() => {
    setWidgetVariant('none')
    return () => setWidgetVariant('bar')
  }, [setWidgetVariant])

  // Pause the 3D scene's render loop while a panel is being dragged. The
  // canvas keeps showing the last frame; raindrops / clouds freeze briefly.
  // This frees the GPU so panel transforms hit the display refresh cleanly.
  const isDragging = useIsDragging()

  // Shop is a static right-rail (not a dockable panel) — opened from the
  // Place tab's "Open Shop" button or the bottom-bar shortcuts.
  const shopOpen = useShopRail()
  const catalogue       = useShopProducts()
  const sellerCatalogue = useSellerCatalogue(shopBuilderSellerId)
  const { trackInterest, trackIntent } = useProductAnalytics()
  // In shop builder mode the shop panel shows only the seller's products.
  // Room rendering (Items, SelectedControls) uses the full catalogue so any
  // static items already in the layout still render correctly.
  const shopPanelCatalogue = shopBuilderSellerId ? (sellerCatalogue ?? {}) : catalogue
  const [initSave] = useState(loadSaved)
  const [lightsOff, setLightsOff] = useState(false)
  const [cloudsOn, setCloudsOn] = useState(() => localStorage.getItem('ddd_clouds') !== '0')
  const [cloudVariant, setCloudVariant] = useState(() => localStorage.getItem('ddd_cloud_variant') || 'bands')
  // Dev: cycle every cloud through the Easter-egg shape pool so the user can
  // audit + tune cloudShapes.js manifest. Off by default.
  const [forceEasterEggs, setForceEasterEggs] = useState(false)

  // Defer cloud rendering until after the room canvas + items have a chance
  // to render and settle. Clouds are visually secondary; loading them first
  // would steal GPU/CPU from the room geometry which the user actually
  // interacts with. Wait for browser idle (or 800ms fallback).
  const [cloudsReady, setCloudsReady] = useState(false)
  useEffect(() => {
    const onIdle = () => setCloudsReady(true)
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(onIdle, { timeout: 1500 })
      return () => window.cancelIdleCallback?.(handle)
    }
    const t = setTimeout(onIdle, 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        const next = cloudVariant === 'drift' ? 'puffs' : 'drift'
        setCloudVariant(next)
        localStorage.setItem('ddd_cloud_variant', next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cloudVariant])

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

  // Explore mode + waiting inventory
  const [exploreData, setExploreData] = useState(null) // { post, designer } when exploring
  const isExploring = !!exploreRoomId
  const waitingInventory = useWaitingInventory()
  const [showWaitingAlert, setShowWaitingAlert] = useState(false)

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
  const [contestsOpen,     setContestsOpen]     = useState(false)
  const [saveModalOpen,   setSaveModalOpen]   = useState(false)
  const [loadModalOpen,   setLoadModalOpen]   = useState(false)
  const [cloudRoomId,     setCloudRoomId]     = useState(null) // id of the last saved cloud room (for overwrite)
  const [checkoutOpen,    setCheckoutOpen]    = useState(false)
  const [shareToCommunityOpen, setShareToCommunityOpen] = useState(false)
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

  // Load explore room if exploreRoomId set
  useEffect(() => {
    if (!exploreRoomId) return
    let cancelled = false
    ;(async () => {
      const { data: post } = await supabase
        .from('community_posts')
        .select('id, title, room_id, mood, music_station, profiles(display_name)')
        .eq('id', exploreRoomId).maybeSingle()
      if (cancelled || !post) return
      setExploreData({ post, designer: post.profiles?.display_name ?? 'Designer' })
      if (post.room_id) {
        const { data: roomRow } = await supabase
          .from('saved_rooms').select('data').eq('id', post.room_id).maybeSingle()
        if (cancelled || !roomRow?.data) return
        const d = roomRow.data
        if (d.gridW)  setGridW(d.gridW)
        if (d.gridD)  setGridD(d.gridD)
        if (d.wallHeight) setWallHeight(d.wallHeight)
        if (d.cells)  setCells(new Set(d.cells))
        if (d.items)  setItems(d.items)
        if (d.floorColor) setFloorColor(d.floorColor)
        if (d.wallColor)  setWallColor(d.wallColor)
      }
    })()
    return () => { cancelled = true }
  }, [exploreRoomId])

  // Show waiting inventory alert if user has unseen items and is in their own builder (not exploring)
  useEffect(() => {
    if (isExploring || shopBuilderSellerId) return
    if (waitingInventory.unseenCount > 0) setShowWaitingAlert(true)
  }, [isExploring, shopBuilderSellerId, waitingInventory.unseenCount])

  const handleLoadRoom = useCallback(async (roomId) => {
    // Guard against silently destroying unsaved work. Confirm before loading.
    const proceed = window.confirm(
      'Loading will replace your current room. ' +
      'If you haven\'t saved your current room yet, please save it first.\n\n' +
      'Click OK to load and discard the current room, or Cancel to go back.'
    )
    if (!proceed) return
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
      setDrawerTab('cart')
      openShop()
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

  // Analytics: track when product detail modal opens (intent level 2)
  const openProductModal = useCallback((typeKey) => {
    setActiveModal(typeKey)
    if (typeKey && isUUID(typeKey)) trackInterest(typeKey)
  }, [trackInterest])

  const placeAndWishlist = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0) => {
    placeItem(typeKey, sizeIndex, swatchIndex, true)
    if (isUUID(typeKey)) trackIntent('add_to_wishlist', typeKey)
  }, [placeItem, trackIntent])

  const handleModalAddToCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    addToCart(typeKey, sizeIndex, swatchIndex)
    if (isUUID(typeKey)) trackIntent('add_to_cart', typeKey)
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
    <SideTabProvider>
    <div className="ember-clear" style={{ ...s.app, display: 'flex', flexDirection: 'row', overflow: 'hidden', height: '100vh', position: 'fixed', inset: 0 }}>
      <div style={{ flex: 1, position: 'relative', height: '100%', minWidth: 0, overflow: 'hidden' }}>
      {/* Sky backdrop — behind the transparent canvas */}
      <SkyBackdrop />

      {cloudsOn && cloudsReady && (cloudVariant === 'drift'
        ? <CloudConveyorDrift key={forceEasterEggs ? 'eggs' : 'normal'} forceEasterEggs={forceEasterEggs} />
        : <CloudConveyorPuffs key={forceEasterEggs ? 'eggs' : 'normal'} forceEasterEggs={forceEasterEggs} />
      )}


      {/* Brand logo — top left. Sized to anchor the page; music tab sits closely below */}
      <div style={{ position: 'absolute', top: 10, left: 14, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none', opacity: 0.95 }}>
        <Logo size={52} color={t.accent} />
        <span style={{ fontSize: 22, fontWeight: 700, color: t.panelText, letterSpacing: '0.3px', fontFamily: "'Outfit', system-ui, sans-serif", textShadow: 'none', WebkitTextStroke: 0 }}>DaydreamDwelling</span>
      </div>
      <Canvas orthographic shadows="percentage" gl={{ preserveDrawingBuffer: true, alpha: true }} frameloop={isDragging ? 'never' : 'always'} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
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
          onDoubleClickItem={openProductModal}
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
          cloudsOn={cloudsOn}
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
      {/* Lights — centered beneath the RoomBanner. Acts as the room's
          lightswitch; disabled until a lamp is placed. */}
      <button
        onClick={() => hasLightFixtures && setLightsOff(v => !v)}
        disabled={!hasLightFixtures}
        title={!hasLightFixtures ? 'Place a lamp to enable' : (lightsOff ? 'Turn lights on' : 'Turn lights off')}
        className="ember-clear"
        style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 22,
          padding: '7px 14px', borderRadius: 18,
          border: `1px solid ${lightsOff ? '#ffc87a55' : `${t.accent}40`}`,
          background: lightsOff ? 'rgba(255,200,122,0.18)' : 'rgba(15,12,30,0.6)',
          color: '#f0eaff',
          cursor: hasLightFixtures ? 'pointer' : 'default',
          opacity: hasLightFixtures ? 1 : 0.5,
          fontSize: 12, fontWeight: 700,
          fontFamily: "'Outfit', system-ui, sans-serif",
          letterSpacing: '0.3px',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {lightsOff ? <LightbulbOff size={15} strokeWidth={2.2} /> : <Lightbulb size={15} strokeWidth={2.2} />}
        {lightsOff ? 'Lights Off' : 'Lights On'}
      </button>

      <TopRightCluster
        shopOpen={shopOpen}
        cartCount={cartCount}
        onShop={() => { setDrawerTab('shop'); shopOpen ? closeShop() : openShop() }}
        onWishlist={() => { setDrawerTab('wishlist'); openShop() }}
        onCart={() => { setDrawerTab('cart'); openShop() }}
        onMarketplace={() => { window.location.href = '/?shop=1' }}
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
          onOpenModal={openProductModal}
        />
      )}

      {selectedItem && (
        <SelectedControls
          item={selectedItem}
          catalogue={catalogue}
          drawerOpen={drawerOpen}
          roomRotation={targetRotation}
          onShowDetails={() => openProductModal(selectedItem.typeKey)}
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
      {contestsOpen && <ContestsPage onClose={() => setContestsOpen(false)} roomItems={items} catalogue={catalogue} cloudRoomId={cloudRoomId} />}
      {checkoutOpen  && <CheckoutModal cart={cart} catalogue={catalogue} onClose={() => setCheckoutOpen(false)} />}
      {shareToCommunityOpen && <ShareToCommunityModal onClose={() => setShareToCommunityOpen(false)} screenshotRef={screenshotRef} musicStation={musicStation} cloudRoomId={cloudRoomId} />}
      {orderSuccess  && <OrderSuccessBanner onClose={() => setOrderSuccess(false)} />}
      {wispyMessage  && <Wispy message={wispyMessage} onDismiss={dismissWispy} />}
      {isExploring && exploreData && (
        <ExploreBanner exploreData={exploreData} waitingCount={waitingInventory.count}
          onExit={() => {
            const from = new URLSearchParams(window.location.search).get('fromCommunity')
            window.location.href = from ? `/community/room/${exploreData.post.id}` : window.location.pathname
          }} />
      )}
      {showWaitingAlert && !isExploring && (
        <WaitingInventoryAlert items={waitingInventory.items}
          onClose={() => { setShowWaitingAlert(false); waitingInventory.markSeen() }}
          onAddAllToCart={() => {
            waitingInventory.items.forEach(it => addToCart(it.typeKey, it.swatchIndex || 0, it.sizeIndex || 0))
            waitingInventory.clearAll(); setShowWaitingAlert(false)
          }}
          onAddAllToWishlist={() => {
            waitingInventory.items.forEach(it => toggleWishlist(it.typeKey))
            waitingInventory.clearAll(); setShowWaitingAlert(false)
          }}
          onClear={() => { waitingInventory.clearAll(); setShowWaitingAlert(false) }}
        />
      )}
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
            onShareToCommunity={() => user ? setShareToCommunityOpen(true) : setAuthModalOpen(true)}
          />
        )}

        <div style={s.bottomBar}>
          {/* ── Shop builder mode ── */}
          {shopBuilderSellerId && (
            <button style={{ ...s.bottomBtn, borderColor: '#3a8a5a', color: '#a0ffcc', background: '#1a3a2a' }} onClick={saveShopLayout}>
              {shopSaving ? '…' : '💾'}{compact ? '' : (shopSaving ? ' Saving' : ' Save')}
            </button>
          )}
          {shopBuilderSellerId && (
            <button style={{ ...s.bottomBtn, borderColor: '#7a5a9a', color: '#d0b0ff', background: '#2a1a3a' }} onClick={() => window.close()}>
              ✕{compact ? '' : ' Exit'}
            </button>
          )}
          {roomStack.length > 0 && <button style={{ ...s.bottomBtn, borderColor: '#6090ff', color: '#a0c0ff' }} onClick={goBack}>←</button>}

          {/* All builder controls (panels, music, view, room) moved to side
              tabs / top buttons. Bottom bar keeps only context-specific
              utilities below: nested-room back, explore-mode save, waiting
              inventory, cart. */}

          {/* Explore-mode save button */}
          {isExploring && selectedItem && (
            <button
              style={{ ...s.bottomBtn, background: `${t.accent}25`, borderColor: t.accent, color: t.accent, fontWeight: 700 }}
              onClick={() => {
                const def = ITEM_CATALOGUE[selectedItem.typeKey]
                waitingInventory.addItem({
                  typeKey: selectedItem.typeKey,
                  swatchIndex: selectedItem.swatchIndex,
                  sizeIndex: selectedItem.sizeIndex,
                  label: def?.label ?? selectedItem.typeKey,
                  action: 'place',
                  fromRoomTitle: exploreData?.post?.title,
                  fromDesigner: exploreData?.designer,
                })
              }}
              title="Save this item to your inventory"
            >+ Save</button>
          )}

          {/* Persistent waiting-inventory badge */}
          {!isExploring && !showWaitingAlert && waitingInventory.count > 0 && (
            <button
              style={{ ...s.bottomBtn, background: `${t.accent}15`, borderColor: t.accent, color: t.accent, position: 'relative' }}
              onClick={() => setShowWaitingAlert(true)}
              title={`${waitingInventory.count} items waiting from explored rooms`}
            >!
              <span style={{ position: 'absolute', top: -4, right: -4, background: t.accent, color: t.accentText, borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {waitingInventory.count}
              </span>
            </button>
          )}

          {/* Social/account/notifications moved to Social tab + bottom-left cluster.
              Shop / Wishlist / Cart / Marketplace moved to TopRightCluster. */}
        </div>
      </div>
      </div>
      {/* Static Shop right-rail. Slides in from the right with the same
          transition the legacy drawer used. Width is 0 when closed. */}
      <div style={{
        width: shopOpen ? drawerWidth : 0,
        flexShrink: 0, height: '100%',
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ width: drawerWidth, height: '100%' }}>
          <ShopDrawer
            open={shopOpen}
            activeTab={drawerTab}
            onTabChange={setDrawerTab}
            onPlace={placeItem}
            onOpenModal={openProductModal}
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
            onClose={closeShop}
          />
        </div>
      </div>
    </div>
    {/* M8 strip + dockable panels (Music / Build / Place / Style / Plan / View / Social) */}
    <SideTabStrip />
    <DockablePanel tabId="music"><MusicTabPanel /></DockablePanel>
    <DockablePanel tabId="build">
      <BuildTabPanel
        onWindow={() => setWindowPickerOpen(true)}
        onDoor={() => setDoorPickerOpen(true)}
      />
    </DockablePanel>
    <DockablePanel tabId="place" width={320} maxHeight="78vh">
      <PlaceTabPanel
        ownedKeys={ownedKeys}
        roomItemKeys={roomItemKeys}
        wishlistedItems={wishlistedItems}
        catalogue={shopPanelCatalogue}
        items={items}
        onPlace={placeItem}
        onOpenModal={openProductModal}
        onSelectItem={setSelectedId}
      />
    </DockablePanel>
    <DockablePanel tabId="plan">
      <PlanTabPanel
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen(v => !v)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onCloudSave={() => user ? setSaveModalOpen(true) : setAuthModalOpen(true)}
        onCloudLoad={() => user ? setLoadModalOpen(true) : setAuthModalOpen(true)}
        bookmark={bookmark}
        onSaveBookmark={saveBookmark}
        onRestoreBookmark={restoreBookmark}
        floorColor={floorColor}
        wallColor={wallColor}
        onFloorColor={setFloorColor}
        onWallColor={setWallColor}
      />
    </DockablePanel>
    <DockablePanel tabId="view">
      <ViewTabPanel
        onRotateLeft={() => setTarget(r => r - Math.PI / 2)}
        onRotateRight={() => setTarget(r => r + Math.PI / 2)}
        ceilingView={ceilingView}
        onToggleCeiling={() => { setCeilingView(v => !v); setCeilingPicker(null) }}
        onSummonWispy={showWispy}
        showMeasurements={showMeasurements}
        onToggleMeasurements={() => setShowMeasurements(v => !v)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(v => !v)}
        cloudsOn={cloudsOn}
        onToggleClouds={() => { const next = !cloudsOn; setCloudsOn(next); localStorage.setItem('ddd_clouds', next ? '1' : '0') }}
        cloudVariant={cloudVariant}
        onChangeCloudVariant={(v) => { setCloudVariant(v); localStorage.setItem('ddd_cloud_variant', v) }}
        forceEasterEggs={forceEasterEggs}
        onToggleEasterEggs={() => setForceEasterEggs(v => !v)}
      />
    </DockablePanel>
    <DockablePanel tabId="social">
      <SocialTabPanel
        onCommunity={() => setCommunityOpen(true)}
        onContests={() => setContestsOpen(true)}
        onNotifications={() => user ? setAccountModalOpen(true) : setAuthModalOpen(true)}
      />
    </DockablePanel>
    <BottomTabCluster
      signedIn={!!user}
      onAccount={() => user ? setAccountModalOpen(true) : setAuthModalOpen(true)}
      onSettings={() => user ? setAccountModalOpen(true) : setAuthModalOpen(true)}
    />
    </SideTabProvider>
  )
}

// Placeholder body until the real panel contents are wired up step-by-step
function PanelPlaceholder({ name, detail }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#f0eaff', textShadow: 'none', WebkitTextStroke: 0 }}>{name} panel</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: '#c8b8ee', textShadow: 'none', WebkitTextStroke: 0 }}>{detail}</div>
      <div style={{ marginTop: 12, fontSize: 10, fontStyle: 'italic', color: '#8a78a8', textShadow: 'none', WebkitTextStroke: 0 }}>Drag the header to undock; release near the tab to snap back.</div>
    </div>
  )
}
