import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function ProductsPage({ onNavigate }) {
  const { user } = useAuth()
  const t        = useTheme()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('newest')

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

  const s = makeStyles(t)
  const filtered = products
    .filter(p => !search || p.label?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return (a.label ?? '').localeCompare(b.label ?? '')
      if (sort === 'price') return (minPrice(a) ?? 0) - (minPrice(b) ?? 0)
      return 0 // newest = DB order
    })

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <p style={s.pageSubtitle}>{products.length} listing{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.addBtn} onClick={() => onNavigate('add-product')}>+ New product</button>
      </div>

      <div style={s.toolbar}>
        <input style={s.search} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price: Low–High</option>
        </select>
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
          {filtered.map(p => {
            const price = minPrice(p)
            return (
              <div key={p.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={{ ...s.statusPill, background: p.is_active ? '#88d8b0' : '#e0d8f0', color: p.is_active ? '#2a6a4a' : '#9a88bb' }}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div style={s.cardBody}>
                  <p style={s.cardLabel}>{p.label}</p>
                  {p.brand && <p style={s.cardBrand}>{p.brand}</p>}
                  {price != null && <p style={s.cardPrice}>from ${price.toLocaleString()}</p>}
                </div>
                <div style={s.cardActions}>
                  <button style={s.actionBtn} onClick={() => onNavigate('add-product', { editProductId: p.id })}>Edit</button>
                  <button style={{ ...s.actionBtn, color: p.is_active ? '#e0944a' : '#5a9a6a' }} onClick={() => toggleActive(p)}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button style={{ ...s.actionBtn, color: '#d06060' }} onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
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

function makeStyles(t) {
  return {
    pageHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    pageTitle:   { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle:{ fontSize: 13, color: t.textSoft },
    addBtn:      { padding: '10px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    toolbar:     { display: 'flex', gap: 10, marginBottom: 20 },
    search:      { flex: 1, padding: '9px 14px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none' },
    sortSelect:  { padding: '9px 14px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, cursor: 'pointer' },
    dimText:     { fontSize: 13, color: t.textSoft },
    empty:       { background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
    emptyTitle:  { fontSize: 16, fontWeight: 600, color: t.text },
    grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    card:        { background: t.surface, backdropFilter: 'blur(12px)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    cardTop:     { height: 100, background: `${t.accent}12`, position: 'relative', display: 'flex', alignItems: 'flex-start', padding: 10 },
    statusPill:  { fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px', letterSpacing: '0.3px' },
    cardBody:    { padding: '14px 16px', flex: 1 },
    cardLabel:   { fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 },
    cardBrand:   { fontSize: 11, color: t.textSoft, marginBottom: 6 },
    cardPrice:   { fontSize: 13, fontWeight: 600, color: t.accent },
    cardActions: { display: 'flex', borderTop: `1px solid ${t.surfaceBorder}` },
    actionBtn:   { flex: 1, padding: '9px 0', background: 'transparent', border: 'none', color: t.textSoft, fontSize: 12, borderRight: `1px solid ${t.surfaceBorder}`, cursor: 'pointer', fontWeight: 500 },
  }
}
