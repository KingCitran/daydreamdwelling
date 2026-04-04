export default function CartPage({ cart, onNavigate }) {
  const { items, cartTotal, increment, decrement, remove, checkout, loading, error } = cart

  if (items.length === 0) {
    return (
      <div style={s.empty}>
        <p style={s.emptyIcon}>🛒</p>
        <h2 style={s.emptyTitle}>Your cart is empty</h2>
        <p style={s.emptyMsg}>Discover beautiful outdoor products.</p>
        <button style={s.shopBtn} onClick={() => onNavigate('browse')}>Start Shopping →</button>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Your Cart</h1>

      <div style={s.layout}>
        {/* Item list */}
        <div style={s.itemList}>
          {items.map(item => (
            <div key={item.key} style={s.item}>
              <div style={{ ...s.itemImg, background: item.gradient }} />
              <div style={s.itemInfo}>
                <p style={s.itemLabel}>{item.label}</p>
                <p style={s.itemMeta}>{[item.sizeLabel, item.swatchName].filter(Boolean).join(' · ')}</p>
                <p style={s.itemPrice}>${item.price.toLocaleString()}</p>
              </div>
              <div style={s.itemControls}>
                <div style={s.qtyRow}>
                  <button style={s.qtyBtn} onClick={() => decrement(item.key)}>−</button>
                  <span style={s.qtyNum}>{item.qty}</span>
                  <button style={s.qtyBtn} onClick={() => increment(item.key)}>+</button>
                </div>
                <p style={s.itemLineTotal}>${(item.price * item.qty).toLocaleString()}</p>
                <button style={s.removeBtn} onClick={() => remove(item.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={s.summary}>
          <h2 style={s.summaryTitle}>Order Summary</h2>
          <div style={s.summaryRow}>
            <span>Subtotal</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          <div style={s.summaryRow}>
            <span>Shipping</span>
            <span style={{ color: '#5a8a4a' }}>Calculated at checkout</span>
          </div>
          <div style={s.divider} />
          <div style={{ ...s.summaryRow, fontWeight: 700, fontSize: 18 }}>
            <span>Estimated Total</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button
            style={{ ...s.checkoutBtn, opacity: loading ? 0.6 : 1 }}
            onClick={checkout}
            disabled={loading}>
            {loading ? 'Redirecting…' : `Checkout · $${cartTotal.toLocaleString()} →`}
          </button>
          <p style={s.checkoutNote}>Secure payment via Stripe. No card info stored on our servers.</p>

          <button style={s.continueBtn} onClick={() => onNavigate('browse')}>← Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  empty:         { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' },
  emptyIcon:     { fontSize: 56, marginBottom: 16 },
  emptyTitle:    { fontSize: 22, fontWeight: 700, color: '#1a2a0a', marginBottom: 8 },
  emptyMsg:      { fontSize: 14, color: '#7a8a6a', marginBottom: 24 },
  shopBtn:       { padding: '12px 24px', background: '#2a5a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700 },
  page:          { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  pageTitle:     { fontSize: 26, fontWeight: 800, color: '#1a2a0a', marginBottom: 28 },
  layout:        { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' },
  itemList:      { display: 'flex', flexDirection: 'column', gap: 0 },
  item:          { display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid #e0dbd0', alignItems: 'flex-start' },
  itemImg:       { width: 80, height: 80, borderRadius: 10, flexShrink: 0 },
  itemInfo:      { flex: 1 },
  itemLabel:     { fontSize: 14, fontWeight: 600, color: '#1a2a0a', marginBottom: 4 },
  itemMeta:      { fontSize: 12, color: '#7a8a6a', marginBottom: 6 },
  itemPrice:     { fontSize: 13, fontWeight: 600, color: '#2a5a1a' },
  itemControls:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  qtyRow:        { display: 'flex', alignItems: 'center', gap: 10, background: '#f5f3ee', borderRadius: 8, padding: '4px 10px' },
  qtyBtn:        { background: 'none', border: 'none', fontSize: 16, color: '#2a5a1a', fontWeight: 700, cursor: 'pointer', lineHeight: 1 },
  qtyNum:        { fontSize: 14, fontWeight: 600, color: '#1a2a0a', minWidth: 18, textAlign: 'center' },
  itemLineTotal: { fontSize: 14, fontWeight: 700, color: '#1a2a0a' },
  removeBtn:     { background: 'none', border: 'none', color: '#cc4a3a', fontSize: 12, cursor: 'pointer' },
  summary:       { background: '#fff', border: '1px solid #e0dbd0', borderRadius: 14, padding: '24px', position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 12 },
  summaryTitle:  { fontSize: 16, fontWeight: 700, color: '#1a2a0a', marginBottom: 4 },
  summaryRow:    { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#2a2a1a' },
  divider:       { borderTop: '1px solid #e0dbd0', margin: '4px 0' },
  error:         { fontSize: 12, color: '#cc3a2a', background: '#fff0ee', border: '1px solid #ffaaaa', borderRadius: 7, padding: '10px 12px' },
  checkoutBtn:   { padding: '14px 0', background: '#2a5a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s' },
  checkoutNote:  { fontSize: 11, color: '#9aaa8a', textAlign: 'center', lineHeight: 1.5 },
  continueBtn:   { background: 'none', border: 'none', color: '#5a8a4a', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
}
