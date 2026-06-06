import { useState } from 'react'
import { ITEM_CATALOGUE } from '../../data/items'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import SellerModal from './SellerModal'

const REPORT_REASONS = [
  'Inaccurate 3D model',
  'Wrong product description',
  'Wrong photos',
  'Inappropriate content',
  'Suspected counterfeit',
  'Other',
]

export default function ProductModal({ typeKey, catalogue, onPlace, onAddToCart, onWishlist, onClose, onOpenModal }) {
  const t = useTheme()
  const ms = makeModalStyles(t)
  const { user } = useAuth()
  const def = (catalogue ?? ITEM_CATALOGUE)[typeKey]
  const [sizeIndex,    setSizeIndex]    = useState(0)
  const [swatchIndex,  setSwatchIndex]  = useState(0)
  const [tagInput,     setTagInput]     = useState('')
  const [tagSent,      setTagSent]      = useState(false)
  const [sellerOpen,   setSellerOpen]   = useState(false)
  const [reportOpen,   setReportOpen]   = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportNote,   setReportNote]   = useState('')
  const [reportSent,   setReportSent]   = useState(false)

  async function submitReport() {
    if (!reportReason) return
    await supabase.from('product_reports').insert({
      product_id: def._liveId || typeKey,
      reporter_id: user?.id || null,
      reason: reportReason,
      note: reportNote.trim() || null,
    })
    setReportSent(true)
    setTimeout(() => { setReportOpen(false); setReportSent(false); setReportReason(''); setReportNote('') }, 2000)
  }

  if (!def) return null
  const isFinish = def.isFloorFinish || def.isWallFinish

  const sendTag = () => {
    if (!tagInput.trim()) return
    setTagSent(true); setTagInput('')
    setTimeout(() => setTagSent(false), 3000)
  }

  return (
    <div style={ms.backdrop} onClick={onClose}>
      <div style={ms.card} onClick={e => e.stopPropagation()}>
        <div style={{ ...ms.thumb, background: def.gradient }} />
        <div style={ms.body}>
          <div style={ms.brandRow}>
            {def._sellerId
              ? <button style={ms.brandBtn} onClick={() => setSellerOpen(true)}>{def.brand} →</button>
              : <span style={ms.brand}>{def.brand}</span>
            }
            <span style={ms.rating}>★ {def.rating} <span style={ms.ratingCount}>({def.reviewCount})</span></span>
          </div>
          <p style={ms.title}>{def.label}</p>
          {isFinish && <p style={ms.finishBadge}>{def.isFloorFinish ? '🪵 Floor Finish' : '🏠 Wall Finish'} · ${def.pricePerSqFt}/sq ft</p>}
          <p style={ms.desc}>{def.description}</p>

          <p style={ms.sectionLabel}>Color</p>
          <div style={ms.swatchRow}>
            {def.swatches.map((sw, i) => (
              <button key={sw.name} title={sw.name}
                style={{ ...ms.swatchBtn, background: sw.hex, ...(i === swatchIndex ? ms.swatchBtnActive : {}) }}
                onClick={() => setSwatchIndex(i)}
              >{i === swatchIndex && <span style={ms.swatchCheck}>✓</span>}</button>
            ))}
          </div>
          <p style={ms.swatchName}>{def.swatches[swatchIndex].name}</p>

          <p style={ms.sectionLabel}>{isFinish ? 'Coverage' : 'Size'}</p>
          <div style={ms.sizeRow}>
            {def.sizes.map((sz, i) => (
              <button key={i} style={{ ...ms.sizeChip, ...(i === sizeIndex ? ms.sizeChipActive : {}) }} onClick={() => setSizeIndex(i)}>
                <span>{sz.label}</span>
                <span style={ms.sizePrice}>${sz.price}</span>
              </button>
            ))}
          </div>

          {def.materials?.length > 0 && (
            <>
              <p style={ms.sectionLabel}>Materials</p>
              <ul style={ms.matList}>{def.materials.map((m, i) => <li key={i} style={ms.matItem}>{m}</li>)}</ul>
            </>
          )}
          {def.guarantee && <p style={ms.guarantee}>{def.guarantee}</p>}

          {(def.themes?.length > 0 || def.styles?.length > 0) && (
            <div style={ms.tagSection}>
              <p style={ms.tagLabel}>Themes</p>
              <div style={ms.tagRow}>
                {[...(def.themes ?? []), ...(def.styles ?? [])].map(th => <span key={th} style={ms.tag}>{th}</span>)}
              </div>
              <p style={ms.tagLabel}>Suggest a tag</p>
              <div style={ms.tagInputRow}>
                <input style={ms.tagField} placeholder="e.g. Dungeon, Pond, Girly…" value={tagInput}
                  onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTag()} />
                <button style={ms.tagSendBtn} onClick={sendTag}>{tagSent ? '✓' : 'Send'}</button>
              </div>
              {tagSent && <p style={ms.tagThanks}>Thanks for the suggestion!</p>}
            </div>
          )}

          <div style={ms.actionRow}>
            {isFinish ? (
              <button style={ms.cartBtn} onClick={() => { onAddToCart(typeKey, sizeIndex, swatchIndex); onPlace(typeKey, sizeIndex, swatchIndex); onClose() }}>🛒 Add to Cart & Apply</button>
            ) : (
              <>
                <button style={ms.cartBtn} onClick={() => { onAddToCart(typeKey, sizeIndex, swatchIndex); onClose() }}>🛒 Add to Cart</button>
                <button style={ms.wishlistBtn} onClick={() => { onWishlist(typeKey, sizeIndex, swatchIndex); onClose() }}>♡ Wishlist</button>
              </>
            )}
          </div>
          {def.shop_url && (
            <a href={def.shop_url} target="_blank" rel="noopener noreferrer" style={ms.buyNowBtn}>
              Buy Now →
            </a>
          )}
          {!isFinish && <button style={ms.placeBtn} onClick={() => { onPlace(typeKey, sizeIndex, swatchIndex); onClose() }}>Place Only</button>}

          {/* Report this item */}
          {!reportOpen && !reportSent && (
            <button style={ms.reportToggle} onClick={() => setReportOpen(true)}>
              Report this item
            </button>
          )}
          {reportOpen && !reportSent && (
            <div style={ms.reportPanel}>
              <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: '0 0 6px' }}>What's wrong?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {REPORT_REASONS.map(r => (
                  <button
                    key={r}
                    style={{ ...ms.reportChip, ...(reportReason === r ? { background: `${t.accent}22`, borderColor: t.accent, color: t.accent } : {}) }}
                    onClick={() => setReportReason(r)}
                  >{r}</button>
                ))}
              </div>
              <textarea
                style={ms.reportInput}
                placeholder="Add details (optional)"
                value={reportNote}
                onChange={e => setReportNote(e.target.value)}
                rows={2}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={ms.reportSubmit} onClick={submitReport} disabled={!reportReason}>Submit Report</button>
                <button style={ms.reportCancel} onClick={() => { setReportOpen(false); setReportReason(''); setReportNote('') }}>Cancel</button>
              </div>
            </div>
          )}
          {reportSent && <p style={{ fontSize: 12, color: '#70c070', textAlign: 'center' }}>Report submitted — thank you.</p>}

          <button style={ms.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
      {sellerOpen && def._sellerId && (
        <SellerModal
          sellerId={def._sellerId}
          onOpenProduct={key => { setSellerOpen(false); onClose(); onOpenModal?.(key) }}
          onClose={() => setSellerOpen(false)}
        />
      )}
    </div>
  )
}

function makeModalStyles(t) {
  return {
    backdrop:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    card:         { background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, width: 440, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' },
    thumb:        { height: 160, flexShrink: 0 },
    body:         { overflowY: 'auto', padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 },
    brandRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    brand:        { fontSize: 11, color: t.textSoft },
    brandBtn:     { fontSize: 11, color: t.accent, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' },
    rating:       { fontSize: 11, color: '#f0c060' },
    ratingCount:  { color: t.textSoft },
    title:        { margin: 0, fontSize: 20, fontWeight: 700, color: t.text },
    finishBadge:  { margin: 0, fontSize: 12, color: '#70c090', fontWeight: 600 },
    desc:         { margin: 0, fontSize: 13, color: t.textSoft, lineHeight: 1.65 },
    sectionLabel: { margin: '6px 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    swatchRow:    { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
    swatchBtn:    { width: 28, height: 28, borderRadius: '50%', border: '2px solid transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s, transform 0.15s' },
    swatchBtnActive: { border: '2px solid #fff', transform: 'scale(1.15)' },
    swatchCheck:  { fontSize: 12, color: '#fff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },
    swatchName:   { margin: 0, fontSize: 11, color: t.textSoft },
    sizeRow:      { display: 'flex', flexWrap: 'wrap', gap: 8 },
    sizeChip:     { padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, cursor: 'pointer', fontSize: 11 },
    sizeChipActive: { background: `${t.accent}22`, borderColor: t.accent, color: t.text },
    sizePrice:    { fontSize: 12, fontWeight: 700, color: t.text },
    matList:      { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 3 },
    matItem:      { fontSize: 12, color: t.textSoft },
    guarantee:    { margin: 0, fontSize: 11, color: t.textSoft, fontStyle: 'italic' },
    tagSection:   { display: 'flex', flexDirection: 'column', gap: 6 },
    tagLabel:     { margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    tagRow:       { display: 'flex', flexWrap: 'wrap', gap: 6 },
    tag:          { padding: '3px 10px', fontSize: 10, background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12 },
    tagInputRow:  { display: 'flex', gap: 6 },
    tagField:     { flex: 1, padding: '6px 10px', fontSize: 12, background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 6, outline: 'none' },
    tagSendBtn:   { padding: '6px 14px', fontSize: 12, fontWeight: 600, background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 6, cursor: 'pointer' },
    tagThanks:    { margin: 0, fontSize: 11, color: '#70c070' },
    actionRow:    { display: 'flex', gap: 8, marginTop: 4 },
    cartBtn:      { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 8, cursor: 'pointer' },
    wishlistBtn:  { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: 'transparent', color: '#ff7aa0', border: '1px solid rgba(200,100,130,0.4)', borderRadius: 8, cursor: 'pointer' },
    buyNowBtn:    { display: 'block', width: '100%', padding: '11px 0', fontSize: 14, fontWeight: 600, background: '#2a9a6a', color: '#fff', border: '1px solid #2a9a6a', borderRadius: 8, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' },
    placeBtn:     { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, cursor: 'pointer' },
    closeBtn:     { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: t.textSoft, border: 'none', cursor: 'pointer', marginTop: 2 },
    reportToggle: { width: '100%', padding: '7px 0', fontSize: 11, background: 'transparent', color: t.textSoft, border: 'none', cursor: 'pointer', opacity: 0.6 },
    reportPanel:  { padding: '12px', background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, marginTop: 4 },
    reportChip:   { padding: '5px 10px', fontSize: 11, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, cursor: 'pointer', color: t.text },
    reportInput:  { width: '100%', padding: '8px 10px', fontSize: 12, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit' },
    reportSubmit: { padding: '7px 14px', fontSize: 12, fontWeight: 600, background: '#d06060', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' },
    reportCancel: { padding: '7px 14px', fontSize: 12, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, cursor: 'pointer' },
  }
}
