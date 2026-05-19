import { ITEM_CATALOGUE } from '../data/items'
import useCheckout from '../hooks/useCheckout'
import { useTheme } from '@shared/ThemeProvider'

export default function CheckoutModal({ cart, catalogue, onClose, roomName }) {
  const { startCheckout, loading, error } = useCheckout({ cart, catalogue, roomName })
  const t = useTheme()
  const st = makeStyles(t)
  const cat = catalogue ?? ITEM_CATALOGUE

  const total = cart.reduce((sum, c) => {
    const def   = cat[c.typeKey] ?? ITEM_CATALOGUE[c.typeKey]
    const price = def?.sizes?.[c.sizeIndex]?.price ?? 0
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
            const def  = cat[entry.typeKey] ?? ITEM_CATALOGUE[entry.typeKey]
            const size = def?.sizes?.[entry.sizeIndex]
            const sw   = def?.swatches?.[entry.swatchIndex]
            if (!def || !size || !sw) return null
            return (
              <div key={`${entry.typeKey}-${entry.sizeIndex}-${entry.swatchIndex}`} style={st.item}>
                <div style={{ ...st.itemThumb, background: def?.gradient ?? def?.color ?? '#9a7aee' }} />
                <div style={st.itemInfo}>
                  <span style={st.itemName}>{def.label}</span>
                  <span style={st.itemMeta}>{size.label} · {sw.name}</span>
                </div>
                <div style={st.itemRight}>
                  <span style={st.itemQty}>×{entry.qty}</span>
                  <span style={st.itemPrice}>${((size?.price ?? 0) * entry.qty).toLocaleString()}</span>
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
            className="ddd-checkout"
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

function makeStyles(t) {
  return {
    backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
    card: { background: t.navBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, width: 420, maxWidth: '94vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    title: { margin: 0, fontSize: 17, fontWeight: 700, color: t.text },
    closeBtn: { background: 'transparent', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 },
    itemList: { overflowY: 'auto', flex: 1 },
    item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${t.surfaceBorder}` },
    itemThumb: { width: 46, height: 46, borderRadius: 8, flexShrink: 0 },
    itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
    itemName: { fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    itemMeta: { fontSize: 11, color: t.textSoft },
    itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 },
    itemQty: { fontSize: 11, color: t.textSoft },
    itemPrice: { fontSize: 13, fontWeight: 600, color: t.accent },
    footer: { padding: '16px 20px 20px', borderTop: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    totalLabel: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    totalPrice: { fontSize: 22, fontWeight: 700, color: t.text },
    note: { margin: 0, fontSize: 11, color: t.textSoft, lineHeight: 1.5 },
    error: { margin: 0, fontSize: 12, color: '#ff7a7a', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.25)', borderRadius: 6, padding: '8px 12px' },
    payBtn: { padding: '13px 0', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s' },
    cancelBtn: { padding: '10px 0', background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  }
}
