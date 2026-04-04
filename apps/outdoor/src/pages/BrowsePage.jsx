import { useEffect, useState } from 'react'
import { supabase } from '@shared/supabase'

const CATEGORY_LABELS = {
  furniture: 'Outdoor Furniture', planters: 'Planters & Pots',
  lighting: 'Garden Lighting', decor: 'Garden Decor',
  tools: 'Tools & Accessories', shade: 'Shade & Shelter',
}

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest'        },
  { value: 'price_asc', label: 'Price: Low–High' },
  { value: 'price_desc',label: 'Price: High–Low' },
]

export default function BrowsePage({ onNavigate, category }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('newest')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase
        .from('products')
        .select('id, label, brand, gradient, category, created_at, product_sizes(price, label), product_swatches(name, hex_color)')
        .eq('is_active', true)
        .eq('category', category || 'outdoor') // outdoor products tagged with their category

      if (category) q = q.eq('category', category)

      const { data } = await q.order('created_at', { ascending: false }).limit(60)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [category])

  const filtered = products
    .filter(p => !search || p.label?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price_asc')  return minPrice(a) - minPrice(b)
      if (sort === 'price_desc') return minPrice(b) - minPrice(a)
      return 0 // newest = DB order
    })

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <h2 style={s.sideTitle}>{category ? CATEGORY_LABELS[category] ?? category : 'All Products'}</h2>
        <p style={s.sideCount}>{filtered.length} products</p>

        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Categories</span>
          <button style={{ ...s.filterBtn, ...((!category) ? s.filterBtnActive : {}) }} onClick={() => onNavigate('browse')}>All</button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key}
              style={{ ...s.filterBtn, ...(category === key ? s.filterBtnActive : {}) }}
              onClick={() => onNavigate('browse', { category: key })}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.main}>
        <div style={s.toolbar}>
          <input style={s.search} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={s.dim}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyTitle}>No products found</p>
            <p style={s.dim}>Try a different category or search term.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, onNavigate }) {
  const price = minPrice(product)
  return (
    <button style={s.card} onClick={() => onNavigate('product', { productId: product.id })}>
      <div style={{ ...s.cardImg, background: product.gradient ?? 'linear-gradient(135deg,#4a8a3a,#2a6a1a)' }} />
      <div style={s.cardBody}>
        {product.brand && <p style={s.cardBrand}>{product.brand}</p>}
        <p style={s.cardLabel}>{product.label}</p>
        {price != null && <p style={s.cardPrice}>from ${price.toLocaleString()}</p>}
      </div>
    </button>
  )
}

function minPrice(p) {
  const prices = (p.product_sizes || []).map(s => s.price).filter(v => v != null)
  return prices.length ? Math.min(...prices) : null
}

const s = {
  page:          { display: 'flex', gap: 0, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', alignItems: 'flex-start' },
  sidebar:       { width: 210, flexShrink: 0, paddingRight: 24, position: 'sticky', top: 80 },
  sideTitle:     { fontSize: 17, fontWeight: 700, color: '#1a2a0a', marginBottom: 4 },
  sideCount:     { fontSize: 12, color: '#7a8a6a', marginBottom: 20 },
  filterGroup:   { display: 'flex', flexDirection: 'column', gap: 3 },
  filterLabel:   { fontSize: 10, fontWeight: 700, color: '#9aaa8a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'block' },
  filterBtn:     { padding: '7px 12px', background: 'transparent', border: 'none', borderRadius: 7, color: '#4a6a3a', fontSize: 13, textAlign: 'left', cursor: 'pointer' },
  filterBtnActive:{ background: '#eef4ea', color: '#1a4a0a', fontWeight: 600 },
  main:          { flex: 1 },
  toolbar:       { display: 'flex', gap: 12, marginBottom: 20 },
  search:        { flex: 1, padding: '9px 14px', border: '1px solid #ddd8cc', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' },
  sortSelect:    { padding: '9px 14px', border: '1px solid #ddd8cc', borderRadius: 8, fontSize: 13, background: '#fff', color: '#2a2a1a', cursor: 'pointer' },
  dim:           { color: '#9aaa8a', fontSize: 13 },
  empty:         { padding: '60px', textAlign: 'center' },
  emptyTitle:    { fontSize: 16, fontWeight: 600, color: '#2a3a1a', marginBottom: 8 },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  card:          { background: '#fff', border: '1px solid #e0dbd0', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s' },
  cardImg:       { height: 160, width: '100%' },
  cardBody:      { padding: '12px 14px' },
  cardBrand:     { fontSize: 10, color: '#9aaa8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  cardLabel:     { fontSize: 13, fontWeight: 600, color: '#1a2a0a', marginBottom: 6, lineHeight: 1.3 },
  cardPrice:     { fontSize: 13, fontWeight: 700, color: '#2a5a1a' },
}
