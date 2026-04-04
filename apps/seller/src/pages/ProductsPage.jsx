import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function ProductsPage({ onNavigate }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, label, brand, is_active, created_at, product_sizes(price)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    setDeleting(null)
    load()
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  function minPrice(product) {
    const prices = (product.product_sizes || []).map(sz => sz.price).filter(Boolean)
    return prices.length ? Math.min(...prices) : null
  }

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <p style={s.pageSubtitle}>{products.length} listing{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.addBtn} onClick={() => onNavigate('add-product')}>+ New product</button>
      </div>

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : products.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No products yet</p>
          <p style={s.dimText}>Add your first product to start selling.</p>
          <button style={s.addBtn} onClick={() => onNavigate('add-product')}>+ New product</button>
        </div>
      ) : (
        <div style={s.grid}>
          {products.map(p => {
            const price = minPrice(p)
            return (
              <div key={p.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.cardThumb} />
                  <div style={{ ...s.statusDot, background: p.is_active ? '#4aff88' : '#666' }} />
                </div>
                <div style={s.cardBody}>
                  <p style={s.cardLabel}>{p.label}</p>
                  {p.brand && <p style={s.cardBrand}>{p.brand}</p>}
                  {price != null && <p style={s.cardPrice}>from ${price.toLocaleString()}</p>}
                </div>
                <div style={s.cardActions}>
                  <button style={s.actionBtn} onClick={() => onNavigate('add-product', { editProductId: p.id })}>Edit</button>
                  <button style={{ ...s.actionBtn, color: p.is_active ? '#ffdd88' : '#a0ffcc' }} onClick={() => toggleActive(p)}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button style={{ ...s.actionBtn, color: '#ff9999' }} onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                    {deleting === p.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s = {
  pageHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle:   { fontSize: 24, fontWeight: 700, color: '#e0d9ff', marginBottom: 4 },
  pageSubtitle:{ fontSize: 13, color: '#7878aa' },
  addBtn:      { padding: '10px 18px', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 9, fontSize: 13, fontWeight: 600 },
  dimText:     { fontSize: 13, color: '#5a5a7a' },
  empty:       { background: '#1a1a2e', border: '1px dashed #3a3a5a', borderRadius: 12, padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyTitle:  { fontSize: 16, fontWeight: 600, color: '#e0d9ff' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card:        { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardTop:     { height: 120, background: 'linear-gradient(135deg, #2a2a4a, #1a1a3a)', position: 'relative', flexShrink: 0 },
  cardThumb:   { width: '100%', height: '100%' },
  statusDot:   { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%' },
  cardBody:    { padding: '14px 16px', flex: 1 },
  cardLabel:   { fontSize: 14, fontWeight: 600, color: '#e0d9ff', marginBottom: 4 },
  cardBrand:   { fontSize: 11, color: '#7878aa', marginBottom: 6 },
  cardPrice:   { fontSize: 13, fontWeight: 600, color: '#a0ffcc' },
  cardActions: { display: 'flex', gap: 0, borderTop: '1px solid #2a2a4a' },
  actionBtn:   { flex: 1, padding: '8px 0', background: 'transparent', border: 'none', color: '#9090b8', fontSize: 12, borderRight: '1px solid #2a2a4a' },
}
