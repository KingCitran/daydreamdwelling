import { useMoodControl, useTheme } from '@shared/ThemeProvider'

/**
 * Sky gradient backdrop — shows through the transparent canvas
 * above the cloud plate and through room windows.
 */

// Deterministic star field for Moonlight — generated once at module load.
// Dense scattering of stars across most of the sky, with a handful of brighter
// "magnitude 1" stars sprinkled in for variety.
function generateStars(count = 320) {
  // Simple seeded RNG so star positions are stable across reloads.
  let seed = 1337
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const parts = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(1)
    const y = (rand() * 80).toFixed(1)              // top 80% — stars all the way down to horizon haze
    // Most stars tiny (0.5–1.4px), occasional bright one (up to 2.4px)
    const r = rand()
    const size = (r < 0.92 ? 0.5 + rand() * 0.9 : 1.5 + rand() * 0.9).toFixed(1)
    const alpha = (0.25 + rand() * 0.7).toFixed(2)
    parts.push(`radial-gradient(circle ${size}px at ${x}% ${y}%, rgba(255,255,255,${alpha}), transparent 100%)`)
  }
  return parts.join(', ')
}
const MOONLIGHT_STARS = generateStars()

const SKY = {
  'Golden Hour':      { top: '#5a2540', mid: '#e88a3e', low: '#ffe39a' },
  'Bright Day':       { top: '#1040a0', mid: '#3878d0', low: '#88c0f0' },
  'Vivid Sunset':     { top: '#060200', mid: '#381008', low: '#884020' },
  'Moonlight':        { top: '#050918', mid: '#16203f', low: '#2a3868' },
  'Dark Academia':    { top: '#060404', mid: '#1a0c08', low: '#4a3020' },
  'Blush Hour':       { top: '#ffe2cf', mid: '#f4b0c0', low: '#c8b8dc' },
  'Coastal Morning':  { top: '#082038', mid: '#205888', low: '#68a8d0' },
  'Dream State':      { top: '#ffe8d0', mid: '#e8c8e0', low: '#a890d4' },
  'Neon Nights':      { top: '#020004', mid: '#0c0420', low: '#301058' },
  'Candlelit Cozy Evening':      { top: '#040100', mid: '#200800', low: '#5a2808' },
  'Greenhouse':       { top: '#040c04', mid: '#102810', low: '#386830' },
  'Studio':           { top: '#303840', mid: '#586068', low: '#909898' },
  'Studio Dark':      { top: '#0c0e14', mid: '#202228', low: '#404448' },
}

export default function SkyBackdrop() {
  const { mood } = useMoodControl()
  const theme = useTheme()

  // Ember's Sunrise: reuse the live composited bg (radial sun + linear sky)
  // so the builder scene reflects the same sky as the rest of the app.
  if (mood === "Ember's Sunrise") {
    return (
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: theme.bg,
        transition: 'background 1.5s ease',
      }} />
    )
  }

  const s = SKY[mood] ?? SKY['Dream State']
  // Dream State uses the cloud-design palette as a clean 5-stop gradient
  // (no radial highlight — it read as an odd "blurb" in the corner).
  // Themed-mood backgrounds — pale at the top, deep at the bottom
  // (sun/horizon-light feels overhead, deeper sky beneath).
  let bg
  if (mood === 'Dream State') {
    bg = `linear-gradient(180deg, ${s.top} 0%, #ffd8d0 25%, ${s.mid} 55%, #c0a8dc 80%, ${s.low} 100%)`
  } else if (mood === 'Golden Hour') {
    // Flipped: deep plum at top, sun-bleached cream at bottom (sun at horizon),
    // warm sun radial pulled to bottom-right.
    bg = `radial-gradient(ellipse 55% 35% at 82% 88%, rgba(255,230,170,0.75) 0%, rgba(255,200,120,0.35) 35%, transparent 70%), ` +
         `linear-gradient(180deg, ${s.top} 0%, #b85a55 22%, ${s.mid} 48%, #f6b85c 72%, ${s.low} 100%)`
  } else if (mood === 'Moonlight') {
    // Dense scattered stars across the upper sky, deep midnight gradient
    // with a faint distant glow at the horizon. No moon disc.
    bg = `${MOONLIGHT_STARS}, ` +
         `linear-gradient(180deg, ${s.top} 0%, #0c1530 22%, ${s.mid} 48%, #1f2a50 72%, ${s.low} 100%)`
  } else if (mood === 'Blush Hour') {
    // Flipped: warm cream at top, peachy-pink → soft pink → rose-mauve → pale
    // lavender at bottom. Matches the cream-crown / plum-underbelly cloud lighting.
    bg = `radial-gradient(ellipse 75% 45% at 50% 25%, rgba(255,240,225,0.55) 0%, rgba(255,210,195,0.22) 45%, transparent 80%), ` +
         `linear-gradient(180deg, ${s.top} 0%, #ffc0b4 25%, ${s.mid} 52%, #e6c4d4 80%, ${s.low} 100%)`
  } else {
    bg = `linear-gradient(180deg, ${s.top} 0%, ${s.mid} 40%, ${s.low} 100%)`
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: bg,
      transition: 'background 2s ease',
    }} />
  )
}
