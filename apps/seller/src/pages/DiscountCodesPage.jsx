import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function DiscountCodesPage() {
  const { user } = useAuth()
  const t = useTheme()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [code, setCode]       = useState('')
  const [type, setType]       = useState('percent')
  const [value, setValue]     = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('discount_codes').select('*').eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCodes(data ?? []); setLoading(false) })
  }, [user])

  async function createCode(e) {
    e.preventDefault()
    if (!code.trim() || !value) return
    setSaving(true)
    const { data, error } = await supabase.from('discount_codes').insert({
      seller_id: user.id,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      max_uses: maxUses ? Number(maxUses) : null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setCodes(prev => [data, ...prev])
      setCode(''); setValue(''); setMaxUses(''); setShowForm(false)
    }
  }

  async function toggleActive(id, current) {
    await supabase.from('discount_codes').update({ is_active: !current }).eq('id', id)
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  async function deleteCode(id) {
    await supabase.from('discount_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ maxWidth: 640, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, margin: 0 }}>Discount Codes</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          background: showForm ? t.surface : t.accent, color: showForm ? t.textSoft : t.accentText,
          border: `1px solid ${showForm ? t.surfaceBorder : t.accent}`,
        }}>{showForm ? 'Cancel' : '+ New Code'}</button>
      </div>

      {showForm && (
        <form onSubmit={createCode} style={{
          background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
          padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code</label>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="SUMMER20" maxLength={20} style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 14, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1px', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none',
              }}>
                <option value="percent">% Off</option>
                <option value="fixed">$ Off</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {type === 'percent' ? 'Percent' : 'Amount ($)'}
              </label>
              <input value={value} onChange={e => setValue(e.target.value)} type="number" min="1" placeholder={type === 'percent' ? '15' : '5'} style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max uses (optional)</label>
              <input value={maxUses} onChange={e => setMaxUses(e.target.value)} type="number" min="1" placeholder="Unlimited" style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, background: t.bg,
                border: `1px solid ${t.surfaceBorder}`, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{
            padding: '10px 0', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
            background: t.accent, color: t.accentText, border: 'none', fontSize: 14, fontWeight: 600,
          }}>{saving ? 'Creating…' : 'Create Code'}</button>
        </form>
      )}

      {loading && <p style={{ color: t.textSoft, fontSize: 13 }}>Loading…</p>}
      {!loading && codes.length === 0 && !showForm && (
        <p style={{ color: t.textSoft, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
          No discount codes yet. Create one to share with customers.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {codes.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10,
            opacity: c.is_active ? 1 : 0.5,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: '1px' }}>{c.code}</span>
              <span style={{ fontSize: 12, color: t.textSoft, marginLeft: 10 }}>
                {c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`}
              </span>
            </div>
            <span style={{ fontSize: 11, color: t.textSoft }}>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''} used</span>
            <button onClick={() => toggleActive(c.id, c.is_active)} style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
            }}>{c.is_active ? 'Disable' : 'Enable'}</button>
            <button onClick={() => deleteCode(c.id)} style={{
              padding: '4px 8px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
            }}>🗑</button>
          </div>
        ))}
      </div>
    </div>
  )
}
