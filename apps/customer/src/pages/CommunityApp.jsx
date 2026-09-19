import { useState, useCallback, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import MoodPicker from '@shared/MoodPicker'
import Logo from '@shared/Logo'
import AuthModal from '../ui/AuthModal'
import FeedbackButton from '../ui/FeedbackButton'
import CommunityHome from './CommunityHome'
import CommunityRoomPage from './CommunityRoomPage'
import ProfilePage from './ProfilePage'
import ContestsPage from './ContestsPage'
import ArtistLanding from './community/ArtistLanding'
import ArtistDashboard from './community/ArtistDashboard'
import ArtistSubmit from './community/ArtistSubmit'
import ArtistPrograms from './community/ArtistPrograms'
import ArtistProfile from './community/ArtistProfile'
import MusicCatalogPage from './community/MusicCatalogPage'
import MusicPlaylistsPage from './community/MusicPlaylistsPage'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import CommunityCartDrawer from '../ui/CommunityCartDrawer'
import CheckoutModal from '../ui/CheckoutModal'
import { useCommunityCart } from '../hooks/useCommunityCart'

function parsePath() {
  const p = window.location.pathname.replace(/\/+$/, '') || '/community'
  const segs = p.split('/').filter(Boolean)
  return { path: p, segs }
}

const NAV_ITEMS = [
  { label: 'Rooms', path: '/community' },
  { label: 'Contests', path: '/community/contests' },
  { label: 'Artists', path: '/community/artists' },
  { label: 'Music', path: '/community/music' },
]

export default function CommunityApp() {
  const t = useTheme()
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const cart = useCommunityCart()
  const [currentPath, setCurrentPath] = useState(() => parsePath().path)
  const [currentSegs, setCurrentSegs] = useState(() => parsePath().segs)

  // Narrow-viewport detection so the nav can reflow on phones. The community
  // surfaces are the marketing-facing, shareable pages — most inbound traffic
  // lands here on a phone, so the nav must not overflow at ~375px.
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640
  )
  useEffect(() => {
    function onResize() { setIsNarrow(window.innerWidth < 640) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState(null, '', to)
    const parsed = parsePath()
    setCurrentPath(parsed.path)
    setCurrentSegs(parsed.segs)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    function onPop() {
      const parsed = parsePath()
      setCurrentPath(parsed.path)
      setCurrentSegs(parsed.segs)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Tell the global music player to render its sidebar variant under our logo
  const { setWidgetVariant } = useMusicPlayer()
  useEffect(() => {
    setWidgetVariant('sidebar')
    return () => setWidgetVariant('bar')
  }, [setWidgetVariant])

  let content
  if (currentSegs[1] === 'room' && currentSegs[2]) {
    content = <CommunityRoomPage key={currentSegs[2]} postId={currentSegs[2]} cart={cart} onNavigate={navigate} />
  } else if (currentSegs[1] === 'contests') {
    content = <ContestsPage onClose={() => navigate('/community')} standalone cart={cart} />
  } else if (currentSegs[1] === 'profile' && currentSegs[2]) {
    content = <ProfilePage key={currentSegs[2]} userId={currentSegs[2]} onEnterBuilder={() => { window.location.href = '/' }} />
  } else if (currentSegs[1] === 'music') {
    if (currentSegs[2] === 'playlists') {
      content = <MusicPlaylistsPage onNavigate={navigate} onSignIn={() => setAuthOpen(true)} />
    } else {
      content = <MusicCatalogPage onNavigate={navigate} />
    }
  } else if (currentSegs[1] === 'artists') {
    const openAuth = () => setAuthOpen(true)
    let inner
    if      (currentSegs[2] === 'dashboard') inner = <ArtistDashboard onNavigate={navigate} onSignIn={openAuth} />
    else if (currentSegs[2] === 'submit')    inner = <ArtistSubmit    onNavigate={navigate} onSignIn={openAuth} />
    else if (currentSegs[2] === 'programs')  inner = <ArtistPrograms  onNavigate={navigate} onSignIn={openAuth} />
    else if (currentSegs[2] === 'profile')   inner = <ArtistProfile   onNavigate={navigate} onSignIn={openAuth} />
    else                                      inner = <ArtistLanding   onNavigate={navigate} onSignIn={openAuth} />
    content = <div className="ddd-artist-section">{inner}</div>
  } else {
    content = <CommunityHome cart={cart} onNavigate={navigate} />
  }

  return (
    <div className="ddd-community-wrap" style={{ minHeight: '100vh', fontFamily: "'Commissioner', 'Outfit', system-ui, sans-serif" }}>
      <style>{`
        /* Force Dream State branding on community — override mood theme */
        .ddd-community-wrap {
          background: linear-gradient(180deg, #ede9ff 0%, #f5f0ff 40%, #fdf5f0 100%) !important;
          color: #2a1848 !important;
        }
        .ddd-community-nav {
          background: rgba(237,233,255,0.8) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(183,167,230,0.25) !important;
        }
        .ddd-community-nav *, .ddd-community-foot *,
        .ddd-artist-section * {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        .ddd-community-wrap .ddd-tile {
          background: rgba(255,255,255,0.5) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border-color: rgba(255,255,255,0.7) !important;
        }
        .ddd-community-wrap .ddd-tile:hover {
          border-color: rgba(122,72,204,0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(122,72,204,0.12) !important;
        }
      `}</style>

      {/* Nav */}
      <header className="ddd-community-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(237,233,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(183,167,230,0.25)',
        padding: isNarrow ? '0 12px' : '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, height: 56,
        }}>
          {/* Logo + brand (tagline hidden on narrow to save width) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
               onClick={() => { window.location.href = '/?hub=1' }}>
            <Logo size={26} color={t.accent} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2a1848', lineHeight: 1.2, fontFamily: "'Young Serif', Georgia, serif" }}>DaydreamCommunity</div>
              {!isNarrow && <div style={{ fontSize: 8, color: t.textSoft, letterSpacing: '0.5px' }}>Room designs you can buy</div>}
            </div>
          </div>

          {/* Center nav — only inline on wide screens; on narrow it moves to
              its own scrollable row below so the top row doesn't overflow. */}
          {!isNarrow && (
            <nav style={{ display: 'flex', gap: 6 }}>
              {NAV_ITEMS.map(item => (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  padding: '6px 14px', borderRadius: '4px 999px 999px 4px', border: 'none',
                  background: currentPath === item.path ? '#ddd4f5' : 'transparent',
                  color: currentPath === item.path ? '#2a1848' : '#7a6aa8',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.18s', fontFamily: "'Commissioner', system-ui, sans-serif",
                  touchAction: 'manipulation',
                }}>{item.label}</button>
              ))}
            </nav>
          )}

          {/* Right actions */}
          <div style={{ display: 'flex', gap: isNarrow ? 6 : 10, alignItems: 'center', flexShrink: 0 }}>
            <MoodPicker />
            <button onClick={() => setCartOpen(true)} style={{
              position: 'relative', padding: '6px 12px', borderRadius: '4px 999px 999px 4px',
              background: 'rgba(255,255,255,0.5)', border: '1px solid #b7a7e6',
              color: '#2a1848', fontSize: 13, cursor: 'pointer', touchAction: 'manipulation',
            }}>
              🛒 {cart.count > 0 && <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 18, height: 18, borderRadius: '50%',
                background: t.accent, color: t.accentText,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cart.count}</span>}
            </button>
            {user ? (
              <button onClick={() => navigate(`/community/profile/${user.id}`)} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: t.accent, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: t.accentText, flexShrink: 0,
              }}>{(user.email || '?')[0].toUpperCase()}</button>
            ) : (
              <button onClick={() => setAuthOpen(true)} style={{
                padding: isNarrow ? '6px 12px' : '6px 16px', borderRadius: 8,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}>Sign in</button>
            )}
            <a href="/" style={{
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
              color: t.accent, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
            }}>{isNarrow ? 'Builder' : 'Open Builder →'}</a>
          </div>
        </div>

        {/* Narrow-screen section nav — horizontally scrollable strip below the
            top row. Keeps all four destinations reachable without cramming. */}
        {isNarrow && (
          <nav style={{
            display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8,
            margin: '0 -12px', padding: '0 12px 8px',
            WebkitOverflowScrolling: 'touch',
          }}>
            {NAV_ITEMS.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: currentPath === item.path ? `${t.accent}15` : 'transparent',
                color: currentPath === item.path ? t.accent : t.textSoft,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>{item.label}</button>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: isNarrow ? '0 14px' : '0 24px' }}>
        {content}
      </main>

      {/* Footer */}
      <footer className="ddd-community-foot" style={{
        borderTop: '1px solid rgba(183,167,230,0.25)',
        padding: '40px 24px', marginTop: 60,
        textAlign: 'center', fontSize: 12, color: '#7a6aa8',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          <a href="/" style={{ color: '#7a48cc', textDecoration: 'underline', textDecorationColor: '#b7a7e6', textUnderlineOffset: '5px', fontFamily: "'Young Serif', Georgia, serif", fontSize: 14 }}>Room Builder</a>
          <a href="https://daydreamsellers.com" style={{ color: '#7a48cc', textDecoration: 'underline', textDecorationColor: '#b7a7e6', textUnderlineOffset: '5px', fontFamily: "'Young Serif', Georgia, serif", fontSize: 14 }}>Sell on Daydream</a>
        </div>
        © {new Date().getFullYear()} DaydreamDwelling. All rights reserved.
      </footer>

      {/* Overlays */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {cartOpen && <CommunityCartDrawer cart={cart} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} />}
      {checkoutOpen && <CheckoutModal cart={cart.items} onClose={() => setCheckoutOpen(false)} roomName="Community" />}
      <FeedbackButton />
    </div>
  )
}
