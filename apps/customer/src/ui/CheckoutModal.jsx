import { ITEM_CATALOGUE } from '../data/items'
import useCheckout from '../hooks/useCheckout'

export default function CheckoutModal({ cart, onClose }) {
  const { startCheckout, loading, error } = useCheckout({ cart })

  const total = cart.reduce((sum, c) => {
    const price = ITEM_CATALOGUE[c.typeKey]?.sizes[c.sizeIndex]?.price ?? 0
    return sum + price * c.qty
  }, 0)

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.card} onClick={e => e.stopPropagation()}>

        <div style={st.header}>
          <p style={st.title}>Order Summary</p>
          <button style={st.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={st.itemList}>
          {cart.map(entry => {
            const def  = ITEM_CATALOGUE[entry.typeKey]
            const size = def?.sizes[entry.sizeIndex]
            const sw   = def?.swatches[entry.swatchIndex]
            if (!def || !size || !sw) return null
            return (
              <div key={`${entry.typeKey}-${entry.sizeIndex}-${entry.swatchIndex}`} style={st.item}>
                <div style={{ ...st.itemThumb, background: def.gradient }} />
                <div style={st.itemInfo}>
                  <span style={st.itemName}>{def.label}</span>
                  <span style={st.itemMeta}>{size.label} · {sw.name}</span>
                </div>
                <div style={st.itemRight}>
                  <span style={st.itemQty}>×{entry.qty}</span>
                  <span style={st.itemPrice}>${(size.price * entry.qty).toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={st.footer}>
          <div style={st.totalRow}>
            <span style={st.totalLabel}>Total</span>
            <span style={st.totalPrice}>${total.toLocaleString()}</span>
          </div>

          <p style={st.note}>
            You'll be taken to Stripe's secure checkout page.
            No payment info is stored on our servers.
          </p>

          {error && <p style={st.error}>{error}</p>}

          <button
            style={{ ...st.payBtn, opacity: loading ? 0.6 : 1 }}
            onClick={startCheckout}
            disabled={loading || !cart.length}
          >
            {loading ? 'Redirecting…' : `Pay $${total.toLocaleString()} →`}
          </button>

          <button style={st.cancelBtn} onClick={onClose}>Back to Cart</button>
        </div>

      </div>
    </div>
  )
}

const st = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
  card: { background: '#1e1e30', border: '1px solid #3a3a5a', borderRadius: 16, width: 420, maxWidth: '94vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px', borderBottom: '1px solid #3a3a5a', flexShrink: 0 },
  title: { margin: 0, fontSize: 17, fontWeight: 700, color: '#e0d9ff' },
  closeBtn: { background: 'transparent', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 },
  itemList: { overflowY: 'auto', flex: 1 },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #2a2a3a' },
  itemThumb: { width: 46, height: 46, borderRadius: 8, flexShrink: 0 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  itemName: { fontSize: 13, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemMeta: { fontSize: 11, color: '#7878aa' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 },
  itemQty: { fontSize: 11, color: '#7878aa' },
  itemPrice: { fontSize: 13, fontWeight: 600, color: '#c0b8ff' },
  footer: { padding: '16px 20px 20px', borderTop: '1px solid #3a3a5a', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  totalPrice: { fontSize: 22, fontWeight: 700, color: '#e0d9ff' },
  note: { margin: 0, fontSize: 11, color: '#5a5a7a', lineHeight: 1.5 },
  error: { margin: 0, fontSize: 12, color: '#ff7a7a', background: '#3a1a1a', border: '1px solid #7a2a2a', borderRadius: 6, padding: '8px 12px' },
  payBtn: { padding: '13px 0', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s' },
  cancelBtn: { padding: '10px 0', background: 'transparent', color: '#7878aa', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
}
