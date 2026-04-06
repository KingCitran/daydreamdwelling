import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Stat card accent colors — intentional per-stat highlights, not mood-driven
const STAT_COLORS = [
  { color: '#b8a0ff', bg: 'rgba(184,160,255,0.12)' },
  { color: '#f0a8d8', bg: 'rgba(240,168,216,0.12)' },
  { color: '#ffc87a', bg: 'rgba(255,200,122,0.12)' },
  { color: '#88d8b0', bg: 'rgba(136,216,176,0.12)' },
]

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

      let revenue = 0, orderCount = 0, pendingCount = 0
      let recentOrders = [], topRows = [], attnOrders = []

      if (productIds.length) {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, orders(status)')
          .in('product_id', productIds)

        // revenue + counts
        for (const item of items || []) {
          if (item.orders?.status === 'paid') revenue += item.quantity * item.unit_price
        }
        orderCount = (items || []).length
        pendingCount = (items || []).filter(it => it.orders?.status === 'pending').length

        // top sellers — group by product
        const totals = {}
        for (const it of items || []) {
          totals[it.product_id] = (totals[it.product_id] || 0) + it.quantity
        }
        topRows = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, qty]) => ({ id, label: productNames[id] ?? '—', qty }))

        // recent orders
        const { data: ro } = await supabase
          .from('order_items')
          .select('id, quantity, unit_price, created_at, products(label), orders(id, status, created_at)')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
          .limit(5)
        recentOrders = ro || []

        // needs attention — paid orders not yet shipped
        const { data: attn } = await supabase
          .from('order_items')
          .select('id, quantity, products(label), orders(id, status, created_at)')
          .in('product_id', productIds)
          .eq('orders.status', 'paid')
          .order('created_at', { ascending: true })
          .limit(8)
        attnOrders = (attn || []).filter(it => it.orders?.status === 'paid')
      }

      setStats({ revenue, orderCount, pendingCount, productCount: productIds.length })
      setRecent(recentOrders)
      setTopSellers(topRows)
      setNeedsAttn(attnOrders)
      setLoading(false)
    }
    load()
  }, [user])

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
          <div style={s.statsGrid}>
            {[
              { label: 'Total Revenue',   value: `$${(stats.revenue || 0).toLocaleString()}`, pct: 72 },
              { label: 'Total Orders',    value: stats.orderCount,   pct: 50 },
              { label: 'Pending',         value: stats.pendingCount, pct: 30 },
              { label: 'Active Products', value: stats.productCount, pct: 88 },
            ].map((stat, i) => (
              <StatCard key={stat.label} {...stat} {...STAT_COLORS[i]} t={t} />
            ))}
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

function StatCard({ label, value, pct, color, bg, t }) {
  const r = 24, circ = 2 * Math.PI * r, dash = circ * (1 - pct / 100)
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 16, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: 11, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</div>
        </div>
        <svg width={60} height={60} style={{ flexShrink: 0 }}>
          <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={6} />
          <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round" transform="rotate(-90 30 30)" />
          <text x={30} y={34} textAnchor="middle" fontSize={10} fill={color} fontWeight={700}>{pct}%</text>
        </svg>
      </div>
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
    statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 },
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
