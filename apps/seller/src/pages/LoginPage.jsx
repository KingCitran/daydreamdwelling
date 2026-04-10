import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [tab,      setTab]      = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [resetSent, setResetSent] = useState(false)

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

  async function handleReset() {
    if (!email) { setError('Enter your email above first.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (err) setError(err.message)
    else setResetSent(true)
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.logoMark}>⌂</p>
          <h1 style={s.heading}>Check your email</h1>
          <p style={s.subtext}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your seller account.</p>
          <button style={{ ...s.btn, marginTop: 8, background: 'transparent', border: '1px solid #3a3a5a', color: '#9a7aee' }}
            onClick={() => { setSuccess(false); setTab('signin') }}>
            ← Back to sign in
          </button>
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

        {/* Google first — primary action */}
        <button style={s.googleBtn} onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div style={s.divider}><span style={s.dividerText}>or use email</span></div>

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
          {resetSent && <p style={s.success}>Password reset email sent — check your inbox.</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? '…' : tab === 'signin' ? 'Sign in →' : 'Create account →'}
          </button>

          {tab === 'signin' && !resetSent && (
            <button type="button" style={s.forgotBtn} onClick={handleReset} disabled={loading}>
              Forgot password?
            </button>
          )}
        </form>

        <p style={{ ...s.subtext, marginTop: 10, fontSize: 11 }}>
          If you signed up with Google, use the button above.
        </p>
      </div>
    </div>
  )
}

const s = {
  page:       { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f1a', padding: 20 },
  card:       { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 16, padding: '36px 32px', width: 380, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 0 },
  logoMark:   { fontSize: 32, textAlign: 'center', margin: '0 0 8px' },
  heading:    { fontSize: 22, fontWeight: 700, color: '#e0d9ff', textAlign: 'center', margin: '0 0 6px' },
  subtext:    { fontSize: 13, color: '#7878aa', textAlign: 'center', margin: '0 0 18px', lineHeight: 1.5 },
  googleBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0', background: '#fff', color: '#333', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%', marginBottom: 4 },
  divider:    { position: 'relative', textAlign: 'center', margin: '14px 0 10px', borderTop: '1px solid #2a2a4a' },
  dividerText:{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', padding: '0 10px', color: '#5a5a7a', fontSize: 11, whiteSpace: 'nowrap' },
  tabs:       { display: 'flex', gap: 0, marginBottom: 14, background: '#13132a', borderRadius: 8, padding: 3 },
  tab:        { flex: 1, padding: '8px 0', background: 'transparent', border: 'none', color: '#7878aa', fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' },
  tabActive:  { background: '#2a2a4a', color: '#e0d9ff' },
  form:       { display: 'flex', flexDirection: 'column', gap: 10 },
  input:      { padding: '11px 14px', background: '#13132a', border: '1px solid #3a3a5a', borderRadius: 8, color: '#e0d9ff', fontSize: 14, outline: 'none' },
  error:      { fontSize: 12, color: '#ff7a7a', background: '#3a1a1a', border: '1px solid #7a2a2a', borderRadius: 6, padding: '8px 12px', margin: 0 },
  success:    { fontSize: 12, color: '#7adda0', background: '#1a3a2a', border: '1px solid #2a7a4a', borderRadius: 6, padding: '8px 12px', margin: 0 },
  btn:        { padding: '12px 0', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' },
  forgotBtn:  { background: 'none', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', textAlign: 'center', padding: '2px 0' },
}
