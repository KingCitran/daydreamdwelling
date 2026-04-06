import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const PAYMENT_COLORS = { paid: ['#88d8b0', '#eeffF6'], pending: ['#ffc87a', '#fff8ee'], cancelled: ['#f09090', '#fff0f0'] }
const FULFILLMENT_STEPS = ['packed', 'shipped', 'delivered']

export default function OrdersPage() {
  const { user }  = useAuth()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [expanded, setExpanded] = useState(null)
  const [tracking, setTracking] = useState({}) // orderId → tracking number input

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
        .select('id, quantity, unit_price, size_label, swatch_name, created_at, fulfillment_status, tracking_number, products(label), orders(id, status, created_at)')
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

  async function saveTracking(itemId, number) {
    await supabase.from('order_items').update({ tracking_number: number, fulfillment_status: 'shipped' }).eq('id', itemId)
    setRows(prev => prev.map(r => r.id === itemId ? { ...r, tracking_number: number, fulfillment_status: 'shipped' } : r))
    setTracking(prev => ({ ...prev, [itemId]: '' }))
  }

  const filtered = rows
    .filter(r => filter === 'all' || r.orders?.status === filter)
    .filter(r => !search || (r.products?.label ?? '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1 style={s.pageTitle}>Orders</h1>
      <p style={s.pageSubtitle}>{rows.length} total order item{rows.length !== 1 ? 's' : ''}</p>

      <div style={s.toolbar}>
        <div style={s.tabs}>
          {['all', 'paid', 'pending', 'cancelled'].map(f => (
            <button key={f} style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span style={s.tabCount}>{rows.filter(r => r.orders?.status === f).length}</span>}
            </button>
          ))}
        </div>
        <input
          style={s.search}
          placeholder="Search by product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No {filter !== 'all' ? filter : ''} orders yet</p>
          <p style={s.dimText}>Orders will appear here after customers checkout.</p>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>Product</span><span>Variant</span><span>Qty</span><span>Amount</span><span>Payment</span><span>Fulfillment</span><span>Date</span>
          </div>
          {filtered.map(item => (
            <div key={item.id}>
              <div
                style={{ ...s.tableRow, background: expanded === item.id ? 'rgba(180,140,255,0.06)' : 'transparent', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <span style={s.cell}>{item.products?.label ?? '—'}</span>
                <span style={{ ...s.cell, color: '#9a88bb', fontSize: 11 }}>{[item.size_label, item.swatch_name].filter(Boolean).join(' · ') || '—'}</span>
                <span style={s.cell}>×{item.quantity}</span>
                <span style={{ ...s.cell, fontWeight: 600, color: '#4a3a6a' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                <span style={s.cell}><PayBadge status={item.orders?.status} /></span>
                <span style={s.cell}><FulfillBadge status={item.fulfillment_status} /></span>
                <span style={{ ...s.cell, color: '#9a88bb', fontSize: 11 }}>{item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString() : '—'}</span>
              </div>

              {expanded === item.id && (
                <div style={s.detail}>
                  <div style={s.detailGrid}>
                    <div>
                      <p style={s.detailLabel}>Order ID</p>
                      <p style={s.detailValue}>{item.orders?.id ?? '—'}</p>
                    </div>
                    <div>
                      <p style={s.detailLabel}>Tracking Number</p>
                      <p style={s.detailValue}>{item.tracking_number || 'Not entered yet'}</p>
                    </div>
                  </div>

                  {item.orders?.status === 'paid' && (
                    <div style={s.fulfillmentPanel}>
                      <p style={s.detailLabel}>Fulfillment Workflow</p>
                      <div style={s.stepRow}>
                        {FULFILLMENT_STEPS.map((step, i) => {
                          const current = FULFILLMENT_STEPS.indexOf(item.fulfillment_status ?? '')
                          const done = i <= current
                          return (
                            <button key={step} style={{ ...s.stepBtn, background: done ? 'linear-gradient(135deg,#c4a8ff,#f0a8d8)' : 'rgba(180,140,255,0.1)', color: done ? '#fff' : '#9a78cc', border: done ? 'none' : '1px solid rgba(180,140,255,0.3)' }}
                              onClick={e => { e.stopPropagation(); markFulfillment(item.id, step) }}>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </button>
                          )
                        })}
                      </div>

                      <div style={s.trackingRow} onClick={e => e.stopPropagation()}>
                        <input
                          style={s.trackingInput}
                          placeholder="Enter tracking number…"
                          value={tracking[item.id] ?? item.tracking_number ?? ''}
                          onChange={e => setTracking(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                        <button style={s.trackingBtn} onClick={() => saveTracking(item.id, tracking[item.id] ?? '')}>
                          Save & Mark Shipped
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PayBadge({ status }) {
  const [color, bg] = PAYMENT_COLORS[status] ?? ['#b8a0ff', '#f0eaff']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? '—'}</span>
}

function FulfillBadge({ status }) {
  const map = { packed: ['#ffc87a', '#fff8ee'], shipped: ['#88c8f0', '#eef8ff'], delivered: ['#88d8b0', '#eeffF6'] }
  const [color, bg] = map[status] ?? ['#c8c0d8', '#f5f2ff']
  return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: bg, color, textTransform: 'capitalize' }}>{status ?? 'unfulfilled'}</span>
}

const s = {
  pageTitle:       { fontSize: 26, fontWeight: 700, color: '#3a2a5a', marginBottom: 4 },
  pageSubtitle:    { fontSize: 13, color: '#9a88bb', marginBottom: 20 },
  toolbar:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
  tabs:            { display: 'flex', gap: 6 },
  tab:             { padding: '7px 14px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(180,160,220,0.3)', borderRadius: 8, color: '#9a88bb', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  tabActive:       { background: 'rgba(180,140,255,0.15)', color: '#5a3a9a', borderColor: 'rgba(180,140,255,0.4)', fontWeight: 600 },
  tabCount:        { fontWeight: 700, fontSize: 11, color: '#b8a0ff' },
  search:          { padding: '8px 14px', border: '1px solid rgba(180,160,220,0.3)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.6)', color: '#3a2a5a', outline: 'none', minWidth: 200 },
  dimText:         { fontSize: 13, color: '#9a88bb' },
  empty:           { background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(180,140,255,0.3)', borderRadius: 16, padding: '40px', textAlign: 'center' },
  emptyTitle:      { fontSize: 15, fontWeight: 600, color: '#3a2a5a', marginBottom: 8 },
  tableWrap:       { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180,160,220,0.2)', borderRadius: 16, overflow: 'hidden' },
  tableHead:       { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', background: 'rgba(180,140,255,0.06)', fontSize: 10, color: '#b0a0cc', textTransform: 'uppercase', letterSpacing: '0.7px' },
  tableRow:        { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.5fr 1fr 0.9fr 1fr 0.9fr', gap: 10, padding: '12px 18px', borderTop: '1px solid rgba(180,160,220,0.12)', alignItems: 'center' },
  cell:            { fontSize: 13, color: '#4a3a6a' },
  detail:          { background: 'rgba(180,140,255,0.05)', borderTop: '1px solid rgba(180,160,220,0.15)', padding: '16px 18px 18px' },
  detailGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  detailLabel:     { fontSize: 10, color: '#b0a0cc', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
  detailValue:     { fontSize: 13, color: '#4a3a6a', fontWeight: 500 },
  fulfillmentPanel:{ marginTop: 4 },
  stepRow:         { display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 },
  stepBtn:         { padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  trackingRow:     { display: 'flex', gap: 8 },
  trackingInput:   { flex: 1, padding: '8px 12px', border: '1px solid rgba(180,160,220,0.3)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.7)', color: '#3a2a5a', outline: 'none' },
  trackingBtn:     { padding: '8px 16px', background: 'linear-gradient(135deg,#c4a8ff,#f0a8d8)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
}
