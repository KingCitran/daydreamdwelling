import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const RANGE_OPTIONS = [
  { label: '3 months',  months: 3  },
  { label: '6 months',  months: 6  },
  { label: '12 months', months: 12 },
]
const PRODUCT_COLORS = ['#b8a0ff','#f0a8d8','#ffc87a','#88d8b0','#88c8f0']

export default function EarningsPage() {
  const { user }  = useAuth()
  const t         = useTheme()
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

      if (!productIds.length) { setData({ total: 0, byProduct: [], monthly: [], totalOrders: 0, aov: 0 }); setLoading(false); return }

      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity, unit_price, orders(status, created_at)')
        .in('product_id', productIds)

      const paidItems = (items || []).filter(i => i.orders?.status === 'paid')
      const total = paidItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

      const byProductMap = {}
      for (const item of paidItems) {
        const id = item.product_id
        const label = products.find(p => p.id === id)?.label ?? id
        if (!byProductMap[id]) byProductMap[id] = { label, revenue: 0, unitsSold: 0 }
        byProductMap[id].revenue   += item.quantity * item.unit_price
        byProductMap[id].unitsSold += item.quantity
      }
      const byProduct = Object.values(byProductMap).sort((a, b) => b.revenue - a.revenue)

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

  if (loading) return <p style={{ fontSize: 13, color: t.textSoft }}>Loading…</p>

  const { total, byProduct, monthly, totalOrders, aov } = data
  const sliced = monthly.slice(-range)
  const maxMonthly = Math.max(...sliced.map(m => m.revenue), 1)

  function fmtMonth(key) {
    const [, m] = key.split('-')
    return MONTH_LABELS[parseInt(m, 10) - 1]
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>Earnings</h1>
      <span style={{ fontSize: 13, color: t.textSoft, marginBottom: 24, display: 'block' }}>Revenue from paid orders.</span>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue',   value: `$${total.toLocaleString()}`,  note: 'Before Stripe fees' },
          { label: 'Total Orders',    value: totalOrders,                    note: 'Paid orders' },
          { label: 'Avg. Order Value',value: `$${aov.toFixed(2)}`,          note: 'Per paid order' },
        ].map(h => (
          <div key={h.label} style={{ background: `${t.accent}12`, border: `1px solid ${t.accent}28`, borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px' }}>{h.label}</span>
            <span style={{ fontSize: 32, fontWeight: 800, color: t.text }}>{h.value}</span>
            <span style={{ fontSize: 11, color: t.textSoft }}>{h.note}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly chart */}
        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Monthly Revenue</h2>
            <div style={{ display: 'flex', gap: 4 }}>
              {RANGE_OPTIONS.map(o => (
                <button key={o.months}
                  style={{ padding: '4px 10px', border: `1px solid ${range === o.months ? t.accent : t.surfaceBorder}`, borderRadius: 6, background: range === o.months ? `${t.accent}18` : 'transparent', fontSize: 11, color: range === o.months ? t.accent : t.textSoft, cursor: 'pointer', fontWeight: range === o.months ? 600 : 400 }}
                  onClick={() => setRange(o.months)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {sliced.length === 0 ? (
            <p style={{ fontSize: 13, color: t.textSoft }}>No paid orders yet.</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 150 }}>
              {sliced.map(({ month, revenue }) => (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 9, color: t.textSoft }}>{revenue >= 1000 ? '$' + (revenue / 1000).toFixed(1) + 'k' : '$' + revenue}</span>
                  <div style={{ width: '100%', background: `linear-gradient(180deg, ${t.accent}, ${t.glow.replace('rgba(', 'rgb(').replace(/, ?[\d.]+\)/, ')')})`, borderRadius: '4px 4px 0 0', minHeight: 6, height: Math.max(6, (revenue / maxMonthly) * 120) }} />
                  <span style={{ fontSize: 10, color: t.textSoft }}>{fmtMonth(month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By product */}
        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16 }}>By Product</h2>
          {byProduct.length === 0 ? (
            <p style={{ fontSize: 13, color: t.textSoft }}>No paid orders yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byProduct.map(({ label, revenue, unitsSold }, i) => {
                const c = PRODUCT_COLORS[i % PRODUCT_COLORS.length]
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: c }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, display: 'block' }}>{label}</span>
                      <span style={{ fontSize: 11, color: t.textSoft }}>{unitsSold} unit{unitsSold !== 1 ? 's' : ''} sold</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0, color: c }}>${revenue.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '14px 16px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, fontSize: 12, color: t.textSoft, lineHeight: 1.6 }}>
        <span style={{ flexShrink: 0, color: t.accent }}>ℹ</span>
        <span>Payouts are processed via Stripe Connect. <strong style={{ color: t.text }}>Set up your payout account in Settings</strong> to receive transfers to your bank.</span>
      </div>
    </div>
  )
}
