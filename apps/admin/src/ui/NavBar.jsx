import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'

const CUSTOMER_URL = import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:5173'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'contests',  label: 'Contests',  icon: '✦' },
  { key: 'artists',   label: 'Artists',   icon: '♫' },
  { key: 'archive',   label: 'Archive',   icon: '◌' },
  { key: 'clouds',    label: 'Cloud Picker', icon: '☁', href: `${CUSTOMER_URL}/clouds-picker.html` },
]

export default function NavBar({ page, onNavigate }) {
  const { user, profile, signOut } = useAuth()
  const t = useTheme()

  return (
    <nav style={{ width: 230, background: t.surface, backdropFilter: 'blur(16px)', borderRight: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <Logo size={36} color={t.accent} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>DaydreamDwelling</div>
          <div style={{ fontSize: 10, color: t.textSoft, letterSpacing: '0.5px' }}>Admin</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = page === item.key
          const baseStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: isActive ? `${t.accent}18` : 'transparent', border: 'none', color: isActive ? t.accent : t.textSoft, fontSize: 13, fontWeight: isActive ? 600 : 500, textAlign: 'left', width: '100%', cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }
          if (item.href) {
            return (
              <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" style={baseStyle}>
                <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>↗</span>
              </a>
            )
          }
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)} style={baseStyle}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div style={{ padding: '16px 14px', borderTop: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, #c084fc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.display_name || 'Admin'}</span>
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
