/**
 * DaydreamDwelling's raindrop vote icon — a teardrop shape with
 * a 4-pointed star sparkle inside. Used for community voting,
 * contest scores, and the brand's visual language.
 */
export default function RaindropIcon({ size = 16, filled = false, color, className, style }) {
  const c = color || (filled ? 'currentColor' : 'currentColor')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Raindrop / teardrop shape */}
      <path
        d="M12 2C12 2 5 10.5 5 15.5C5 19.36 8.13 22 12 22C15.87 22 19 19.36 19 15.5C19 10.5 12 2 12 2Z"
        fill={filled ? c : 'none'}
        stroke={c}
        strokeWidth={filled ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={filled ? 0.25 : 0.6}
      />
      {/* Filled inner glow when active */}
      {filled && (
        <path
          d="M12 2C12 2 5 10.5 5 15.5C5 19.36 8.13 22 12 22C15.87 22 19 19.36 19 15.5C19 10.5 12 2 12 2Z"
          fill={c}
          opacity={0.9}
        />
      )}
      {/* 4-pointed star sparkle in the center */}
      <g transform="translate(12, 14)" opacity={filled ? 1 : 0.5}>
        <path
          d="M0 -3.5L0.8 -0.8L3.5 0L0.8 0.8L0 3.5L-0.8 0.8L-3.5 0L-0.8 -0.8Z"
          fill={filled ? '#fff' : c}
          opacity={filled ? 0.9 : 0.7}
        />
      </g>
      {/* Small secondary sparkle */}
      {filled && (
        <g transform="translate(9, 10.5)" opacity={0.6}>
          <path
            d="M0 -1.5L0.4 -0.4L1.5 0L0.4 0.4L0 1.5L-0.4 0.4L-1.5 0L-0.4 -0.4Z"
            fill="#fff"
          />
        </g>
      )}
    </svg>
  )
}
