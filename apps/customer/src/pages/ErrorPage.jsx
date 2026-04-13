import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'

export default function ErrorPage({ type = '404', onGoHome }) {
  const t = useTheme()
  const is404 = type === '404'

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', system-ui, sans-serif", padding: 24 }}>
      {/* Wispy confused expression */}
      <svg width="120" height="120" viewBox="0 0 140 140" style={{ marginBottom: 24, opacity: 0.7 }}>
        <defs>
          <linearGradient id="eg" x1="70" y1="30" x2="70" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8f0ff" />
            <stop offset="100%" stopColor="#e8d0e0" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="65" r="30" fill="url(#eg)" />
        <circle cx="44" cy="72" r="18" fill="url(#eg)" />
        <circle cx="96" cy="70" r="20" fill="url(#eg)" />
        <circle cx="50" cy="48" r="16" fill="url(#eg)" />
        <circle cx="88" cy="46" r="14" fill="url(#eg)" />
        <circle cx="70" cy="40" r="13" fill="url(#eg)" />
        {/* Worried eyes */}
        <circle cx="58" cy="65" r="5" fill="#2a1040" />
        <circle cx="60" cy="63" r="2" fill="white" opacity="0.8" />
        <circle cx="82" cy="65" r="5" fill="#2a1040" />
        <circle cx="84" cy="63" r="2" fill="white" opacity="0.8" />
        {/* Worried eyebrows */}
        <path d="M52 56 Q58 52 64 56" stroke="#2a1040" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M76 56 Q82 52 88 56" stroke="#2a1040" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Wobbly mouth */}
        <path d={is404 ? "M62 78 Q67 74 70 78 Q73 82 78 78" : "M62 80 Q70 74 78 80"} stroke="#c0a0c8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Blush */}
        <circle cx="48" cy="72" r="4" fill="#ffb0c8" opacity="0.3" />
        <circle cx="92" cy="72" r="4" fill="#ffb0c8" opacity="0.3" />
        {/* Question marks for 404 */}
        {is404 && <>
          <text x="30" y="38" fill={t.accent} fontSize="16" fontWeight="700" opacity="0.4">?</text>
          <text x="105" y="42" fill={t.accent} fontSize="12" fontWeight="700" opacity="0.3">?</text>
        </>}
      </svg>

      <h1 style={{ fontSize: 32, fontWeight: 700, color: t.text, margin: '0 0 8px', textAlign: 'center' }}>
        {is404 ? "This room doesn't exist yet!" : 'Something went wrong'}
      </h1>
      <p style={{ fontSize: 14, color: t.textSoft, margin: '0 0 28px', textAlign: 'center', maxWidth: 360, lineHeight: 1.7 }}>
        {is404
          ? "Wispy looked everywhere but couldn't find this page. Maybe it's still being dreamt up?"
          : "Wispy bumped into something unexpected. Try refreshing, or head back to the builder."}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onGoHome || (() => window.location.href = '/')} style={{
          padding: '12px 28px', borderRadius: 10, background: t.accent, color: t.accentText,
          border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          {is404 ? 'Go to Builder' : 'Try Again'}
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 24, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
        <Logo size={20} color={t.textSoft} />
        <span style={{ fontSize: 11, color: t.textSoft }}>DaydreamDwelling</span>
      </div>
    </div>
  )
}
