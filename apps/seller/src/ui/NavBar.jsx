import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'

const NAV_ITEMS = [
  { key: 'dashboard',     label: 'Dashboard',      icon: '⊞' },
  { key: 'products',      label: 'Products',        icon: '◫' },
  { key: 'shop',          label: 'My 3D Shop',      icon: '☁' },
  { key: 'orders',        label: 'Orders',          icon: '⊟' },
  { key: 'earnings',      label: 'Earnings',        icon: '◈' },
  { key: 'notifications', label: 'Notifications',   icon: '◉' },
  { key: 'reviews',       label: 'Reviews',         icon: '✦' },
  { key: 'tools',         label: 'Tools',           icon: '⚒' },
  { key: 'settings',      label: 'Settings',        icon: '⚙' },
]

export default function NavBar({ page, onNavigate }) {
  const { user, profile, signOut } = useAuth()
  const t = useTheme()

  return (
    <nav style={{ width: 230, background: t.surface, backdropFilter: 'blur(16px)', borderRight: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${t.accent}, ${t.glow.replace('rgba(', 'rgb(').replace(/, ?[\d.]+\)/, ')')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: t.accentText, flexShrink: 0 }}>✦</div>
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
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
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
        <button style={{ padding: '7px 0', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, width: '100%', cursor: 'pointer' }} onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
