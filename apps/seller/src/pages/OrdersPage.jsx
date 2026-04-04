import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const STATUS_COLORS = { paid: '#a0ffcc', pending: '#ffdd88', cancelled: '#ff9999' }

export default function OrdersPage() {
  const { user }   = useAuth()
  const [rows,     setRows]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      // Get this seller's product IDs first
      const { data: products } = await supabase
        .from('products').select('id').eq('seller_id', user.id)
      const productIds = (products || []).map(p => p.id)

      if (!productIds.length) { setRows([]); setLoading(false); return }

      const { data } = await supabase
        .from('order_items')
        .select('id, quantity, unit_price, size_label, swatch_name, created_at, products(label), orders(id, status, created_at)')
        .in('product_id', productIds)
        .order('created_at', { ascending: false })

      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = filter === 'all' ? rows : rows.filter(r => r.orders?.status === filter)

  return (
    <div>
      <h1 style={s.pageTitle}>Orders</h1>
      <p style={s.pageSubtitle}>{rows.length} total order item{rows.length !== 1 ? 's' : ''}</p>

      {/* Filter tabs */}
      <div style={s.tabs}>
        {['all', 'paid', 'pending', 'cancelled'].map(f => (
          <button key={f} style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span style={{ ...s.tabCount, color: STATUS_COLORS[f] }}>{rows.filter(r => r.orders?.status === f).length}</span>}
          </button>
        ))}
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
            <span>Product</span><span>Size / Color</span><span>Qty</span><span>Amount</span><span>Status</span><span>Date</span>
          </div>
          {filtered.map(item => (
            <div key={item.id} style={s.tableRow}>
              <span style={s.cell}>{item.products?.label ?? '—'}</span>
              <span style={{ ...s.cell, color: '#7878aa', fontSize: 11 }}>{[item.size_label, item.swatch_name].filter(Boolean).join(' · ') || '—'}</span>
              <span style={s.cell}>×{item.quantity}</span>
              <span style={s.cell}>${(item.quantity * item.unit_price).toLocaleString()}</span>
              <span style={s.cell}><Badge status={item.orders?.status} /></span>
              <span style={{ ...s.cell, color: '#5a5a7a', fontSize: 11 }}>{item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString() : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Badge({ status }) {
  const color = STATUS_COLORS[status] ?? '#9090b8'
  return <span style={{ fontSize: 10, fontWeight: 600, color, border: `1px solid ${color}`, borderRadius: 4, padding: '2px 7px', textTransform: 'capitalize' }}>{status ?? '—'}</span>
}

const s = {
  pageTitle:   { fontSize: 24, fontWeight: 700, color: '#e0d9ff', marginBottom: 4 },
  pageSubtitle:{ fontSize: 13, color: '#7878aa', marginBottom: 20 },
  tabs:        { display: 'flex', gap: 6, marginBottom: 20 },
  tab:         { padding: '7px 14px', background: 'transparent', border: '1px solid #2a2a4a', borderRadius: 7, color: '#7878aa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' },
  tabActive:   { background: '#1e1e3a', color: '#e0d9ff', borderColor: '#4a4a7a' },
  tabCount:    { fontWeight: 700 },
  dimText:     { fontSize: 13, color: '#5a5a7a' },
  empty:       { background: '#1a1a2e', border: '1px dashed #3a3a5a', borderRadius: 12, padding: '40px', textAlign: 'center' },
  emptyTitle:  { fontSize: 15, fontWeight: 600, color: '#e0d9ff', marginBottom: 8 },
  tableWrap:   { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, overflow: 'hidden' },
  tableHead:   { display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.5fr 1fr 1fr 1fr', gap: 10, padding: '12px 18px', background: '#13132a', fontSize: 11, color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.7px' },
  tableRow:    { display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.5fr 1fr 1fr 1fr', gap: 10, padding: '12px 18px', borderTop: '1px solid #1e1e38', alignItems: 'center' },
  cell:        { fontSize: 13, color: '#c0b8ff' },
}
