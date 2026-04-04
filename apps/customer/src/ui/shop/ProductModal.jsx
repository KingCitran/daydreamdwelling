import { useState } from 'react'
import { ITEM_CATALOGUE } from '../../data/items'

export default function ProductModal({ typeKey, onPlace, onAddToCart, onWishlist, onClose }) {
  const def = ITEM_CATALOGUE[typeKey]
  const [sizeIndex,   setSizeIndex]   = useState(0)
  const [swatchIndex, setSwatchIndex] = useState(0)
  const [tagInput,    setTagInput]    = useState('')
  const [tagSent,     setTagSent]     = useState(false)

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
            <span style={ms.brand}>{def.brand}</span>
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

          <p style={ms.sectionLabel}>Materials</p>
          <ul style={ms.matList}>{def.materials.map((m, i) => <li key={i} style={ms.matItem}>{m}</li>)}</ul>
          <p style={ms.guarantee}>{def.guarantee}</p>

          {(def.themes?.length > 0 || def.styles?.length > 0) && (
            <div style={ms.tagSection}>
              <p style={ms.tagLabel}>Themes</p>
              <div style={ms.tagRow}>
                {[...(def.themes ?? []), ...(def.styles ?? [])].map(t => <span key={t} style={ms.tag}>{t}</span>)}
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
          {!isFinish && <button style={ms.placeBtn} onClick={() => { onPlace(typeKey, sizeIndex, swatchIndex); onClose() }}>Place Only</button>}
          <button style={ms.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

const ms = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { background: '#2a2a3d', border: '1px solid #4a4a6a', borderRadius: 14, width: 440, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' },
  thumb: { height: 160, flexShrink: 0 },
  body:  { overflowY: 'auto', padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 },
  brandRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 11, color: '#7878aa' },
  rating: { fontSize: 11, color: '#f0c060' },
  ratingCount: { color: '#7878aa' },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#e0d9ff' },
  finishBadge: { margin: 0, fontSize: 12, color: '#70e090', fontWeight: 600 },
  desc:  { margin: 0, fontSize: 13, color: '#a0a0cc', lineHeight: 1.65 },
  sectionLabel: { margin: '6px 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  swatchRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  swatchBtn: { width: 28, height: 28, borderRadius: '50%', border: '2px solid transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s, transform 0.15s' },
  swatchBtnActive: { border: '2px solid #fff', transform: 'scale(1.15)' },
  swatchCheck: { fontSize: 12, color: '#fff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },
  swatchName: { margin: 0, fontSize: 11, color: '#9898cc' },
  sizeRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  sizeChip: { padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', background: '#3a3a55', color: '#c0b8ff', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer', fontSize: 11 },
  sizeChipActive: { background: '#5a4a8a', borderColor: '#9a7aee', color: '#fff' },
  sizePrice: { fontSize: 12, fontWeight: 700, color: '#e0d9ff' },
  matList: { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 3 },
  matItem: { fontSize: 12, color: '#a0a0cc' },
  guarantee: { margin: 0, fontSize: 11, color: '#6868aa', fontStyle: 'italic' },
  tagSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  tagLabel: { margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { padding: '3px 10px', fontSize: 10, background: '#3a3a55', color: '#c0b8ff', border: '1px solid #4a4a6a', borderRadius: 12 },
  tagInputRow: { display: 'flex', gap: 6 },
  tagField: { flex: 1, padding: '6px 10px', fontSize: 12, background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 6, outline: 'none' },
  tagSendBtn: { padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 6, cursor: 'pointer' },
  tagThanks: { margin: 0, fontSize: 11, color: '#70c070' },
  actionRow: { display: 'flex', gap: 8, marginTop: 4 },
  cartBtn: { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer' },
  wishlistBtn: { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: '#2a2a3d', color: '#ff7aa0', border: '1px solid #6a4a6a', borderRadius: 8, cursor: 'pointer' },
  placeBtn: { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer' },
  closeBtn: { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: '#6868aa', border: 'none', cursor: 'pointer', marginTop: 2 },
}
