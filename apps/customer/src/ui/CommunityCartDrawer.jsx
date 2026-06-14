import { useTheme } from '@shared/ThemeProvider'
import { ITEM_CATALOGUE } from '../data/items'

export default function CommunityCartDrawer({ cart, onClose, onCheckout }) {
  const t = useTheme()
  const { items, updateQty, removeItem, clear } = cart

  function getLabel(typeKey) {
    const cat = ITEM_CATALOGUE[typeKey]
    return cat?.label ?? typeKey.slice(0, 8) + '...'
  }

  function getPrice(item) {
    const cat = ITEM_CATALOGUE[item.typeKey]
    if (!cat) return 0
    return cat.sizes?.[item.sizeIndex]?.price ?? cat.price ?? 0
  }

  const total = items.reduce((s, item) => s + getPrice(item) * item.qty, 0)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 380, maxWidth: '100vw',
        background: t.surface, borderLeft: `1px solid ${t.surfaceBorder}`,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${t.surfaceBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>Your Cart</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none',
            color: t.textSoft, cursor: 'pointer', fontSize: 18,
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: t.textSoft, fontSize: 14 }}>
              Your cart is empty. Browse rooms and hit "Buy This Room" to add items.
            </div>
          )}
          {items.map((item, idx) => {
            const price = getPrice(item)
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: `1px solid ${t.surfaceBorder}`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>🛋️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getLabel(item.typeKey)}
                  </div>
                  <div style={{ fontSize: 11, color: t.textSoft }}>
                    ${price.toFixed(2)} each
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateQty(idx, item.qty - 1)} style={qtyBtn(t)}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(idx, item.qty + 1)} style={qtyBtn(t)}>+</button>
                </div>
                <button onClick={() => removeItem(idx)} style={{
                  background: 'transparent', border: 'none',
                  color: t.textSoft, cursor: 'pointer', fontSize: 12,
                }}>✕</button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.surfaceBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
              }}
            >Checkout</button>
            <button onClick={clear} style={{
              width: '100%', padding: '8px', borderRadius: 8,
              background: 'transparent', color: t.textSoft,
              border: `1px solid ${t.surfaceBorder}`,
              fontSize: 12, cursor: 'pointer',
            }}>Clear cart</button>
          </div>
        )}
      </div>
    </div>
  )
}

function qtyBtn(t) {
  return {
    width: 26, height: 26, borderRadius: 6,
    background: t.bg, border: `1px solid ${t.surfaceBorder}`,
    color: t.text, cursor: 'pointer', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
