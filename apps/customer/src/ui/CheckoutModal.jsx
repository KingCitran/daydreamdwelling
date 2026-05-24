import { useState } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import useCheckout from '../hooks/useCheckout'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Two-step checkout: enter shipping address → quote shipping rate → review
// totals → Stripe Checkout. The chosen rate flows through to create-checkout
// so the buyer pays items + postage in one Stripe session.

export default function CheckoutModal({ cart, catalogue, onClose, roomName }) {
  const t = useTheme()
  const st = makeStyles(t)
  const cat = catalogue ?? ITEM_CATALOGUE

  const itemsTotal = cart.reduce((sum, c) => {
    const def   = cat[c.typeKey] ?? ITEM_CATALOGUE[c.typeKey]
    const price = def?.sizes?.[c.sizeIndex]?.price ?? 0
    return sum + price * c.qty
  }, 0)

  const [address, setAddress] = useState({ name: '', email: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' })
  const [rate,    setRate]    = useState(null)
  const [rateBusy, setRateBusy] = useState(false)
  const [rateErr,  setRateErr]  = useState(null)

  const { startCheckout, loading, error } = useCheckout({ cart, catalogue, roomName, shipping: rate, address })

  const addressComplete = address.line1.trim() && address.city.trim() && address.state.trim() && address.postal_code.trim()

  async function fetchRate() {
    setRateBusy(true); setRateErr(null); setRate(null)
    const items = cart.map(c => {
      const def = cat[c.typeKey] ?? ITEM_CATALOGUE[c.typeKey]
      return { typeKey: c.typeKey, qty: c.qty, unitPrice: def?.sizes?.[c.sizeIndex]?.price ?? 0, sellerId: def?._sellerId ?? null, label: def?.label }
    })
    const { data, error: fnErr } = await supabase.functions.invoke('get-shipping-rates', {
      body: { items, address },
    })
    setRateBusy(false)
    // supabase-js wraps non-2xx responses in fnErr but doesn't auto-parse the
    // function's JSON body. Try to read the real {error: ...} from
    // fnErr.context so buyers see "this seller can't accept orders yet"
    // instead of "Edge Function returned a non-2xx status code".
    let serverMessage = data?.error || null
    if (fnErr && !serverMessage) {
      try {
        const ctx = fnErr.context
        if (ctx && typeof ctx.json === 'function') {
          const body = await ctx.json()
          serverMessage = body?.error || null
        }
      } catch { /* swallow, fall back to generic */ }
    }
    if (fnErr || data?.error) {
      setRateErr(serverMessage || fnErr?.message || 'Could not get shipping rate')
      return
    }
    setRate(data)
  }

  const shippingCost = rate ? Math.round(parseFloat(rate.amount) * 100) / 100 : 0
  const total = itemsTotal + shippingCost

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.card} onClick={e => e.stopPropagation()}>

        <div style={st.header}>
          <p style={st.title}>Order Summary</p>
          <button style={st.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={st.body}>
          {/* Cart items */}
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

          {/* Address */}
          <div style={st.section}>
            <p style={st.sectionLabel}>Ship to</p>
            <input style={st.input} placeholder="Full name" value={address.name} onChange={e => { setAddress(a => ({ ...a, name: e.target.value })); setRate(null) }} />
            <input style={st.input} placeholder="Email (for tracking updates)" value={address.email} onChange={e => { setAddress(a => ({ ...a, email: e.target.value })); setRate(null) }} />
            <input style={st.input} placeholder="Street address" value={address.line1} onChange={e => { setAddress(a => ({ ...a, line1: e.target.value })); setRate(null) }} />
            <input style={st.input} placeholder="Apt / Suite (optional)" value={address.line2} onChange={e => { setAddress(a => ({ ...a, line2: e.target.value })); setRate(null) }} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: 8 }}>
              <input style={st.input} placeholder="City" value={address.city} onChange={e => { setAddress(a => ({ ...a, city: e.target.value })); setRate(null) }} />
              <input style={st.input} placeholder="State" value={address.state} onChange={e => { setAddress(a => ({ ...a, state: e.target.value })); setRate(null) }} maxLength={2} />
              <input style={st.input} placeholder="ZIP" value={address.postal_code} onChange={e => { setAddress(a => ({ ...a, postal_code: e.target.value })); setRate(null) }} />
            </div>

            {!rate && (
              <button
                style={{ ...st.rateBtn, opacity: addressComplete ? 1 : 0.5, cursor: addressComplete ? 'pointer' : 'default' }}
                onClick={fetchRate}
                disabled={!addressComplete || rateBusy}
              >
                {rateBusy ? 'Calculating shipping…' : 'Calculate shipping →'}
              </button>
            )}
            {rateErr && <p style={st.error}>{rateErr}</p>}
            {rate && (
              <div style={st.rateBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{rate.carrier}</strong> {rate.service}
                    {rate.estimatedDays != null && <span style={{ color: t.textSoft, marginLeft: 6, fontSize: 11 }}>· est. {rate.estimatedDays} day{rate.estimatedDays === 1 ? '' : 's'}</span>}
                  </span>
                  <span style={{ fontWeight: 600 }}>${parseFloat(rate.amount).toFixed(2)}</span>
                </div>
                <button style={st.changeAddrLink} onClick={() => setRate(null)}>Change address</button>
              </div>
            )}
          </div>
        </div>

        <div style={st.footer}>
          <div style={st.summary}>
            <div style={st.summaryRow}><span>Items</span><span>${itemsTotal.toLocaleString()}</span></div>
            <div style={st.summaryRow}><span>Shipping</span><span>{rate ? `$${shippingCost.toFixed(2)}` : '—'}</span></div>
            <div style={{ ...st.summaryRow, ...st.totalRow }}><span>Total</span><span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>

          <p style={st.note}>
            You'll be taken to Stripe's secure checkout page.
            No payment info is stored on our servers.
          </p>

          {error && <p style={st.error}>{error}</p>}

          <button
            style={{ ...st.payBtn, opacity: (loading || !rate) ? 0.5 : 1, cursor: (loading || !rate) ? 'default' : 'pointer' }}
            onClick={startCheckout}
            disabled={loading || !rate || !cart.length}
          >
            {loading ? 'Redirecting…' : rate ? `Pay $${total.toFixed(2)} →` : 'Enter address to continue'}
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
    card: { background: t.navBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, width: 480, maxWidth: '94vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    title: { margin: 0, fontSize: 17, fontWeight: 700, color: t.text },
    closeBtn: { background: 'transparent', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 },
    body: { overflowY: 'auto', flex: 1, paddingBottom: 8 },
    item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${t.surfaceBorder}` },
    itemThumb: { width: 46, height: 46, borderRadius: 8, flexShrink: 0 },
    itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
    itemName: { fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    itemMeta: { fontSize: 11, color: t.textSoft },
    itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 },
    itemQty: { fontSize: 11, color: t.textSoft },
    itemPrice: { fontSize: 13, fontWeight: 600, color: t.accent },
    section: { padding: '16px 20px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 8 },
    sectionLabel: { fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, margin: '0 0 4px' },
    input: { padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none' },
    rateBtn: { padding: '10px 14px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, marginTop: 4 },
    rateBlock: { padding: '10px 14px', background: `${t.accent}10`, border: `1px solid ${t.accent}30`, borderRadius: 8, fontSize: 13, color: t.text },
    changeAddrLink: { background: 'transparent', border: 'none', color: t.accent, fontSize: 11, cursor: 'pointer', padding: 0, marginTop: 6 },
    footer: { padding: '14px 20px 20px', borderTop: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 },
    summary: { display: 'flex', flexDirection: 'column', gap: 6 },
    summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.textSoft },
    totalRow: { fontSize: 15, fontWeight: 700, color: t.text, paddingTop: 8, borderTop: `1px dashed ${t.surfaceBorder}`, marginTop: 2 },
    note: { margin: 0, fontSize: 11, color: t.textSoft, lineHeight: 1.5 },
    error: { margin: 0, fontSize: 12, color: '#ff7a7a', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.25)', borderRadius: 6, padding: '8px 12px' },
    payBtn: { padding: '13px 0', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s' },
    cancelBtn: { padding: '10px 0', background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  }
}
