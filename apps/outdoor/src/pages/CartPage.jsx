import { useTheme } from '@shared/ThemeProvider'

export default function CartPage({ cart, onNavigate }) {
  const t = useTheme()
  const { items, cartTotal, increment, decrement, remove, checkout, loading, error } = cart

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>🛒</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ fontSize: 14, color: t.textSoft, marginBottom: 24 }}>Discover beautiful outdoor products.</p>
        <button style={{ padding: '12px 24px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }} onClick={() => onNavigate('browse')}>
          Start Shopping →
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 28 }}>Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>

        {/* Item list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: `1px solid ${t.surfaceBorder}`, alignItems: 'flex-start' }}>
              <div style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0, background: item.gradient ?? t.surface }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: t.textSoft, marginBottom: 6 }}>{[item.sizeLabel, item.swatchName].filter(Boolean).join(' · ')}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>${item.price.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, padding: '4px 10px' }}>
                  <button style={{ background: 'none', border: 'none', fontSize: 16, color: t.accent, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }} onClick={() => decrement(item.key)}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.text, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                  <button style={{ background: 'none', border: 'none', fontSize: 16, color: t.accent, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }} onClick={() => increment(item.key)}>+</button>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: t.text }}>${(item.price * item.qty).toLocaleString()}</p>
                <button style={{ background: 'none', border: 'none', color: '#cc4a3a', fontSize: 12, cursor: 'pointer' }} onClick={() => remove(item.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '24px', position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: t.text }}>
            <span>Subtotal</span><span>${cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: t.text }}>
            <span>Shipping</span>
            <span style={{ color: t.accent }}>Calculated at checkout</span>
          </div>
          <div style={{ borderTop: `1px solid ${t.surfaceBorder}`, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: t.text }}>
            <span>Estimated Total</span><span>${cartTotal.toLocaleString()}</span>
          </div>

          {error && <p style={{ fontSize: 12, color: '#cc3a2a', background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.25)', borderRadius: 7, padding: '10px 12px' }}>{error}</p>}

          <button
            style={{ padding: '14px 0', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s', opacity: loading ? 0.6 : 1, cursor: 'pointer' }}
            onClick={checkout} disabled={loading}>
            {loading ? 'Redirecting…' : `Checkout · $${cartTotal.toLocaleString()} →`}
          </button>
          <p style={{ fontSize: 11, color: t.textSoft, textAlign: 'center', lineHeight: 1.5 }}>Secure payment via Stripe.</p>
          <button style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate('browse')}>← Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}
