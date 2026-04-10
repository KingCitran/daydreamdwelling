import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const CUSTOMER_APP_URL = import.meta.env.VITE_CUSTOMER_URL
  ?? (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://daydreamdwelling.com')

export default function SellerShopPage() {
  const { user } = useAuth()
  const t = useTheme()

  const [greeting,    setGreeting]    = useState('Welcome to my shop! ☁')
  const [lastSaved,   setLastSaved]   = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('seller_shops')
      .select('wispy_greeting, updated_at')
      .eq('seller_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setGreeting(data.wispy_greeting ?? greeting)
        setLastSaved(data.updated_at ? new Date(data.updated_at) : null)
      })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveGreeting() {
    if (!user || saving) return
    setSaving(true)
    await supabase.from('seller_shops').upsert({
      seller_id: user.id,
      wispy_greeting: greeting,
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

  return (
    <div style={{ maxWidth: 640, fontFamily: 'system-ui, sans-serif' }}>
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

      {/* Wispy greeting */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>
          Wispy's greeting
        </label>
        <p style={{ fontSize: 12, color: t.textSoft, margin: '0 0 10px', lineHeight: 1.5 }}>
          This is what Wispy says when a customer enters your shop.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={greeting}
            onChange={e => setGreeting(e.target.value)}
            maxLength={80}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8,
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              color: t.text, fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={saveGreeting}
            disabled={saving}
            style={{
              padding: '10px 18px', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
              background: saved ? '#1a4a2a' : t.accent,
              border: `1px solid ${saved ? '#3a8a5a' : t.accent}`,
              color: saved ? '#a0ffcc' : t.accentText,
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}
          >{saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      {/* Open builder */}
      <button
        onClick={openBuilder}
        style={{
          width: '100%', padding: '16px 24px', borderRadius: 12, cursor: 'pointer',
          background: `linear-gradient(135deg, ${t.accent}, #8040d0)`,
          border: 'none', color: t.accentText,
          fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: `0 4px 20px ${t.accent}40`,
        }}
      >
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
