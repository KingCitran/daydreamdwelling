import { useAuth } from '@shared/auth/AuthContext'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'products',  label: 'Products',  icon: '◫' },
  { key: 'orders',    label: 'Orders',    icon: '⊟' },
  { key: 'earnings',  label: 'Earnings',  icon: '◈' },
]

export default function NavBar({ page, onNavigate }) {
  const { user, profile, signOut } = useAuth()

  return (
    <nav style={s.nav}>
      <div style={s.logo}>
        <span style={s.logoIcon}>⌂</span>
        <span style={s.logoText}>Seller Hub</span>
      </div>

      <div style={s.navList}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            style={{ ...s.navItem, ...(page === item.key ? s.navItemActive : {}) }}
            onClick={() => onNavigate(item.key)}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={s.footer}>
        <div style={s.userInfo}>
          <div style={s.avatar}>{(profile?.display_name || user?.email || '?')[0].toUpperCase()}</div>
          <div style={s.userMeta}>
            <span style={s.userName}>{profile?.display_name || 'Seller'}</span>
            <span style={s.userEmail}>{user?.email}</span>
          </div>
        </div>
        <button style={s.signOutBtn} onClick={signOut}>Sign out</button>
      </div>
    </nav>
  )
}

const s = {
  nav:          { width: 220, background: '#13132a', borderRight: '1px solid #2a2a4a', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' },
  logo:         { padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #2a2a4a' },
  logoIcon:     { fontSize: 22, color: '#a08aff' },
  logoText:     { fontSize: 15, fontWeight: 700, color: '#e0d9ff' },
  navList:      { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: '#9090b8', fontSize: 13, fontWeight: 500, textAlign: 'left', width: '100%', transition: 'background 0.15s, color 0.15s' },
  navItemActive:{ background: '#1e1e3a', color: '#e0d9ff' },
  navIcon:      { fontSize: 16, width: 20, textAlign: 'center' },
  footer:       { padding: '16px 14px', borderTop: '1px solid #2a2a4a', display: 'flex', flexDirection: 'column', gap: 10 },
  userInfo:     { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:       { width: 32, height: 32, borderRadius: '50%', background: '#4a3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#e0d9ff', flexShrink: 0 },
  userMeta:     { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  userName:     { fontSize: 12, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail:    { fontSize: 10, color: '#5a5a7a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  signOutBtn:   { padding: '7px 0', background: 'transparent', border: '1px solid #3a3a5a', borderRadius: 6, color: '#7878aa', fontSize: 12, width: '100%' },
}
