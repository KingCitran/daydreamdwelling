import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import { Icon } from '@shared/ui/Icon'

const NAV_ITEMS = [
  { key: 'dashboard',     label: 'Dashboard',     icon: 'dashboard' },
  { key: 'products',      label: 'Products',      icon: 'products' },
  { key: 'shop',          label: 'My 3D Shop',    icon: 'shop3d' },
  { key: 'orders',        label: 'Orders',        icon: 'orders' },
  { key: 'shipping',      label: 'Shipping',      icon: 'shipping' },
  { key: 'messages',      label: 'Messages',      icon: 'messages' },
  { key: 'earnings',      label: 'Earnings',      icon: 'earnings' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications' },
  { key: 'reviews',       label: 'Reviews',       icon: 'reviews' },
  { key: 'discounts',     label: 'Discounts',     icon: 'discounts' },
  { key: 'promoted',      label: 'Promoted',      icon: 'promoted' },
  { key: 'tools',         label: 'Tools',         icon: 'tools' },
  { key: 'settings',      label: 'Settings',      icon: 'settings' },
]

// Bottom tab bar on mobile: 5 key items + More drawer (like Amazon/Etsy)
const MOBILE_TABS = [
  { key: 'dashboard', label: 'Home',     icon: 'dashboard' },
  { key: 'products',  label: 'Products', icon: 'products' },
  { key: 'orders',    label: 'Orders',   icon: 'orders' },
  { key: 'messages',  label: 'Messages', icon: 'messages' },
]

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(window.innerWidth <= breakpoint)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= breakpoint)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return mobile
}

export default function NavBar({ page, onNavigate }) {
  const { user, profile, signOut } = useAuth()
  const t = useTheme()
  const isMobile = useIsMobile()
  const [moreOpen, setMoreOpen] = useState(false)

  if (isMobile) {
    const isOnTab = MOBILE_TABS.some(tab => tab.key === page)
    return (
      <>
        {/* More drawer backdrop + panel */}
        {moreOpen && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }}
            onClick={() => setMoreOpen(false)}
          >
            <div
              style={{
                position: 'absolute', bottom: 56, left: 0, right: 0, maxHeight: '60vh',
                background: t.bg, borderTop: `1px solid ${t.surfaceBorder}`,
                borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: '16px 10px',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', zIndex: 999,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {NAV_ITEMS.filter(it => !MOBILE_TABS.some(tab => tab.key === it.key)).map(item => {
                  const isActive = page === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => { onNavigate(item.key); setMoreOpen(false) }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '12px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: isActive ? `${t.accent}18` : 'transparent',
                        color: isActive ? t.accent : t.textSoft,
                      }}
                    >
                      <Icon name={item.icon} size={20} />
                      <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={signOut}
                style={{
                  marginTop: 12, width: '100%', padding: '10px', background: 'transparent',
                  border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft,
                  fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                <Icon name="signout" size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Bottom tab bar — not position:fixed, it's a flex child of the fixed shell */}
        <nav style={{
          height: 56, flexShrink: 0,
          background: t.surface, borderTop: `1px solid ${t.surfaceBorder}`,
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          zIndex: 997,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {MOBILE_TABS.map(tab => {
            const isActive = page === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => { onNavigate(tab.key); setMoreOpen(false) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 12px', border: 'none', background: 'transparent',
                  color: isActive ? t.accent : t.textSoft, cursor: 'pointer',
                }}
              >
                <Icon name={tab.icon} size={22} color={isActive ? t.accent : undefined} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '6px 12px', border: 'none', background: 'transparent',
              color: (!isOnTab || moreOpen) ? t.accent : t.textSoft, cursor: 'pointer',
            }}
          >
            <Icon name="tools" size={22} color={(!isOnTab || moreOpen) ? t.accent : undefined} />
            <span style={{ fontSize: 10, fontWeight: (!isOnTab || moreOpen) ? 700 : 500 }}>More</span>
          </button>
        </nav>
      </>
    )
  }

  // Desktop: full sidebar
  return (
    <nav style={{ width: 230, background: t.surface, backdropFilter: 'blur(16px)', borderRight: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <Logo size={36} color={t.accent} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>DaydreamDwelling</div>
          <div style={{ fontSize: 10, color: t.textSoft, letterSpacing: '0.5px' }}>Seller Hub</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = page === item.key
          return (
            <button
              key={item.key}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: isActive ? `${t.accent}18` : 'transparent', border: 'none', color: isActive ? t.accent : t.textSoft, fontSize: 13, fontWeight: isActive ? 600 : 500, textAlign: 'left', width: '100%', cursor: 'pointer' }}
              onClick={() => onNavigate(item.key)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: '16px 14px', borderTop: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, ${t.glow.replace('rgba(', 'rgb(').replace(/, ?[\d.]+\)/, ')')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: t.accentText, flexShrink: 0 }}>
            {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.display_name || 'Seller'}</span>
            <span style={{ fontSize: 10, color: t.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
          </div>
        </div>
        <button style={{ padding: '7px 0', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, width: '100%', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={signOut}>
          <Icon name="signout" size={14} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
