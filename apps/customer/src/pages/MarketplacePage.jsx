import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const CATEGORIES = ['All', 'Seating', 'Tables', 'Storage', 'Bedroom', 'Lighting', 'Flooring', 'Textiles', 'Decor', 'Specialty']
const SORT_OPTIONS = [
  { key: 'newest',     label: 'Newest' },
  { key: 'price_asc',  label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'rating',     label: 'Top Rated' },
]

export default function MarketplacePage({ onEnterBuilder, onBack }) {
  const t = useTheme()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort]         = useState('newest')

  useEffect(() => {
    supabase
      .from('products')
      .select('*, product_sizes(*), product_swatches(*), product_images(storage_path, is_primary, sort_order), profiles!seller_id(display_name)')
      .eq('is_active', true)
      .then(({ data }) => { setProducts(data ?? []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let items = products

    if (category !== 'All') {
      const CAT_MAP = { seating: 'Seating', tables: 'Tables', storage: 'Storage', beds: 'Bedroom',
        lighting: 'Lighting', surfaces: 'Flooring', textiles: 'Textiles', decor: 'Decor',
        electronics: 'Specialty', outdoor: 'Specialty', other: 'Decor' }
      items = items.filter(p => {
        const mapped = CAT_MAP[p.category] ?? (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '')
        return mapped === category
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(p => p.label?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }

    if (sort === 'price_asc')  items = [...items].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sort === 'price_desc') items = [...items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    if (sort === 'rating')     items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sort === 'newest')     items = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return items
  }, [products, category, search, sort])

  function getImageUrl(product) {
    const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)
    const primary = images.find(i => i.is_primary) ?? images[0]
    if (!primary) return null
    return supabase.storage.from('product-images').getPublicUrl(primary.storage_path).data.publicUrl
  }

  function getPrice(product) {
    const sizes = (product.product_sizes ?? []).sort((a, b) => a.sort_order - b.sort_order)
    return sizes[0]?.price ?? product.price ?? 0
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <div style={{ padding: '14px 28px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: t.bg, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: t.textSoft }}>← Back</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>DaydreamDwelling Shop</span>
        </div>
        <button onClick={onEnterBuilder} style={{ padding: '8px 18px', borderRadius: 8, background: t.accent, color: t.accentText, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Open Builder
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="ddd-input"
            style={{
              flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8,
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              color: t.text, fontSize: 14, outline: 'none',
            }}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: '10px 14px', borderRadius: 8, background: t.surface,
            border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none',
          }}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: category === cat ? `${t.accent}20` : 'transparent',
              color: category === cat ? t.accent : t.textSoft,
              border: `1px solid ${category === cat ? t.accent : t.surfaceBorder}`,
              transition: 'all 0.2s',
            }}>{cat}</button>
          ))}
        </div>

        {/* Results */}
        {loading && <p style={{ color: t.textSoft, textAlign: 'center', padding: '40px 0' }}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ color: t.textSoft, textAlign: 'center', padding: '40px 0' }}>
            No products found{search ? ` for "${search}"` : ''}.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {filtered.map(product => {
            const imgUrl = getImageUrl(product)
            const price = getPrice(product)
            const seller = product.profiles?.display_name ?? 'Seller'
            return (
              <div key={product.id} className="ddd-tile" style={{
                background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}>
                <div style={{
                  height: 180, background: product.gradient ?? t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {imgUrl
                    ? <img src={imgUrl} alt={product.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 40, opacity: 0.2 }}>🛋</span>}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: t.textSoft }}>{seller}</span>
                    {product.rating > 0 && <span style={{ fontSize: 11, color: '#f0c060' }}>★ {product.rating}</span>}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: t.text }}>{product.label}</p>
                  <p style={{ margin: 0, fontSize: 14, color: t.accent, fontWeight: 600 }}>
                    ${price.toLocaleString()}
                  </p>
                  {(product.product_swatches ?? []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {product.product_swatches.slice(0, 6).map(sw => (
                        <span key={sw.id} style={{ width: 14, height: 14, borderRadius: '50%', background: sw.hex_color ?? sw.hex, border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
