import { useEffect, useState } from 'react'
import { supabase } from '@shared/supabase'

const EVENT_ICONS = {
  created:   '📋',
  paid:      '💳',
  shipped:   '📦',
  delivered: '✓',
  cancelled: '❌',
  refunded:  '💸',
  escalated: '🚩',
  label:     '🏷️',
  note:      '📝',
  message:   '💬',
  pending:   '⏳',
  packed:    '📦',
}

export default function OrderActivityLog({ orderId, t }) {
  const [events, setEvents] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open || !orderId) return
    supabase
      .from('order_events')
      .select('id, event_type, detail, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setEvents(data) })
  }, [orderId, open])

  return (
    <div style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', color: t.textSoft,
          fontSize: 11, cursor: 'pointer', padding: '4px 0',
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}
      >
        {open ? '▾' : '▸'} Activity Log {events.length > 0 && `(${events.length})`}
      </button>
      {open && (
        <div style={{
          marginTop: 6, padding: '8px 12px', borderRadius: 8,
          background: `${t.bg}cc`, border: `1px solid ${t.surfaceBorder}`,
          maxHeight: 200, overflowY: 'auto',
        }}>
          {events.length === 0 ? (
            <p style={{ margin: 0, fontSize: 11, color: t.textSoft }}>No activity recorded yet</p>
          ) : events.map(ev => (
            <div key={ev.id} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              padding: '4px 0', fontSize: 11, color: t.text,
              borderBottom: `1px solid ${t.surfaceBorder}22`,
            }}>
              <span style={{ flexShrink: 0 }}>{EVENT_ICONS[ev.event_type] ?? '•'}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{ev.detail}</span>
              <span style={{ flexShrink: 0, color: t.textSoft, fontSize: 10 }}>
                {new Date(ev.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
