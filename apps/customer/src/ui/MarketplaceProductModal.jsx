import { useState, useMemo } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const REPORT_REASONS = [
  'Inaccurate 3D model',
  'Wrong product description',
  'Wrong photos',
  'Inappropriate content',
  'Suspected counterfeit',
  'Other',
]

export default function MarketplaceProductModal({ product, onClose, onEnterBuilder }) {
  const t = useTheme()
  const { user } = useAuth()
  const [sizeIdx, setSizeIdx]       = useState(0)
  const [swatchIdx, setSwatchIdx]   = useState(0)
  const [imageIdx, setImageIdx]     = useState(0)
  const [reportOpen, setReportOpen]     = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportNote, setReportNote]     = useState('')
  const [reportSent, setReportSent]     = useState(false)

  async function submitReport() {
    if (!reportReason) return
    await supabase.from('product_reports').insert({
      product_id: product.id,
      reporter_id: user?.id || null,
      reason: reportReason,
      note: reportNote.trim() || null,
    })
    setReportSent(true)
    setTimeout(() => { setReportOpen(false); setReportSent(false); setReportReason(''); setReportNote('') }, 2000)
  }

  const sizes    = product.product_sizes ?? []
  const swatches = product.product_swatches ?? []
  const images   = useMemo(() => {
    const arr = (product.product_images ?? []).slice().sort((a, b) => {
      if (a.is_primary) return -1
      if (b.is_primary) return 1
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })
    return arr.map(img => {
      const { data } = supabase.storage.from('product-images').getPublicUrl(img.storage_path)
      return data?.publicUrl
    }).filter(Boolean)
  }, [product])

  const selectedSize    = sizes[sizeIdx]
  const selectedSwatch  = swatches[swatchIdx]
  const currentImage    = images[imageIdx]
  const price           = selectedSize?.price ?? product.price ?? null
  const seller          = product.profiles?.display_name ?? 'Seller'
  const stock           = selectedSize?.stock_qty

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 260,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', system-ui, sans-serif",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.surface, border: `1px solid ${t.surfaceBorder}`,
        borderRadius: 16, width: 820, maxWidth: '94vw', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 20, zIndex: 10,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(20,20,45,0.8)', backdropFilter: 'blur(8px)',
          border: `1px solid ${t.surfaceBorder}`, color: t.text,
          cursor: 'pointer', fontSize: 14,
        }}>✕</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
          {/* LEFT — image + thumbnails */}
          <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.surfaceBorder}` }}>
            <div style={{
              flex: 1, minHeight: 320, background: product.gradient ?? t.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {currentImage
                ? <img src={currentImage} alt={product.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 56, opacity: 0.2 }}>✦</span>}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto', flexShrink: 0 }}>
                {images.map((url, i) => (
                  <button key={i} onClick={() => setImageIdx(i)} style={{
                    width: 60, height: 60, borderRadius: 8, padding: 0, flexShrink: 0,
                    border: `2px solid ${i === imageIdx ? t.accent : t.surfaceBorder}`,
                    background: 'transparent', cursor: 'pointer', overflow: 'hidden',
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — details */}
          <div style={{ padding: '24px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Seller + rating */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: t.textSoft }}>by {seller}</span>
              {product.rating > 0 && (
                <span style={{ fontSize: 12, color: '#f0c060' }}>
                  ★ {product.rating} <span style={{ color: t.textSoft }}>({product.review_count ?? 0})</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1.25 }}>{product.label}</h2>
            {product.brand && <p style={{ margin: 0, fontSize: 13, color: t.textSoft }}>{product.brand}</p>}

            {/* Price + stock */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: t.accent }}>
                {price == null ? 'Contact seller' : `$${price.toLocaleString()}`}
              </span>
              {stock != null && stock > 0 && stock <= 5 && (
                <span style={{ fontSize: 11, color: '#f0c060', fontWeight: 600 }}>Only {stock} left</span>
              )}
              {stock === 0 && <span style={{ fontSize: 11, color: '#ff7aa0', fontWeight: 600 }}>Out of stock</span>}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ margin: 0, fontSize: 13, color: t.textSoft, lineHeight: 1.65 }}>
                {product.description}
              </p>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Size</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sizes.map((s, i) => (
                    <button key={s.id} onClick={() => setSizeIdx(i)} style={{
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                      background: i === sizeIdx ? `${t.accent}15` : t.bg,
                      border: `1px solid ${i === sizeIdx ? t.accent : t.surfaceBorder}`,
                      color: i === sizeIdx ? t.accent : t.text,
                      fontWeight: i === sizeIdx ? 600 : 400,
                    }}>
                      {s.label || `${s.width_in ?? ''}×${s.depth_in ?? ''}×${s.height_in ?? ''}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Swatches */}
            {swatches.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Color {selectedSwatch?.name && <span style={{ textTransform: 'none', color: t.text, fontWeight: 400 }}>— {selectedSwatch.name}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {swatches.map((sw, i) => (
                    <button key={sw.id} onClick={() => setSwatchIdx(i)} title={sw.name} style={{
                      width: 30, height: 30, borderRadius: '50%', padding: 0, cursor: 'pointer',
                      background: sw.hex_color ?? sw.hex,
                      border: `2px solid ${i === swatchIdx ? t.accent : 'rgba(255,255,255,0.2)'}`,
                      transform: i === swatchIdx ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s',
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {product.materials && (
              <div style={{ fontSize: 12, color: t.textSoft }}>
                <strong style={{ color: t.text, fontWeight: 600 }}>Materials:</strong> {product.materials}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 12 }}>
              <button onClick={onEnterBuilder} style={{
                flex: 1, padding: '12px 18px', borderRadius: 10,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                ✦ Place in a room
              </button>
            </div>

            {/* Report this item */}
            {!reportOpen && !reportSent && (
              <button
                onClick={() => setReportOpen(true)}
                style={{ width: '100%', padding: '7px 0', fontSize: 11, background: 'transparent', color: t.textSoft, border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                Report this item
              </button>
            )}
            {reportOpen && !reportSent && (
              <div style={{ padding: 12, background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: '0 0 6px' }}>What's wrong?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {REPORT_REASONS.map(r => (
                    <button
                      key={r}
                      style={{
                        padding: '5px 10px', fontSize: 11, borderRadius: 8, cursor: 'pointer',
                        background: reportReason === r ? `${t.accent}22` : t.surface,
                        border: `1px solid ${reportReason === r ? t.accent : t.surfaceBorder}`,
                        color: reportReason === r ? t.accent : t.text,
                      }}
                      onClick={() => setReportReason(r)}
                    >{r}</button>
                  ))}
                </div>
                <textarea
                  style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit' }}
                  placeholder="Add details (optional)"
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  rows={2}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={submitReport} disabled={!reportReason} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, background: '#d06060', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' }}>Submit Report</button>
                  <button onClick={() => { setReportOpen(false); setReportReason(''); setReportNote('') }} style={{ padding: '7px 14px', fontSize: 12, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {reportSent && <p style={{ fontSize: 12, color: '#70c070', textAlign: 'center' }}>Report submitted — thank you.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
