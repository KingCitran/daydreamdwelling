import { useAuth } from '@shared/auth/AuthContext'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'products',  label: 'Products',  icon: '◫' },
  { key: 'orders',    label: 'Orders',    icon: '⊟' },
  { key: 'earnings',  label: 'Earnings',  icon: '◈' },
  { key: 'settings',  label: 'Settings',  icon: '⚙' },
]

export default function NavBar({ page, onNavigate }) {
  const { user, profile, signOut } = useAuth()

  return (
    <nav style={s.nav}>
      <div style={s.logo}>
        <div style={s.logoMark}>✦</div>
        <div>
          <div style={s.logoText}>DaydreamDwelling</div>
          <div style={s.logoSub}>Seller Hub</div>
        </div>
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
  nav:           { width: 230, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(180,160,220,0.2)', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' },
  logo:          { padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(180,160,220,0.2)' },
  logoMark:      { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #c4a8ff, #f0a8d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', flexShrink: 0 },
  logoText:      { fontSize: 13, fontWeight: 700, color: '#3a2a5a', lineHeight: 1.2 },
  logoSub:       { fontSize: 10, color: '#9a88bb', letterSpacing: '0.5px' },
  navList:       { flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:       { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: '#8a78aa', fontSize: 13, fontWeight: 500, textAlign: 'left', width: '100%', cursor: 'pointer' },
  navItemActive: { background: 'rgba(180,140,255,0.15)', color: '#5a3a9a', fontWeight: 600 },
  navIcon:       { fontSize: 15, width: 20, textAlign: 'center' },
  footer:        { padding: '16px 14px', borderTop: '1px solid rgba(180,160,220,0.2)', display: 'flex', flexDirection: 'column', gap: 10 },
  userInfo:      { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:        { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #c4a8ff, #f0a8d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 },
  userMeta:      { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  userName:      { fontSize: 12, fontWeight: 600, color: '#3a2a5a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail:     { fontSize: 10, color: '#9a88bb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  signOutBtn:    { padding: '7px 0', background: 'transparent', border: '1px solid rgba(180,160,220,0.4)', borderRadius: 8, color: '#9a88bb', fontSize: 12, width: '100%', cursor: 'pointer' },
}
