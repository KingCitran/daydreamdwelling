import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const TYPES = [
  { key: 'bug',       label: 'Report a bug',     icon: '🐞', placeholder: 'What broke? Walk us through what happened.' },
  { key: 'idea',      label: 'Suggest an idea',  icon: '💡', placeholder: "What's missing? What would make this better?" },
  { key: 'feedback',  label: 'General feedback', icon: '✦', placeholder: "Tell us what's on your mind." },
  { key: 'complaint', label: 'File a complaint', icon: '⚠️', placeholder: 'What went wrong? We want to make it right.' },
]

export default function FeedbackButton() {
  const t = useTheme()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('feedback')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const selectedType = TYPES.find(tp => tp.key === type)

  async function handleSubmit() {
    if (!message.trim()) return
    setSubmitting(true); setError(null)
    const { error: err } = await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      email: email.trim() || user?.email || null,
      type,
      message: message.trim(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    })
    setSubmitting(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => {
      setOpen(false)
      setMessage('')
      setEmail('')
      setSuccess(false)
      setType('feedback')
    }, 2200)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${t.surfaceBorder}`, background: t.surface,
    color: t.text, fontSize: 13, boxSizing: 'border-box', outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <>
      {/* Floating button — bottom right */}
      <style>{`
        @media (max-width: 768px) {
          .ddd-feedback-btn { bottom: 76px !important; right: 10px !important; width: 38px !important; height: 38px !important; font-size: 15px !important; }
        }
      `}</style>
      <button className="ddd-feedback-btn" onClick={() => setOpen(true)} title="Send feedback" style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 200,
        width: 44, height: 44, borderRadius: '50%',
        background: t.accent, color: t.accentText, border: 'none',
        cursor: 'pointer', fontSize: 18,
        boxShadow: `0 4px 16px ${t.accent}55, 0 2px 8px rgba(0,0,0,0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >💬</button>

      {/* Modal */}
      {open && (
        <div onClick={() => !submitting && setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 280,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: t.navBg, border: `1px solid ${t.surfaceBorder}`,
            borderRadius: 16, width: 440, maxWidth: '92vw', maxHeight: '85vh',
            overflow: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 22px', borderBottom: `1px solid ${t.surfaceBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>
                💬 Tell us what's on your mind
              </h2>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16,
              }}>✕</button>
            </div>

            {success ? (
              <div style={{ padding: '40px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 8px' }}>Thank you!</h3>
                <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>
                  We read every message. We'll get back to you if you left an email.
                </p>
              </div>
            ) : (
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Type selector */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>
                    Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {TYPES.map(tp => (
                      <button key={tp.key} onClick={() => setType(tp.key)} style={{
                        padding: '8px 10px', borderRadius: 8, fontSize: 12,
                        background: type === tp.key ? `${t.accent}15` : t.surface,
                        border: `1px solid ${type === tp.key ? t.accent : t.surfaceBorder}`,
                        color: type === tp.key ? t.accent : t.text,
                        fontWeight: type === tp.key ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        textAlign: 'left', fontFamily: 'inherit',
                      }}>
                        <span style={{ fontSize: 14 }}>{tp.icon}</span>
                        {tp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>
                    Message *
                  </label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder={selectedType.placeholder} rows={5} maxLength={1000}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                  />
                  <div style={{ fontSize: 10, color: t.textSoft, textAlign: 'right', marginTop: 4 }}>
                    {message.length} / 1000
                  </div>
                </div>

                {/* Email (only if not signed in) */}
                {!user && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>
                      Email (optional, for a reply)
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle} />
                  </div>
                )}

                {error && <p style={{ margin: 0, fontSize: 12, color: '#ff6b6b' }}>{error}</p>}

                <button onClick={handleSubmit} disabled={submitting || !message.trim()} style={{
                  padding: '12px', borderRadius: 10,
                  background: t.accent, color: t.accentText, border: 'none',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  cursor: (submitting || !message.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || !message.trim()) ? 0.5 : 1,
                }}>
                  {submitting ? 'Sending...' : 'Send feedback'}
                </button>

                <p style={{ fontSize: 10, color: t.textSoft, textAlign: 'center', margin: 0 }}>
                  We'll know which page you sent this from.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
