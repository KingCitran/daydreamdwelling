import { useState } from 'react'
import { ITEM_CATALOGUE } from '../../data/items'
import { s } from './shopStyles'

export default function WishlistTab({ items, onOpenModal, onToggleWishlist }) {
  const [shared, setShared] = useState(false)

  if (items.length === 0) {
    return (
      <div style={s.cartEmpty}>
        <p style={s.cartEmptyIcon}>♡</p>
        <p style={s.emptyMsg}>Your wishlist is empty.</p>
        <p style={{ ...s.emptyMsg, fontSize: 11, marginTop: 4 }}>Select any placed item and tap ♡ to save it here.</p>
      </div>
    )
  }

  const total = items.reduce((sum, it) => sum + ITEM_CATALOGUE[it.typeKey].sizes[it.sizeIndex].price, 0)

  const shareWishlist = () => {
    const lines = items.map(it => {
      const def = ITEM_CATALOGUE[it.typeKey]
      return `• ${def.label} (${def.sizes[it.sizeIndex].label}, ${def.swatches[it.swatchIndex].name}) — $${def.sizes[it.sizeIndex].price}`
    })
    navigator.clipboard.writeText(`My Room Wishlist:\n\n${lines.join('\n')}\n\nEst. Total: $${total.toLocaleString()}`)
      .then(() => { setShared(true); setTimeout(() => setShared(false), 2500) })
  }

  return (
    <div style={s.cartList}>
      {items.map(it => {
        const def  = ITEM_CATALOGUE[it.typeKey]
        const size = def.sizes[it.sizeIndex]
        const sw   = def.swatches[it.swatchIndex]
        return (
          <div key={it.id} style={s.cartItem} onClick={() => onOpenModal(it.typeKey)}>
            <div style={{ ...s.cartThumb, background: def.gradient }} />
            <div style={s.cartInfo}>
              <p style={s.cartLabel}>{def.label}</p>
              <p style={s.cartMeta}>{size.label} · {sw.name}</p>
              <p style={s.cartLineTotal}>${size.price}</p>
            </div>
            <button style={s.unwishBtn} onClick={e => { e.stopPropagation(); onToggleWishlist(it.id) }} title="Remove from wishlist">♥</button>
          </div>
        )
      })}
      <div style={s.cartFooter}>
        <div style={s.cartTotal}>
          <span style={s.cartTotalLabel}>Est. Total</span>
          <span style={s.cartTotalPrice}>${total.toLocaleString()}</span>
        </div>
        <button style={s.shareBtn} onClick={shareWishlist}>
          {shared ? '✓ Copied to clipboard!' : '🔗 Share Wishlist'}
        </button>
      </div>
    </div>
  )
}
