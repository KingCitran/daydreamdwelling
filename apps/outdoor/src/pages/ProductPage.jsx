import { useEffect, useState } from 'react'
import { supabase } from '@shared/supabase'
import { useTheme } from '@shared/ThemeProvider'

export default function ProductPage({ productId, cart, onNavigate }) {
  const t = useTheme()
  const [product,     setProduct]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [sizeIndex,   setSizeIndex]   = useState(0)
  const [swatchIndex, setSwatchIndex] = useState(0)
  const [added,       setAdded]       = useState(false)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    supabase
      .from('products')
      .select('*, product_sizes(*), product_swatches(*), product_tags(tag)')
      .eq('id', productId)
      .single()
      .then(({ data }) => { setProduct(data); setLoading(false) })
  }, [productId])

  if (loading) return <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}><p style={{ color: '#9aaa8a', fontSize: 14 }}>Loading…</p></div>
  if (!product) return <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}><p style={{ color: '#9aaa8a', fontSize: 14 }}>Product not found.</p></div>

  const sizes   = product.product_sizes    || []
  const swatches = product.product_swatches || []
  const tags    = product.product_tags     || []
  const size    = sizes[sizeIndex]
  const swatch  = swatches[swatchIndex]

  function handleAddToCart() {
    cart.addToCart(product, sizeIndex, swatchIndex)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      <button style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 }} onClick={() => onNavigate('browse')}>
        ← Back to Browse
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'flex-start' }}>

        {/* Image */}
        <div style={{ height: 460, borderRadius: 16, width: '100%', background: product.gradient ?? t.surface, border: `1px solid ${t.surfaceBorder}` }} />

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {product.brand && (
            <p style={{ fontSize: 11, fontWeight: 700, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{product.brand}</p>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1.2, marginBottom: 12 }}>{product.label}</h1>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {tags.map(tag => (
                <span key={tag.tag} style={{ fontSize: 11, color: t.accent, background: `${t.accent}14`, padding: '3px 9px', borderRadius: 20 }}>{tag.tag}</span>
              ))}
            </div>
          )}

          {product.description && <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 16 }}>{product.description}</p>}

          {/* Swatches */}
          {swatches.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: t.text, marginBottom: 10 }}>Color: <strong>{swatch?.name}</strong></p>
              <div style={{ display: 'flex', gap: 8 }}>
                {swatches.map((sw, i) => (
                  <button key={i} title={sw.name}
                    style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${t.surfaceBorder}`, cursor: 'pointer', background: sw.hex_color, outline: i === swatchIndex ? `3px solid ${t.accent}` : '3px solid transparent', outlineOffset: 2 }}
                    onClick={() => setSwatchIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: t.text, marginBottom: 10 }}>Size</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sizes.map((sz, i) => (
                  <button key={i}
                    style={{ padding: '8px 16px', border: `1px solid ${i === sizeIndex ? t.accent : t.surfaceBorder}`, borderRadius: 7, background: i === sizeIndex ? `${t.accent}14` : t.surface, fontSize: 13, cursor: 'pointer', color: i === sizeIndex ? t.accent : t.text, fontWeight: i === sizeIndex ? 600 : 400 }}
                    onClick={() => setSizeIndex(i)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: t.text }}>${(size?.price ?? 0).toLocaleString()}</span>
            <span style={{ fontSize: 12, color: t.textSoft }}>Free shipping on orders over $150</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              style={{ flex: 1, padding: '14px 0', background: added ? t.accent : t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'opacity 0.2s', cursor: 'pointer', opacity: added ? 0.8 : 1 }}
              onClick={handleAddToCart}>
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button
              style={{ padding: '14px 20px', background: 'transparent', border: `2px solid ${t.accent}`, color: t.accent, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { handleAddToCart(); onNavigate('cart') }}>
              Buy Now →
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: t.textSoft }}>
            <span>🔒 Secure checkout via Stripe</span>
            <span>🚚 Ships within 3 business days</span>
            <span>⭐ Verified seller</span>
          </div>
        </div>
      </div>
    </div>
  )
}
