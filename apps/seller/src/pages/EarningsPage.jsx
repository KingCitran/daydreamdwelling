import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const RANGE_OPTIONS = [
  { label: '3 months',  months: 3  },
  { label: '6 months',  months: 6  },
  { label: '12 months', months: 12 },
]

export default function EarningsPage() {
  const { user }  = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [range,   setRange]   = useState(6)

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

      const paidItems = (items || []).filter(i => i.orders?.status === 'paid')
      const total = paidItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

      // By product
      const byProductMap = {}
      for (const item of paidItems) {
        const id = item.product_id
        const label = products.find(p => p.id === id)?.label ?? id
        if (!byProductMap[id]) byProductMap[id] = { label, revenue: 0, unitsSold: 0 }
        byProductMap[id].revenue   += item.quantity * item.unit_price
        byProductMap[id].unitsSold += item.quantity
      }
      const byProduct = Object.values(byProductMap).sort((a, b) => b.revenue - a.revenue)

      // Monthly for all time (we filter by range in render)
      const monthly = {}
      for (const item of paidItems) {
        const date = item.orders?.created_at
        if (!date) continue
        const key = date.slice(0, 7)
        if (!monthly[key]) monthly[key] = 0
        monthly[key] += item.quantity * item.unit_price
      }
      const monthlyArr = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({ month, revenue }))

      const totalOrders = paidItems.length
      const aov = totalOrders ? total / totalOrders : 0

      setData({ total, byProduct, monthly: monthlyArr, totalOrders, aov })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <p style={s.dimText}>Loading…</p>

  const { total, byProduct, monthly, totalOrders, aov } = data
  const sliced = monthly.slice(-range)
  const maxMonthly = Math.max(...sliced.map(m => m.revenue), 1)

  function fmtMonth(key) {
    const [, m] = key.split('-')
    return MONTH_LABELS[parseInt(m, 10) - 1]
  }

  return (
    <div>
      <h1 style={s.pageTitle}>Earnings</h1>
      <p style={s.pageSubtitle}>Revenue from paid orders.</p>

      {/* Hero stats row */}
      <div style={s.heroRow}>
        <div style={s.heroCard}>
          <span style={s.heroLabel}>Total Revenue</span>
          <span style={s.heroValue}>${total.toLocaleString()}</span>
          <span style={s.heroCaveat}>Before Stripe fees</span>
        </div>
        <div style={s.heroCard}>
          <span style={s.heroLabel}>Total Orders</span>
          <span style={s.heroValue}>{totalOrders}</span>
          <span style={s.heroCaveat}>Paid orders</span>
        </div>
        <div style={s.heroCard}>
          <span style={s.heroLabel}>Avg. Order Value</span>
          <span style={s.heroValue}>${aov.toFixed(2)}</span>
          <span style={s.heroCaveat}>Per paid order</span>
        </div>
      </div>

      <div style={s.cols}>
        {/* Monthly chart */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Monthly Revenue</h2>
            <div style={s.rangeTabs}>
              {RANGE_OPTIONS.map(o => (
                <button key={o.months} style={{ ...s.rangeTab, ...(range === o.months ? s.rangeTabActive : {}) }} onClick={() => setRange(o.months)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {sliced.length === 0 ? (
            <p style={s.dimText}>No paid orders yet.</p>
          ) : (
            <div style={s.barChart}>
              {sliced.map(({ month, revenue }) => (
                <div key={month} style={s.barCol}>
                  <span style={s.barValue}>{revenue >= 1000 ? '$' + (revenue / 1000).toFixed(1) + 'k' : '$' + revenue}</span>
                  <div style={{ ...s.bar, height: Math.max(6, (revenue / maxMonthly) * 120) }} />
                  <span style={s.barLabel}>{fmtMonth(month)}</span>
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
              {byProduct.map(({ label, revenue, unitsSold }, i) => {
                const colors = ['#b8a0ff','#f0a8d8','#ffc87a','#88d8b0','#88c8f0']
                const c = colors[i % colors.length]
                return (
                  <div key={label} style={s.productRow}>
                    <div style={{ ...s.productDot, background: c }} />
                    <div style={s.productInfo}>
                      <span style={s.productLabel}>{label}</span>
                      <span style={s.productUnits}>{unitsSold} unit{unitsSold !== 1 ? 's' : ''} sold</span>
                    </div>
                    <span style={{ ...s.productRevenue, color: c }}>${revenue.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={s.payoutNote}>
        <span style={s.payoutIcon}>ℹ</span>
        <span>Payouts are processed via Stripe Connect. <strong>Set up your payout account in Settings</strong> to receive transfers to your bank.</span>
      </div>
    </div>
  )
}

const s = {
  pageTitle:      { fontSize: 26, fontWeight: 700, color: '#3a2a5a', marginBottom: 4 },
  pageSubtitle:   { fontSize: 13, color: '#9a88bb', marginBottom: 24, display: 'block' },
  heroRow:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 },
  heroCard:       { background: 'linear-gradient(135deg, rgba(196,168,255,0.2), rgba(240,168,216,0.2))', border: '1px solid rgba(180,140,255,0.25)', borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 },
  heroLabel:      { fontSize: 10, color: '#b0a0cc', textTransform: 'uppercase', letterSpacing: '1px' },
  heroValue:      { fontSize: 32, fontWeight: 800, color: '#3a2a5a' },
  heroCaveat:     { fontSize: 11, color: '#b0a0cc' },
  cols:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  card:           { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180,160,220,0.2)', borderRadius: 16, padding: '20px 22px' },
  cardHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:      { fontSize: 13, fontWeight: 700, color: '#6a4aaa', textTransform: 'uppercase', letterSpacing: '0.7px' },
  dimText:        { fontSize: 13, color: '#9a88bb' },
  rangeTabs:      { display: 'flex', gap: 4 },
  rangeTab:       { padding: '4px 10px', border: '1px solid rgba(180,160,220,0.3)', borderRadius: 6, background: 'transparent', fontSize: 11, color: '#9a88bb', cursor: 'pointer' },
  rangeTabActive: { background: 'rgba(180,140,255,0.15)', color: '#5a3a9a', borderColor: 'rgba(180,140,255,0.4)', fontWeight: 600 },
  barChart:       { display: 'flex', gap: 8, alignItems: 'flex-end', height: 150 },
  barCol:         { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  barValue:       { fontSize: 9, color: '#9a88bb' },
  bar:            { width: '100%', background: 'linear-gradient(180deg, #c4a8ff, #f0a8d8)', borderRadius: '4px 4px 0 0', minHeight: 6 },
  barLabel:       { fontSize: 10, color: '#b0a0cc' },
  productList:    { display: 'flex', flexDirection: 'column', gap: 12 },
  productRow:     { display: 'flex', alignItems: 'center', gap: 10 },
  productDot:     { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  productInfo:    { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  productLabel:   { fontSize: 13, color: '#3a2a5a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 },
  productUnits:   { fontSize: 11, color: '#9a88bb' },
  productRevenue: { fontSize: 14, fontWeight: 700, flexShrink: 0 },
  payoutNote:     { display: 'flex', gap: 10, padding: '14px 16px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(180,160,220,0.25)', borderRadius: 12, fontSize: 12, color: '#7a6a9a', lineHeight: 1.6 },
  payoutIcon:     { flexShrink: 0, color: '#b8a0ff' },
}
