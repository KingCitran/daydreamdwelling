import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'

export default function AuthModal({ onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const t = useTheme()
  const st = makeStyles(t)
  const [tab,          setTab]          = useState('signin') // 'signin' | 'signup'
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [displayName,  setDisplayName]  = useState('')
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)

  const reset = () => { setError(null); setSuccess(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); reset()
    if (tab === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else onClose()
    } else {
      const { error } = await signUp(email, password, displayName)
      if (error) setError(error.message)
      else setSuccess(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true); reset()
    const { error } = await signInWithGoogle()
    if (error) { setError(error.message); setLoading(false) }
    // On success the page redirects — no need to close
  }

  return (
    <div style={st.backdrop} onClick={!loading && !error ? onClose : undefined}>
      <div style={st.card} onClick={e => e.stopPropagation()}>
        <div style={st.header}>
          <span style={st.logo}>✦ DaydreamDwelling</span>
          <button style={st.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={st.tabs}>
          <button style={{ ...st.tab, ...(tab === 'signin' ? st.tabActive : {}) }} onClick={() => { setTab('signin'); reset() }}>Sign In</button>
          <button style={{ ...st.tab, ...(tab === 'signup' ? st.tabActive : {}) }} onClick={() => { setTab('signup'); reset() }}>Create Account</button>
        </div>

        {success ? (
          <div style={st.successBox}>
            <p style={st.successIcon}>✉️</p>
            <p style={st.successMsg}>Check your email to confirm your account!</p>
            <p style={st.successSub}>You can close this and sign in once confirmed.</p>
            <button style={st.submitBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form style={st.form} onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div style={st.field}>
                <label style={st.label}>Display Name</label>
                <input className="ddd-input" style={st.input} type="text" placeholder="Your name" value={displayName}
                  onChange={e => setDisplayName(e.target.value)} required autoFocus />
              </div>
            )}
            <div style={st.field}>
              <label style={st.label}>Email</label>
              <input className="ddd-input" style={st.input} type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoFocus={tab === 'signin'} />
            </div>
            <div style={st.field}>
              <label style={st.label}>Password</label>
              <input className="ddd-input" style={st.input} type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <p style={st.error}>{error}</p>}

            <button style={{ ...st.submitBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <div style={st.divider}><span style={st.dividerText}>or</span></div>

            <button type="button" style={st.googleBtn} onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {tab === 'signin' && (
              <p style={st.guestNote}>
                Just browsing?{' '}
                <button type="button" style={st.guestLink} onClick={onClose}>Continue as guest</button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

function makeStyles(t) {
  return {
    backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
    card: { background: t.navBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, width: 380, maxWidth: '92vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px' },
    logo: { fontSize: 15, fontWeight: 700, color: t.accent },
    closeBtn: { background: 'transparent', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 },
    tabs: { display: 'flex', borderBottom: `1px solid ${t.surfaceBorder}` },
    tab: { flex: 1, padding: '10px 0', background: 'transparent', color: t.textSoft, border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    tabActive: { color: t.text, borderBottom: `2px solid ${t.accent}` },
    form: { display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 24px 24px' },
    field: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: t.textSoft },
    input: { padding: '10px 12px', background: t.bg, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 14, outline: 'none' },
    error: { margin: 0, fontSize: 12, color: '#ff7a7a', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.25)', borderRadius: 6, padding: '8px 12px' },
    submitBtn: { padding: '12px 0', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'opacity 0.15s' },
    divider: { display: 'flex', alignItems: 'center', gap: 10 },
    dividerText: { fontSize: 11, color: t.textSoft, background: t.navBg, padding: '0 8px', whiteSpace: 'nowrap', margin: '0 auto' },
    googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 0', background: '#fff', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    guestNote: { margin: 0, fontSize: 11, color: t.textSoft, textAlign: 'center' },
    guestLink: { background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 11, padding: 0, textDecoration: 'underline' },
    successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '30px 24px 28px' },
    successIcon: { fontSize: 40, margin: 0 },
    successMsg: { margin: 0, fontSize: 16, fontWeight: 700, color: t.text, textAlign: 'center' },
    successSub: { margin: 0, fontSize: 12, color: t.textSoft, textAlign: 'center' },
  }
}
