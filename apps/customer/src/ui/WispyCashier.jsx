const KEYFRAMES = `
@keyframes cashierIn {
  from { opacity: 0; transform: translateY(16px) scale(0.88); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes cashierBob {
  0%, 100% { transform: translateY(0px);  }
  50%       { transform: translateY(-6px); }
}
@keyframes cashierEyeOpen {
  0%, 46.9%, 48.1%, 91.9%, 93.1%, 100% { opacity: 1; }
  47%, 48% { opacity: 0; }
  92%, 93% { opacity: 0; }
}
@keyframes cashierDriftL {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(2.5deg); }
}
@keyframes cashierDriftR {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(-2deg);  }
}
@keyframes cashierLegL {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(2deg);   }
}
@keyframes cashierLegR {
  0%, 100% { transform: rotate(0deg);   }
  50%       { transform: rotate(-1.8deg); }
}
`

function WispySVG({ tint }) {
  const gradId = 'ccg'
  const stops = tint
    ? [tint + 'ff', tint + 'dd', tint + 'bb']
    : ['#f8f5ff', '#efe8f8', '#e0d6ee']
  const limb = tint ? tint + '99' : '#c8bada'

  return (
    <svg
      width="110" height="140" viewBox="0 0 140 175"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gradId} cx="70" cy="28" r="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor={stops[0]} />
          <stop offset="50%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </radialGradient>
        <linearGradient id="cEyeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0e2e" />
          <stop offset="100%" stopColor="#4a1a6b" />
        </linearGradient>
      </defs>

      {/* Left arm (hanging loose, relaxed fist) */}
      <g style={{ animation: 'cashierDriftL 4s ease-in-out infinite', transformOrigin: '38px 88px' }}>
        <path d="M 38 88 Q 30 98, 28 110 Q 27 116, 28 120" stroke={limb} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="122" r="5" fill={`url(#${gradId})`} stroke={limb} strokeWidth="1.5" />
      </g>
      {/* Right arm (raised up, open hand wave) */}
      <g style={{ animation: 'cashierDriftR 4.4s ease-in-out 0.6s infinite', transformOrigin: '102px 86px' }}>
        <path d="M 102 86 Q 112 92, 118 96 Q 126 100, 134 78" stroke={limb} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g transform="rotate(12 135 76)">
          <circle cx="135" cy="76" r="5" fill={`url(#${gradId})`} stroke={limb} strokeWidth="1.5" />
          <path d="M 140 74 L 142 66" stroke={limb} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 137 73 L 138 64" stroke={limb} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 134 72 L 134 63" stroke={limb} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 131 74 L 130 66" stroke={limb} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 130 78 L 125 76" stroke={limb} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Cloud body with outline glow */}
      <g style={{ filter: 'drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 6px 18px rgba(170,140,220,0.35))' }}>
        <circle cx="70" cy="68" r="30" fill={`url(#${gradId})`} />
        <circle cx="42" cy="72" r="22" fill={`url(#${gradId})`} />
        <circle cx="98" cy="70" r="24" fill={`url(#${gradId})`} />
        <circle cx="50" cy="48" r="18" fill={`url(#${gradId})`} />
        <circle cx="88" cy="46" r="16" fill={`url(#${gradId})`} />
        <circle cx="70" cy="40" r="14" fill={`url(#${gradId})`} />
      </g>

      {/* 3D highlights */}
      <ellipse cx="52" cy="43" rx="10" ry="6" fill="white" opacity="0.28" />
      <ellipse cx="70" cy="35" rx="8"  ry="5" fill="white" opacity="0.32" />
      <ellipse cx="88" cy="41" rx="8"  ry="5" fill="white" opacity="0.22" />
      <ellipse cx="58" cy="58" rx="12" ry="6" fill="white" opacity="0.14" />
      <ellipse cx="86" cy="56" rx="10" ry="5" fill="white" opacity="0.14" />

      {/* Eyes open: gradient pupils + highlights */}
      <g style={{ animation: 'cashierEyeOpen 4.5s ease-in-out infinite' }}>
        <circle cx="60" cy="68" r="6" fill="url(#cEyeG)" />
        <circle cx="62" cy="65" r="2.5" fill="white" opacity="0.9" />
        <circle cx="63.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
        <circle cx="80" cy="68" r="6" fill="url(#cEyeG)" />
        <circle cx="82" cy="65" r="2.5" fill="white" opacity="0.9" />
        <circle cx="83.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
      </g>
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

      {/* Stars */}
      <path d="M 46 60 L 47.2 62 L 49 60.5 L 47.8 62.5 L 49 64 L 47.2 63 L 46 64.5 L 46.5 62.5 L 44.5 62 L 46.5 61.5 Z" fill="#ffd700" opacity="0.6" />
      <path d="M 94 60 L 95.2 62 L 97 60.5 L 95.8 62.5 L 97 64 L 95.2 63 L 94 64.5 L 94.5 62.5 L 92.5 62 L 94.5 61.5 Z" fill="#ffd700" opacity="0.6" />

      {/* Legs (start apart, knees gently out, feet back to center) */}
      <g style={{ animation: 'cashierLegL 3.2s ease-in-out infinite', transformOrigin: '53px 96px' }}>
        <path d="M 53 96 Q 46 110, 48 124 Q 50 134, 62 140" stroke={limb} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="63" cy="144" rx="3.5" ry="6" fill={`url(#${gradId})`} stroke={limb} strokeWidth="1.5" transform="rotate(-12 63 144)" />
      </g>
      <g style={{ animation: 'cashierLegR 3.6s ease-in-out 0.4s infinite', transformOrigin: '87px 96px' }}>
        <path d="M 87 96 Q 94 108, 92 120 Q 90 130, 78 136" stroke={limb} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="77" cy="140" rx="3.5" ry="6" fill={`url(#${gradId})`} stroke={limb} strokeWidth="1.5" transform="rotate(12 77 140)" />
      </g>
    </svg>
  )
}

export default function WispyCashier({ greeting, tint }) {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        position: 'fixed',
        bottom: 85,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'system-ui, sans-serif',
        animation: 'cashierIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'relative',
          background: 'white',
          border: '1.5px solid #ddd4f5',
          borderRadius: 14,
          padding: '10px 16px',
          maxWidth: 240,
          boxShadow: '0 4px 18px rgba(100,60,200,0.16)',
          fontSize: 13,
          lineHeight: '1.5',
          color: '#251340',
          textAlign: 'center',
        }}>
          {greeting || 'Welcome to my shop! ☁'}
          <div style={{
            position: 'absolute', bottom: -10,
            left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #ddd4f5',
          }} />
          <div style={{
            position: 'absolute', bottom: -8,
            left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid white',
          }} />
        </div>
        <div style={{ animation: 'cashierBob 3.5s ease-in-out infinite' }}>
          <WispySVG tint={tint} />
        </div>
      </div>
    </>
  )
}
