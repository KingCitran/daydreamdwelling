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
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import CommunityCartDrawer from '../ui/CommunityCartDrawer'
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
  const cart = useCommunityCart()
  const [currentPath, setCurrentPath] = useState(() => parsePath().path)
  const [currentSegs, setCurrentSegs] = useState(() => parsePath().segs)

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
    content = <MusicCatalogPage onNavigate={navigate} />
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
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`
        /* Strip Ember Sunrise's global text-shadow inside the nav, footer, and
           every artist page — those have their own solid backdrops, so the
           shadow only muddies text. */
        .ddd-community-nav h1, .ddd-community-nav h2, .ddd-community-nav p,
        .ddd-community-nav a,  .ddd-community-nav span, .ddd-community-nav button,
        .ddd-community-nav label, .ddd-community-nav div,
        .ddd-community-foot a, .ddd-community-foot p, .ddd-community-foot span,
        .ddd-community-foot div,
        .ddd-artist-section h1, .ddd-artist-section h2, .ddd-artist-section h3,
        .ddd-artist-section p, .ddd-artist-section span, .ddd-artist-section a,
        .ddd-artist-section button, .ddd-artist-section label,
        .ddd-artist-section label *, .ddd-artist-section div,
        .ddd-artist-section input, .ddd-artist-section textarea, .ddd-artist-section select {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
      `}</style>

      {/* Nav */}
      <header className="ddd-community-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: t.navBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.navBorder}`,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
               onClick={() => navigate('/community')}>
            <Logo size={26} color={t.accent} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>DaydreamCommunity</div>
              <div style={{ fontSize: 8, color: t.textSoft, letterSpacing: '0.5px' }}>Room designs you can buy</div>
            </div>
          </div>

          {/* Center nav */}
          <nav style={{ display: 'flex', gap: 6 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: currentPath === item.path ? `${t.accent}15` : 'transparent',
                color: currentPath === item.path ? t.accent : t.textSoft,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>{item.label}</button>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <MoodPicker />
            <button onClick={() => setCartOpen(true)} style={{
              position: 'relative', padding: '6px 12px', borderRadius: 8,
              background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
              color: t.text, fontSize: 13, cursor: 'pointer',
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
                fontSize: 13, fontWeight: 700, color: t.accentText,
              }}>{(user.email || '?')[0].toUpperCase()}</button>
            ) : (
              <button onClick={() => setAuthOpen(true)} style={{
                padding: '6px 16px', borderRadius: 8,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Sign in</button>
            )}
            <a href="/" style={{
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
              color: t.accent, fontSize: 12, fontWeight: 600,
            }}>Open Builder →</a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {content}
      </main>

      {/* Footer */}
      <footer className="ddd-community-foot" style={{
        borderTop: `1px solid ${t.surfaceBorder}`,
        padding: '32px 24px', marginTop: 48,
        textAlign: 'center', fontSize: 12, color: t.text, opacity: 0.75,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          <a href="/" style={{ color: t.text, textDecoration: 'none' }}>Room Builder</a>
          <a href="https://daydreamsellers.com" style={{ color: t.text, textDecoration: 'none' }}>Sell on Daydream</a>
          <a href="https://daydreamblossoms.com" style={{ color: t.text, textDecoration: 'none' }}>Daydream Blossoms</a>
        </div>
        © {new Date().getFullYear()} DaydreamDwelling. All rights reserved.
      </footer>

      {/* Overlays */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {cartOpen && <CommunityCartDrawer cart={cart} onClose={() => setCartOpen(false)} />}
      <FeedbackButton />
    </div>
  )
}
