import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const TYPE_META = {
  order:    { icon: '◈', label: 'New Order' },
  shipped:  { icon: '⊟', label: 'Shipment' },
  review:   { icon: '✦', label: 'Review' },
  payout:   { icon: '◇', label: 'Payout' },
  stock:    { icon: '⊞', label: 'Stock Alert' },
  platform: { icon: '◉', label: 'Platform' },
}

// Placeholder notifications — will be replaced with Supabase fetch
const MOCK = [
  { id: 1,  type: 'order',    read: false, time: '2 min ago',   title: 'New order received',             body: 'Order #1048 — Terracotta Planter Set · $64.00' },
  { id: 2,  type: 'review',   read: false, time: '1 hr ago',    title: 'New 5-star review',              body: '"Absolutely gorgeous, packed with care. Will order again!"' },
  { id: 3,  type: 'order',    read: false, time: '3 hr ago',    title: 'New order received',             body: 'Order #1047 — Rattan Dining Chair (×2) · $218.00' },
  { id: 4,  type: 'payout',   read: true,  time: 'Yesterday',   title: 'Payout processed',               body: '$412.50 deposited to your connected account.' },
  { id: 5,  type: 'stock',    read: true,  time: 'Yesterday',   title: 'Low stock warning',              body: 'Ceramic Hanging Planter has 2 units remaining.' },
  { id: 6,  type: 'shipped',  read: true,  time: '2 days ago',  title: 'Shipment delivered',             body: 'Order #1042 marked delivered by carrier.' },
  { id: 7,  type: 'platform', read: true,  time: '3 days ago',  title: 'New seller feature available',   body: 'Bulk product CSV import is now live in your Tools hub.' },
  { id: 8,  type: 'review',   read: true,  time: '4 days ago',  title: 'New 4-star review',              body: '"Love the quality. Shipping was a little slow but worth the wait."' },
]

const FILTERS = ['All', 'Unread', 'Orders', 'Reviews', 'Payouts', 'Stock']
const FILTER_MAP = { Orders: 'order', Reviews: 'review', Payouts: 'payout', Stock: 'stock' }

export default function NotificationsPage() {
  const t = useTheme()
  const [items,  setItems]  = useState(MOCK)
  const [filter, setFilter] = useState('All')

  const unreadCount = items.filter(n => !n.read).length

  function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markRead(id) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const visible = items.filter(n => {
    if (filter === 'Unread') return !n.read
    if (FILTER_MAP[filter]) return n.type === FILTER_MAP[filter]
    return true
  })

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, background: t.accent, color: t.accentText, borderRadius: 20, padding: '2px 10px' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: t.textSoft }}>Order updates, reviews, payouts, and platform news.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ padding: '8px 14px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === f ? t.accent : t.surfaceBorder}`, background: filter === f ? `${t.accent}18` : 'transparent', color: filter === f ? t.accent : t.textSoft, fontSize: 12, fontWeight: filter === f ? 600 : 500, cursor: 'pointer' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: t.textSoft }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◉</div>
          <p style={{ fontSize: 14 }}>No notifications here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visible.map(n => {
            const meta = TYPE_META[n.type] ?? TYPE_META.platform
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{ display: 'flex', gap: 14, padding: '16px 18px', borderRadius: 12, background: n.read ? 'transparent' : t.surface, border: `1px solid ${n.read ? 'transparent' : t.surfaceBorder}`, cursor: n.read ? 'default' : 'pointer', transition: 'background 0.15s' }}
              >
                {/* Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${t.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: t.accent, flexShrink: 0 }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{meta.label}</span>
                    <span style={{ fontSize: 10, color: t.textSoft }}>{n.time}</span>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: t.text, marginBottom: 3 }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.5 }}>{n.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Future note */}
      <p style={{ marginTop: 28, fontSize: 11, color: t.textSoft, textAlign: 'center', opacity: 0.6 }}>
        Live notifications via Supabase Realtime — coming when backend events are wired up.
      </p>
    </div>
  )
}
