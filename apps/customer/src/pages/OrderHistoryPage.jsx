import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import useMessageThread from '@shared/useMessageThread'

// Buyer-facing order history. Mounts via `?orders=1`. Mirrors the seller
// OrdersPage data shape but presented from the buyer's POV: their orders,
// each item's current status, pre-ship photo (when seller uploaded it),
// tracking link with carrier auto-detection, and a "mark received" button
// they can hit once the carrier delivers.

const PAYMENT_COLORS = {
  paid:      ['#88d8b0', '#eef9f1'],
  pending:   ['#ffc87a', '#fff5e6'],
  cancelled: ['#f09090', '#fceeee'],
  refunded:  ['#b8a0ff', '#f0eaff'],
  fulfilled: ['#88d8b0', '#eef9f1'],
}

// Tracking-number → carrier link heuristics. Common US carriers; falls back to
// a generic "search this tracking number" link.
function carrierLinkFor(tracking) {
  if (!tracking) return null
  const t = tracking.replace(/\s/g, '').toUpperCase()
  // USPS: 22 digits, starts with 9
  if (/^9[0-9]{21}$/.test(t)) {
    return { carrier: 'USPS', url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}` }
  }
  // UPS: 1Z + 16 chars
  if (/^1Z[A-Z0-9]{16}$/.test(t)) {
    return { carrier: 'UPS', url: `https://www.ups.com/track?tracknum=${tracking}` }
  }
  // FedEx: 12 or 15 digits typically
  if (/^[0-9]{12}$/.test(t) || /^[0-9]{15}$/.test(t)) {
    return { carrier: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${tracking}` }
  }
  return { carrier: 'Search', url: `https://www.google.com/search?q=${encodeURIComponent(tracking + ' tracking')}` }
}

function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null
  const line1 = addr.line1 || addr.address_line1 || addr.street1
  const line2 = addr.line2 || addr.address_line2 || addr.street2
  const city  = addr.city || addr.town
  const state = addr.state || addr.region || addr.province
  const postal = addr.postal_code || addr.zip || addr.postcode
  const country = addr.country
  const lines = []
  if (line1) lines.push(line1)
  if (line2) lines.push(line2)
  const cityLine = [city, state, postal].filter(Boolean).join(', ')
  if (cityLine) lines.push(cityLine)
  if (country) lines.push(country)
  return lines.length ? lines : null
}

// Visual status pipeline: ordered → paid → shipped → delivered. Renders as a
// 4-stop progress strip on each order so buyers see at a glance where things are.
function stageOf(orderStatus, fulfillmentStatus) {
  if (orderStatus === 'cancelled' || orderStatus === 'refunded') return -1
  if (fulfillmentStatus === 'delivered') return 3
  if (fulfillmentStatus === 'shipped') return 2
  if (orderStatus === 'paid' || orderStatus === 'fulfilled') return 1
  return 0  // ordered / pending payment
}

export default function OrderHistoryPage({ onBack }) {
  const { user } = useAuth()
  const t        = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, total_cents, shipping_address, created_at,
          order_items(
            id, quantity, unit_price, size_label, swatch_name, product_name,
            fulfillment_status, tracking_number, pre_ship_photo_path, seller_id,
            products(label, product_images(storage_path, is_primary),
                     seller:profiles!products_seller_id_fkey(id, display_name))
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) console.warn('[orders] load error:', error.message)
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function markDelivered(itemId) {
    await supabase.from('order_items').update({ fulfillment_status: 'delivered' }).eq('id', itemId)
    setOrders(prev => prev.map(o => ({
      ...o,
      order_items: o.order_items.map(i => i.id === itemId ? { ...i, fulfillment_status: 'delivered' } : i),
    })))
  }

  const s = makeStyles(t)

  if (!user) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <h2 style={s.emptyTitle}>Sign in to see your orders</h2>
          <p style={s.dimText}>Your purchase history lives here once you've placed an order.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h1 style={s.pageTitle}>Your Orders</h1>
      </header>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : orders.length === 0 ? (
        <div style={s.empty}>
          <h2 style={s.emptyTitle}>No orders yet</h2>
          <p style={s.dimText}>Items you buy will show up here so you can track them and revisit details.</p>
        </div>
      ) : (
        <div style={s.list}>
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              s={s}
              expanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onMarkDelivered={markDelivered}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, t, s, expanded, onToggle, onMarkDelivered }) {
  const addrLines = formatAddress(order.shipping_address)
  const items = order.order_items || []
  return (
    <div style={s.card}>
      <button style={s.cardHeader} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.cardTitle}>
            {items.length === 1
              ? items[0].products?.label ?? items[0].product_name ?? 'Order'
              : `${items.length} items`}
          </div>
          <div style={s.cardSub}>
            Order #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div style={s.cardTotal}>${((order.total_cents ?? 0) / 100).toFixed(2)}</div>
        <PayPill status={order.status} />
        <span style={s.caret}>{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded && (
        <div style={s.cardBody}>
          {items.map(item => (
            <ItemRow key={item.id} item={item} order={order} t={t} s={s} onMarkDelivered={onMarkDelivered} />
          ))}

          {addrLines && (
            <div style={s.section}>
              <div style={s.sectionLabel}>Shipping to</div>
              <div style={s.address}>{addrLines.map((l, i) => <div key={i}>{l}</div>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, order, t, s, onMarkDelivered }) {
  const photo = item.products?.product_images?.find(im => im.is_primary) ?? item.products?.product_images?.[0]
  const productImgUrl = photo?.storage_path
    ? supabase.storage.from('product-images').getPublicUrl(photo.storage_path).data.publicUrl
    : null
  const preShipUrl = item.pre_ship_photo_path
    ? supabase.storage.from('order-photos').getPublicUrl(item.pre_ship_photo_path).data.publicUrl
    : null
  const variant = [item.size_label, item.swatch_name].filter(Boolean).join(' · ')
  const stage = stageOf(order.status, item.fulfillment_status)
  const tracking = item.tracking_number
  const trackInfo = carrierLinkFor(tracking)
  const sellerName = item.products?.seller?.display_name ?? 'Seller'
  const sellerId   = item.products?.seller?.id

  return (
    <div style={s.itemRow}>
      <Thumb url={productImgUrl} label={item.products?.label ?? item.product_name ?? '?'} size={64} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.itemTitle}>{item.products?.label ?? item.product_name ?? '—'}</div>
        {variant && <div style={s.itemVariant}>{variant}</div>}
        <div style={s.itemMeta}>
          ×{item.quantity} · ${(item.quantity * item.unit_price).toFixed(2)} · from <button style={s.sellerLink} onClick={() => { if (sellerId) window.location.search = `?profile=${sellerId}` }}>{sellerName}</button>
        </div>

        <StageStrip stage={stage} t={t} s={s} />

        {tracking && trackInfo && (
          <div style={s.trackBlock}>
            <span style={s.trackLabel}>Tracking ({trackInfo.carrier}):</span>
            <a href={trackInfo.url} target="_blank" rel="noopener noreferrer" style={s.trackLink}>{tracking} ↗</a>
          </div>
        )}

        {preShipUrl && (
          <div style={s.preShipBlock}>
            <div style={s.sectionLabel}>From the maker (pre-ship photo)</div>
            <a href={preShipUrl} target="_blank" rel="noopener noreferrer">
              <img src={preShipUrl} alt="Pre-ship photo from seller" style={s.preShipImg} />
            </a>
          </div>
        )}

        {item.fulfillment_status === 'shipped' && (
          <button style={s.markBtn} onClick={() => onMarkDelivered(item.id)}>
            ✓ I've received this
          </button>
        )}

        {item.fulfillment_status === 'delivered' && (
          <div style={s.deliveredNote}>Delivered — enjoy.</div>
        )}

        {sellerId && <MessageBlock orderId={order.id} partnerId={sellerId} partnerName={sellerName} t={t} s={s} />}
      </div>
    </div>
  )
}

// Inline thread between buyer and one seller, scoped to a specific order.
// Collapsed by default (just shows "Message X" + unread count); expands to
// the conversation on click.
function MessageBlock({ orderId, partnerId, partnerName, t, s }) {
  const { user } = useAuth()
  const { messages, sending, send, unreadCount } = useMessageThread({ user, orderId, partnerId })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  if (!user) return null

  return (
    <div style={s.msgBlock}>
      <button
        style={s.msgToggle}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
      >
        💬 {open ? `Hide messages with ${partnerName}` : `Message ${partnerName}`}
        {messages.length > 0 && <span style={s.msgCount}>· {messages.length}</span>}
        {unreadCount > 0 && <span style={s.msgUnread}>{unreadCount} new</span>}
      </button>
      {open && (
        <div style={s.msgPanel} onClick={e => e.stopPropagation()}>
          <div style={s.msgList}>
            {messages.length === 0 ? (
              <p style={s.msgEmpty}>No messages yet — say hi.</p>
            ) : messages.map(m => {
              const mine = m.from_user_id === user.id
              return (
                <div key={m.id} style={{ ...s.msgBubble, ...(mine ? s.msgBubbleMine : s.msgBubbleTheirs) }}>
                  <p style={s.msgBody}>{m.body}</p>
                  <p style={s.msgTime}>{new Date(m.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              )
            })}
          </div>
          <div style={s.msgInputRow}>
            <input
              style={s.msgInput}
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
              style={s.msgSend}
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
        </div>
      )}
    </div>
  )
}

function StageStrip({ stage, t, s }) {
  if (stage < 0) {
    return <div style={{ ...s.stageCancelled }}>Cancelled or refunded</div>
  }
  const labels = ['Ordered', 'Paid', 'Shipped', 'Delivered']
  return (
    <div style={s.stageStrip}>
      {labels.map((label, i) => (
        <div key={label} style={s.stageStop}>
          <div style={{ ...s.stageDot, background: i <= stage ? t.accent : `${t.accent}22` }} />
          <div style={{ ...s.stageLabel, color: i <= stage ? t.text : t.textSoft, fontWeight: i === stage ? 700 : 400 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function PayPill({ status }) {
  const [color, bg] = PAYMENT_COLORS[status] ?? ['#a098b0', '#f0ecf5']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '4px 10px', background: bg, color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{status ?? '—'}</span>
}

function Thumb({ url, label, size }) {
  const initial = (label ?? '').trim().charAt(0).toUpperCase() || '?'
  if (!url) {
    return (
      <div style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: size > 60 ? 12 : 8,
        background: 'linear-gradient(135deg, #e8dffc 0%, #d4c8ee 100%)',
        color: '#7a5fb8', fontWeight: 700, fontSize: size > 60 ? 24 : 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{initial}</div>
    )
  }
  return (
    <img
      src={url}
      alt={label || ''}
      style={{ width: size, height: size, flexShrink: 0, borderRadius: size > 60 ? 12 : 8, objectFit: 'cover', border: '1px solid rgba(180,160,220,0.18)' }}
      onError={e => { e.currentTarget.style.display = 'none' }}
    />
  )
}

function makeStyles(t) {
  return {
    page:        { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'system-ui, sans-serif', padding: '32px clamp(20px, 5vw, 64px)' },
    header:      { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, maxWidth: 920, margin: '0 auto 24px' },
    backBtn:     { background: 'transparent', border: 'none', color: t.accent, fontSize: 14, cursor: 'pointer', padding: '4px 8px', fontWeight: 500 },
    pageTitle:   { fontSize: 28, fontWeight: 700, color: t.text, margin: 0 },
    dimText:     { fontSize: 13, color: t.textSoft },
    empty:       { background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 520, margin: '40px auto' },
    emptyTitle:  { fontSize: 17, fontWeight: 600, color: t.text, marginBottom: 8 },
    list:        { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 920, margin: '0 auto' },
    card:        { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, overflow: 'hidden' },
    cardHeader:  { width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: t.text },
    cardTitle:   { fontSize: 15, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    cardSub:     { fontSize: 11, color: t.textSoft, marginTop: 2 },
    cardTotal:   { fontSize: 15, fontWeight: 700, color: t.text, whiteSpace: 'nowrap' },
    caret:       { color: t.textSoft, fontSize: 12, marginLeft: 4 },
    cardBody:    { borderTop: `1px solid ${t.surfaceBorder}`, background: `${t.accent}05`, padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 18 },
    itemRow:     { display: 'flex', gap: 14, paddingBottom: 14, borderBottom: `1px dashed ${t.surfaceBorder}` },
    itemTitle:   { fontSize: 14, fontWeight: 600, color: t.text },
    itemVariant: { fontSize: 11, color: t.textSoft, marginTop: 1 },
    itemMeta:    { fontSize: 12, color: t.textSoft, marginTop: 4 },
    sellerLink:  { background: 'transparent', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'inherit' },
    stageStrip:  { display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start' },
    stageStop:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
    stageDot:    { width: 10, height: 10, borderRadius: '50%' },
    stageLabel:  { fontSize: 10, textAlign: 'center' },
    stageCancelled: { fontSize: 12, color: '#a06060', fontStyle: 'italic', marginTop: 8 },
    trackBlock:  { marginTop: 10, fontSize: 12, color: t.text },
    trackLabel:  { color: t.textSoft, marginRight: 6 },
    trackLink:   { color: t.accent, textDecoration: 'none', fontWeight: 500, fontFamily: 'ui-monospace, monospace' },
    preShipBlock:{ marginTop: 10 },
    preShipImg:  { maxWidth: 240, maxHeight: 180, borderRadius: 10, marginTop: 4, border: `1px solid ${t.surfaceBorder}`, display: 'block' },
    markBtn:     { marginTop: 12, padding: '8px 16px', background: '#7adda0', color: '#1a4a2a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    deliveredNote: { marginTop: 10, fontSize: 12, color: '#3a7a4e', fontWeight: 500 },
    section:     { paddingTop: 6 },
    sectionLabel:{ fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
    address:     { fontSize: 13, color: t.text, lineHeight: 1.55 },
    msgBlock:    { marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${t.surfaceBorder}` },
    msgToggle:   { background: 'transparent', border: 'none', color: t.accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 },
    msgCount:    { color: t.textSoft, fontWeight: 400 },
    msgUnread:   { marginLeft: 6, padding: '2px 7px', background: t.accent, color: t.accentText, borderRadius: 10, fontSize: 10, fontWeight: 700 },
    msgPanel:    { marginTop: 10, background: `${t.accent}08`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 10 },
    msgList:     { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto', paddingRight: 4 },
    msgEmpty:    { fontSize: 12, color: t.textSoft, fontStyle: 'italic', margin: 0, padding: '8px 0', textAlign: 'center' },
    msgBubble:   { padding: '6px 10px', borderRadius: 10, maxWidth: '80%' },
    msgBubbleMine:   { background: t.accent, color: t.accentText, alignSelf: 'flex-end' },
    msgBubbleTheirs: { background: t.surface, color: t.text, alignSelf: 'flex-start', border: `1px solid ${t.surfaceBorder}` },
    msgBody:     { margin: 0, fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    msgTime:     { margin: '3px 0 0', fontSize: 10, opacity: 0.65 },
    msgInputRow: { display: 'flex', gap: 6 },
    msgInput:    { flex: 1, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none' },
    msgSend:     { padding: '7px 14px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  }
}
