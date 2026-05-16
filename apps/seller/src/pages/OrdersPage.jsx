import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const PAYMENT_COLORS = { paid: ['#88d8b0', '#eeffF6'], pending: ['#ffc87a', '#fff8ee'], cancelled: ['#f09090', '#fff0f0'] }
const FULFILLMENT_STEPS = ['packed', 'shipped', 'delivered']

// Pull a usable contact email out of an order. The buyer can be:
//   - A guest (orders.guest_email is set)
//   - A logged-in user who entered their email at checkout (often stashed in
//     shipping_address.email by the checkout flow)
// Returns null if neither is present.
function contactEmailFor(order) {
  if (!order) return null
  if (order.guest_email) return order.guest_email
  const addr = order.shipping_address
  if (addr && typeof addr === 'object' && addr.email) return addr.email
  return null
}

// Customer display name. Falls back to profile display_name, then a shipping
// address name field, then "Guest" / "—".
function customerNameFor(order) {
  if (!order) return '—'
  if (order.customer?.display_name) return order.customer.display_name
  const addr = order.shipping_address
  if (addr && typeof addr === 'object') {
    if (addr.name) return addr.name
    if (addr.full_name) return addr.full_name
    if (addr.first_name || addr.last_name) return [addr.first_name, addr.last_name].filter(Boolean).join(' ')
  }
  return order.guest_email ? 'Guest' : '—'
}

// Render a shipping_address jsonb in a human-readable way. Supports a few
// common shapes (Stripe-style, plain object).
function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null
  const line1 = addr.line1 || addr.address_line1 || addr.street1
  const line2 = addr.line2 || addr.address_line2 || addr.street2
  const city = addr.city || addr.town
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

function toIsoDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

// Build a CSV string from the visible rows. Quotes fields containing commas,
// quotes, or newlines per RFC 4180.
function rowsToCsv(items) {
  const headers = ['Order ID', 'Date', 'Product', 'Variant', 'Qty', 'Unit Price', 'Amount', 'Payment Status', 'Fulfillment', 'Tracking', 'Customer', 'Email', 'Shipping Address']
  const escape = (v) => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(escape).join(',')]
  for (const it of items) {
    const order = it.orders
    const amount = (it.quantity * it.unit_price).toFixed(2)
    const variant = [it.size_label, it.swatch_name].filter(Boolean).join(' · ')
    const date = order?.created_at ? new Date(order.created_at).toISOString().slice(0, 10) : ''
    const addr = order?.shipping_address
    const addrStr = formatAddress(addr)?.join(' / ') ?? ''
    const email = contactEmailFor(order) ?? ''
    const customer = customerNameFor(order)
    lines.push([
      order?.id ?? '', date, it.products?.label ?? '', variant, it.quantity, it.unit_price, amount,
      order?.status ?? '', it.fulfillment_status ?? 'unfulfilled', it.tracking_number ?? '',
      customer, email, addrStr,
    ].map(escape).join(','))
  }
  return lines.join('\n')
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function OrdersPage() {
  const { user }  = useAuth()
  const t         = useTheme()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [expanded, setExpanded] = useState(null)
  const [tracking, setTracking] = useState({}) // orderId → tracking number input

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const { data: products } = await supabase
        .from('products').select('id').eq('seller_id', user.id)
      const productIds = (products || []).map(p => p.id)
      if (!productIds.length) { setRows([]); setLoading(false); return }

      const { data } = await supabase
        .from('order_items')
        .select(`
          id, quantity, unit_price, size_label, swatch_name, created_at,
          fulfillment_status, tracking_number,
          products(label, product_images(storage_path, is_primary)),
          orders(id, status, created_at, shipping_address, guest_email, user_id,
                 customer:profiles!orders_user_id_fkey(display_name))
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })

      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function markFulfillment(itemId, status) {
    await supabase.from('order_items').update({ fulfillment_status: status }).eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId ? { ...r, fulfillment_status: status } : r))
  }

  async function saveTracking(itemId, number) {
    // Entering tracking auto-advances to 'shipped' so sellers never have to
    // tap separate fulfillment buttons. "Delivered" is a separate single-tap
    // confirm later (true automation would need carrier APIs).
    await supabase.from('order_items').update({ tracking_number: number, fulfillment_status: 'shipped' }).eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId ? { ...r, tracking_number: number, fulfillment_status: 'shipped' } : r))
    setTracking(prev => ({ ...prev, [itemId]: '' }))
  }

  // Resolve the primary product image's public URL (or null if none uploaded).
  function imageUrlFor(item) {
    const imgs = item.products?.product_images
    if (!imgs || !imgs.length) return null
    const primary = imgs.find(im => im.is_primary) ?? imgs[0]
    if (!primary?.storage_path) return null
    return supabase.storage.from('product-images').getPublicUrl(primary.storage_path).data.publicUrl
  }

  const s = makeStyles(t)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null
    // Date "to" is inclusive of that whole day.
    const toMs   = dateTo   ? new Date(dateTo).getTime() + 86_400_000 : null
    return rows.filter(r => {
      if (filter !== 'all' && r.orders?.status !== filter) return false
      if (q) {
        const productMatch = (r.products?.label ?? '').toLowerCase().includes(q)
        const orderIdMatch = (r.orders?.id ?? '').toLowerCase().includes(q)
        const customerMatch = customerNameFor(r.orders).toLowerCase().includes(q)
        if (!productMatch && !orderIdMatch && !customerMatch) return false
      }
      const created = r.orders?.created_at ? new Date(r.orders.created_at).getTime() : 0
      if (fromMs != null && created < fromMs) return false
      if (toMs   != null && created >= toMs) return false
      return true
    })
  }, [rows, filter, search, dateFrom, dateTo])

  function exportCsv() {
    if (!filtered.length) return
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`daydreamdwelling-orders-${stamp}.csv`, rowsToCsv(filtered))
  }

  return (
    <div>
      <h1 style={s.pageTitle}>Orders</h1>
      <p style={s.pageSubtitle}>
        {rows.length} total order item{rows.length !== 1 ? 's' : ''}
        {filtered.length !== rows.length && ` · ${filtered.length} matching filters`}
      </p>

      <div style={s.toolbar}>
        <div style={s.tabs}>
          {['all', 'paid', 'pending', 'cancelled'].map(f => (
            <button key={f} style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span style={s.tabCount}>{rows.filter(r => r.orders?.status === f).length}</span>}
            </button>
          ))}
        </div>
        <div style={s.toolbarRight}>
          <input
            style={s.search}
            placeholder="Search by product, customer, or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={s.dateGroup} title="Filter by order date">
            <input type="date" style={s.dateInput} value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)} />
            <span style={s.dateSep}>→</span>
            <input type="date" style={s.dateInput} value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && (
              <button style={s.dateClear} onClick={() => { setDateFrom(''); setDateTo('') }} title="Clear date filter">✕</button>
            )}
          </div>
          <button
            style={{ ...s.exportBtn, opacity: filtered.length ? 1 : 0.4, cursor: filtered.length ? 'pointer' : 'not-allowed' }}
            onClick={exportCsv}
            disabled={!filtered.length}
            title="Export current rows as CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No {filter !== 'all' ? filter : ''} orders {dateFrom || dateTo ? 'in this range' : 'yet'}</p>
          <p style={s.dimText}>Orders will appear here after customers checkout.</p>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>Product</span><span>Customer</span><span>Qty</span><span>Amount</span><span>Payment</span><span>Fulfillment</span><span>Date</span>
          </div>
          {filtered.map(item => {
            const order = item.orders
            const email = contactEmailFor(order)
            const customer = customerNameFor(order)
            const addressLines = formatAddress(order?.shipping_address)
            const variant = [item.size_label, item.swatch_name].filter(Boolean).join(' · ')
            const imgUrl = imageUrlFor(item)
            const productLabel = item.products?.label ?? item.product_name ?? '—'
            return (
              <div key={item.id}>
                <div
                  style={{ ...s.tableRow, background: expanded === item.id ? `${t.accent}08` : 'transparent', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <span style={{ ...s.cell, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ProductThumb url={imgUrl} label={productLabel} size={42} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productLabel}</div>
                      {variant && <div style={s.variantSub}>{variant}</div>}
                    </div>
                  </span>
                  <span style={s.cell}>{customer}</span>
                  <span style={s.cell}>×{item.quantity}</span>
                  <span style={{ ...s.cell, fontWeight: 600, color: '#4a3a6a' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                  <span style={s.cell}><PayBadge status={order?.status} /></span>
                  <span style={s.cell}><FulfillBadge status={item.fulfillment_status} orderStatus={order?.status} /></span>
                  <span style={{ ...s.cell, color: '#9a88bb', fontSize: 11 }}>{order?.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</span>
                </div>

                {expanded === item.id && (
                  <div style={s.detail}>
                    <div style={s.detailGrid}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <ProductThumb url={imgUrl} label={productLabel} size={88} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.detailLabel}>Product</p>
                          <p style={s.detailValue}>{productLabel}</p>
                          {variant && <p style={{ ...s.dimMicro, fontStyle: 'normal', marginTop: 2 }}>{variant}</p>}
                          <p style={{ ...s.detailLabel, marginTop: 10 }}>Order ID</p>
                          <p style={{ ...s.detailValue, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{order?.id ?? '—'}</p>
                        </div>
                      </div>
                      <div>
                        <p style={s.detailLabel}>Customer</p>
                        <p style={s.detailValue}>{customer}</p>
                        {email ? (
                          <a href={`mailto:${email}?subject=${encodeURIComponent('Your DaydreamDwelling order')}`} style={s.contactLink} onClick={e => e.stopPropagation()}>
                            ✉ {email}
                          </a>
                        ) : (
                          <p style={s.dimMicro}>No contact email on file</p>
                        )}
                      </div>
                      <div>
                        <p style={s.detailLabel}>Shipping Address</p>
                        {addressLines ? (
                          <div style={s.addressBlock}>
                            {addressLines.map((line, i) => <div key={i}>{line}</div>)}
                          </div>
                        ) : (
                          <p style={s.dimMicro}>No shipping address on this order</p>
                        )}
                      </div>
                      <div>
                        <p style={s.detailLabel}>Tracking Number</p>
                        <p style={s.detailValue}>{item.tracking_number || 'Not entered yet'}</p>
                      </div>
                    </div>

                    {order?.status === 'paid' && item.fulfillment_status !== 'delivered' && (
                      <div style={s.fulfillmentPanel} onClick={e => e.stopPropagation()}>
                        <p style={s.detailLabel}>
                          {item.fulfillment_status === 'shipped' ? 'In Transit' : 'Ready to Ship'}
                        </p>
                        <div style={s.trackingRow}>
                          <input
                            style={s.trackingInput}
                            placeholder={item.fulfillment_status === 'shipped' ? 'Update tracking…' : 'Enter tracking number to mark shipped…'}
                            value={tracking[item.id] ?? item.tracking_number ?? ''}
                            onChange={e => setTracking(prev => ({ ...prev, [item.id]: e.target.value }))}
                          />
                          <button
                            style={s.trackingBtn}
                            onClick={() => saveTracking(item.id, tracking[item.id] ?? item.tracking_number ?? '')}
                            disabled={!(tracking[item.id] ?? item.tracking_number ?? '').trim()}
                          >
                            {item.fulfillment_status === 'shipped' ? 'Update' : 'Save & Ship'}
                          </button>
                          {item.fulfillment_status === 'shipped' && (
                            <button
                              style={s.deliveredBtn}
                              onClick={() => markFulfillment(item.id, 'delivered')}
                              title="Mark this item as delivered"
                            >
                              ✓ Mark Delivered
                            </button>
                          )}
                        </div>
                        <p style={s.dimMicro}>
                          {item.fulfillment_status === 'shipped'
                            ? 'Tap "Mark Delivered" when the carrier confirms delivery, or wait for automated carrier sync (coming soon).'
                            : 'Entering a tracking number automatically marks this item as shipped — no extra clicks.'}
                        </p>
                      </div>
                    )}
                    {item.fulfillment_status === 'delivered' && (
                      <div style={s.deliveredNote}>
                        ✓ Delivered — no further action needed
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PayBadge({ status }) {
  const [color, bg] = PAYMENT_COLORS[status] ?? ['#b8a0ff', '#f0eaff']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? '—'}</span>
}

function FulfillBadge({ status, orderStatus }) {
  // Cancelled / refunded orders never get a fulfillment state — show N/A
  // instead of the misleading "unfulfilled."
  if (orderStatus === 'cancelled' || orderStatus === 'refunded') {
    return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: '#f5f0f5', color: '#a098b0' }}>N/A</span>
  }
  const map = { packed: ['#ffc87a', '#fff8ee'], shipped: ['#88c8f0', '#eef8ff'], delivered: ['#88d8b0', '#eeffF6'] }
  const [color, bg] = map[status] ?? ['#c8c0d8', '#f5f2ff']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? 'unfulfilled'}</span>
}

// Product thumbnail with a graceful fallback when the seller hasn't uploaded
// images yet (or the URL 404s). Uses the first letter of the label inside a
// soft pastel square so the row layout stays consistent.
function ProductThumb({ url, label, size = 42 }) {
  const initial = (label ?? '').trim().charAt(0).toUpperCase() || '?'
  const fallback = (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: size > 60 ? 10 : 8,
      background: 'linear-gradient(135deg, #e8dffc 0%, #d4c8ee 100%)',
      color: '#7a5fb8', fontWeight: 700, fontSize: size > 60 ? 28 : 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{initial}</div>
  )
  if (!url) return fallback
  return (
    <img
      src={url}
      alt={label || ''}
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: size > 60 ? 10 : 8,
        objectFit: 'cover',
        border: '1px solid rgba(180,160,220,0.18)',
      }}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

function makeStyles(t) {
  return {
    pageTitle:       { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle:    { fontSize: 13, color: t.textSoft, marginBottom: 20 },
    toolbar:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
    toolbarRight:    { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    tabs:            { display: 'flex', gap: 6 },
    tab:             { padding: '7px 14px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
    tabActive:       { background: `${t.accent}18`, color: t.accent, borderColor: `${t.accent}44`, fontWeight: 600 },
    tabCount:        { fontWeight: 700, fontSize: 11, color: t.accent },
    search:          { padding: '8px 14px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none', minWidth: 240 },
    dateGroup:       { display: 'flex', alignItems: 'center', gap: 4, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, padding: '2px 6px' },
    dateInput:       { padding: '6px 8px', border: 'none', background: 'transparent', fontSize: 12, color: t.text, outline: 'none', fontFamily: 'inherit' },
    dateSep:         { fontSize: 11, color: t.textSoft },
    dateClear:       { background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 11, padding: '2px 4px' },
    exportBtn:       { padding: '8px 14px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600 },
    dimText:         { fontSize: 13, color: t.textSoft },
    dimMicro:        { fontSize: 11, color: t.textSoft, margin: 0, fontStyle: 'italic' },
    empty:           { background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: '40px', textAlign: 'center' },
    emptyTitle:      { fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 8 },
    tableWrap:       { background: t.surface, backdropFilter: 'blur(12px)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, overflow: 'hidden' },
    tableHead:       { display: 'grid', gridTemplateColumns: '2fr 1.4fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', background: `${t.accent}06`, fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' },
    tableRow:        { display: 'grid', gridTemplateColumns: '2fr 1.4fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', borderTop: `1px solid ${t.surfaceBorder}`, alignItems: 'center' },
    cell:            { fontSize: 13, color: t.text },
    variantSub:      { fontSize: 10, color: '#9a88bb', marginTop: 2 },
    detail:          { background: `${t.accent}05`, borderTop: `1px solid ${t.surfaceBorder}`, padding: '16px 18px 18px' },
    detailGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    detailLabel:     { fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
    detailValue:     { fontSize: 13, color: t.text, fontWeight: 500, margin: 0 },
    contactLink:     { display: 'inline-block', marginTop: 4, fontSize: 12, color: t.accent, textDecoration: 'none', fontWeight: 500 },
    addressBlock:    { fontSize: 13, color: t.text, lineHeight: 1.55 },
    fulfillmentPanel:{ marginTop: 4 },
    stepRow:         { display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 },
    stepBtn:         { padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    trackingRow:     { display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
    trackingInput:   { flex: 1, minWidth: 200, padding: '8px 12px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none' },
    trackingBtn:     { padding: '8px 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    deliveredBtn:    { padding: '8px 14px', background: '#7adda0', color: '#1a4a2a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    deliveredNote:   { marginTop: 6, padding: '10px 14px', background: '#eef9f1', border: '1px solid #c8e8d4', borderRadius: 8, color: '#3a7a4e', fontSize: 13, fontWeight: 500 },
  }
}
