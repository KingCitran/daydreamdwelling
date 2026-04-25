import { useMoodControl, useTheme } from '@shared/ThemeProvider'

/**
 * Sky gradient backdrop — shows through the transparent canvas
 * above the cloud plate and through room windows.
 */

const SKY = {
  'Golden Hour':      { top: '#0c0800', mid: '#6a3018', low: '#d89848' },
  'Bright Day':       { top: '#1040a0', mid: '#3878d0', low: '#88c0f0' },
  'Vivid Sunset':     { top: '#060200', mid: '#381008', low: '#884020' },
  'Moonlight':        { top: '#020408', mid: '#0c1828', low: '#1a2840' },
  'Dark Academia':    { top: '#060404', mid: '#1a0c08', low: '#4a3020' },
  'Cottagecore Dawn': { top: '#180818', mid: '#703048', low: '#d09098' },
  'Coastal Morning':  { top: '#082038', mid: '#205888', low: '#68a8d0' },
  'Dream State':      { top: '#080418', mid: '#201048', low: '#583898' },
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
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `linear-gradient(180deg, ${s.top} 0%, ${s.mid} 40%, ${s.low} 100%)`,
      transition: 'background 2s ease',
    }} />
  )
}
