import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import useMessageThread from '@shared/useMessageThread'

// Seller's inbox. Lists every conversation (any buyer who has messaged the
// seller, with or without an order), with the most-recent message as preview.
// Click a conversation to expand the thread inline.
//
// Conversations are keyed by (partner_id, order_id) so a buyer with multiple
// orders gets multiple threads — same way they appear scoped on OrdersPage.
// General (no-order) messages are a separate "General inquiry" thread.

export default function MessagesPage() {
  const { user } = useAuth()
  const t        = useTheme()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [openKey, setOpenKey] = useState(null) // `${partnerId}::${orderId ?? 'none'}`

  useEffect(() => {
    if (!user) { setRows([]); setLoading(false); return }
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select(`
          id, order_id, from_user_id, to_user_id, body, created_at, read_at,
          from_profile:profiles!messages_from_user_id_fkey(display_name),
          to_profile:profiles!messages_to_user_id_fkey(display_name),
          orders(id, status, total_cents, created_at)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      setRows(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  // Group rows into conversations keyed by (partner, order). Latest message
  // wins for preview + sort order.
  const conversations = useMemo(() => {
    if (!user) return []
    const map = new Map()
    for (const m of rows) {
      const partnerId = m.from_user_id === user.id ? m.to_user_id : m.from_user_id
      const partnerName = (m.from_user_id === user.id ? m.to_profile?.display_name : m.from_profile?.display_name) || 'Buyer'
      const key = `${partnerId}::${m.order_id ?? 'none'}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          partnerId,
          partnerName,
          orderId: m.order_id,
          order: m.orders,
          latestBody: m.body,
          latestAt: m.created_at,
          unread: m.to_user_id === user.id && !m.read_at ? 1 : 0,
        })
      } else if (m.to_user_id === user.id && !m.read_at) {
        existing.unread += 1
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt))
  }, [rows, user])

  const s = makeStyles(t)

  if (!user) return <div style={s.page}><p style={s.dim}>Sign in to see your messages.</p></div>

  return (
    <div style={s.page}>
      <h1 style={s.title}>Messages</h1>
      <p style={s.subtitle}>{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</p>

      {loading ? (
        <p style={s.dim}>Loading…</p>
      ) : conversations.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No conversations yet</p>
          <p style={s.dim}>Buyer messages will appear here. You can also message buyers from the Orders page.</p>
        </div>
      ) : (
        <div style={s.list}>
          {conversations.map(conv => (
            <div key={conv.key} style={s.card}>
              <button
                style={s.cardHeader}
                onClick={() => setOpenKey(openKey === conv.key ? null : conv.key)}
              >
                <div style={s.avatar}>{(conv.partnerName ?? '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.cardName}>
                    {conv.partnerName}
                    {conv.unread > 0 && <span style={s.unreadPill}>{conv.unread} new</span>}
                  </div>
                  <div style={s.cardSub}>
                    {conv.orderId
                      ? <>Re: Order #{conv.orderId.slice(0, 8)}{conv.order?.total_cents != null ? ` · $${(conv.order.total_cents / 100).toFixed(2)}` : ''}</>
                      : <em>General inquiry</em>}
                  </div>
                  <div style={s.cardPreview}>{conv.latestBody}</div>
                </div>
                <div style={s.cardTime}>{relativeTime(conv.latestAt)}</div>
              </button>
              {openKey === conv.key && (
                <div style={s.cardBody}>
                  <Conversation user={user} partnerId={conv.partnerId} partnerName={conv.partnerName} orderId={conv.orderId} t={t} s={s} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Conversation({ user, partnerId, partnerName, orderId, t, s }) {
  const { messages, sending, send } = useMessageThread({ user, orderId, partnerId })
  const [draft, setDraft] = useState('')
  return (
    <>
      <div style={s.msgList}>
        {messages.length === 0 ? (
          <p style={s.dim}>No messages yet.</p>
        ) : messages.map(m => {
          const mine = m.from_user_id === user.id
          return (
            <div key={m.id} style={{ ...s.bubble, ...(mine ? s.bubbleMine : s.bubbleTheirs) }}>
              <p style={s.bubbleBody}>{m.body}</p>
              <p style={s.bubbleTime}>{new Date(m.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          )
        })}
      </div>
      <div style={s.composeRow}>
        <input
          style={s.composeInput}
          placeholder={`Message ${partnerName}…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={async e => {
            if (e.key === 'Enter' && draft.trim() && !sending) {
              const { error } = await send(draft)
              if (!error) setDraft('')
            }
          }}
        />
        <button
          style={s.composeSend}
          onClick={async () => {
            if (!draft.trim() || sending) return
            const { error } = await send(draft)
            if (!error) setDraft('')
          }}
          disabled={!draft.trim() || sending}
        >
          {sending ? '…' : 'Send'}
        </button>
      </div>
    </>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

function makeStyles(t) {
  return {
    page:        { color: t.text, fontFamily: 'system-ui, sans-serif' },
    title:       { fontSize: 28, fontWeight: 700, margin: 0, color: t.text },
    subtitle:    { fontSize: 13, color: t.textSoft, margin: '4px 0 24px' },
    dim:         { fontSize: 13, color: t.textSoft, margin: 0 },
    empty:       { padding: 40, background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 14, textAlign: 'center' },
    emptyTitle:  { fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 },
    list:        { display: 'flex', flexDirection: 'column', gap: 10 },
    card:        { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, overflow: 'hidden' },
    cardHeader:  { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: t.text },
    avatar:      { width: 38, height: 38, borderRadius: '50%', background: t.accent, color: t.accentText, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
    cardName:    { fontSize: 14, fontWeight: 600, color: t.text, display: 'flex', alignItems: 'center', gap: 8 },
    unreadPill:  { padding: '2px 8px', background: t.accent, color: t.accentText, borderRadius: 10, fontSize: 10, fontWeight: 700 },
    cardSub:     { fontSize: 11, color: t.textSoft, margin: '2px 0' },
    cardPreview: { fontSize: 12, color: t.textSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 },
    cardTime:    { fontSize: 11, color: t.textSoft, flexShrink: 0, alignSelf: 'flex-start', marginTop: 4 },
    cardBody:    { padding: '14px 18px 18px', borderTop: `1px solid ${t.surfaceBorder}`, background: `${t.accent}06`, display: 'flex', flexDirection: 'column', gap: 12 },
    msgList:     { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto', paddingRight: 4 },
    bubble:      { padding: '8px 12px', borderRadius: 10, maxWidth: '78%' },
    bubbleMine:  { background: t.accent, color: t.accentText, alignSelf: 'flex-end' },
    bubbleTheirs:{ background: t.bg, color: t.text, alignSelf: 'flex-start', border: `1px solid ${t.surfaceBorder}` },
    bubbleBody:  { margin: 0, fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    bubbleTime:  { margin: '3px 0 0', fontSize: 10, opacity: 0.65 },
    composeRow:  { display: 'flex', gap: 6 },
    composeInput:{ flex: 1, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, background: t.bg, color: t.text, outline: 'none' },
    composeSend: { padding: '9px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  }
}
