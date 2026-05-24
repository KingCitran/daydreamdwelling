import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Dedicated Shipping History page. Independent of OrdersPage — this is where
// the seller comes to see and reprint everything they've ever shipped, grouped
// into work sessions, with totals + a detailed line-by-line table below.
//
// Stats header → Sessions list → Shipped items table.

export default function ShippingHistoryPage() {
  const { user } = useAuth()
  const t = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: 'date', dir: 'desc' })
  const [toast, setToast] = useState(null)
  const [sellerName, setSellerName] = useState('')

  function showToast(kind, message) {
    setToast({ kind, message, id: Date.now() })
    setTimeout(() => setToast(t => (t && t.message === message) ? null : t), 4000)
  }

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return }
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
      if (!productIds.length) { setItems([]); setLoading(false); return }
      const { data } = await supabase
        .from('order_items')
        .select(`
          id, quantity, unit_price, size_label, swatch_name,
          fulfillment_status, tracking_number, label_url, label_purchased_at,
          shipping_cost_cents, shipping_carrier, shipping_service, label_session_id,
          products(label, product_images(storage_path, is_primary)),
          orders(id, status, shipping_address, guest_email, user_id, created_at,
                 customer:profiles!orders_user_id_fkey(display_name))
        `)
        .in('product_id', productIds)
        .not('label_url', 'is', null)
        .order('label_purchased_at', { ascending: false })
      setItems(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  // Lifetime stats — total labels printed, total postage spent, total
  // shipments (distinct tracking numbers), avg cost per shipment.
  const stats = useMemo(() => {
    const totalLabels = items.length
    const totalCents = items.reduce((s, i) => s + (i.shipping_cost_cents ?? 0), 0)
    const distinctTracking = new Set(items.map(i => i.tracking_number).filter(Boolean))
    const totalShipments = distinctTracking.size
    const avgCents = totalShipments > 0 ? totalCents / totalShipments : 0
    return { totalLabels, totalCents, totalShipments, avgCents }
  }, [items])

  // Sessions list — group by label_session_id (items without one fall into a
  // synthetic 'no session' bucket so they're still visible).
  const sessions = useMemo(() => {
    const groups = new Map()
    for (const i of items) {
      const sid = i.label_session_id || '__none__'
      const g = groups.get(sid) || { id: sid, items: [], earliest: null, totalCents: 0 }
      g.items.push(i)
      const t = i.label_purchased_at ? new Date(i.label_purchased_at).getTime() : null
      if (t && (!g.earliest || t < g.earliest)) g.earliest = t
      g.totalCents += i.shipping_cost_cents || 0
      groups.set(sid, g)
    }
    return [...groups.values()].sort((a, b) => (b.earliest ?? 0) - (a.earliest ?? 0))
  }, [items])

  // Filtered + sorted items for the table at the bottom.
  const tableItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    let filtered = items
    if (q) {
      filtered = items.filter(i => {
        const product = (i.products?.label ?? '').toLowerCase()
        const tracking = (i.tracking_number ?? '').toLowerCase()
        const customer = customerNameFor(i.orders).toLowerCase()
        return product.includes(q) || tracking.includes(q) || customer.includes(q)
      })
    }
    const dir = sort.dir === 'asc' ? 1 : -1
    const get = (r) => {
      switch (sort.col) {
        case 'product':  return (r.products?.label ?? '').toLowerCase()
        case 'customer': return customerNameFor(r.orders).toLowerCase()
        case 'carrier':  return r.shipping_carrier ?? ''
        case 'cost':     return r.shipping_cost_cents ?? 0
        case 'tracking': return r.tracking_number ?? ''
        case 'date':
        default:         return r.label_purchased_at ? new Date(r.label_purchased_at).getTime() : 0
      }
    }
    return [...filtered].sort((a, b) => {
      const av = get(a), bv = get(b)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  }, [items, search, sort])

  function toggleSort(col) {
    setSort(prev => prev.col === col
      ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: 'desc' })
  }

  function printLabelsByUrls(urls) {
    if (!urls?.length) { showToast('info', 'No labels to print'); return }
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Labels — ${urls.length}</title>
      <style>
        body { margin: 0; padding: 0; font-family: system-ui, sans-serif; background: #fff; }
        .label-page { width: 4in; height: 6in; page-break-after: always; overflow: hidden; }
        .label-page:last-child { page-break-after: auto; }
        iframe { width: 100%; height: 100%; border: 0; }
        @media print { body { margin: 0; padding: 0; } @page { size: 4in 6in; margin: 0; } }
      </style></head><body>
      ${urls.map(u => `<div class="label-page"><iframe src="${escapeHtml(u)}"></iframe></div>`).join('')}
      <script>
        let loaded = 0
        const frames = document.querySelectorAll('iframe')
        frames.forEach(f => f.addEventListener('load', () => {
          loaded += 1
          if (loaded === frames.length) setTimeout(() => window.print(), 600)
        }))
      </script>
      </body></html>`
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) { showToast('error', 'Popup blocked — allow popups for this site'); return }
    w.document.write(html)
    w.document.close()
  }

  function printSessionSlips(sess) {
    const groups = new Map()
    for (const r of sess.items) {
      const key = r.tracking_number ? `trk:${r.tracking_number}` : `ord:${r.orders?.id ?? r.id}`
      const list = groups.get(key) || []
      list.push(r)
      groups.set(key, list)
    }
    const bodies = [...groups.values()].map(g => renderSlipBody(g, sellerName)).filter(Boolean).join('<div class="page-break"></div>')
    const html = wrapPrintDoc(`Packing Slips — ${groups.size}`, bodies)
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) { showToast('error', 'Popup blocked'); return }
    w.document.write(html)
    w.document.close()
  }

  const s = makeStyles(t)

  if (!user) return <div style={s.page}><p style={s.dim}>Sign in to see shipping history.</p></div>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Shipping History</h1>
          <p style={s.subtitle}>Every label you've printed, grouped by session.</p>
        </div>
      </header>

      {/* Stats row */}
      <div style={s.statsRow}>
        <StatCard t={t} label="Labels Printed" value={stats.totalLabels} />
        <StatCard t={t} label="Shipments" value={stats.totalShipments} />
        <StatCard t={t} label="Total Postage" value={`$${(stats.totalCents / 100).toFixed(2)}`} />
        <StatCard t={t} label="Avg per Shipment" value={`$${(stats.avgCents / 100).toFixed(2)}`} />
      </div>

      {loading ? (
        <p style={s.dim}>Loading…</p>
      ) : sessions.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No shipping history yet</p>
          <p style={s.dim}>When you generate labels on the Orders page, they'll appear here grouped by session.</p>
        </div>
      ) : (
        <>
          <section style={s.sessionsSection}>
            <h2 style={s.sectionTitle}>Sessions</h2>
            <div style={s.sessionsList}>
              {sessions.map(sess => {
                const date = sess.earliest
                  ? new Date(sess.earliest).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : '—'
                const urls = [...new Set(sess.items.map(r => r.label_url).filter(Boolean))]
                const display = sess.id === '__none__' ? 'Older labels (pre-session-tracking)' : date
                return (
                  <div key={sess.id} style={s.sessionRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.sessionRowTitle}>{display}</div>
                      <div style={s.sessionRowMeta}>
                        {sess.items.length} label{sess.items.length === 1 ? '' : 's'}
                        {sess.totalCents > 0 && ` · $${(sess.totalCents / 100).toFixed(2)} postage`}
                      </div>
                    </div>
                    <button style={s.actionBtn} onClick={() => printLabelsByUrls(urls)}>
                      🏷️ Reprint Labels
                    </button>
                    <button style={s.actionBtn} onClick={() => printSessionSlips(sess)}>
                      🖨 Reprint Slips
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section style={s.tableSection}>
            <div style={s.tableHeader}>
              <h2 style={s.sectionTitle}>All Shipments ({tableItems.length})</h2>
              <input
                style={s.search}
                placeholder="Search product, customer, or tracking…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={s.tableWrap}>
              <div style={s.tHead}>
                {[
                  { col: 'date',     label: 'Ship Date' },
                  { col: 'product',  label: 'Product' },
                  { col: 'customer', label: 'Customer' },
                  { col: 'carrier',  label: 'Carrier' },
                  { col: 'tracking', label: 'Tracking' },
                  { col: 'cost',     label: 'Postage' },
                  { col: null,       label: '' },
                ].map(({ col, label }) => {
                  const active = col && sort.col === col
                  const arrow = active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''
                  return col
                    ? <span key={col} onClick={() => toggleSort(col)} style={{ ...s.tHeadCell, ...(active ? s.tHeadCellActive : {}) }}>{label}{arrow}</span>
                    : <span key="actions"></span>
                })}
              </div>
              {tableItems.map(it => (
                <div key={it.id} style={s.tRow}>
                  <span style={s.tCell}>{it.label_purchased_at ? new Date(it.label_purchased_at).toLocaleDateString() : '—'}</span>
                  <span style={s.tCell}>{it.products?.label ?? '—'}{it.size_label || it.swatch_name ? <span style={s.dimSmall}> · {[it.size_label, it.swatch_name].filter(Boolean).join(' · ')}</span> : null}</span>
                  <span style={s.tCell}>{customerNameFor(it.orders)}</span>
                  <span style={s.tCell}>{it.shipping_carrier ?? '—'}{it.shipping_service ? <span style={s.dimSmall}> · {it.shipping_service}</span> : null}</span>
                  <span style={{ ...s.tCell, ...s.mono }}>{it.tracking_number ?? '—'}</span>
                  <span style={s.tCell}>${typeof it.shipping_cost_cents === 'number' ? (it.shipping_cost_cents / 100).toFixed(2) : '—'}</span>
                  <span style={s.tCell}>
                    {it.label_url && (
                      <a href={it.label_url} target="_blank" rel="noopener noreferrer" style={s.rowLink}>Open</a>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {toast && (
        <div style={{ ...s.toast, ...(toast.kind === 'error' ? s.toastError : toast.kind === 'success' ? s.toastSuccess : s.toastInfo) }} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

function StatCard({ t, label, value }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: t.text }}>{value}</div>
    </div>
  )
}

function customerNameFor(order) {
  if (!order) return '—'
  const addr = order.shipping_address
  if (addr?.name) return addr.name
  if (addr?.first_name || addr?.last_name) return [addr.first_name, addr.last_name].filter(Boolean).join(' ')
  if (order.customer?.display_name) return order.customer.display_name
  if (order.guest_email) return order.guest_email.split('@')[0]
  return '—'
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
}

function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null
  const lines = []
  if (addr.line1 || addr.address_line1 || addr.street1) lines.push(addr.line1 || addr.address_line1 || addr.street1)
  if (addr.line2 || addr.address_line2 || addr.street2) lines.push(addr.line2 || addr.address_line2 || addr.street2)
  const cityLine = [addr.city, addr.state || addr.region, addr.postal_code || addr.zip].filter(Boolean).join(', ')
  if (cityLine) lines.push(cityLine)
  if (addr.country) lines.push(addr.country)
  return lines.length ? lines : null
}

function renderSlipBody(itemRows, sellerName) {
  if (!itemRows?.length) return ''
  const order = itemRows[0].orders
  const orderId = order?.id ?? ''
  const tracking = itemRows[0].tracking_number || null
  const customer = customerNameFor(order)
  const addr = formatAddress(order?.shipping_address) ?? []
  const itemsHtml = itemRows.map(r => {
    const label = r.products?.label ?? '—'
    const variant = [r.size_label, r.swatch_name].filter(Boolean).join(' · ')
    const lineTotal = ((r.quantity ?? 0) * (r.unit_price ?? 0)).toFixed(2)
    return `<tr><td>${escapeHtml(label)}${variant ? `<br><span class="dim">${escapeHtml(variant)}</span>` : ''}</td><td class="num">${r.quantity ?? 0}</td><td class="num">$${(r.unit_price ?? 0).toFixed(2)}</td><td class="num">$${lineTotal}</td></tr>`
  }).join('')
  const total = itemRows.reduce((sum, r) => sum + (r.quantity ?? 0) * (r.unit_price ?? 0), 0).toFixed(2)
  return `<section class="slip">
    <div class="brand">DaydreamDwelling</div>
    <h1>Packing Slip${itemRows.length > 1 ? ` · ${itemRows.length} items in one box` : ''}</h1>
    <div class="row"><div class="col"><div class="label">${tracking ? 'Tracking' : 'Order ID'}</div><div class="value mono">${escapeHtml(tracking || orderId)}</div></div>
    <div class="col"><div class="label">Ship To</div><div class="value">${escapeHtml(customer)}<br>${addr.map(escapeHtml).join('<br>')}</div></div></div>
    <table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Total</th></tr></thead>
    <tbody>${itemsHtml}<tr class="total-row"><td colspan="3" class="num">Subtotal</td><td class="num">$${total}</td></tr></tbody></table>
    <div class="footer">${sellerName ? `Packed with care by <strong>${escapeHtml(sellerName)}</strong><br>` : ''}daydreamdwelling.com</div>
  </section>`
}

function wrapPrintDoc(title, bodies) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: system-ui, sans-serif; color: #1a1a2e; padding: 32px 40px; max-width: 720px; margin: 0 auto; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      .brand { font-size: 12px; color: #7a6ca6; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
      .row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
      .col { flex: 1; }
      .label { font-size: 10px; color: #9a8fb0; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px; }
      .value { font-size: 13px; line-height: 1.5; }
      .mono { font-family: ui-monospace, monospace; font-size: 12px; }
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
    </style></head><body>${bodies}<script>window.onload = () => { window.print(); };</script></body></html>`
}

function makeStyles(t) {
  return {
    page:       { fontFamily: 'system-ui, sans-serif', color: t.text },
    header:     { marginBottom: 24 },
    title:      { fontSize: 28, fontWeight: 700, margin: 0, color: t.text },
    subtitle:   { fontSize: 13, color: t.textSoft, margin: '4px 0 0' },
    dim:        { fontSize: 13, color: t.textSoft, margin: 0 },
    dimSmall:   { fontSize: 11, color: t.textSoft },
    statsRow:   { display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' },
    empty:      { padding: 40, background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 14, textAlign: 'center' },
    emptyTitle: { fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 },
    sessionsSection: { marginBottom: 32 },
    sectionTitle:    { fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 14px' },
    sessionsList:    { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, overflow: 'hidden' },
    sessionRow:      { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${t.surfaceBorder}` },
    sessionRowTitle: { fontSize: 13, fontWeight: 600, color: t.text },
    sessionRowMeta:  { fontSize: 11, color: t.textSoft, marginTop: 2 },
    actionBtn:       { padding: '7px 14px', background: 'transparent', color: t.accent, border: `1px solid ${t.accent}40`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    tableSection:    { marginBottom: 32 },
    tableHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, gap: 12 },
    search:          { padding: '8px 14px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, background: t.surface, color: t.text, outline: 'none', width: 280 },
    tableWrap:       { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, overflow: 'hidden' },
    tHead:           { display: 'grid', gridTemplateColumns: '0.9fr 1.6fr 1.2fr 0.9fr 1.3fr 0.7fr 0.5fr', gap: 10, padding: '11px 18px', background: `${t.accent}06`, fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' },
    tHeadCell:       { cursor: 'pointer', userSelect: 'none' },
    tHeadCellActive: { color: t.accent, fontWeight: 700 },
    tRow:            { display: 'grid', gridTemplateColumns: '0.9fr 1.6fr 1.2fr 0.9fr 1.3fr 0.7fr 0.5fr', gap: 10, padding: '12px 18px', borderTop: `1px solid ${t.surfaceBorder}`, alignItems: 'center', fontSize: 13, color: t.text },
    tCell:           { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    mono:            { fontFamily: 'ui-monospace, monospace', fontSize: 11 },
    rowLink:         { color: t.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' },
    toast:           { position: 'fixed', bottom: 24, right: 24, padding: '12px 18px', borderRadius: 10, fontSize: 13, color: '#fff', boxShadow: '0 10px 30px rgba(20,16,40,0.25)', cursor: 'pointer', zIndex: 200 },
    toastSuccess:    { background: '#3a9a64' },
    toastError:      { background: '#c25656' },
    toastInfo:       { background: '#6a4ca6' },
  }
}
