import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Stat cards use a single neutral palette — visual differentiation comes
// from the value itself and the delta, not background color. Overdue gets
// special amber/green treatment because it's actionable.

export default function DashboardPage({ onNavigate }) {
  const { user, profile } = useAuth()
  const t = useTheme()
  const [stats,      setStats]      = useState(null)
  const [recent,     setRecent]     = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [needsAttn,  setNeedsAttn]  = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const { data: products } = await supabase
        .from('products').select('id, label').eq('seller_id', user.id)
      const productIds   = (products || []).map(p => p.id)
      const productNames = Object.fromEntries((products || []).map(p => [p.id, p.label]))

      const empty = {
        revenue: 0, revPrev: 0,
        orderCount: 0, orderPrev: 0,
        pendingCount: 0, pendingPrev: 0,
        productCount: productIds.length,
        aov: 0, aovPrev: 0,
        repeatRate: 0, totalCustomers: 0,
        overdueCount: 0,
        dailyRev: Array(30).fill(0),
      }
      let recentOrders = [], topRows = [], attnOrders = []

      if (productIds.length) {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, created_at, fulfillment_status, orders(id, status, created_at, user_id, guest_email)')
          .in('product_id', productIds)

        const now = Date.now()
        const day = 24 * 60 * 60 * 1000
        const cutoff30 = now - 30 * day
        const cutoff60 = now - 60 * day
        const cutoffOverdue = now - 3 * day

        // Per-period aggregates (last 30d vs prior 30d)
        let revC = 0, revP = 0, orderItemsC = 0, orderItemsP = 0, pendC = 0, pendP = 0
        const paidOrderIdsC = new Set()
        const paidOrderIdsP = new Set()
        const dailyRev = Array(30).fill(0)
        const buyerOrderMap = new Map() // buyerKey -> Set<orderId>
        let overdueCount = 0

        for (const it of items ?? []) {
          const o = it.orders
          const ts = o?.created_at ? new Date(o.created_at).getTime() : 0
          if (!ts) continue
          const inCurrent = ts >= cutoff30
          const inPrev    = ts >= cutoff60 && ts < cutoff30
          const rev = (it.quantity ?? 0) * (it.unit_price ?? 0)

          if (o.status === 'paid' || o.status === 'fulfilled') {
            if (inCurrent) {
              revC += rev
              paidOrderIdsC.add(o.id)
              const dayIdx = 29 - Math.floor((now - ts) / day)
              if (dayIdx >= 0 && dayIdx < 30) dailyRev[dayIdx] += rev
            }
            if (inPrev) {
              revP += rev
              paidOrderIdsP.add(o.id)
            }
            // All-time buyer-grouping for repeat rate
            const buyerKey = o.user_id || o.guest_email
            if (buyerKey) {
              const set = buyerOrderMap.get(buyerKey) || new Set()
              set.add(o.id)
              buyerOrderMap.set(buyerKey, set)
            }
          }
          if (inCurrent) orderItemsC += 1
          if (inPrev) orderItemsP += 1
          if (o.status === 'pending') {
            if (inCurrent) pendC += 1
            if (inPrev) pendP += 1
          }
          // Overdue: paid > 3d old, not shipped/delivered
          if (o.status === 'paid'
              && it.fulfillment_status !== 'shipped'
              && it.fulfillment_status !== 'delivered'
              && ts < cutoffOverdue) {
            overdueCount += 1
          }
        }

        const aovC = paidOrderIdsC.size > 0 ? revC / paidOrderIdsC.size : 0
        const aovP = paidOrderIdsP.size > 0 ? revP / paidOrderIdsP.size : 0
        const totalCustomers = buyerOrderMap.size
        const repeatBuyers = [...buyerOrderMap.values()].filter(set => set.size >= 2).length
        const repeatRate = totalCustomers > 0 ? (repeatBuyers / totalCustomers) * 100 : 0

        Object.assign(empty, {
          revenue: revC, revPrev: revP,
          orderCount: orderItemsC, orderPrev: orderItemsP,
          pendingCount: pendC, pendingPrev: pendP,
          aov: aovC, aovPrev: aovP,
          repeatRate, totalCustomers,
          overdueCount,
          dailyRev,
        })

        // Top sellers — all-time by quantity
        const totals = {}
        for (const it of items ?? []) {
          totals[it.product_id] = (totals[it.product_id] || 0) + (it.quantity ?? 0)
        }
        topRows = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, qty]) => ({ id, label: productNames[id] ?? '—', qty }))

        const { data: ro } = await supabase
          .from('order_items')
          .select('id, quantity, unit_price, created_at, products(label), orders(id, status, created_at)')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
          .limit(5)
        recentOrders = ro || []

        const { data: attn } = await supabase
          .from('order_items')
          .select('id, quantity, products(label), orders(id, status, created_at)')
          .in('product_id', productIds)
          .eq('orders.status', 'paid')
          .order('created_at', { ascending: true })
          .limit(8)
        attnOrders = (attn || []).filter(it => it.orders?.status === 'paid')
      }

      setStats(empty)
      setRecent(recentOrders)
      setTopSellers(topRows)
      setNeedsAttn(attnOrders)
      setLoading(false)
    }
    load()
  }, [user])

  function pctChange(curr, prev) {
    if (prev === 0) return curr > 0 ? null : 0  // null = "no prior data"
    return ((curr - prev) / prev) * 100
  }

  const name = profile?.display_name || user?.email?.split('@')[0] || 'Seller'
  const s = makeStyles(t)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={s.pageTitle}>Good day, {name} ✦</h1>
        <p style={s.pageSubtitle}>Here's your store at a glance.</p>
      </div>

      {loading ? <p style={s.dim}>Loading…</p> : (
        <>
          <div style={s.metricRowLabel}>Last 30 days vs prior 30 days</div>
          <div style={s.statsGrid}>
            <StatCard
              label="Revenue (30d)"
              value={`$${(stats.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              delta={pctChange(stats.revenue, stats.revPrev)}
              t={t}
            />
            <StatCard
              label="Avg Order Value"
              value={`$${(stats.aov || 0).toFixed(2)}`}
              delta={pctChange(stats.aov, stats.aovPrev)}
              t={t}
            />
            <StatCard
              label="Overdue"
              value={stats.overdueCount}
              hint={stats.overdueCount > 0 ? 'Paid orders awaiting shipment 3+ days' : 'All caught up'}
              accent={stats.overdueCount > 0 ? '#c47c4a' : '#5a9a76'}
              t={t}
            />
            <StatCard
              label="Repeat Rate"
              value={`${stats.repeatRate.toFixed(0)}%`}
              hint={stats.totalCustomers === 0
                ? 'No customers yet'
                : `${stats.totalCustomers} unique customer${stats.totalCustomers === 1 ? '' : 's'} all-time`}
              t={t}
            />
          </div>

          <div style={s.twoCol}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Recent Orders</h2>
                <button style={s.linkBtn} onClick={() => onNavigate('orders')}>View all →</button>
              </div>
              {recent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={s.dim}>No orders yet.</p>
                  <button style={s.linkBtn} onClick={() => onNavigate('add-product')}>Add your first product →</button>
                </div>
              ) : (
                <div>
                  <div style={s.tableHead}><span>Product</span><span>Qty</span><span>Amount</span><span>Status</span></div>
                  {recent.map(item => (
                    <div key={item.id} style={s.tableRow}>
                      <span style={s.cell}>{item.products?.label ?? '—'}</span>
                      <span style={s.cell}>×{item.quantity}</span>
                      <span style={s.cell}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                      <span style={s.cell}><StatusBadge status={item.orders?.status} /></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={s.card}>
              <h2 style={{ ...s.cardTitle, marginBottom: 14 }}>Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {[
                  { icon: '+', label: 'Add New Product',  page: 'add-product', color: '#b8a0ff' },
                  { icon: '⊟', label: 'View Orders',     page: 'orders',      color: '#f0a8d8' },
                  { icon: '◈', label: 'View Earnings',   page: 'earnings',    color: '#ffc87a' },
                  { icon: '◫', label: 'Manage Products', page: 'products',    color: '#88d8b0' },
                ].map(a => (
                  <button key={a.label} style={s.actionBtn} onClick={() => onNavigate(a.page)}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, background: a.color + '30', color: a.color }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, color: t.text, fontWeight: 500, textAlign: 'left' }}>{a.label}</span>
                    <span style={{ fontSize: 12, color: t.textSoft }}>→</span>
                  </button>
                ))}
              </div>

              <div style={{ background: `${t.accent}10`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>✦ Reverie Tier</span>
                  <span style={{ fontSize: 12, color: t.textSoft }}>12%</span>
                </div>
                <div style={{ height: 6, background: `${t.accent}20`, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: '12%', background: `linear-gradient(90deg, ${t.accent}, ${t.glow.replace('rgba(', 'rgb(').replace(/, ?[\d.]+\)/, ')')})`, borderRadius: 3 }} />
                </div>
                <p style={{ fontSize: 11, color: t.textSoft, margin: 0 }}>Complete 10 sales to reach Drift tier</p>
              </div>
            </div>
          </div>

          {/* Needs Attention + Top Sellers row */}
          {(needsAttn.length > 0 || topSellers.length > 0) && (
            <div style={{ ...s.twoCol, marginBottom: 20 }}>
              {needsAttn.length > 0 ? (
                <div style={s.card}>
                  <div style={s.cardHeader}>
                    <h2 style={s.cardTitle}>
                      <span style={{ color: '#ffc87a', marginRight: 6 }}>⚠</span>
                      Needs Fulfillment
                    </h2>
                    <button style={s.linkBtn} onClick={() => onNavigate('orders')}>View orders →</button>
                  </div>
                  {needsAttn.map(item => (
                    <div key={item.id} style={s.attnRow}>
                      <div style={s.attnDot} />
                      <span style={{ flex: 1, fontSize: 13, color: t.text }}>{item.products?.label ?? '—'}</span>
                      <span style={{ fontSize: 12, color: t.textSoft }}>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : <div />}

              {topSellers.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardHeader}>
                    <h2 style={s.cardTitle}>Top Sellers</h2>
                    <button style={s.linkBtn} onClick={() => onNavigate('products')}>All products →</button>
                  </div>
                  {topSellers.map((p, i) => (
                    <div key={p.id} style={s.topRow}>
                      <span style={s.topRank}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, color: t.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>{p.qty} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {stats.productCount === 0 && (
            <div style={{ marginTop: 16, background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: t.textSoft, marginBottom: 14 }}>You haven't listed any products yet.</p>
              <button style={{ padding: '11px 24px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNavigate('add-product')}>
                + List your first product
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, delta, deltaInverse, hint, accent, t }) {
  const hasDelta = typeof delta === 'number' && !Number.isNaN(delta)
  const goodDir = hasDelta && (deltaInverse ? delta < 0 : delta > 0)
  const badDir  = hasDelta && (deltaInverse ? delta > 0 : delta < 0)
  const deltaColor = goodDir ? '#3a9a64' : badDir ? '#c25656' : t.textSoft
  const arrow = !hasDelta ? '' : delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
  const valueColor = accent || t.text
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: valueColor, lineHeight: 1.1 }}>{value}</div>
      {hasDelta && (
        <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500, color: deltaColor, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{arrow}</span>
          <span>{Math.abs(delta).toFixed(0)}%</span>
          <span style={{ color: t.textSoft, fontWeight: 400 }}>vs prior 30d</span>
        </div>
      )}
      {!hasDelta && delta === null && (
        <div style={{ marginTop: 10, fontSize: 11, color: t.textSoft, fontStyle: 'italic' }}>new — no prior period</div>
      )}
      {hint && !hasDelta && (
        <div style={{ marginTop: 10, fontSize: 11, color: t.textSoft }}>{hint}</div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { paid: ['#88d8b0','rgba(136,216,176,0.15)'], pending: ['#ffc87a','rgba(255,200,122,0.15)'], cancelled: ['#f09090','rgba(240,144,144,0.15)'] }
  const [color, bg] = map[status] ?? ['#b8a0ff', 'rgba(184,160,255,0.15)']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? '—'}</span>
}

function makeStyles(t) {
  return {
    pageTitle:  { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle:{ fontSize: 13, color: t.textSoft },
    dim:        { fontSize: 13, color: t.textSoft },
    statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14, minWidth: 0 },
    metricRowLabel: { fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 600 },
    twoCol:     { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 20 },
    card:       { background: t.surface, backdropFilter: 'blur(12px)', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: `1px solid ${t.surfaceBorder}` },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle:  { fontSize: 15, fontWeight: 700, color: t.text },
    linkBtn:    { background: 'transparent', border: 'none', color: t.accent, fontSize: 13, cursor: 'pointer', padding: 0 },
    tableHead:  { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', borderBottom: `1px solid ${t.surfaceBorder}`, fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
    tableRow:   { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '10px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    cell:       { fontSize: 13, color: t.text, display: 'flex', alignItems: 'center' },
    actionBtn:  { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: `${t.accent}08`, cursor: 'pointer', width: '100%' },
    attnRow:    { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    attnDot:    { width: 8, height: 8, borderRadius: '50%', background: '#ffc87a', flexShrink: 0 },
    topRow:     { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    topRank:    { width: 20, fontSize: 11, fontWeight: 700, color: t.textSoft, textAlign: 'center', flexShrink: 0 },
  }
}
