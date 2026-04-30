import { useTheme } from '@shared/ThemeProvider'

// Social tab — connections + activity from other people.
// Built sections: Community, Contests, Notifications (open existing UIs).
// Stubbed sections: Friends, Friend Wishlists, Followed Stores, Account
// Notifications — features not built yet, shown as "coming soon" rows so the
// final layout is visible before the data plumbing lands.

export default function SocialTabPanel({ onCommunity, onContests, onNotifications }) {
  const t = useTheme()

  const rows = [
    { id: 'friends',   icon: '👥', label: 'Friends',           coming: true },
    { id: 'fwish',     icon: '💖', label: 'Friend Wishlists',  coming: true },
    { id: 'followed',  icon: '🏪', label: 'Followed Stores',   coming: true },
    { id: 'community', icon: '🌐', label: 'Community Updates', onClick: onCommunity },
    { id: 'contests',  icon: '✦',  label: 'Contests',          onClick: onContests },
    { id: 'notif',     icon: '🔔', label: 'Notifications',     onClick: onNotifications },
    { id: 'acctnotif', icon: '📬', label: 'Account Notifications', coming: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {rows.map(row => (
        <button
          key={row.id}
          onClick={row.coming ? undefined : row.onClick}
          disabled={row.coming}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: row.coming ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            cursor: row.coming ? 'default' : 'pointer',
            opacity: row.coming ? 0.55 : 1,
            fontFamily: "'Outfit', system-ui, sans-serif",
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{row.icon}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#f0eaff' }}>{row.label}</span>
          {row.coming ? (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: `${t.accent}18`, color: t.accent, letterSpacing: '0.5px' }}>SOON</span>
          ) : (
            <span style={{ fontSize: 12, color: '#a090c8' }}>→</span>
          )}
        </button>
      ))}
    </div>
  )
}
