import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [tab,      setTab]      = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error: err } = await signIn(email, password)
        if (err) throw err
      } else {
        const { error: err } = await signUp(email, password, name)
        if (err) throw err
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) setError(err.message)
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.logoMark}>⌂</p>
          <h1 style={s.heading}>Check your email</h1>
          <p style={s.subtext}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your seller account.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.logoMark}>⌂</p>
        <h1 style={s.heading}>Seller Hub</h1>
        <p style={s.subtext}>Manage your products, orders &amp; earnings</p>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'signin' ? s.tabActive : {}) }} onClick={() => setTab('signin')}>Sign in</button>
          <button style={{ ...s.tab, ...(tab === 'signup' ? s.tabActive : {}) }} onClick={() => setTab('signup')}>Create account</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {tab === 'signup' && (
            <input style={s.input} type="text" placeholder="Display name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input style={s.input} type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    required />
          <input style={s.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

          {error && <p style={s.error}>{error}</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? '…' : tab === 'signin' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>

        <div style={s.divider}><span style={s.dividerText}>or</span></div>

        <button style={s.googleBtn} onClick={handleGoogle}>
          <span style={{ fontSize: 16 }}>G</span> Continue with Google
        </button>
      </div>
    </div>
  )
}

const s = {
  page:        { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f1a', padding: 20 },
  card:        { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 16, padding: '36px 32px', width: 380, maxWidth: '100%' },
  logoMark:    { fontSize: 32, textAlign: 'center', margin: '0 0 8px' },
  heading:     { fontSize: 22, fontWeight: 700, color: '#e0d9ff', textAlign: 'center', margin: '0 0 6px' },
  subtext:     { fontSize: 13, color: '#7878aa', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 },
  tabs:        { display: 'flex', gap: 0, marginBottom: 20, background: '#13132a', borderRadius: 8, padding: 3 },
  tab:         { flex: 1, padding: '8px 0', background: 'transparent', border: 'none', color: '#7878aa', fontSize: 13, fontWeight: 500, borderRadius: 6, transition: 'all 0.15s' },
  tabActive:   { background: '#2a2a4a', color: '#e0d9ff' },
  form:        { display: 'flex', flexDirection: 'column', gap: 12 },
  input:       { padding: '11px 14px', background: '#13132a', border: '1px solid #3a3a5a', borderRadius: 8, color: '#e0d9ff', fontSize: 14, outline: 'none' },
  error:       { fontSize: 12, color: '#ff7a7a', background: '#3a1a1a', border: '1px solid #7a2a2a', borderRadius: 6, padding: '8px 12px', margin: 0 },
  btn:         { padding: '12px 0', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 9, fontSize: 14, fontWeight: 700, transition: 'opacity 0.15s' },
  divider:     { position: 'relative', textAlign: 'center', margin: '18px 0', borderTop: '1px solid #2a2a4a' },
  dividerText: { position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', padding: '0 10px', color: '#5a5a7a', fontSize: 11 },
  googleBtn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 0', background: 'transparent', border: '1px solid #3a3a5a', borderRadius: 9, color: '#c0b8ff', fontSize: 14, fontWeight: 600, width: '100%', transition: 'border-color 0.15s' },
}
