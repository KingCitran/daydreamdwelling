import { useState, useEffect, useRef } from 'react'

const KEYFRAMES = `
@keyframes wispyIn {
  from { opacity: 0; transform: translateY(22px) scale(0.85); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes wispyPoof {
  0%   { opacity: 1;   transform: scale(1)    translateY(0);    filter: blur(0px); }
  55%  { opacity: 0.7; transform: scale(1.22) translateY(-8px); filter: blur(0px); }
  100% { opacity: 0;   transform: scale(0.05) translateY(-14px); filter: blur(4px); }
}
@keyframes wispyBob {
  0%, 100% { transform: translateY(0px);  }
  50%       { transform: translateY(-7px); }
}
@keyframes wispyEyeOpen {
  0%, 46.9%, 48.1%, 91.9%, 93.1%, 100% { opacity: 1; }
  47%, 48% { opacity: 0; }
  92%, 93% { opacity: 0; }
}
@keyframes wispyDriftL {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(3deg);  }
}
@keyframes wispyDriftR {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(-2.5deg); }
}
@keyframes wispyLegL {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(2.5deg); }
}
@keyframes wispyLegR {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(-2deg);  }
}
`

function WispySVG() {
  return (
    <svg
      width="140" height="178" viewBox="0 0 140 175"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Top-down gradient: cool blue-white → warm pink-lavender */}
        <linearGradient id="cg" x1="70" y1="30" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e8f0ff" />
          <stop offset="40%"  stopColor="#eee8f6" />
          <stop offset="100%" stopColor="#e8d0e0" />
        </linearGradient>
        {/* Darker version for back-layer depth */}
        <linearGradient id="cs" x1="70" y1="30" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#dae4f0" />
          <stop offset="100%" stopColor="#d8c0d4" />
        </linearGradient>
        {/* Eye gradient: dark top → deep purple bottom */}
        <linearGradient id="eyeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0e2e" />
          <stop offset="100%" stopColor="#4a1a6b" />
        </linearGradient>
      </defs>

      {/* ── Left arm (hanging limp, relaxed) ── */}
      <g style={{ animation: 'wispyDriftL 5s ease-in-out infinite', transformOrigin: '38px 88px' }}>
        <path d="M 38 88 Q 30 98, 28 110 Q 27 116, 28 120" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="122" r="5" fill="url(#cg)" stroke="#c8bada" strokeWidth="1.5" />
      </g>
      {/* ── Right arm (raised up, open hand wave) ── */}
      <g style={{ animation: 'wispyDriftR 4.4s ease-in-out 0.6s infinite', transformOrigin: '102px 86px' }}>
        <path d="M 102 86 Q 112 92, 118 96 Q 126 100, 134 78" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g transform="rotate(12 135 76)">
          <circle cx="135" cy="76" r="5" fill="url(#cg)" stroke="#c8bada" strokeWidth="1.5" />
          <path d="M 140 74 L 142 66" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 137 73 L 138 64" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 134 72 L 134 63" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 131 74 L 130 66" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 130 78 L 125 76" stroke="#c8bada" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* ── Cloud body with outline glow ── */}
      <g style={{ filter: 'drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 6px 18px rgba(170,140,220,0.35))' }}>
        <circle cx="70" cy="72" r="30" fill="url(#cs)" />
        <circle cx="44" cy="78" r="18" fill="url(#cs)" />
        <circle cx="96" cy="76" r="20" fill="url(#cs)" />
        <circle cx="70" cy="68" r="30" fill="url(#cg)" />
        <circle cx="42" cy="72" r="22" fill="url(#cg)" />
        <circle cx="98" cy="70" r="24" fill="url(#cg)" />
        <circle cx="50" cy="48" r="18" fill="url(#cg)" />
        <circle cx="88" cy="46" r="16" fill="url(#cg)" />
        <circle cx="70" cy="40" r="15" fill="url(#cg)" />
        <circle cx="56" cy="64" r="16" fill="url(#cg)" />
        <circle cx="84" cy="62" r="15" fill="url(#cg)" />
      </g>

      {/* ── 3D highlights ── */}
      <ellipse cx="50" cy="42" rx="10" ry="5" fill="white" opacity="0.40" />
      <ellipse cx="70" cy="34" rx="9"  ry="5" fill="white" opacity="0.45" />
      <ellipse cx="88" cy="40" rx="8"  ry="4" fill="white" opacity="0.35" />
      <ellipse cx="42" cy="64" rx="8"  ry="4" fill="white" opacity="0.22" />
      <ellipse cx="56" cy="56" rx="9"  ry="4" fill="white" opacity="0.25" />
      <ellipse cx="84" cy="54" rx="8"  ry="4" fill="white" opacity="0.20" />
      <ellipse cx="98" cy="62" rx="7"  ry="3" fill="white" opacity="0.18" />

      {/* ── Face ── */}

      {/* Eyes open: gradient pupils + highlights */}
      <g style={{ animation: 'wispyEyeOpen 4.5s ease-in-out infinite' }}>
        <circle cx="60" cy="68" r="6" fill="url(#eyeG)" />
        <circle cx="62" cy="65" r="2.5" fill="white" opacity="0.9" />
        <circle cx="63.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
        <circle cx="80" cy="68" r="6" fill="url(#eyeG)" />
        <circle cx="82" cy="65" r="2.5" fill="white" opacity="0.9" />
        <circle cx="83.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
      </g>
      {/* Lashes — always visible, curved arc + tips flicking outward */}
      <path d="M 55 66 Q 60 62, 65 66" stroke="#1a0e2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 55 65 Q 52 63, 51 61" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 57 64 Q 55 61, 54 59" stroke="#1a0e2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 75 66 Q 80 62, 85 66" stroke="#1a0e2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 85 65 Q 88 63, 89 61" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 83 64 Q 85 61, 86 59" stroke="#1a0e2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <circle cx="50" cy="74" r="5" fill="#ffb0c8" opacity="0.4" />
      <circle cx="90" cy="74" r="5" fill="#ffb0c8" opacity="0.4" />

      {/* Smile */}
      <path d="M 65 77 Q 70 81 75 77" stroke="#c0a0c8" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Star accents */}
      <path d="M 46 60 L 47.2 62 L 49 60.5 L 47.8 62.5 L 49 64 L 47.2 63 L 46 64.5 L 46.5 62.5 L 44.5 62 L 46.5 61.5 Z" fill="#ffd700" opacity="0.6" />
      <path d="M 94 60 L 95.2 62 L 97 60.5 L 95.8 62.5 L 97 64 L 95.2 63 L 94 64.5 L 94.5 62.5 L 92.5 62 L 94.5 61.5 Z" fill="#ffd700" opacity="0.6" />

      {/* ── Legs (start apart, knees gently out, feet back to center) ── */}
      <g style={{ animation: 'wispyLegL 3.2s ease-in-out infinite', transformOrigin: '53px 96px' }}>
        <path d="M 53 96 Q 46 110, 48 124 Q 50 134, 62 140" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="63" cy="144" rx="3.5" ry="6" fill="url(#cg)" stroke="#c8bada" strokeWidth="1.5" transform="rotate(-12 63 144)" />
      </g>
      <g style={{ animation: 'wispyLegR 3.6s ease-in-out 0.4s infinite', transformOrigin: '87px 96px' }}>
        <path d="M 87 96 Q 94 108, 92 120 Q 90 130, 78 136" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="77" cy="140" rx="3.5" ry="6" fill="url(#cg)" stroke="#c8bada" strokeWidth="1.5" transform="rotate(12 77 140)" />
      </g>
    </svg>
  )
}

export default function Wispy({ message, onDismiss }) {
  const [closing, setClosing] = useState(false)
  const timerRef = useRef(null)

  function close() {
    if (closing) return
    setClosing(true)
    setTimeout(onDismiss, 430)
  }

  useEffect(() => {
    timerRef.current = setTimeout(close, 8000)
    return () => clearTimeout(timerRef.current)
  }, [message])

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        position: 'fixed',
        bottom: 85,
        left: 28,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        fontFamily: 'system-ui, sans-serif',
        animation: closing
          ? 'wispyPoof 0.43s cubic-bezier(0.4,0,1,1) forwards'
          : 'wispyIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        {/* Speech bubble */}
        <div style={{
          position: 'relative',
          background: 'white',
          border: '1.5px solid #ddd4f5',
          borderRadius: 14,
          padding: '10px 32px 10px 14px',
          maxWidth: 220,
          boxShadow: '0 4px 18px rgba(100,60,200,0.16)',
          fontSize: 13,
          lineHeight: '1.5',
          color: '#251340',
        }}>
          {message}
          <button
            onClick={close}
            style={{
              position: 'absolute', top: 7, right: 8,
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 12,
              color: '#a080e0', lineHeight: 1, padding: 2,
            }}
          >✕</button>
          <div style={{
            position: 'absolute', bottom: -10, left: 29,
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #ddd4f5',
          }} />
          <div style={{
            position: 'absolute', bottom: -8, left: 30,
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid white',
          }} />
        </div>

        {/* Character */}
        <div style={{ animation: 'wispyBob 3.5s ease-in-out infinite' }}>
          <WispySVG />
        </div>
      </div>
    </>
  )
}
