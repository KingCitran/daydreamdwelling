import { ITEM_CATALOGUE } from '../../data/items'
import { s } from './shopStyles'

export default function CartTab({ cart, onIncrement, onDecrement, onRemove, cartHighlight, onCartHighlight, onCheckout }) {
  if (cart.length === 0) {
    return (
      <div style={s.cartEmpty}>
        <p style={s.cartEmptyIcon}>🛒</p>
        <p style={s.emptyMsg}>Your cart is empty.</p>
        <p style={{ ...s.emptyMsg, fontSize: 11, marginTop: 4 }}>Add items from the Shop tab.</p>
      </div>
    )
  }

  const total = cart.reduce((sum, c) => sum + ITEM_CATALOGUE[c.typeKey].sizes[c.sizeIndex].price * c.qty, 0)

  return (
    <div style={s.cartList}>
      {cart.map(entry => {
        const def  = ITEM_CATALOGUE[entry.typeKey]
        const size = def.sizes[entry.sizeIndex]
        const sw   = def.swatches[entry.swatchIndex]
        const isHL = !!(cartHighlight &&
          entry.typeKey    === cartHighlight.typeKey &&
          entry.sizeIndex  === cartHighlight.sizeIndex &&
          entry.swatchIndex === cartHighlight.swatchIndex)
        return (
          <div key={`${entry.typeKey}-${entry.sizeIndex}-${entry.swatchIndex}`}
            style={{ ...s.cartItem, ...(isHL ? { background: '#2a2a18', borderLeft: '2px solid #ffd700' } : {}) }}
            title="Click to highlight in room"
            onClick={() => onCartHighlight?.(isHL ? null : { typeKey: entry.typeKey, sizeIndex: entry.sizeIndex, swatchIndex: entry.swatchIndex })}
          >
            <div style={{ ...s.cartThumb, background: def.gradient }} />
            <div style={s.cartInfo}>
              <p style={s.cartLabel}>{def.label}</p>
              <p style={s.cartMeta}>{size.label} · {sw.name}</p>
              <p style={s.cartLineTotal}>${(size.price * entry.qty).toLocaleString()}</p>
            </div>
            <div style={s.cartControls}>
              <div style={s.qtyRow}>
                <button style={s.qtyBtn} onClick={() => onDecrement(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>−</button>
                <span style={s.qtyNum}>{entry.qty}</span>
                <button style={s.qtyBtn} onClick={() => onIncrement(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>+</button>
              </div>
              <button style={s.removeBtn} onClick={() => onRemove(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>Remove</button>
            </div>
          </div>
        )
      })}
      <div style={s.cartFooter}>
        <div style={s.cartTotal}>
          <span style={s.cartTotalLabel}>Subtotal</span>
          <span style={s.cartTotalPrice}>${total.toLocaleString()}</span>
        </div>
        <button style={s.checkoutBtn} onClick={onCheckout}>Proceed to Checkout →</button>
        <p style={s.checkoutNote}>Secure payment via Stripe. You'll be redirected to complete your purchase.</p>
      </div>
    </div>
  )
}
