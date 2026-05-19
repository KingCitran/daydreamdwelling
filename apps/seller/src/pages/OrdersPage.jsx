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
  const [notes,    setNotes]    = useState({}) // itemId → in-progress note draft
  const [noteSaved, setNoteSaved] = useState({}) // itemId → transient "Saved" flash
  const [uploading, setUploading] = useState({}) // itemId → currently uploading
  const [sellerName, setSellerName] = useState('')

  useEffect(() => {
    if (!user) { setSellerName(''); return }
    supabase.from('profiles').select('display_name').eq('id', user.id).single()
      .then(({ data }) => setSellerName(data?.display_name || user.email || ''))
  }, [user])

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
          fulfillment_status, tracking_number, seller_note,
          pre_ship_photo_path, pre_ship_photo_uploaded_at,
          products(label, product_images(storage_path, is_primary)),
          orders(id, status, created_at, shipping_address, guest_email, user_id,
                 buyer_mood, buyer_room_name,
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

  async function uploadPreShipPhoto(itemId, file) {
    if (!file || !user) return
    setUploading(prev => ({ ...prev, [itemId]: true }))
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `${user.id}/${itemId}.${ext}`
    const { error: upErr } = await supabase.storage.from('order-photos').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      console.warn('[pre-ship upload]', upErr.message)
      setUploading(prev => { const { [itemId]: _, ...rest } = prev; return rest })
      return
    }
    await supabase.from('order_items')
      .update({ pre_ship_photo_path: path, pre_ship_photo_uploaded_at: new Date().toISOString() })
      .eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId
      ? { ...r, pre_ship_photo_path: path, pre_ship_photo_uploaded_at: new Date().toISOString() }
      : r))
    setUploading(prev => { const { [itemId]: _, ...rest } = prev; return rest })
  }

  async function removePreShipPhoto(itemId, currentPath) {
    if (!user) return
    if (currentPath) {
      await supabase.storage.from('order-photos').remove([currentPath])
    }
    await supabase.from('order_items')
      .update({ pre_ship_photo_path: null, pre_ship_photo_uploaded_at: null })
      .eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId
      ? { ...r, pre_ship_photo_path: null, pre_ship_photo_uploaded_at: null }
      : r))
  }

  function preShipUrlFor(item) {
    if (!item.pre_ship_photo_path) return null
    return supabase.storage.from('order-photos').getPublicUrl(item.pre_ship_photo_path).data.publicUrl
  }

  // Open a clean printable window for the whole order (all of THIS seller's
  // line items on the order — buyers may have ordered from other sellers in
  // the same checkout, but those aren't ours to ship).
  function printPackingSlip(orderId) {
    const orderRows = rows.filter(r => r.orders?.id === orderId)
    if (!orderRows.length) return
    const order = orderRows[0].orders
    const customer = customerNameFor(order)
    const addr = formatAddress(order?.shipping_address) ?? []
    const created = order?.created_at ? new Date(order.created_at).toLocaleDateString() : ''
    const itemsHtml = orderRows.map(r => {
      const label = r.products?.label ?? '—'
      const variant = [r.size_label, r.swatch_name].filter(Boolean).join(' · ')
      const lineTotal = ((r.quantity ?? 0) * (r.unit_price ?? 0)).toFixed(2)
      return `
        <tr>
          <td>${escapeHtml(label)}${variant ? `<br><span class="dim">${escapeHtml(variant)}</span>` : ''}</td>
          <td class="num">${r.quantity ?? 0}</td>
          <td class="num">$${(r.unit_price ?? 0).toFixed(2)}</td>
          <td class="num">$${lineTotal}</td>
        </tr>`
    }).join('')
    const total = orderRows.reduce((sum, r) => sum + (r.quantity ?? 0) * (r.unit_price ?? 0), 0).toFixed(2)
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Packing Slip — ${escapeHtml(orderId.slice(0, 8))}</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #1a1a2e; padding: 32px 40px; max-width: 720px; margin: 0 auto; }
        h1 { font-size: 24px; margin: 0 0 4px; }
        .brand { font-size: 12px; color: #7a6ca6; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
        .col { flex: 1; }
        .label { font-size: 10px; color: #9a8fb0; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px; }
        .value { font-size: 13px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e4e0ec; font-size: 13px; }
        th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #9a8fb0; }
        .num { text-align: right; }
        .total-row td { border-bottom: none; font-weight: 700; padding-top: 14px; }
        .dim { color: #9a8fb0; font-size: 11px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e0ec; font-size: 11px; color: #7a6ca6; text-align: center; line-height: 1.6; }
        @media print { body { padding: 12px 20px; } }
      </style></head><body>
      <div class="brand">DaydreamDwelling</div>
      <h1>Packing Slip</h1>
      <div class="row">
        <div class="col">
          <div class="label">Order ID</div>
          <div class="value" style="font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(orderId)}</div>
          <div class="label" style="margin-top:10px">Date</div>
          <div class="value">${escapeHtml(created)}</div>
        </div>
        <div class="col">
          <div class="label">Ship To</div>
          <div class="value">${escapeHtml(customer)}<br>${addr.map(escapeHtml).join('<br>')}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Total</th></tr></thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row"><td colspan="3" class="num">Subtotal</td><td class="num">$${total}</td></tr>
        </tbody>
      </table>
      <div class="footer">
        ${sellerName ? `Packed with care by <strong>${escapeHtml(sellerName)}</strong><br>` : ''}
        daydreamdwelling.com · Questions? Reply to your order confirmation email.
      </div>
      <script>window.onload = () => { window.print(); };</script>
      </body></html>`
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) return
    w.document.write(html)
    w.document.close()
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
  }

  async function saveNote(itemId, text) {
    const trimmed = text.trim()
    const value = trimmed.length ? trimmed : null
    await supabase.from('order_items').update({ seller_note: value }).eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId ? { ...r, seller_note: value } : r))
    setNotes(prev => { const { [itemId]: _, ...rest } = prev; return rest })
    setNoteSaved(prev => ({ ...prev, [itemId]: true }))
    setTimeout(() => setNoteSaved(prev => { const { [itemId]: _, ...rest } = prev; return rest }), 2000)
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

  // Per-buyer lifetime stats (this seller only). Buyer key falls back to
  // guest_email for non-logged-in checkouts so repeat guests still count.
  const buyerStats = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      const o = r.orders
      if (!o) continue
      if (o.status !== 'paid' && o.status !== 'fulfilled') continue
      const key = o.user_id || o.guest_email
      if (!key) continue
      const entry = map.get(key) || { orderIds: new Set(), lifetime: 0, first: null }
      entry.orderIds.add(o.id)
      entry.lifetime += (r.quantity ?? 0) * (r.unit_price ?? 0)
      const createdAt = o.created_at ? new Date(o.created_at).getTime() : null
      if (createdAt && (!entry.first || createdAt < entry.first)) entry.first = createdAt
      map.set(key, entry)
    }
    return map
  }, [rows])

  function statsForOrder(order) {
    if (!order) return null
    const key = order.user_id || order.guest_email
    if (!key) return null
    const entry = buyerStats.get(key)
    if (!entry) return null
    return { count: entry.orderIds.size, lifetime: entry.lifetime, first: entry.first }
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
                          {order?.id && (
                            <button
                              style={s.printBtn}
                              onClick={e => { e.stopPropagation(); printPackingSlip(order.id) }}
                              title="Open a printable packing slip for this order"
                            >
                              🖨 Print Packing Slip
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p style={s.detailLabel}>Customer</p>
                        <p style={s.detailValue}>{customer}</p>
                        {email ? (
                          <a href={`mailto:${email}?subject=${encodeURIComponent('Your DaydreamDwelling order')}`} style={s.contactEmail} onClick={e => e.stopPropagation()}>
                            ✉ {email}
                          </a>
                        ) : (
                          <p style={s.dimMicro}>No contact email on file</p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {(() => {
                            const stats = statsForOrder(order)
                            if (!stats || stats.count < 2) return null
                            return (
                              <div style={s.ltvBadge} title={stats.first ? `First order: ${new Date(stats.first).toLocaleDateString()}` : undefined}>
                                ⭐ Repeat customer · {stats.count} paid orders · ${stats.lifetime.toFixed(2)} lifetime
                              </div>
                            )
                          })()}
                          {order?.buyer_mood && (
                            <div style={s.moodBadge}>
                              ✨ Ordered for their <strong>{order.buyer_mood}</strong>
                              {order.buyer_room_name ? <> <em>{order.buyer_room_name}</em></> : ' room'}
                            </div>
                          )}
                        </div>
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
                      <div onClick={e => e.stopPropagation()}>
                        <p style={s.detailLabel}>
                          Private Note <span style={s.dimMicro}>(only you see this)</span>
                        </p>
                        <textarea
                          style={s.noteInput}
                          placeholder="Reminders for yourself — e.g. waiting on ribbon resupply, custom engraving requested, etc."
                          value={notes[item.id] ?? item.seller_note ?? ''}
                          onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          rows={2}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <button
                            style={s.noteSaveBtn}
                            onClick={() => saveNote(item.id, notes[item.id] ?? item.seller_note ?? '')}
                            disabled={(notes[item.id] ?? item.seller_note ?? '') === (item.seller_note ?? '')}
                          >
                            Save Note
                          </button>
                          {noteSaved[item.id] && <span style={s.noteSavedFlash}>✓ Saved</span>}
                        </div>
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

                        <div style={s.preShipBlock}>
                          <p style={s.detailLabel}>
                            Pre-Ship Photo <span style={s.dimMicro}>(buyer sees this in their order)</span>
                          </p>
                          {(() => {
                            const url = preShipUrlFor(item)
                            if (url) {
                              return (
                                <div style={s.preShipRow}>
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt="Pre-ship photo" style={s.preShipThumb} />
                                  </a>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ ...s.noteSaveBtn, textAlign: 'center', cursor: uploading[item.id] ? 'default' : 'pointer', opacity: uploading[item.id] ? 0.6 : 1 }}>
                                      {uploading[item.id] ? 'Uploading…' : 'Replace'}
                                      <input type="file" accept="image/*" hidden disabled={uploading[item.id]} onChange={e => uploadPreShipPhoto(item.id, e.target.files?.[0])} />
                                    </label>
                                    <button style={s.preShipRemoveBtn} onClick={() => removePreShipPhoto(item.id, item.pre_ship_photo_path)}>Remove</button>
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <label style={{ ...s.noteSaveBtn, display: 'inline-block', cursor: uploading[item.id] ? 'default' : 'pointer', opacity: uploading[item.id] ? 0.6 : 1 }}>
                                {uploading[item.id] ? 'Uploading…' : '+ Add Photo'}
                                <input type="file" accept="image/*" hidden disabled={uploading[item.id]} onChange={e => uploadPreShipPhoto(item.id, e.target.files?.[0])} />
                              </label>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                    {item.fulfillment_status === 'delivered' && (
                      <div style={s.deliveredNote}>
                        <span>✓ Delivered — no further action needed</span>
                        <button
                          style={s.undoBtn}
                          onClick={() => markFulfillment(item.id, 'shipped')}
                          title="Revert this item back to shipped"
                        >
                          Undo
                        </button>
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
    contactEmail:    { display: 'inline-block', marginTop: 6, padding: '4px 10px', background: `${t.accent}14`, color: t.accent, textDecoration: 'none', fontWeight: 600, fontSize: 13, borderRadius: 6, fontFamily: 'ui-monospace, system-ui, sans-serif' },
    addressBlock:    { fontSize: 13, color: t.text, lineHeight: 1.55 },
    fulfillmentPanel:{ marginTop: 4 },
    stepRow:         { display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 },
    stepBtn:         { padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    trackingRow:     { display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
    trackingInput:   { flex: 1, minWidth: 200, padding: '8px 12px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none' },
    trackingBtn:     { padding: '8px 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    deliveredBtn:    { padding: '8px 14px', background: '#7adda0', color: '#1a4a2a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    noteInput:       { width: '100%', padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', border: '1px solid rgba(180,160,220,0.32)', borderRadius: 8, background: 'rgba(255,255,255,0.6)', color: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
    noteSaveBtn:     { padding: '5px 12px', background: 'rgba(180,160,220,0.18)', color: '#6a4ca6', border: '1px solid rgba(180,160,220,0.32)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    noteSavedFlash:  { fontSize: 11, color: '#3a7a4e', fontWeight: 500 },
    preShipBlock:    { marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(180,160,220,0.25)' },
    preShipRow:      { display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 6 },
    preShipThumb:    { width: 96, height: 96, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(180,160,220,0.32)', display: 'block', cursor: 'zoom-in' },
    preShipRemoveBtn:{ padding: '5px 12px', background: 'transparent', color: '#9a6868', border: '1px solid rgba(180,120,120,0.32)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
    ltvBadge:        { display: 'inline-block', marginTop: 6, padding: '4px 10px', background: 'linear-gradient(135deg, #fdf3d8 0%, #f5e1a8 100%)', border: '1px solid #d4b870', borderRadius: 14, fontSize: 11, fontWeight: 600, color: '#8a6a1c' },
    printBtn:        { marginTop: 8, padding: '6px 12px', background: 'transparent', color: '#6a4ca6', border: '1px solid rgba(180,160,220,0.32)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
    moodBadge:       { display: 'inline-block', marginTop: 6, padding: '4px 10px', background: 'linear-gradient(135deg, #f0e8ff 0%, #d8c8f4 100%)', border: '1px solid #b89ce0', borderRadius: 14, fontSize: 11, color: '#5a3a8a', fontWeight: 500 },
    deliveredNote:   { marginTop: 6, padding: '10px 14px', background: '#eef9f1', border: '1px solid #c8e8d4', borderRadius: 8, color: '#3a7a4e', fontSize: 13, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    undoBtn:         { background: 'transparent', border: '1px solid #88c896', color: '#3a7a4e', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  }
}
