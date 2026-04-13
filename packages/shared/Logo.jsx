/**
 * DaydreamDwelling logo — isometric room outline formed from three "D" letterforms.
 * The three D's create walls and floor of a small isometric room.
 * Uses theme accent color for brand consistency across moods.
 */
export default function Logo({ size = 36, color, className, style }) {
  const c = color || 'currentColor'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Floor plane (bottom D — flat, isometric perspective) */}
      <path
        d="M24 38 L8 29 L8 25 Q8 19 14 16 L24 10 L24 14 L16 19 Q12 21.5 12 25 L12 27 L24 34Z"
        fill={c}
        opacity={0.25}
      />
      {/* Left wall (left D — vertical face) */}
      <path
        d="M8 25 L8 13 Q8 7 14 4 L24 10 L24 14 L16 19 Q12 21.5 12 25Z"
        fill={c}
        opacity={0.55}
      />
      {/* Right wall (right D — vertical face) */}
      <path
        d="M24 10 L34 4 Q40 7 40 13 L40 25 Q40 21.5 36 19 L24 14Z"
        fill={c}
        opacity={0.4}
      />
      {/* Right floor extension */}
      <path
        d="M24 38 L40 29 L40 25 Q40 21.5 36 19 L24 14 L24 34Z"
        fill={c}
        opacity={0.18}
      />
      {/* Room interior highlight */}
      <path
        d="M24 14 L16 19 Q12 21.5 12 25 L12 27 L24 34 L36 27 L36 25 Q36 21.5 32 19Z"
        fill={c}
        opacity={0.08}
      />
      {/* Accent sparkle */}
      <g transform="translate(24, 8)" opacity={0.7}>
        <path
          d="M0 -3L0.6 -0.6L3 0L0.6 0.6L0 3L-0.6 0.6L-3 0L-0.6 -0.6Z"
          fill={c}
        />
      </g>
    </svg>
  )
}
