import { useEffect, useState } from 'react'
import { supabase } from '@shared/supabase'

export default function ProductPage({ productId, cart, onNavigate }) {
  const [product,      setProduct]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [sizeIndex,    setSizeIndex]    = useState(0)
  const [swatchIndex,  setSwatchIndex]  = useState(0)
  const [added,        setAdded]        = useState(false)

  useEffect(() => {
    if (!productId) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*, product_sizes(*), product_swatches(*), product_tags(tag)')
        .eq('id', productId)
        .single()
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [productId])

  if (loading) return <div style={s.page}><p style={s.dim}>Loading…</p></div>
  if (!product) return <div style={s.page}><p style={s.dim}>Product not found.</p></div>

  const sizes   = product.product_sizes   || []
  const swatches = product.product_swatches || []
  const tags    = product.product_tags    || []
  const size    = sizes[sizeIndex]
  const swatch  = swatches[swatchIndex]

  function handleAddToCart() {
    cart.addToCart(product, sizeIndex, swatchIndex)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => onNavigate('browse')}>← Back to Browse</button>

      <div style={s.layout}>
        {/* Image */}
        <div style={{ ...s.imgBox, background: product.gradient ?? 'linear-gradient(135deg,#4a8a3a,#2a6a1a)' }} />

        {/* Info */}
        <div style={s.info}>
          {product.brand && <p style={s.brand}>{product.brand}</p>}
          <h1 style={s.title}>{product.label}</h1>

          {tags.length > 0 && (
            <div style={s.tagRow}>
              {tags.map(t => <span key={t.tag} style={s.tag}>{t.tag}</span>)}
            </div>
          )}

          {product.description && <p style={s.desc}>{product.description}</p>}

          {/* Swatches */}
          {swatches.length > 0 && (
            <div style={s.section}>
              <p style={s.sectionLabel}>Color: <strong>{swatch?.name}</strong></p>
              <div style={s.swatchRow}>
                {swatches.map((sw, i) => (
                  <button key={i} title={sw.name}
                    style={{ ...s.swatch, background: sw.hex_color, outline: i === swatchIndex ? `3px solid #2a5a1a` : '3px solid transparent', outlineOffset: 2 }}
                    onClick={() => setSwatchIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div style={s.section}>
              <p style={s.sectionLabel}>Size</p>
              <div style={s.sizeRow}>
                {sizes.map((sz, i) => (
                  <button key={i}
                    style={{ ...s.sizeBtn, ...(i === sizeIndex ? s.sizeBtnActive : {}) }}
                    onClick={() => setSizeIndex(i)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div style={s.priceRow}>
            <span style={s.price}>${(size?.price ?? 0).toLocaleString()}</span>
            <span style={s.priceSub}>Free shipping on orders over $150</span>
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <button style={{ ...s.addBtn, background: added ? '#4a8a3a' : '#2a5a1a' }} onClick={handleAddToCart}>
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button style={s.cartBtn} onClick={() => { handleAddToCart(); onNavigate('cart') }}>
              Buy Now →
            </button>
          </div>

          <div style={s.trustRow}>
            <span>🔒 Secure checkout via Stripe</span>
            <span>🚚 Ships within 3 business days</span>
            <span>⭐ Verified seller</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page:        { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  backBtn:     { background: 'none', border: 'none', color: '#5a8a4a', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 },
  layout:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'flex-start' },
  imgBox:      { height: 460, borderRadius: 16, width: '100%' },
  info:        { display: 'flex', flexDirection: 'column', gap: 0 },
  brand:       { fontSize: 11, fontWeight: 700, color: '#7a8a6a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 },
  title:       { fontSize: 28, fontWeight: 800, color: '#1a2a0a', lineHeight: 1.2, marginBottom: 12 },
  tagRow:      { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag:         { fontSize: 11, color: '#5a8a4a', background: '#eef4ea', padding: '3px 9px', borderRadius: 20 },
  desc:        { fontSize: 14, color: '#4a6a3a', lineHeight: 1.7, marginBottom: 16 },
  section:     { marginBottom: 18 },
  sectionLabel:{ fontSize: 13, color: '#2a2a1a', marginBottom: 10 },
  swatchRow:   { display: 'flex', gap: 8 },
  swatch:      { width: 30, height: 30, borderRadius: '50%', border: '1px solid #ddd8cc', cursor: 'pointer' },
  sizeRow:     { display: 'flex', gap: 8, flexWrap: 'wrap' },
  sizeBtn:     { padding: '8px 16px', border: '1px solid #ddd8cc', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#2a2a1a' },
  sizeBtnActive:{ borderColor: '#2a5a1a', background: '#eef4ea', color: '#1a4a0a', fontWeight: 600 },
  priceRow:    { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 },
  price:       { fontSize: 30, fontWeight: 800, color: '#1a2a0a' },
  priceSub:    { fontSize: 12, color: '#7a8a6a' },
  actions:     { display: 'flex', gap: 10, marginBottom: 16 },
  addBtn:      { flex: 1, padding: '14px 0', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'background 0.2s' },
  cartBtn:     { padding: '14px 20px', background: 'transparent', border: '2px solid #2a5a1a', color: '#2a5a1a', borderRadius: 10, fontSize: 15, fontWeight: 700 },
  trustRow:    { display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: '#7a8a6a' },
  dim:         { color: '#9aaa8a', fontSize: 14 },
}
