import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const CUSTOMER_APP_URL = import.meta.env.VITE_CUSTOMER_URL
  ?? (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://daydreamdwelling.com')

export default function SellerShopPage() {
  const { user } = useAuth()
  const t = useTheme()

  const [greetings,  setGreetings]  = useState(['Welcome to my shop! ☁'])
  const [lastSaved,  setLastSaved]  = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('seller_shops')
      .select('wispy_greeting, updated_at')
      .eq('seller_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        // Support both single string (legacy) and JSON array
        const g = data.wispy_greeting
        if (Array.isArray(g)) setGreetings(g.length > 0 ? g : ['Welcome to my shop! ☁'])
        else if (typeof g === 'string') {
          try { const arr = JSON.parse(g); if (Array.isArray(arr)) setGreetings(arr) }
          catch { setGreetings([g]) }
        }
        setLastSaved(data.updated_at ? new Date(data.updated_at) : null)
      })
  }, [user])

  function updateGreeting(idx, val) {
    setGreetings(prev => prev.map((g, i) => i === idx ? val : g))
  }

  function addGreeting() {
    if (greetings.length >= 5) return
    setGreetings(prev => [...prev, ''])
  }

  function removeGreeting(idx) {
    if (greetings.length <= 1) return
    setGreetings(prev => prev.filter((_, i) => i !== idx))
  }

  async function saveGreetings() {
    if (!user || saving) return
    setSaving(true)
    await supabase.from('seller_shops').upsert({
      seller_id: user.id,
      wispy_greeting: JSON.stringify(greetings.filter(g => g.trim())),
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setLastSaved(new Date())
    setTimeout(() => setSaved(false), 2500)
  }

  function openBuilder() {
    const url = `${CUSTOMER_APP_URL}?shopBuilder=true&sellerId=${user.id}`
    window.open(url, '_blank', 'noopener')
  }

  const inputStyle = {
    flex: 1, padding: '10px 12px', borderRadius: 8,
    background: t.surface, border: `1px solid ${t.surfaceBorder}`,
    color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 640, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, margin: '0 0 6px' }}>My 3D Shop</h1>
      <p style={{ fontSize: 14, color: t.textSoft, margin: '0 0 32px', lineHeight: 1.6 }}>
        Build a beautiful 3D room that showcases your products. Customers can browse your shop,
        place your items in their own rooms, and buy directly — all from inside DaydreamDwelling.
      </p>

      {/* Status */}
      <div style={{
        padding: '14px 18px', borderRadius: 10, marginBottom: 28,
        background: lastSaved ? `${t.accent}12` : t.surface,
        border: `1px solid ${lastSaved ? t.accent + '40' : t.surfaceBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>{lastSaved ? '☁' : '🏗'}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
            {lastSaved ? 'Shop layout saved' : 'Not configured yet'}
          </div>
          <div style={{ fontSize: 11, color: t.textSoft }}>
            {lastSaved
              ? `Last updated ${lastSaved.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Open the builder to place your products and design your shop'}
          </div>
        </div>
      </div>

      {/* Wispy greetings (multiple) */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>
          Wispy's Greetings
        </label>
        <p style={{ fontSize: 12, color: t.textSoft, margin: '0 0 12px', lineHeight: 1.5 }}>
          Wispy will randomly pick one of these greetings when a customer enters your shop. Add up to 5 variations!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {greetings.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: t.textSoft, width: 16, flexShrink: 0 }}>{i + 1}.</span>
              <input value={g} onChange={e => updateGreeting(i, e.target.value)} maxLength={80} placeholder={`Greeting ${i + 1}...`} style={inputStyle} />
              {greetings.length > 1 && (
                <button onClick={() => removeGreeting(i)} style={{ background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {greetings.length < 5 && (
            <button onClick={addGreeting} style={{
              padding: '8px 14px', borderRadius: 8, background: 'transparent',
              border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}>+ Add greeting</button>
          )}
          <button onClick={saveGreetings} disabled={saving} style={{
            padding: '8px 18px', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
            background: saved ? '#1a4a2a' : t.accent,
            border: `1px solid ${saved ? '#3a8a5a' : t.accent}`,
            color: saved ? '#a0ffcc' : t.accentText,
            fontSize: 13, fontWeight: 600, flexShrink: 0, fontFamily: 'inherit',
          }}>{saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Greetings'}</button>
        </div>
      </div>

      {/* Open builder */}
      <button onClick={openBuilder} style={{
        width: '100%', padding: '16px 24px', borderRadius: 12, cursor: 'pointer',
        background: `linear-gradient(135deg, ${t.accent}, #8040d0)`,
        border: 'none', color: t.accentText,
        fontSize: 15, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: `0 4px 20px ${t.accent}40`, fontFamily: 'inherit',
      }}>
        <span style={{ fontSize: 20 }}>☁</span>
        Open Shop Builder
        <span style={{ fontSize: 12, opacity: 0.8 }}>↗</span>
      </button>

      <p style={{ fontSize: 11, color: t.textSoft, marginTop: 10, textAlign: 'center' }}>
        Opens in a new tab · Your layout auto-saves when you click "Save Shop"
      </p>
    </div>
  )
}
