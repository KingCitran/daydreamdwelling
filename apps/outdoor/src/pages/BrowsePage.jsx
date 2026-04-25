import { useEffect, useState } from 'react'
import { supabase } from '@shared/supabase'
import { useTheme } from '@shared/ThemeProvider'
import { Icon } from '@shared/ui/Icon'

const CATEGORY_LABELS = {
  furniture: 'Outdoor Furniture', planters: 'Planters & Pots',
  lighting:  'Garden Lighting',   decor:    'Garden Decor',
  tools:     'Tools & Accessories', shade:  'Shade & Shelter',
}

const CATEGORY_ICONS = {
  furniture: 'furniture', planters: 'planters', lighting: 'lighting',
  decor: 'decor', tools: 'supplies', shade: 'shade',
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
]

export default function BrowsePage({ onNavigate, category }) {
  const t = useTheme()
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
      return 0
    })

  return (
    <div style={{ display: 'flex', gap: 0, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', alignItems: 'flex-start' }}>

      {/* Sidebar */}
      <div style={{ width: 210, flexShrink: 0, paddingRight: 24, position: 'sticky', top: 80 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 4 }}>
          {category ? CATEGORY_LABELS[category] ?? category : 'All Products'}
        </h2>
        <p style={{ fontSize: 12, color: t.textSoft, marginBottom: 20 }}>{filtered.length} products</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'block' }}>Categories</span>
          {[['', 'All'], ...Object.entries(CATEGORY_LABELS)].map(([key, label]) => {
            const isActive = key === '' ? !category : category === key
            return (
              <button key={key}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: isActive ? `${t.accent}18` : 'transparent', border: 'none', borderRadius: 7, color: isActive ? t.accent : t.textSoft, fontSize: 13, textAlign: 'left', cursor: 'pointer', fontWeight: isActive ? 600 : 400 }}
                onClick={() => onNavigate('browse', key ? { category: key } : {})}>
                {key && <Icon name={CATEGORY_ICONS[key]} size={15} />}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: t.textSoft, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <Icon name="search" size={15} />
            </span>
            <input
              style={{ flex: 1, padding: '9px 14px 9px 34px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none' }}
              placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: t.textSoft, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <Icon name="filter" size={15} />
            </span>
            <select
              style={{ padding: '9px 32px 9px 34px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, cursor: 'pointer', appearance: 'none' }}
              value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 10, color: t.textSoft, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
        </div>

        {loading ? (
          <p style={{ color: t.textSoft, fontSize: 13 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 8 }}>No products found</p>
            <p style={{ color: t.textSoft, fontSize: 13 }}>Try a different category or search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} t={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, onNavigate, t }) {
  const price = minPrice(product)
  return (
    <button
      style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
      onClick={() => onNavigate('product', { productId: product.id })}>
      <div style={{ height: 160, width: '100%', background: product.gradient ?? t.surface }} />
      <div style={{ padding: '12px 14px' }}>
        {product.brand && <p style={{ fontSize: 10, color: t.textSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{product.brand}</p>}
        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6, lineHeight: 1.3 }}>{product.label}</p>
        {price != null && <p style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>from ${price.toLocaleString()}</p>}
      </div>
    </button>
  )
}

function minPrice(p) {
  const prices = (p.product_sizes || []).map(s => s.price).filter(v => v != null)
  return prices.length ? Math.min(...prices) : null
}
