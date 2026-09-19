/**
 * DaydreamDwelling logo mark — isometric room with D-shaped windows.
 * From Parhelia brand revamp spec (section 5a).
 * viewBox 0 0 120 130, 22° pitch isometric.
 * Both windows and rug are the same D shape: stem 22, flat 8, bowl radius 11.
 * Windows are real holes (evenodd) — background shows through.
 */
export default function Logo({ size = 36, color, className, style, mono = false }) {
  const s = size
  if (mono) {
    const c = color || 'currentColor'
    return (
      <svg width={s} height={s} viewBox="0 0 120 130" fill="none" className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
        {/* Floor slab edges */}
        <path d="M20.1 79.9L60 96V99L20.1 82.9Z" fill={c} opacity={0.2} />
        <path d="M60 96L99.9 79.9V82.9L60 99Z" fill={c} opacity={0.15} />
        {/* Floor top + rug */}
        <g transform="matrix(-0.927 0.375 0.927 0.375 60 66)">
          <path d="M-3 -3H40V40H-3Z" fill={c} opacity={0.25} />
          <path d="M9 9H31V17A11 11 0 0 1 9 17Z" fill={c} opacity={0.6} />
        </g>
        {/* Left wall with D hole */}
        <g transform="matrix(-0.927 0.375 0 -1 60 66)">
          <path d="M0 0H40V46H0Z M30 12V34H22A11 11 0 0 1 22 12Z" fill={c} opacity={0.6} fillRule="evenodd" />
        </g>
        {/* Right wall with D hole */}
        <g transform="matrix(0.927 0.375 0 -1 60 66)">
          <path d="M0 0H40V46H0Z M10 12V34H18A11 11 0 0 0 18 12Z" fill={c} opacity={0.85} fillRule="evenodd" />
        </g>
      </svg>
    )
  }

  return (
    <svg width={s} height={s} viewBox="0 0 120 130" fill="none" className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
      {/* Floor slab edges */}
      <path d="M20.1 79.9L60 96V99L20.1 82.9Z" fill="#c9bca8" />
      <path d="M60 96L99.9 79.9V82.9L60 99Z" fill="#b0a28e" />
      {/* Floor top + rug */}
      <g transform="matrix(-0.927 0.375 0.927 0.375 60 66)">
        <path d="M-3 -3H40V40H-3Z" fill="#e9dfcf" />
        <path d="M9 9H31V17A11 11 0 0 1 9 17Z" fill="#6d5cb8" />
      </g>
      {/* Left wall with D hole (evenodd = real hole, sky shows through) */}
      <g transform="matrix(-0.927 0.375 0 -1 60 66)">
        <path d="M0 0H40V46H0Z M30 12V34H22A11 11 0 0 1 22 12Z" fill="#c9bbea" fillRule="evenodd" />
        {/* Reveal (depth visible through hole) */}
        <path d="M33 14.25V36.25H25A11 11 0 0 1 25 14.25Z" fill="#a695d6" clipPath="url(#leftHole)" />
        {/* Frame stroke */}
        <path d="M30 12V34H22A11 11 0 0 1 22 12Z" stroke="#3b2a6e" strokeWidth="2" fill="none" />
      </g>
      {/* Right wall with D hole */}
      <g transform="matrix(0.927 0.375 0 -1 60 66)">
        <path d="M0 0H40V46H0Z M10 12V34H18A11 11 0 0 0 18 12Z" fill="#a08fd8" fillRule="evenodd" />
        <path d="M7 14.25V36.25H15A11 11 0 0 0 15 14.25Z" fill="#7d69c0" />
        <path d="M10 12V34H18A11 11 0 0 0 18 12Z" stroke="#3b2a6e" strokeWidth="2" fill="none" />
      </g>
      {/* Wall thickness — top caps */}
      <path d="M20.1 79.9L60 63.6L99.9 79.9L60 66Z" fill="#e4dcf6" opacity={0.5} />
    </svg>
  )
}
