import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'

export default function LoginPage() {
  const { signInWithEmail } = useAuth()
  const t = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await signInWithEmail(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${t.surfaceBorder}`, background: t.surface, color: t.text, fontSize: 14, boxSizing: 'border-box', outline: 'none' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: t.bg }}>
      <form onSubmit={handleSubmit} style={{ width: 360, padding: '40px 32px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 12, color: t.textSoft, marginTop: 6 }}>DaydreamDwelling</p>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...inputStyle, marginBottom: 12 }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, marginBottom: 16 }} />
        {error && <p style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, background: t.accent, color: t.accentText, border: 'none', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
