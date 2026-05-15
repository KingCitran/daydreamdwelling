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

// Vivid Sunset stars: dense smattering in the blue band (top of sky).
// Density is heavy at y=0 (deep zenith) and falls off to near-zero by y≈45%
// where the pale blue-grey middle begins. Stars also dim as they descend so the
// transition into the palest blue feels organic.
function generateVividSunsetStars(count = 260) {
  let seed = 7331
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const parts = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(1)
    // Bias y toward the top: rand^1.7 weights into the first ~30% but leaves
    // some scatter through the steel-blue band.
    const yRaw = Math.pow(rand(), 1.7) * 50
    const y = yRaw.toFixed(1)
    const r = rand()
    const size = (r < 0.92 ? 0.4 + rand() * 0.9 : 1.4 + rand() * 0.8).toFixed(1)
    // Alpha fades to 0 by y≈45 so the smattering trails off into the pale blue.
    const baseAlpha = 0.32 + rand() * 0.60
    const yFade = Math.max(0, 1 - yRaw / 45)
    const alpha = (baseAlpha * yFade).toFixed(2)
    parts.push(`radial-gradient(circle ${size}px at ${x}% ${y}%, rgba(255,255,255,${alpha}), transparent 100%)`)
  }
  return parts.join(', ')
}
const VIVID_SUNSET_STARS = generateVividSunsetStars()

const SKY = {
  'Golden Hour':      { top: '#5a2540', mid: '#e88a3e', low: '#ffe39a' },
  'Bright Day':       { top: '#1040a0', mid: '#3878d0', low: '#88c0f0' },
  'Vivid Sunset':     { top: '#1a2a5a', mid: '#a8b8d0', low: '#e8a040' },
  'Moonlight':        { top: '#050918', mid: '#16203f', low: '#2a3868' },
  'Dark Academia':    { top: '#060404', mid: '#1a0c08', low: '#4a3020' },
  'Blush Hour':       { top: '#ffe2cf', mid: '#f4b0c0', low: '#c8b8dc' },
  'Coastal Morning':  { top: '#2a5a8c', mid: '#a8c4d8', low: '#ffd896' },
  'Dream State':      { top: '#ffe8d0', mid: '#e8c8e0', low: '#a890d4' },
  'Neon Nights':      { top: '#060318', mid: '#160e3a', low: '#2a1862' },
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
  } else if (mood === 'Neon Nights') {
    // Deep midnight purple with magenta horizon glow + faint vertical neon
    // streaks. Stars are sparse and scattered. Clouds are lit by external neon
    // (see Neon Nights MOOD_THEMES entry in the cloud components).
    const stars = [
      'radial-gradient(circle 1px at 8% 6%, rgba(255,255,255,0.7), transparent 100%)',
      'radial-gradient(circle 1px at 22% 12%, rgba(220,180,255,0.5), transparent 100%)',
      'radial-gradient(circle 1.5px at 41% 4%, rgba(255,255,255,0.8), transparent 100%)',
      'radial-gradient(circle 1px at 64% 9%, rgba(180,220,255,0.6), transparent 100%)',
      'radial-gradient(circle 1px at 78% 17%, rgba(255,200,255,0.7), transparent 100%)',
      'radial-gradient(circle 1px at 91% 8%, rgba(255,255,255,0.5), transparent 100%)',
      'radial-gradient(circle 1.5px at 15% 23%, rgba(220,180,255,0.6), transparent 100%)',
      'radial-gradient(circle 1px at 52% 18%, rgba(255,255,255,0.4), transparent 100%)',
      'radial-gradient(circle 1px at 72% 26%, rgba(180,220,255,0.5), transparent 100%)',
    ].join(', ')
    bg = `${stars}, ` +
         `linear-gradient(180deg, transparent 0%, rgba(255,80,220,0.06) 25%, transparent 55%) 58% 0 / 4px 100% no-repeat, ` +
         `linear-gradient(180deg, transparent 0%, rgba(80,200,255,0.06) 25%, transparent 55%) 32% 0 / 6px 100% no-repeat, ` +
         `radial-gradient(ellipse 70% 28% at 50% 100%, rgba(220,60,200,0.32) 0%, rgba(150,40,180,0.16) 35%, transparent 70%), ` +
         `linear-gradient(180deg, ${s.top} 0%, #0c0828 25%, ${s.mid} 55%, #1f1450 82%, ${s.low} 100%)`
  } else if (mood === 'Coastal Morning') {
    // Sun rising at the horizon. Cool deep ocean-blue zenith → teal-blue upper
    // → soft sky blue middle → warm cream lower → peachy-gold horizon, with a
    // gentle rising-sun glow from below. Fresh and atmospheric, not dramatic.
    bg = `radial-gradient(ellipse 80% 30% at 50% 100%, rgba(255,220,140,0.55) 0%, rgba(255,190,120,0.28) 40%, transparent 78%), ` +
         `linear-gradient(180deg, ${s.top} 0%, #5a8cb8 25%, ${s.mid} 55%, #f0d8b8 82%, ${s.low} 100%)`
  } else if (mood === 'Vivid Sunset') {
    // Muted sky — clouds carry the drama. Stars smatter the blue band only,
    // density falling off before the palest middle. Sun glow tempered slightly
    // and horizon pulled toward amber instead of canary gold.
    bg = `${VIVID_SUNSET_STARS}, ` +
         `radial-gradient(ellipse 110% 40% at 50% 100%, rgba(255,185,95,0.50) 0%, rgba(255,165,85,0.22) 40%, transparent 78%), ` +
         `linear-gradient(180deg, ${s.top} 0%, #4a5a8c 25%, ${s.mid} 55%, #e8c088 82%, ${s.low} 100%)`
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
