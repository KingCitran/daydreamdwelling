import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'

export default function AuthModal({ onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
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
                <input style={st.input} type="text" placeholder="Your name" value={displayName}
                  onChange={e => setDisplayName(e.target.value)} required autoFocus />
              </div>
            )}
            <div style={st.field}>
              <label style={st.label}>Email</label>
              <input style={st.input} type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoFocus={tab === 'signin'} />
            </div>
            <div style={st.field}>
              <label style={st.label}>Password</label>
              <input style={st.input} type="password" placeholder="••••••••" value={password}
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

const st = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
  card: { background: '#1e1e30', border: '1px solid #3a3a5a', borderRadius: 16, width: 380, maxWidth: '92vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px' },
  logo: { fontSize: 15, fontWeight: 700, color: '#c0b8ff' },
  closeBtn: { background: 'transparent', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 },
  tabs: { display: 'flex', borderBottom: '1px solid #3a3a5a' },
  tab: { flex: 1, padding: '10px 0', background: 'transparent', color: '#9898cc', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  tabActive: { color: '#e0d9ff', borderBottom: '2px solid #9a7aee' },
  form: { display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 24px 24px' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7878aa' },
  input: { padding: '10px 12px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 8, fontSize: 14, outline: 'none' },
  error: { margin: 0, fontSize: 12, color: '#ff7a7a', background: '#3a1a1a', border: '1px solid #7a2a2a', borderRadius: 6, padding: '8px 12px' },
  submitBtn: { padding: '12px 0', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'opacity 0.15s' },
  divider: { display: 'flex', alignItems: 'center', gap: 10 },
  dividerText: { fontSize: 11, color: '#5a5a7a', background: '#1e1e30', padding: '0 8px', whiteSpace: 'nowrap', margin: '0 auto' },
  googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 0', background: '#fff', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  guestNote: { margin: 0, fontSize: 11, color: '#5a5a7a', textAlign: 'center' },
  guestLink: { background: 'none', border: 'none', color: '#9a7aee', cursor: 'pointer', fontSize: 11, padding: 0, textDecoration: 'underline' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '30px 24px 28px' },
  successIcon: { fontSize: 40, margin: 0 },
  successMsg: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e0d9ff', textAlign: 'center' },
  successSub: { margin: 0, fontSize: 12, color: '#7878aa', textAlign: 'center' },
}
