import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function DashboardPage({ onNavigate }) {
  const { user, profile } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const { data: products } = await supabase
        .from('products').select('id').eq('seller_id', user.id)
      const productIds = (products || []).map(p => p.id)

      let revenue = 0, orderCount = 0, pendingCount = 0
      let recentOrders = []

      if (productIds.length) {
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity, unit_price, orders(status)')
          .in('product_id', productIds)
        for (const item of items || []) {
          if (item.orders?.status === 'paid') revenue += item.quantity * item.unit_price
        }
        orderCount = (items || []).length
        const { count } = await supabase
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .in('product_id', productIds)
          .eq('orders.status', 'pending')
        pendingCount = count || 0

        const { data } = await supabase
          .from('order_items')
          .select('id, quantity, unit_price, created_at, products(label), orders(status, created_at)')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
          .limit(5)
        recentOrders = data || []
      }

      setStats({ revenue, orderCount, pendingCount, productCount: productIds.length })
      setRecent(recentOrders)
      setLoading(false)
    }
    load()
  }, [user])

  const name = profile?.display_name || user?.email?.split('@')[0] || 'Seller'

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Good day, {name} ✦</h1>
          <p style={s.pageSubtitle}>Here's your store at a glance.</p>
        </div>
      </div>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : (
        <>
          <div style={s.statsGrid}>
            <StatCard label="Total Revenue"   value={`$${(stats.revenue || 0).toLocaleString()}`} pct={72} color="#b8a0ff" bg="#f0eaff" />
            <StatCard label="Total Orders"    value={stats.orderCount}   pct={50} color="#f0a8d8" bg="#ffeef8" />
            <StatCard label="Pending"         value={stats.pendingCount} pct={30} color="#ffc87a" bg="#fff8ee" />
            <StatCard label="Active Products" value={stats.productCount} pct={88} color="#88d8b0" bg="#eeffF6" />
          </div>

          <div style={s.twoCol}>
            {/* Recent activity */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Recent Orders</h2>
                <button style={s.linkBtn} onClick={() => onNavigate('orders')}>View all →</button>
              </div>
              {recent.length === 0 ? (
                <div style={s.emptyState}>
                  <p style={s.dimText}>No orders yet.</p>
                  <button style={s.inlineLink} onClick={() => onNavigate('add-product')}>Add your first product →</button>
                </div>
              ) : (
                <div style={s.table}>
                  <div style={s.tableHead}>
                    <span>Product</span><span>Qty</span><span>Amount</span><span>Status</span>
                  </div>
                  {recent.map(item => (
                    <div key={item.id} style={s.tableRow}>
                      <span style={s.tableCell}>{item.products?.label ?? '—'}</span>
                      <span style={s.tableCell}>×{item.quantity}</span>
                      <span style={s.tableCell}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                      <span style={s.tableCell}><StatusBadge status={item.orders?.status} /></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>Quick Actions</h2>
              <div style={s.actionList}>
                <ActionBtn icon="+" label="Add New Product"  onClick={() => onNavigate('add-product')} color="#b8a0ff" />
                <ActionBtn icon="⊟" label="View Orders"     onClick={() => onNavigate('orders')}      color="#f0a8d8" />
                <ActionBtn icon="◈" label="View Earnings"   onClick={() => onNavigate('earnings')}    color="#ffc87a" />
                <ActionBtn icon="◫" label="Manage Products" onClick={() => onNavigate('products')}    color="#88d8b0" />
              </div>

              <div style={s.tierBox}>
                <div style={s.tierRow}>
                  <span style={s.tierLabel}>✦ Reverie Tier</span>
                  <span style={s.tierPct}>12%</span>
                </div>
                <div style={s.tierBarBg}>
                  <div style={{ ...s.tierBarFill, width: '12%' }} />
                </div>
                <p style={s.tierHint}>Complete 10 sales to reach Drift tier</p>
              </div>
            </div>
          </div>

          {stats.productCount === 0 && (
            <div style={s.cta}>
              <p style={s.ctaText}>You haven't listed any products yet.</p>
              <button style={s.ctaBtn} onClick={() => onNavigate('add-product')}>+ List your first product</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, pct, color, bg }) {
  const r = 24, circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)
  return (
    <div style={{ ...s.statCard, background: bg }}>
      <div style={s.statCardInner}>
        <div>
          <div style={{ ...s.statValue, color }}>{value}</div>
          <div style={s.statLabel}>{label}</div>
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

function ActionBtn({ icon, label, onClick, color }) {
  return (
    <button style={s.actionBtn} onClick={onClick}>
      <span style={{ ...s.actionIcon, background: color + '30', color }}>{icon}</span>
      <span style={s.actionLabel}>{label}</span>
      <span style={s.actionArrow}>→</span>
    </button>
  )
}

function StatusBadge({ status }) {
  const map = { paid: ['#88d8b0', '#eeffF6'], pending: ['#ffc87a', '#fff8ee'], cancelled: ['#f09090', '#fff0f0'] }
  const [color, bg] = map[status] ?? ['#b8a0ff', '#f0eaff']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? '—'}</span>
}

const s = {
  header:       { marginBottom: 28 },
  pageTitle:    { fontSize: 26, fontWeight: 700, color: '#3a2a5a', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#9a88bb' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 },
  statCard:     { borderRadius: 16, padding: '20px', boxShadow: '0 2px 16px rgba(140,100,200,0.1)' },
  statCardInner:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statValue:    { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  statLabel:    { fontSize: 11, color: '#8a78aa', textTransform: 'uppercase', letterSpacing: '0.7px' },
  twoCol:       { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 20 },
  card:         { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 16px rgba(140,100,200,0.08)', border: '1px solid rgba(180,160,220,0.2)' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:    { fontSize: 15, fontWeight: 700, color: '#3a2a5a', marginBottom: 14 },
  linkBtn:      { background: 'transparent', border: 'none', color: '#9a78cc', fontSize: 13, cursor: 'pointer', padding: 0 },
  dimText:      { fontSize: 13, color: '#9a88bb', marginBottom: 8 },
  emptyState:   { textAlign: 'center', padding: '24px 0' },
  inlineLink:   { background: 'transparent', border: 'none', color: '#9a78cc', fontSize: 13, cursor: 'pointer' },
  table:        { display: 'flex', flexDirection: 'column' },
  tableHead:    { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(180,160,220,0.2)', fontSize: 10, color: '#b0a0cc', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
  tableRow:     { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '10px 0', borderBottom: '1px solid rgba(180,160,220,0.1)' },
  tableCell:    { fontSize: 13, color: '#4a3a6a', display: 'flex', alignItems: 'center' },
  actionList:   { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  actionBtn:    { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%' },
  actionIcon:   { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  actionLabel:  { flex: 1, fontSize: 13, color: '#4a3a6a', fontWeight: 500, textAlign: 'left' },
  actionArrow:  { fontSize: 12, color: '#b0a0cc' },
  tierBox:      { background: 'rgba(180,140,255,0.08)', borderRadius: 12, padding: '14px 16px' },
  tierRow:      { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  tierLabel:    { fontSize: 12, fontWeight: 600, color: '#6a4aaa' },
  tierPct:      { fontSize: 12, color: '#9a78cc' },
  tierBarBg:    { height: 6, background: 'rgba(180,140,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  tierBarFill:  { height: '100%', background: 'linear-gradient(90deg, #c4a8ff, #f0a8d8)', borderRadius: 3 },
  tierHint:     { fontSize: 11, color: '#9a88bb', margin: 0 },
  cta:          { marginTop: 16, background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(180,140,255,0.4)', borderRadius: 16, padding: '28px', textAlign: 'center' },
  ctaText:      { fontSize: 14, color: '#9a88bb', marginBottom: 14 },
  ctaBtn:       { padding: '11px 24px', background: 'linear-gradient(135deg, #c4a8ff, #f0a8d8)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
