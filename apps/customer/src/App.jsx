import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@shared/auth/AuthContext'
import { ThemeProvider } from '@shared/ThemeProvider'
import { MusicPlayerProvider, useMusicPlayer } from './contexts/MusicPlayerContext'
import TopMusicButton from './ui/TopMusicButton'
import MusicPlayerBar from './ui/MusicPlayerBar'
import MusicPlayerSidebar from './ui/MusicPlayerSidebar'
import MusicPlayerFloating from './ui/MusicPlayerFloating'
import LandingPage from './pages/LandingPage'
import LandingAdminPage from './pages/LandingAdminPage'
import AboutPage from './pages/AboutPage'
import HubPage from './pages/HubPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import LandingPageV1 from './pages/_archive/LandingPageV1'
import OrderHistoryPage from './pages/OrderHistoryPage'
import SavedRoomsPage from './pages/SavedRoomsPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import MarketplacePage from './pages/MarketplacePage'
import FeedbackButton from './ui/FeedbackButton'
import CommunityApp from './pages/CommunityApp'
import { useMoodControl } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import { WispyProvider } from '@shared/wispy'
import { syncCurationFromSupabase } from './scene/cloudDrapes'

const BuilderApp = React.lazy(() => import('./BuilderApp'))

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
          {/* WispyProvider moved INSIDE Gate so the landing page can opt
              out of the corner mascot. The landing page renders its own
              Wispy illustration in the "Meet your roommate" section;
              showing the corner mascot on top would double her up. */}
          <Gate />
          <GlobalMusicWidgets />
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

// Error boundary — shows the error instead of a dark screen
class BuilderErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, fontFamily: 'system-ui', color: '#1a2a48', background: '#f8f6f2', minHeight: '100vh' }}>
        <h2 style={{ color: '#c03838' }}>Something went wrong</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
        <a href="/?landing=1" style={{ color: '#ff9b5c', fontSize: 14 }}>← go to landing page</a>
      </div>
    )
    return this.props.children
  }
}

function Gate() {
  // Clean up stale admin flags that caused dark screens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ddd_admin_load_room')
    localStorage.removeItem('ddd_admin_load_type')
    localStorage.removeItem('ddd_return_to')
  }
  const params                     = new URLSearchParams(window.location.search)
  const isCheckoutRedirect         = params.get('checkout') != null
  const shopBuilderSellerId        = params.get('shopBuilder') === 'true' ? params.get('sellerId') : null
  const exploreRoomId              = params.get('exploreRoom') || null
  const adminRoomId                = params.get('room') || null
  const wantsBuilder               = params.get('builder') === '1'
  const hasVisited                 = typeof window !== 'undefined' && localStorage.getItem('ddd_has_visited') === '1'
  // Return to builder on reload if user has visited before — landing page
  // is only shown to first-time visitors or via explicit ?landing=1
  const [inBuilder, _setInBuilder]  = useState(isCheckoutRedirect || !!shopBuilderSellerId || !!exploreRoomId || !!adminRoomId || wantsBuilder || hasVisited)
  const setInBuilder = (v) => { if (v) localStorage.setItem('ddd_has_visited', '1'); _setInBuilder(v) }
  const [inMarketplace, setInMarketplace] = useState(params.get('shop') === '1')
  const { mood, setMood }          = useMoodControl()
  const { user }                   = useAuth()


  if (params.get('legacy') === 'v1') return <LandingPageV1 onEnter={() => setInBuilder(true)} onBrowseShop={() => setInMarketplace(true)} />
  if (window.location.pathname.startsWith('/community')) return <CommunityApp />
  // Unknown path (not / and not /community) → 404
  if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/community')) return <NotFoundPage />

  let page
  let isLanding = false
  if (params.get('landing-admin') === '1') page = <LandingAdminPage onBack={() => { window.location.search = '' }} />
  else if (params.get('hub') === '1') page = <HubPage onBack={() => { window.location.search = '' }} />
  else if (params.get('landing') === '1') { page = <LandingPage onEnter={() => { window.location.search = '' }} onBrowseShop={() => setInMarketplace(true)} />; isLanding = true }
  else if (params.get('about') === '1') page = <AboutPage onBack={() => { window.location.search = '' }} />
  else if (params.get('privacy') === '1') page = <PrivacyPage onBack={() => { window.location.search = '' }} />
  else if (params.get('terms') === '1') page = <TermsPage onBack={() => { window.location.search = '' }} />
  else if (params.get('rooms') === '1') page = <SavedRoomsPage onBack={() => { window.location.search = '' }} />
  else if (params.get('orders') === '1') page = <OrderHistoryPage onBack={() => { window.location.search = '' }} />
  else if (params.get('messages') === '1') page = <MessagesPage onBack={() => { window.location.search = '' }} />
  else if (params.get('profile')) page = <ProfilePage userId={params.get('profile')} onEnterBuilder={() => setInBuilder(true)} />
  else if (inBuilder) page = <BuilderErrorBoundary><React.Suspense fallback={
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0c1e', color: '#e0d9ff', fontFamily: "'Outfit',system-ui,sans-serif", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #9870c020', borderTopColor: '#9870c0', borderRadius: '50%', animation: 'ddd-spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>Loading your room...</p>
      <style>{`@keyframes ddd-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  }><BuilderApp shopBuilderSellerId={shopBuilderSellerId} exploreRoomId={exploreRoomId} adminRoomId={adminRoomId} /></React.Suspense></BuilderErrorBoundary>
  else if (inMarketplace) page = <MarketplacePage onEnterBuilder={() => { setInMarketplace(false); setInBuilder(true) }} onBack={() => setInMarketplace(false)} />
  else { page = <LandingPage onEnter={() => setInBuilder(true)} onBrowseShop={() => setInMarketplace(true)} />; isLanding = true }

  // Corner Wispy renders everywhere EXCEPT the landing page (which
  // already shows Wispy as a feature illustration inside the page).
  if (isLanding) return <>{page}<FeedbackButton /></>
  return <WispyProvider>{page}<FeedbackButton /></WispyProvider>
}
