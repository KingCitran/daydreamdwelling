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
      // Fetch seller's product IDs
      const { data: products } = await supabase
        .from('products').select('id').eq('seller_id', user.id)
      const productIds = (products || []).map(p => p.id)

      let revenue = 0, orderCount = 0, pendingCount = 0
      if (productIds.length) {
        // Revenue from completed orders
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity, unit_price, orders(status)')
          .in('product_id', productIds)
        for (const item of items || []) {
          if (item.orders?.status === 'paid') {
            revenue += item.quantity * item.unit_price
          }
        }
        // Pending order count
        const { count } = await supabase
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .in('product_id', productIds)
          .eq('orders.status', 'pending')
        pendingCount = count || 0
        orderCount   = (items || []).length
      }

      // Recent 5 orders for this seller's products
      let recentOrders = []
      if (productIds.length) {
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
      <h1 style={s.pageTitle}>Welcome back, {name}</h1>
      <p style={s.pageSubtitle}>Here's your store at a glance.</p>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : (
        <>
          <div style={s.statsGrid}>
            <StatCard label="Total Revenue"    value={`$${(stats.revenue || 0).toLocaleString()}`}  color="#a0ffcc" />
            <StatCard label="Total Orders"     value={stats.orderCount}                              color="#c0b8ff" />
            <StatCard label="Pending"          value={stats.pendingCount}                            color="#ffdd88" />
            <StatCard label="Active Products"  value={stats.productCount}                            color="#88ccff" />
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Recent Activity</h2>
              <button style={s.linkBtn} onClick={() => onNavigate('orders')}>View all →</button>
            </div>
            {recent.length === 0 ? (
              <p style={s.dimText}>No orders yet. <button style={s.inlineLink} onClick={() => onNavigate('add-product')}>Add your first product →</button></p>
            ) : (
              <div style={s.table}>
                <div style={s.tableHead}>
                  <span>Product</span><span>Qty</span><span>Amount</span><span>Status</span><span>Date</span>
                </div>
                {recent.map(item => (
                  <div key={item.id} style={s.tableRow}>
                    <span style={s.tableCell}>{item.products?.label ?? '—'}</span>
                    <span style={s.tableCell}>×{item.quantity}</span>
                    <span style={s.tableCell}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                    <span style={s.tableCell}><StatusBadge status={item.orders?.status} /></span>
                    <span style={s.tableCell}>{item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                ))}
              </div>
            )}
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

function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = { paid: '#a0ffcc', pending: '#ffdd88', cancelled: '#ff9999' }
  return <span style={{ ...s.badge, color: colors[status] ?? '#9090b8', borderColor: colors[status] ?? '#3a3a5a' }}>{status ?? '—'}</span>
}

const s = {
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#e0d9ff', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#7878aa', marginBottom: 28 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 },
  statCard:     { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 },
  statValue:    { fontSize: 26, fontWeight: 700 },
  statLabel:    { fontSize: 11, color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.8px' },
  section:      { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, padding: '20px 22px' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#e0d9ff' },
  linkBtn:      { background: 'transparent', border: 'none', color: '#a08aff', fontSize: 13, padding: 0 },
  dimText:      { fontSize: 13, color: '#5a5a7a' },
  inlineLink:   { background: 'transparent', border: 'none', color: '#a08aff', fontSize: 13, padding: 0, cursor: 'pointer' },
  table:        { display: 'flex', flexDirection: 'column', gap: 0 },
  tableHead:    { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, padding: '6px 0', borderBottom: '1px solid #2a2a4a', fontSize: 11, color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 },
  tableRow:     { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e1e38' },
  tableCell:    { fontSize: 13, color: '#c0b8ff', display: 'flex', alignItems: 'center' },
  badge:        { fontSize: 10, fontWeight: 600, border: '1px solid', borderRadius: 4, padding: '2px 6px', textTransform: 'capitalize' },
  cta:          { marginTop: 24, background: '#1a1a2e', border: '1px dashed #3a3a5a', borderRadius: 12, padding: '28px', textAlign: 'center' },
  ctaText:      { fontSize: 14, color: '#7878aa', marginBottom: 14 },
  ctaBtn:       { padding: '11px 22px', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 9, fontSize: 14, fontWeight: 600 },
}
