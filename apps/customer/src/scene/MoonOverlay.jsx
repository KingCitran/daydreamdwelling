import { useMemo } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { ACTIVE_MOONS, MOON_MOODS, moonUrl } from '../data/moonPhases'

// ── Moon overlay ───────────────────────────────────────────────────
// Renders a small photorealistic moon in the upper-right sky on dark
// moods. Picks a random moon from the curated pool each time the mood
// activates. No user picker — ambient decoration.

export default function MoonOverlay() {
  const { mood } = useMoodControl()

  const moonId = useMemo(() => {
    if (!MOON_MOODS.has(mood) || !ACTIVE_MOONS.length) return null
    return ACTIVE_MOONS[Math.floor(Math.random() * ACTIVE_MOONS.length)].id
  }, [mood])

  if (!moonId) return null

  const src = moonUrl(moonId)

  const glowColor = mood === 'Neon Nights'
    ? 'rgba(180,80,220,0.25)'
    : mood === 'Northern Lights'
    ? 'rgba(80,200,180,0.2)'
    : 'rgba(200,210,240,0.18)'

  return (
    <div
      style={{
        position: 'absolute',
        top: '2%',
        right: '6%',
        width: 'clamp(60px, 8vw, 140px)',
        aspectRatio: '3 / 4',
        pointerEvents: 'none',
        zIndex: 2,
        filter: `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 50px ${glowColor})`,
        transition: 'filter 1.5s ease, opacity 1.5s ease',
        opacity: 0.85,
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
