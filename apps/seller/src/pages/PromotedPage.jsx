import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function PromotedPage() {
  const { user } = useAuth()
  const t = useTheme()
  const [promos, setPromos]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form
  const [productId, setProductId]   = useState('')
  const [placement, setPlacement]   = useState('search')
  const [budget, setBudget]         = useState('5')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('promoted_listings').select('*, products(label)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('products').select('id, label').eq('seller_id', user.id).eq('is_active', true),
    ]).then(([{ data: p }, { data: pr }]) => {
      setPromos(p ?? [])
      setProducts(pr ?? [])
      setLoading(false)
    })
  }, [user])

  async function createPromo(e) {
    e.preventDefault()
    if (!productId || !budget) return
    setSaving(true)
    const { data, error } = await supabase.from('promoted_listings').insert({
      seller_id: user.id, product_id: productId, placement,
      daily_budget_cents: Math.round(Number(budget) * 100),
    }).select('*, products(label)').single()
    setSaving(false)
    if (!error && data) {
      setPromos(prev => [data, ...prev])
      setProductId(''); setBudget('5'); setShowForm(false)
    }
  }

  async function toggleActive(id, current) {
    await supabase.from('promoted_listings').update({ is_active: !current }).eq('id', id)
    setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  return (
    <div style={{ maxWidth: 640, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, margin: 0 }}>Promoted Listings</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          background: showForm ? t.surface : t.accent, color: showForm ? t.textSoft : t.accentText,
          border: `1px solid ${showForm ? t.surfaceBorder : t.accent}`,
        }}>{showForm ? 'Cancel' : '+ Promote'}</button>
      </div>

      <p style={{ fontSize: 13, color: t.textSoft, margin: '0 0 20px', lineHeight: 1.6 }}>
        Promoted products appear higher in search results and category pages. You set a daily budget — never pay more than you choose.
      </p>

      {showForm && (
        <form onSubmit={createPromo} style={{
          background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
          padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
              border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none',
            }}>
              <option value="">Select a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Placement</label>
              <select value={placement} onChange={e => setPlacement(e.target.value)} style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none',
              }}>
                <option value="search">Search results</option>
                <option value="category">Category page</option>
                <option value="homepage">Homepage</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily budget ($)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} type="number" min="1" step="1" style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{
            padding: '10px 0', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
            background: t.accent, color: t.accentText, border: 'none', fontSize: 14, fontWeight: 600,
          }}>{saving ? 'Creating…' : 'Start Promotion'}</button>
        </form>
      )}

      {loading && <p style={{ color: t.textSoft, fontSize: 13 }}>Loading…</p>}
      {!loading && promos.length === 0 && !showForm && (
        <p style={{ color: t.textSoft, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
          No promotions yet.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {promos.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10,
            opacity: p.is_active ? 1 : 0.5,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{p.products?.label ?? 'Product'}</span>
              <span style={{ fontSize: 11, color: t.textSoft, marginLeft: 8 }}>{p.placement}</span>
            </div>
            <span style={{ fontSize: 12, color: t.textSoft }}>${(p.daily_budget_cents / 100).toFixed(0)}/day</span>
            <span style={{ fontSize: 11, color: t.accent }}>${(p.spent_cents / 100).toFixed(2)} spent</span>
            <button onClick={() => toggleActive(p.id, p.is_active)} style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
            }}>{p.is_active ? 'Pause' : 'Resume'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
