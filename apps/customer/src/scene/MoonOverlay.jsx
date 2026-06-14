import { useMoodControl } from '@shared/ThemeProvider'
import { MOON_MOODS, MOOD_DEFAULT_MOON, moonUrl } from '../data/moonPhases'

// ── Moon overlay ───────────────────────────────────────────────────
// Renders a single moon PNG in the upper-right portion of the sky.
// Only visible on dark moods (Moonlight, Northern Lights, etc.).
// The moonId prop comes from room state — defaults to a mood-specific
// pick if the user hasn't chosen one yet.
//
// Position is fixed upper-right with a subtle CSS glow halo so the
// moon feels like it's casting light. Pointer-events off so it never
// blocks builder interaction.

export default function MoonOverlay({ moonId }) {
  const { mood } = useMoodControl()

  if (!MOON_MOODS.has(mood)) return null

  const id = moonId ?? MOOD_DEFAULT_MOON[mood] ?? 5
  const src = moonUrl(id)

  // Mood-specific tint glow behind the moon
  const glowColor = mood === 'Neon Nights'
    ? 'rgba(180,80,220,0.25)'
    : mood === 'Northern Lights'
    ? 'rgba(80,200,180,0.2)'
    : 'rgba(200,210,240,0.2)'

  return (
    <div
      style={{
        position: 'absolute',
        top: '3%',
        right: '8%',
        width: 'clamp(120px, 15vw, 280px)',
        aspectRatio: '3 / 4',
        pointerEvents: 'none',
        zIndex: 2,
        filter: `drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 80px ${glowColor})`,
        transition: 'filter 1.5s ease, opacity 1.5s ease',
        opacity: 0.92,
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center top',
        }}
      />
    </div>
  )
}
