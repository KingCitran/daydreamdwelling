import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function SellerModal({ sellerId, onOpenProduct, onClose }) {
  const t = useTheme()
  const ms = makeStyles(t)
  const [profile,  setProfile]  = useState(null)
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!sellerId) return
    setLoading(true)
    Promise.all([
      supabase.from('profiles').select('display_name, bio, avatar_url').eq('id', sellerId).single(),
      supabase.from('products')
        .select('id, label, brand, gradient, price, rating, review_count, type_key, shop_url, product_sizes(price)')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    ]).then(([{ data: prof }, { data: prods }]) => {
      setProfile(prof)
      setProducts((prods ?? []).map(p => ({
        ...p,
        price: p.product_sizes?.length
          ? Math.min(...p.product_sizes.map(s => s.price))
          : p.price,
      })))
      setLoading(false)
    })
  }, [sellerId])

  return (
    <div style={ms.backdrop} onClick={onClose}>
      <div style={ms.card} onClick={e => e.stopPropagation()}>
        <div style={ms.header}>
          <div style={ms.avatar}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : <span style={ms.avatarInitial}>{(profile?.display_name ?? '?')[0]}</span>
            }
          </div>
          <div style={ms.headerInfo}>
            <p style={ms.sellerName}>{profile?.display_name ?? 'Seller'}</p>
            {profile?.bio && <p style={ms.bio}>{profile.bio}</p>}
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={ms.body}>
          {loading && <p style={ms.empty}>Loading…</p>}
          {!loading && products.length === 0 && <p style={ms.empty}>No active listings.</p>}
          {!loading && products.map(p => (
            <div key={p.id} style={ms.tile} onClick={() => p.type_key && onOpenProduct(p.type_key)}>
              <div style={{ ...ms.thumb, background: p.gradient ?? 'linear-gradient(135deg,#c4a8ff,#f0a8d8)' }} />
              <div style={ms.tileBody}>
                <p style={ms.tileLabel}>{p.label}</p>
                {p.price != null && <p style={ms.tilePrice}>From ${p.price}</p>}
                {p.rating > 0 && <p style={ms.tileRating}>★ {p.rating} ({p.review_count ?? 0})</p>}
              </div>
              {p.shop_url && (
                <a href={p.shop_url} target="_blank" rel="noopener noreferrer"
                  style={ms.buyBtn} onClick={e => e.stopPropagation()}>
                  Buy →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function makeStyles(t) {
  return {
    backdrop:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 },
    card:          { background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, width: 440, maxHeight: '85vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' },
    header:        { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px 14px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    avatar:        { width: 48, height: 48, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: `1px solid ${t.surfaceBorder}` },
    avatarInitial: { fontSize: 20, color: t.textSoft },
    headerInfo:    { flex: 1, minWidth: 0 },
    sellerName:    { margin: 0, fontSize: 16, fontWeight: 700, color: t.text },
    bio:           { margin: '4px 0 0', fontSize: 12, color: t.textSoft, lineHeight: 1.5 },
    closeBtn:      { background: 'none', border: 'none', cursor: 'pointer', color: t.textSoft, fontSize: 16, padding: 4, flexShrink: 0 },
    body:          { overflowY: 'auto', padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
    empty:         { margin: 0, fontSize: 13, color: t.textSoft, textAlign: 'center', padding: '24px 0' },
    tile:          { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, cursor: 'pointer' },
    thumb:         { width: 52, height: 52, borderRadius: 8, flexShrink: 0 },
    tileBody:      { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
    tileLabel:     { margin: 0, fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    tilePrice:     { margin: 0, fontSize: 12, color: t.textSoft },
    tileRating:    { margin: 0, fontSize: 11, color: '#f0c060' },
    buyBtn:        { flexShrink: 0, padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#2a9a6a', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', textDecoration: 'none' },
  }
}
