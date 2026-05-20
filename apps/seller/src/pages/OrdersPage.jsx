import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import useMessageThread from '@shared/useMessageThread'

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
  const [selected, setSelected]     = useState(() => new Set())
  const [bulkTracking, setBulkTracking] = useState('')
  const [bulkBusy,     setBulkBusy]     = useState(false)
  const [actionPrompt, setActionPrompt] = useState(null) // { type: 'cancel'|'escalate', orderId, reason }

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
                 escalated_at, escalation_note, cancelled_at, cancellation_reason,
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

  function toggleSelect(itemId, checked) {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }

  function toggleSelectAll(visibleIds, checked) {
    setSelected(prev => {
      const next = new Set(prev)
      for (const id of visibleIds) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function clearSelection() { setSelected(new Set()) }

  async function bulkMarkShipped() {
    const trimmed = bulkTracking.trim()
    if (!trimmed || !selected.size) return
    setBulkBusy(true)
    const ids = [...selected]
    await supabase.from('order_items')
      .update({ tracking_number: trimmed, fulfillment_status: 'shipped' })
      .in('id', ids)
    setRows(prev => prev.map(r => ids.includes(r.id)
      ? { ...r, tracking_number: trimmed, fulfillment_status: 'shipped' }
      : r))
    setBulkTracking('')
    clearSelection()
    setBulkBusy(false)
  }

  async function bulkMarkStatus(status) {
    if (!selected.size) return
    setBulkBusy(true)
    const ids = [...selected]
    await supabase.from('order_items').update({ fulfillment_status: status }).in('id', ids)
    setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, fulfillment_status: status } : r))
    clearSelection()
    setBulkBusy(false)
  }

  async function confirmCancelOrder(orderId, reason) {
    const { error } = await supabase.rpc('seller_cancel_order', { p_order_id: orderId, p_reason: reason || null })
    if (error) { console.warn('[cancel]', error.message); return }
    const now = new Date().toISOString()
    setRows(prev => prev.map(r => r.orders?.id === orderId
      ? { ...r, orders: { ...r.orders, status: 'cancelled', cancelled_at: now, cancellation_reason: reason || null } }
      : r))
    setActionPrompt(null)
  }

  async function confirmEscalateOrder(orderId, note) {
    const { error } = await supabase.rpc('seller_escalate_order', { p_order_id: orderId, p_note: note || null })
    if (error) { console.warn('[escalate]', error.message); return }
    const now = new Date().toISOString()
    setRows(prev => prev.map(r => r.orders?.id === orderId
      ? { ...r, orders: { ...r.orders, escalated_at: now, escalation_note: note || null } }
      : r))
    setActionPrompt(null)
  }

  async function clearEscalation(orderId) {
    const { error } = await supabase.rpc('seller_clear_escalation', { p_order_id: orderId })
    if (error) { console.warn('[clear-escalation]', error.message); return }
    setRows(prev => prev.map(r => r.orders?.id === orderId
      ? { ...r, orders: { ...r.orders, escalated_at: null, escalation_note: null } }
      : r))
  }

  function bulkPrintSlips() {
    if (!selected.size) return
    const orderIds = [...new Set([...selected].map(id => rows.find(r => r.id === id)?.orders?.id).filter(Boolean))]
    printPackingSlips(orderIds)
  }

  // Render the inner body of a single slip — no doctype/head/script. Used to
  // assemble multi-slip print docs by concatenating with a page-break div
  // between each entry.
  function renderSlipBody(orderId) {
    const orderRows = rows.filter(r => r.orders?.id === orderId)
    if (!orderRows.length) return ''
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
    return `
      <section class="slip">
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
      </section>`
  }

  // Open one printable window containing any number of packing slips, each
  // on its own page via CSS page-break-after. Browsers only honor one
  // window.open() per click, so bulk printing must stay in a single doc.
  function printPackingSlips(orderIds) {
    if (!orderIds?.length) return
    const bodies = orderIds.map(renderSlipBody).filter(Boolean).join(
      '<div class="page-break"></div>'
    )
    const title = orderIds.length === 1
      ? `Packing Slip — ${escapeHtml(orderIds[0].slice(0, 8))}`
      : `Packing Slips — ${orderIds.length} orders`
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
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
        .slip { page-break-inside: avoid; }
        .page-break { page-break-after: always; height: 0; }
        @media screen { .page-break { border-top: 2px dashed #d4ccea; margin: 40px 0; } }
        @media print { body { padding: 12px 20px; } .page-break { border: none; margin: 0; } }
      </style></head><body>
      ${bodies}
      <script>window.onload = () => { window.print(); };</script>
      </body></html>`
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) return
    w.document.write(html)
    w.document.close()
  }

  // Single-order entry point (kept for the per-order "🖨 Print Packing Slip"
  // button in the expanded detail view).
  function printPackingSlip(orderId) {
    printPackingSlips([orderId])
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
  // Distinct order ids per buyer across all rows — drives the "Same buyer,
  // N orders" badge so sellers can spot bundles to ship together. Computed
  // against the full row set (not the filtered view) so the count stays
  // stable regardless of date/status filters.
  const buyerOrdersInView = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      const o = r.orders
      if (!o) continue
      const key = o.user_id || o.guest_email || (o.shipping_address && (o.shipping_address.name || o.shipping_address.email))
      if (!key) continue
      const entry = map.get(key) || new Set()
      entry.add(o.id)
      map.set(key, entry)
    }
    return map
  }, [rows])

  function buyerKeyFor(order) {
    if (!order) return null
    return order.user_id || order.guest_email || (order.shipping_address && (order.shipping_address.name || order.shipping_address.email)) || null
  }

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
    const passed = rows.filter(r => {
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
    // Group rows by buyer so multiple current orders from the same person sit
    // together visually. Within a group, keep the most-recent order first.
    // For ungrouped buyers (single order), sort the buyer's earliest-active
    // order to its natural position by date.
    const byBuyer = new Map()
    for (const r of passed) {
      const key = buyerKeyFor(r.orders) ?? `__solo_${r.id}`
      if (!byBuyer.has(key)) byBuyer.set(key, [])
      byBuyer.get(key).push(r)
    }
    // Sort groups themselves by the most recent order_item created_at in each
    // group (so the table top stays "most recent activity first").
    const groups = [...byBuyer.entries()].map(([key, items]) => ({
      key,
      items: items.sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)),
      recent: Math.max(...items.map(it => new Date(it.created_at ?? 0).getTime() || 0)),
    }))
    groups.sort((a, b) => b.recent - a.recent)
    return groups.flatMap(g => g.items)
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
            <span>
              <input
                type="checkbox"
                checked={filtered.length > 0 && filtered.every(r => selected.has(r.id))}
                ref={el => { if (el) el.indeterminate = filtered.some(r => selected.has(r.id)) && !filtered.every(r => selected.has(r.id)) }}
                onChange={e => toggleSelectAll(filtered.map(r => r.id), e.target.checked)}
                title={filtered.every(r => selected.has(r.id)) ? 'Deselect all' : 'Select all'}
              />
            </span>
            <span>Product</span><span>Customer</span><span>Qty</span><span>Amount</span><span>Payment</span><span>Fulfillment</span><span>Date</span>
          </div>
          {filtered.map((item, idx) => {
            const order = item.orders
            const email = contactEmailFor(order)
            const customer = customerNameFor(order)
            const addressLines = formatAddress(order?.shipping_address)
            const variant = [item.size_label, item.swatch_name].filter(Boolean).join(' · ')
            const imgUrl = imageUrlFor(item)
            const productLabel = item.products?.label ?? item.product_name ?? '—'
            // Continuation row = same buyer as previous AND part of a 2+ cluster.
            const currentKey = buyerKeyFor(order)
            const prevKey    = idx > 0 ? buyerKeyFor(filtered[idx - 1]?.orders) : null
            const clusterSize = currentKey ? (buyerOrdersInView.get(currentKey)?.size ?? 0) : 0
            const isContinuation = clusterSize >= 2 && currentKey && currentKey === prevKey
            const isClusterMember = clusterSize >= 2 && currentKey
            const isClusterStart  = isClusterMember && currentKey !== prevKey
            const clusterAddress  = isClusterStart ? (formatAddress(order?.shipping_address) ?? []).join(', ') : null
            return (
              <div key={item.id}>
                {isClusterStart && (
                  <div style={s.clusterHeader}>
                    📦 <strong>Ship together:</strong> {buyerOrdersInView.get(currentKey).size} active orders for <strong>{customer}</strong>
                    {clusterAddress ? <> · <span style={s.clusterAddress}>{clusterAddress}</span></> : null}
                  </div>
                )}
                <div
                  style={{
                    ...s.tableRow,
                    background: expanded === item.id ? `${t.accent}08` : selected.has(item.id) ? `${t.accent}05` : isClusterMember ? `${t.accent}0a` : 'transparent',
                    cursor: 'pointer',
                    ...(isClusterMember ? s.clusterTrail : {}),
                  }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <span style={s.cell} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={e => toggleSelect(item.id, e.target.checked)}
                    />
                  </span>
                  <span style={{ ...s.cell, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ProductThumb url={imgUrl} label={productLabel} size={42} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productLabel}</div>
                      {variant && <div style={s.variantSub}>{variant}</div>}
                    </div>
                  </span>
                  <span style={s.cell}>
                    {isContinuation ? <span style={s.continuationCustomer}>↪ {customer}</span> : customer}
                  </span>
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
                    {order?.user_id && (
                      <SellerMessageBlock orderId={order.id} partnerId={order.user_id} partnerName={customer} t={t} s={s} user={user} />
                    )}
                    {!order?.user_id && order?.guest_email && (
                      <div style={s.guestMsgNote}>
                        This buyer checked out as a guest — they don't have an in-app inbox.
                        Reach them via <a href={`mailto:${order.guest_email}`} style={s.contactLink}>{order.guest_email}</a>.
                      </div>
                    )}

                    {/* Order-level seller actions: escalate (flag for Hayley)
                        or cancel outright. Both write to RPCs that gate on
                        order_items.seller_id = auth.uid(). */}
                    <div style={s.actionRow} onClick={e => e.stopPropagation()}>
                      {order?.escalated_at ? (
                        <div style={s.escalatedBanner}>
                          🚩 <strong>Escalated</strong>
                          {order.escalation_note ? <> · {order.escalation_note}</> : null}
                          <button style={s.clearEscalateBtn} onClick={() => clearEscalation(order.id)} title="Mark resolved">
                            Clear
                          </button>
                        </div>
                      ) : order?.status !== 'cancelled' && (
                        <button
                          style={s.escalateBtn}
                          onClick={() => setActionPrompt({ type: 'escalate', orderId: order.id, reason: '' })}
                          title="Flag this order for admin attention"
                        >
                          🚩 Escalate
                        </button>
                      )}
                      {order?.status === 'cancelled' ? (
                        <div style={s.cancelledBanner}>
                          ❌ <strong>Cancelled</strong>
                          {order.cancellation_reason ? <> · {order.cancellation_reason}</> : null}
                        </div>
                      ) : (
                        <button
                          style={s.cancelBtn}
                          onClick={() => setActionPrompt({ type: 'cancel', orderId: order.id, reason: '' })}
                          title="Cancel this order (buyer refund handled separately)"
                        >
                          ❌ Cancel order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {actionPrompt && (
        <div style={s.modalBackdrop} onClick={() => setActionPrompt(null)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>
              {actionPrompt.type === 'cancel' ? 'Cancel this order?' : 'Escalate this order'}
            </h3>
            <p style={s.modalBody}>
              {actionPrompt.type === 'cancel'
                ? "The order status flips to cancelled. The buyer's payment isn't auto-refunded — refund through Stripe (or your payment dashboard) separately."
                : "Flags this order for admin review. Use when something is wrong that you can't resolve alone (damaged stock, suspicious address, buyer dispute)."}
            </p>
            <textarea
              style={s.modalInput}
              placeholder={actionPrompt.type === 'cancel' ? 'Reason (optional, but recommended)' : 'What needs admin attention?'}
              value={actionPrompt.reason}
              onChange={e => setActionPrompt(p => ({ ...p, reason: e.target.value }))}
              rows={3}
              autoFocus
            />
            <div style={s.modalActions}>
              <button style={s.modalCancel} onClick={() => setActionPrompt(null)}>Never mind</button>
              <button
                style={actionPrompt.type === 'cancel' ? s.modalConfirmDanger : s.modalConfirm}
                onClick={() => {
                  if (actionPrompt.type === 'cancel') confirmCancelOrder(actionPrompt.orderId, actionPrompt.reason)
                  else confirmEscalateOrder(actionPrompt.orderId, actionPrompt.reason)
                }}
              >
                {actionPrompt.type === 'cancel' ? 'Cancel order' : 'Send escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div style={s.bulkBar} onClick={e => e.stopPropagation()}>
          <div style={s.bulkInfo}>
            <strong>{selected.size}</strong> item{selected.size === 1 ? '' : 's'} selected
            <button style={s.bulkClear} onClick={clearSelection}>Clear</button>
          </div>
          <div style={s.bulkActions}>
            <div style={s.bulkTrackingGroup}>
              <input
                style={s.bulkInput}
                placeholder="Tracking number…"
                value={bulkTracking}
                onChange={e => setBulkTracking(e.target.value)}
                disabled={bulkBusy}
              />
              <button
                style={s.bulkPrimary}
                disabled={!bulkTracking.trim() || bulkBusy}
                onClick={bulkMarkShipped}
                title="Set this tracking number on all selected items and mark them shipped"
              >
                {bulkBusy ? '…' : 'Ship All'}
              </button>
            </div>
            <button style={s.bulkSecondary} disabled={bulkBusy} onClick={() => bulkMarkStatus('packed')}>
              Mark Packed
            </button>
            <button style={s.bulkSecondary} disabled={bulkBusy} onClick={() => bulkMarkStatus('delivered')}>
              Mark Delivered
            </button>
            <button style={s.bulkSecondary} disabled={bulkBusy} onClick={bulkPrintSlips}>
              🖨 Print Slips
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Order-scoped buyer↔seller thread. Collapsed by default; opens to show
// conversation + send box. Only renders when the buyer is logged-in (we have
// their user_id); guests fall back to the mailto path.
function SellerMessageBlock({ orderId, partnerId, partnerName, t, s, user }) {
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
              <p style={s.msgEmpty}>No messages yet — start the conversation.</p>
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
    tableHead:       { display: 'grid', gridTemplateColumns: '36px 2fr 1.4fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', background: `${t.accent}06`, fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' },
    tableRow:        { display: 'grid', gridTemplateColumns: '36px 2fr 1.4fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', borderTop: `1px solid ${t.surfaceBorder}`, alignItems: 'center' },
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
    msgBlock:        { marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(180,160,220,0.25)' },
    msgToggle:       { background: 'transparent', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 },
    msgCount:        { color: t.textSoft, fontWeight: 400, fontSize: 12 },
    msgUnread:       { marginLeft: 6, padding: '2px 7px', background: t.accent, color: t.accentText, borderRadius: 10, fontSize: 10, fontWeight: 700 },
    msgPanel:        { marginTop: 10, background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
    msgList:         { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto', paddingRight: 4 },
    msgEmpty:        { fontSize: 12, color: t.textSoft, fontStyle: 'italic', margin: 0, padding: '8px 0', textAlign: 'center' },
    msgBubble:       { padding: '7px 11px', borderRadius: 10, maxWidth: '80%' },
    msgBubbleMine:   { background: t.accent, color: t.accentText, alignSelf: 'flex-end' },
    msgBubbleTheirs: { background: t.surface, color: t.text, alignSelf: 'flex-start', border: `1px solid ${t.surfaceBorder}` },
    msgBody:         { margin: 0, fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    msgTime:         { margin: '3px 0 0', fontSize: 10, opacity: 0.65 },
    msgInputRow:     { display: 'flex', gap: 6 },
    msgInput:        { flex: 1, padding: '8px 11px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none' },
    msgSend:         { padding: '8px 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    guestMsgNote:    { marginTop: 14, padding: '10px 14px', background: 'rgba(255,200,120,0.12)', border: '1px solid rgba(255,200,120,0.4)', borderRadius: 8, color: t.text, fontSize: 12, lineHeight: 1.5 },
    bulkBar:         { position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, boxShadow: '0 10px 30px rgba(60,40,120,0.18), 0 4px 12px rgba(60,40,120,0.10)', zIndex: 50, backdropFilter: 'blur(12px)' },
    bulkInfo:        { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: t.text },
    bulkClear:       { background: 'transparent', border: 'none', color: t.textSoft, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' },
    bulkActions:     { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    bulkTrackingGroup: { display: 'flex', alignItems: 'center', gap: 6 },
    bulkInput:       { padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none', width: 180 },
    bulkPrimary:     { padding: '7px 14px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    bulkSecondary:   { padding: '7px 14px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
    continuationCustomer: { color: t.textSoft, fontSize: 12, fontStyle: 'italic' },
    clusterTrail:    { boxShadow: `inset 4px 0 0 ${t.accent}` },
    clusterHeader:   { padding: '10px 18px', background: `linear-gradient(90deg, ${t.accent}22 0%, ${t.accent}10 100%)`, borderTop: `1px solid ${t.accent}40`, borderLeft: `4px solid ${t.accent}`, fontSize: 12, color: t.text, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    clusterAddress:  { color: t.textSoft, fontStyle: 'italic' },
    actionRow:       { marginTop: 16, paddingTop: 14, borderTop: `1px dashed rgba(180,160,220,0.25)`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
    escalateBtn:     { padding: '7px 14px', background: 'transparent', border: '1px solid #e4a868', color: '#8a5a2a', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    cancelBtn:       { padding: '7px 14px', background: 'transparent', border: '1px solid #d49090', color: '#9a4848', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    escalatedBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff4e0', border: '1px solid #f0c890', borderRadius: 8, color: '#8a5a2a', fontSize: 13 },
    cancelledBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fce8e8', border: '1px solid #d8a8a8', borderRadius: 8, color: '#8a3a3a', fontSize: 13 },
    clearEscalateBtn:{ marginLeft: 'auto', padding: '4px 10px', background: 'transparent', border: '1px solid #c89868', color: '#8a5a2a', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer' },
    modalBackdrop:   { position: 'fixed', inset: 0, background: 'rgba(20,16,40,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalCard:       { background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: 24, maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 20px 40px rgba(20,16,40,0.35)' },
    modalTitle:      { fontSize: 18, fontWeight: 700, color: t.text, margin: 0 },
    modalBody:       { fontSize: 13, color: t.textSoft, lineHeight: 1.55, margin: 0 },
    modalInput:      { padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, background: t.surface, color: t.text, outline: 'none', resize: 'vertical' },
    modalActions:    { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
    modalCancel:     { padding: '8px 14px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.text, borderRadius: 7, fontSize: 13, cursor: 'pointer' },
    modalConfirm:    { padding: '8px 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    modalConfirmDanger: { padding: '8px 16px', background: '#c25656', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    deliveredNote:   { marginTop: 6, padding: '10px 14px', background: '#eef9f1', border: '1px solid #c8e8d4', borderRadius: 8, color: '#3a7a4e', fontSize: 13, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    undoBtn:         { background: 'transparent', border: '1px solid #88c896', color: '#3a7a4e', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  }
}
