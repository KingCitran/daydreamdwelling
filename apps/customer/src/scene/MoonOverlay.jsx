import { useMemo } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { MOONS, MOON_MOODS, moonUrl } from '../data/moonPhases'

// Silver/white moons only — no dark or warm-toned ones
const SILVER_MOONS = MOONS.filter(m => m.tone === 'light')

// ── Moon overlay ───────────────────────────────────────────────────
// Renders a small photorealistic moon in the upper-right sky on dark
// moods. Picks a random silver moon each time the mood activates so
// it feels fresh on every visit. No user picker — ambient decoration.

export default function MoonOverlay() {
  const { mood } = useMoodControl()

  const moonId = useMemo(() => {
    if (!MOON_MOODS.has(mood)) return null
    const pick = SILVER_MOONS[Math.floor(Math.random() * SILVER_MOONS.length)]
    return pick.id
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
