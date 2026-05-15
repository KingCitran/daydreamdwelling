// Wispy character SVG. Shared by all pose components.
// Props let pose files override specific parts (mouth, arms, eyes, accents).
// Keep visual decisions in this file — don't redraw the cloud in every pose.

export default function WispyArt({
  mouthOpen = false,
  eyeClosed = false,
  leftArmStyle = 'down',     // 'down' | 'up' | 'point'
  rightArmStyle = 'wave',    // 'down' | 'up' | 'wave' | 'point'
  showSparkles = true,
  width = 140,
  height = 178,
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 175" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="wispy-cg" x1="70" y1="30" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e8f0ff" />
          <stop offset="40%"  stopColor="#eee8f6" />
          <stop offset="100%" stopColor="#e8d0e0" />
        </linearGradient>
        <linearGradient id="wispy-cs" x1="70" y1="30" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#dae4f0" />
          <stop offset="100%" stopColor="#d8c0d4" />
        </linearGradient>
        <linearGradient id="wispy-eyeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0e2e" />
          <stop offset="100%" stopColor="#4a1a6b" />
        </linearGradient>
      </defs>

      {/* Left arm */}
      <LeftArm style={leftArmStyle} />
      {/* Right arm */}
      <RightArm style={rightArmStyle} />

      {/* Cloud body */}
      <g style={{ filter: 'drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 0 1.5px #b8a0d8) drop-shadow(0 6px 18px rgba(170,140,220,0.35))' }}>
        <circle cx="70" cy="72" r="30" fill="url(#wispy-cs)" />
        <circle cx="44" cy="78" r="18" fill="url(#wispy-cs)" />
        <circle cx="96" cy="76" r="20" fill="url(#wispy-cs)" />
        <circle cx="70" cy="68" r="30" fill="url(#wispy-cg)" />
        <circle cx="42" cy="72" r="22" fill="url(#wispy-cg)" />
        <circle cx="98" cy="70" r="24" fill="url(#wispy-cg)" />
        <circle cx="50" cy="48" r="18" fill="url(#wispy-cg)" />
        <circle cx="88" cy="46" r="16" fill="url(#wispy-cg)" />
        <circle cx="70" cy="40" r="15" fill="url(#wispy-cg)" />
        <circle cx="56" cy="64" r="16" fill="url(#wispy-cg)" />
        <circle cx="84" cy="62" r="15" fill="url(#wispy-cg)" />
      </g>

      {/* Highlights */}
      <ellipse cx="50" cy="42" rx="10" ry="5" fill="white" opacity="0.40" />
      <ellipse cx="70" cy="34" rx="9"  ry="5" fill="white" opacity="0.45" />
      <ellipse cx="88" cy="40" rx="8"  ry="4" fill="white" opacity="0.35" />
      <ellipse cx="42" cy="64" rx="8"  ry="4" fill="white" opacity="0.22" />
      <ellipse cx="56" cy="56" rx="9"  ry="4" fill="white" opacity="0.25" />
      <ellipse cx="84" cy="54" rx="8"  ry="4" fill="white" opacity="0.20" />
      <ellipse cx="98" cy="62" rx="7"  ry="3" fill="white" opacity="0.18" />

      {/* Eyes */}
      {eyeClosed ? (
        <g>
          <path d="M 54 67 Q 60 71 66 67" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 74 67 Q 80 71 86 67" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="60" cy="68" r="6" fill="url(#wispy-eyeG)" />
          <circle cx="62" cy="65" r="2.5" fill="white" opacity="0.9" />
          <circle cx="63.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
          <circle cx="80" cy="68" r="6" fill="url(#wispy-eyeG)" />
          <circle cx="82" cy="65" r="2.5" fill="white" opacity="0.9" />
          <circle cx="83.5" cy="63.5" r="1.2" fill="white" opacity="0.5" />
        </g>
      )}

      {/* Lashes */}
      <path d="M 55 66 Q 60 62, 65 66" stroke="#1a0e2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 55 65 Q 52 63, 51 61" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 57 64 Q 55 61, 54 59" stroke="#1a0e2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 75 66 Q 80 62, 85 66" stroke="#1a0e2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 85 65 Q 88 63, 89 61" stroke="#1a0e2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 83 64 Q 85 61, 86 59" stroke="#1a0e2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <circle cx="50" cy="74" r="5" fill="#ffb0c8" opacity="0.4" />
      <circle cx="90" cy="74" r="5" fill="#ffb0c8" opacity="0.4" />

      {/* Mouth — closed smile vs open "o" for talking flap */}
      {mouthOpen ? (
        <ellipse cx="70" cy="79" rx="3.2" ry="3.6" fill="#3a1a4a" />
      ) : (
        <path d="M 65 77 Q 70 81 75 77" stroke="#c0a0c8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Star accents on cheeks */}
      {showSparkles && (
        <g>
          <path d="M 46 60 L 47.2 62 L 49 60.5 L 47.8 62.5 L 49 64 L 47.2 63 L 46 64.5 L 46.5 62.5 L 44.5 62 L 46.5 61.5 Z" fill="#ffd700" opacity="0.6" />
          <path d="M 94 60 L 95.2 62 L 97 60.5 L 95.8 62.5 L 97 64 L 95.2 63 L 94 64.5 L 94.5 62.5 L 92.5 62 L 94.5 61.5 Z" fill="#ffd700" opacity="0.6" />
        </g>
      )}

      {/* Legs */}
      <g style={{ animation: 'wispyLegL 3.2s ease-in-out infinite', transformOrigin: '53px 96px' }}>
        <path d="M 53 96 Q 46 110, 48 124 Q 50 134, 62 140" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="63" cy="144" rx="3.5" ry="6" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" transform="rotate(-12 63 144)" />
      </g>
      <g style={{ animation: 'wispyLegR 3.6s ease-in-out 0.4s infinite', transformOrigin: '87px 96px' }}>
        <path d="M 87 96 Q 94 108, 92 120 Q 90 130, 78 136" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="77" cy="140" rx="3.5" ry="6" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" transform="rotate(12 77 140)" />
      </g>
    </svg>
  )
}

function LeftArm({ style }) {
  if (style === 'point') {
    // Arm points down-left, finger extended
    return (
      <g style={{ transformOrigin: '38px 88px' }}>
        <path d="M 38 88 Q 24 100, 14 116" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="118" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
        <path d="M 12 122 L 8 130" stroke="#c8bada" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  if (style === 'up') {
    return (
      <g style={{ transformOrigin: '38px 88px' }}>
        <path d="M 38 88 Q 30 70, 24 56" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="54" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
      </g>
    )
  }
  // 'down' — relaxed hang
  return (
    <g style={{ animation: 'wispyDriftL 5s ease-in-out infinite', transformOrigin: '38px 88px' }}>
      <path d="M 38 88 Q 30 98, 28 110 Q 27 116, 28 120" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="122" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
    </g>
  )
}

function RightArm({ style }) {
  if (style === 'point') {
    return (
      <g style={{ transformOrigin: '102px 86px' }}>
        <path d="M 102 86 Q 118 96, 130 112" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="130" cy="114" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
        <path d="M 132 118 L 136 126" stroke="#c8bada" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  if (style === 'up') {
    return (
      <g style={{ transformOrigin: '102px 86px' }}>
        <path d="M 102 86 Q 112 70, 118 56" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="118" cy="54" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
      </g>
    )
  }
  if (style === 'down') {
    return (
      <g style={{ transformOrigin: '102px 86px' }}>
        <path d="M 102 86 Q 110 98, 112 110 Q 113 116, 112 120" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="112" cy="122" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
      </g>
    )
  }
  // 'wave' (default) — raised, open hand with finger highlights
  return (
    <g style={{ animation: 'wispyDriftR 4.4s ease-in-out 0.6s infinite', transformOrigin: '102px 86px' }}>
      <path d="M 102 86 Q 112 92, 118 96 Q 126 100, 134 78" stroke="#c8bada" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <g transform="rotate(12 135 76)">
        <circle cx="135" cy="76" r="5" fill="url(#wispy-cg)" stroke="#c8bada" strokeWidth="1.5" />
        <path d="M 140 74 L 142 66" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 137 73 L 138 64" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 134 72 L 134 63" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 131 74 L 130 66" stroke="#c8bada" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 130 78 L 125 76" stroke="#c8bada" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

export const WISPY_KEYFRAMES = `
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
@keyframes wispyBubbleIn {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes wispyHighlight {
  0%, 100% { box-shadow: 0 0 0 0 rgba(180,140,230,0.6), 0 0 0 0 rgba(180,140,230,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(180,140,230,0.0), 0 0 24px 4px rgba(180,140,230,0.55); }
}
`
