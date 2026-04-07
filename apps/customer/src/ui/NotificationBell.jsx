import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function NotificationBell({ btnStyle }) {
  const t = useTheme()
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [open, setOpen]       = useState(false)
  const panelRef              = useRef(null)

  // Load notifications and subscribe to new ones
  useEffect(() => {
    if (!user) return

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { if (data) setItems(data) })

    const channel = supabase
      .channel(`notif-${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setItems(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function markRead(id) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  if (!user) return null

  const unread = items.filter(n => !n.read).length

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        style={{ ...btnStyle, position: 'relative' }}
        onClick={() => setOpen(v => !v)}
        title="Notifications"
      >
        {/* Bell icon (SVG, no emoji) */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={styles.badge(t)}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={styles.panel(t)}>
          <p style={styles.panelTitle(t)}>Notifications</p>
          {items.length === 0 ? (
            <p style={styles.empty(t)}>No notifications yet.</p>
          ) : (
            <ul style={styles.list}>
              {items.map(n => (
                <li
                  key={n.id}
                  style={styles.item(t, n.read)}
                  onClick={() => markRead(n.id)}
                >
                  <p style={styles.itemTitle(t, n.read)}>{n.title}</p>
                  {n.body && <p style={styles.itemBody(t)}>{n.body}</p>}
                  <p style={styles.itemTime(t)}>{timeAgo(n.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const styles = {
  badge: t => ({
    position:   'absolute',
    top:        2,
    right:      2,
    background: '#e03030',
    color:      '#fff',
    fontSize:   9,
    fontWeight: 700,
    lineHeight: 1,
    padding:    '2px 4px',
    borderRadius: 8,
    minWidth:   14,
    textAlign:  'center',
    pointerEvents: 'none',
  }),
  panel: t => ({
    position:   'absolute',
    bottom:     'calc(100% + 10px)',
    right:      0,
    width:      300,
    maxHeight:  380,
    background: t.navBg,
    border:     `1px solid ${t.surfaceBorder}`,
    borderRadius: 12,
    boxShadow:  '0 8px 32px rgba(0,0,0,0.28)',
    overflow:   'hidden',
    display:    'flex',
    flexDirection: 'column',
    zIndex:     200,
  }),
  panelTitle: t => ({
    fontSize:   12,
    fontWeight: 600,
    color:      t.textSoft,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding:    '12px 16px 8px',
    margin:     0,
    borderBottom: `1px solid ${t.surfaceBorder}`,
  }),
  empty: t => ({
    fontSize:   13,
    color:      t.textSoft,
    padding:    '20px 16px',
    margin:     0,
    textAlign:  'center',
  }),
  list: {
    margin:   0,
    padding:  0,
    listStyle: 'none',
    overflowY: 'auto',
    flex:     1,
  },
  item: (t, read) => ({
    padding:    '10px 16px',
    borderBottom: `1px solid ${t.surfaceBorder}`,
    cursor:     'pointer',
    background: read ? 'transparent' : `${t.accent}10`,
    transition: 'background 0.15s',
  }),
  itemTitle: (t, read) => ({
    fontSize:   13,
    fontWeight: read ? 400 : 600,
    color:      t.text,
    margin:     '0 0 2px',
  }),
  itemBody: t => ({
    fontSize:   12,
    color:      t.textSoft,
    margin:     '0 0 4px',
    whiteSpace: 'nowrap',
    overflow:   'hidden',
    textOverflow: 'ellipsis',
  }),
  itemTime: t => ({
    fontSize:   11,
    color:      t.textSoft,
    margin:     0,
    opacity:    0.7,
  }),
}
