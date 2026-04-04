import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function EarningsPage() {
  const { user }   = useAuth()
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)

      const { data: products } = await supabase
        .from('products').select('id, label').eq('seller_id', user.id)
      const productIds = (products || []).map(p => p.id)

      if (!productIds.length) { setData({ total: 0, byProduct: [], monthly: [] }); setLoading(false); return }

      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity, unit_price, orders(status, created_at)')
        .in('product_id', productIds)
        .eq('orders.status', 'paid')

      const paidItems = (items || []).filter(i => i.orders?.status === 'paid')
      const total     = paidItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

      // Earnings by product
      const byProductMap = {}
      for (const item of paidItems) {
        const id    = item.product_id
        const label = products.find(p => p.id === id)?.label ?? id
        if (!byProductMap[id]) byProductMap[id] = { label, revenue: 0, unitsSold: 0 }
        byProductMap[id].revenue   += item.quantity * item.unit_price
        byProductMap[id].unitsSold += item.quantity
      }
      const byProduct = Object.values(byProductMap).sort((a, b) => b.revenue - a.revenue)

      // Monthly breakdown (last 6 months)
      const monthly = {}
      for (const item of paidItems) {
        const date = item.orders?.created_at
        if (!date) continue
        const key = date.slice(0, 7) // YYYY-MM
        if (!monthly[key]) monthly[key] = 0
        monthly[key] += item.quantity * item.unit_price
      }
      const monthlyArr = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, revenue]) => ({ month, revenue }))

      setData({ total, byProduct, monthly: monthlyArr })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div style={s.page}><p style={s.dimText}>Loading…</p></div>

  const { total, byProduct, monthly } = data
  const maxMonthly = Math.max(...monthly.map(m => m.revenue), 1)

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Earnings</h1>
      <p style={s.pageSubtitle}>Lifetime revenue from paid orders.</p>

      <div style={s.heroCard}>
        <span style={s.heroLabel}>Total Revenue</span>
        <span style={s.heroValue}>${total.toLocaleString()}</span>
        <span style={s.heroCaveat}>Stripe fees not deducted</span>
      </div>

      <div style={s.cols}>
        {/* Monthly chart */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Monthly (last 6 months)</h2>
          {monthly.length === 0 ? (
            <p style={s.dimText}>No paid orders yet.</p>
          ) : (
            <div style={s.barChart}>
              {monthly.map(({ month, revenue }) => (
                <div key={month} style={s.barCol}>
                  <span style={s.barValue}>${revenue >= 1000 ? (revenue / 1000).toFixed(1) + 'k' : revenue}</span>
                  <div style={{ ...s.bar, height: Math.max(4, (revenue / maxMonthly) * 120) }} />
                  <span style={s.barLabel}>{month.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By product */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>By Product</h2>
          {byProduct.length === 0 ? (
            <p style={s.dimText}>No paid orders yet.</p>
          ) : (
            <div style={s.productList}>
              {byProduct.map(({ label, revenue, unitsSold }) => (
                <div key={label} style={s.productRow}>
                  <div style={s.productDot} />
                  <div style={s.productInfo}>
                    <span style={s.productLabel}>{label}</span>
                    <span style={s.productUnits}>{unitsSold} unit{unitsSold !== 1 ? 's' : ''} sold</span>
                  </div>
                  <span style={s.productRevenue}>${revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={s.payoutNote}>
        <span style={s.payoutIcon}>ℹ</span>
        <span>Payouts are processed via Stripe Connect. Contact support to set up your payout account.</span>
      </div>
    </div>
  )
}

const s = {
  page:         {},
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#e0d9ff', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#7878aa', marginBottom: 24, display: 'block' },
  heroCard:     { background: 'linear-gradient(135deg, #1e1e3a, #2a1e4a)', border: '1px solid #4a3a8a', borderRadius: 14, padding: '28px 28px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 6 },
  heroLabel:    { fontSize: 11, color: '#9090b8', textTransform: 'uppercase', letterSpacing: '1px' },
  heroValue:    { fontSize: 40, fontWeight: 700, color: '#e0d9ff' },
  heroCaveat:   { fontSize: 11, color: '#5a5a7a' },
  cols:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  card:         { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, padding: '20px 22px' },
  cardTitle:    { fontSize: 13, fontWeight: 600, color: '#7878aa', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16 },
  dimText:      { fontSize: 13, color: '#5a5a7a' },
  barChart:     { display: 'flex', gap: 10, alignItems: 'flex-end', height: 150 },
  barCol:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  barValue:     { fontSize: 9, color: '#7878aa' },
  bar:          { width: '100%', background: 'linear-gradient(180deg, #8a6aee, #4a3a7a)', borderRadius: '3px 3px 0 0', minHeight: 4 },
  barLabel:     { fontSize: 10, color: '#5a5a7a' },
  productList:  { display: 'flex', flexDirection: 'column', gap: 10 },
  productRow:   { display: 'flex', alignItems: 'center', gap: 10 },
  productDot:   { width: 8, height: 8, borderRadius: '50%', background: '#6a4aaa', flexShrink: 0 },
  productInfo:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  productLabel: { fontSize: 13, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  productUnits: { fontSize: 11, color: '#5a5a7a' },
  productRevenue:{ fontSize: 14, fontWeight: 600, color: '#a0ffcc', flexShrink: 0 },
  payoutNote:   { display: 'flex', gap: 10, padding: '14px 16px', background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 10, fontSize: 12, color: '#7878aa', lineHeight: 1.5 },
  payoutIcon:   { flexShrink: 0, color: '#9090b8' },
}
