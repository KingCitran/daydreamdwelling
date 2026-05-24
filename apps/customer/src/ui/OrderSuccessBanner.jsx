import { useEffect, useState } from 'react'

export default function OrderSuccessBanner({ onClose }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance on next frame. No auto-dismiss — first-time buyers
    // want to read the confirmation, click into their order, etc. They'll
    // close it themselves when they've absorbed the moment.
    const t1 = setTimeout(() => setVisible(true), 30)
    return () => { clearTimeout(t1) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setLeaving(true)
    setTimeout(onClose, 500)
  }

  return (
    <div style={st.overlay} onClick={dismiss}>
      <div
        style={{
          ...st.card,
          opacity:    visible && !leaving ? 1 : 0,
          transform:  visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Shimmer bar */}
        <div style={st.shimmer} />

        {/* Sparkle ring */}
        <div style={st.ringWrap}>
          <div style={st.ring}>
            <span style={st.checkmark}>✓</span>
          </div>
          {SPARKS.map((s, i) => (
            <div key={i} style={{ ...st.spark, ...s, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>

        <p style={st.title}>Order placed!</p>
        <p style={st.sub}>
          Your items are on their way.<br />
          A confirmation email is heading to your inbox.
        </p>

        <div style={st.itemsLine}>
          <span style={st.dot} />
          <span style={{ ...st.dot, animationDelay: '0.2s' }} />
          <span style={{ ...st.dot, animationDelay: '0.4s' }} />
        </div>

        <p style={st.hint}>Your room is saved · Items marked as owned once shipped</p>

        <button style={st.primaryBtn} onClick={() => { window.location.search = '?orders=1' }}>
          View order details →
        </button>
        <button style={st.btn} onClick={dismiss}>
          Continue decorating
        </button>
      </div>

      <style>{KEYFRAMES}</style>
    </div>
  )
}

// 8 spark positions around the ring
const SPARKS = [
  { top: -8,  left: '50%',  transform: 'translateX(-50%)' },
  { top: 4,   right: -10 },
  { top: '50%', right: -12, transform: 'translateY(-50%)' },
  { bottom: 4, right: -10 },
  { bottom: -8, left: '50%', transform: 'translateX(-50%)' },
  { bottom: 4, left: -10 },
  { top: '50%', left: -12, transform: 'translateY(-50%)' },
  { top: 4,   left: -10 },
]

const KEYFRAMES = `
@keyframes osbFadeIn {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1);   }
}
@keyframes osbPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(154,122,238,0.5); }
  50%       { box-shadow: 0 0 0 14px rgba(154,122,238,0); }
}
@keyframes osbSpark {
  0%   { opacity: 0; transform: scale(0); }
  30%  { opacity: 1; transform: scale(1.3); }
  100% { opacity: 0; transform: scale(0.6); }
}
@keyframes osbShimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%);  }
}
@keyframes osbDot {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
  40%           { opacity: 1;   transform: scale(1.1); }
}
@keyframes osbProgress {
  from { width: 100%; }
  to   { width: 0%;   }
}
`

const st = {
  overlay: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 300,
    background: 'rgba(8,6,18,0.55)',
    backdropFilter: 'blur(6px)',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(160deg, #1a1430 0%, #0e0c1e 60%, #1a1430 100%)',
    border: '1px solid rgba(154,122,238,0.35)',
    borderRadius: 24,
    padding: '44px 40px 32px',
    width: 380,
    maxWidth: '90vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(154,122,238,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow: 'hidden',
    transition: 'opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg, transparent 0%, rgba(154,122,238,0.8) 50%, transparent 100%)',
    animation: 'osbShimmer 2.5s ease-in-out infinite',
    borderRadius: '24px 24px 0 0',
  },
  ringWrap: {
    position: 'relative', width: 72, height: 72,
    marginBottom: 24,
  },
  ring: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4a3a7a 0%, #7a4aaa 100%)',
    border: '2px solid rgba(154,122,238,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'osbFadeIn 0.5s cubic-bezier(.4,0,.2,1) both, osbPulse 2s ease-in-out 0.5s 3',
    boxShadow: '0 0 32px rgba(154,122,238,0.4)',
  },
  checkmark: {
    fontSize: 30, color: '#e0d9ff', fontWeight: 700, lineHeight: 1,
  },
  spark: {
    position: 'absolute', width: 6, height: 6, borderRadius: '50%',
    background: '#c0a8ff',
    animation: 'osbSpark 0.7s ease-out 0.3s both',
    boxShadow: '0 0 4px #9a7aee',
  },
  title: {
    margin: 0, marginBottom: 10,
    fontSize: 26, fontWeight: 800,
    color: '#f0eaff',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  sub: {
    margin: 0, marginBottom: 20,
    fontSize: 14, color: '#a090c8',
    lineHeight: 1.6,
    textAlign: 'center',
  },
  itemsLine: {
    display: 'flex', gap: 8, marginBottom: 16,
  },
  dot: {
    display: 'inline-block',
    width: 8, height: 8, borderRadius: '50%',
    background: '#9a7aee',
    animation: 'osbDot 1.4s ease-in-out infinite',
    boxShadow: '0 0 6px rgba(154,122,238,0.5)',
  },
  hint: {
    margin: 0, marginBottom: 28,
    fontSize: 11, color: '#5a4a7a',
    textAlign: 'center',
    letterSpacing: '0.3px',
  },
  primaryBtn: {
    width: '100%',
    padding: '13px 0',
    background: 'linear-gradient(135deg, #4a3a7a 0%, #7a4aaa 100%)',
    border: '1px solid rgba(154,122,238,0.5)',
    borderRadius: 12,
    color: '#e8e0ff',
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'opacity 0.15s',
    marginBottom: 10,
  },
  btn: {
    width: '100%',
    padding: '11px 0',
    background: 'transparent',
    border: '1px solid rgba(154,122,238,0.3)',
    borderRadius: 12,
    color: '#a090c8',
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'opacity 0.15s, background 0.15s',
    marginBottom: 0,
  },
  progressTrack: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3,
    background: 'rgba(154,122,238,0.1)',
    borderRadius: '0 0 24px 24px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4a3a7a, #9a7aee)',
    animation: 'osbProgress linear forwards',
    borderRadius: '0 0 24px 24px',
  },
}
