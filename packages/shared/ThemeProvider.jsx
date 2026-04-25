import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useMood, MOODS } from './useMood'
import {
  MOOD_THEMES, APP_MOOD_DEFAULTS,
  EMBER_SUNRISE_KEYFRAMES, EMBER_SUNRISE_DURATION_MS, interpolateTheme,
  computeSunriseGradient,
} from './themes'

const SUNRISE_MOOD = "Ember's Sunrise"

// CSS injected globally during Ember's Sunrise to keep text legible across the
// dark→light transition. text-shadow + paint-order stroke draws a subtle dark
// outline behind every text element; invisible on dark bg, adds contrast on light.
function EmberSunriseStyles() {
  return (
    <style>{`
      body, .ember-sunrise-text, button, h1, h2, h3, h4, label, p, a, span {
        text-shadow: 0 0 2px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.32);
        paint-order: stroke fill;
        -webkit-text-stroke: 0.4px rgba(0,0,0,0.5);
      }
    `}</style>
  )
}

// Compose Ember's Sunrise bg as radial sun + linear sky in one background string.
// CSS layers paint top-to-bottom, so the radial sun sits over the linear sky.
// Used both as the page bg AND inside SkyBackdrop so the builder reflects it.
function buildSunriseBg(stops, progress) {
  const sunY = 85 - progress * 55          // 85% → 30% from top
  const sunOpacity = Math.min(0.55, 0.12 + progress * 0.5)
  const sunRadius = 28 + progress * 18     // 28vmax → 46vmax
  const sun = `radial-gradient(circle ${sunRadius}vmax at 50% ${sunY}%, rgba(255,245,200,${sunOpacity}) 0%, rgba(255,220,180,${(sunOpacity*0.55).toFixed(3)}) 32%, transparent 68%)`
  const sky = `linear-gradient(to top, ${stops[0]} 0%, ${stops[1]} 35%, ${stops[2]} 70%, ${stops[3]} 100%)`
  return `${sun}, ${sky}`
}

const ThemeContext = createContext({
  theme:    MOOD_THEMES['Bright Day'],
  mood:     'Bright Day',
  setMood:  () => {},
  moods:    MOODS,
  isLocked: false,
})

/**
 * Wrap each app root with <ThemeProvider appKey="outdoor|seller|customer">.
 * Children call useTheme() for color tokens, useMoodControl() for mood switching.
 *
 * Ember's Sunrise is special: when active, the theme interpolates through
 * EMBER_SUNRISE_KEYFRAMES over 5 minutes — bonfire embers → pastel dawn.
 * Restarts whenever the mood is (re)selected.
 */
export function ThemeProvider({ appKey, children }) {
  const { mood, setMood, moods, isLocked } = useMood(appKey)
  const [sunriseProgress, setSunriseProgress] = useState(0)

  // Drive the sunrise progression when active. Restarts on mood (re)select.
  useEffect(() => {
    if (mood !== SUNRISE_MOOD) return
    setSunriseProgress(0)
    const start = Date.now()
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / EMBER_SUNRISE_DURATION_MS)
      setSunriseProgress(p)
      if (p >= 1) clearInterval(id)
    }
    const id = setInterval(tick, 1500)
    return () => clearInterval(id)
  }, [mood])

  const theme = useMemo(() => {
    if (mood === SUNRISE_MOOD) {
      const interpolated = interpolateTheme(EMBER_SUNRISE_KEYFRAMES, sunriseProgress)
      const stops = computeSunriseGradient(sunriseProgress)
      // bg = composited radial sun + linear sky. Same gradient is reused by
      // SkyBackdrop in the builder so the scene reflects the live sunrise.
      return { ...interpolated, bg: buildSunriseBg(stops, sunriseProgress) }
    }
    return MOOD_THEMES[mood] ?? MOOD_THEMES[APP_MOOD_DEFAULTS[appKey]] ?? MOOD_THEMES['Bright Day']
  }, [mood, appKey, sunriseProgress])

  const value = useMemo(
    () => ({ theme, mood, setMood, moods, isLocked }),
    [theme, mood, setMood, moods, isLocked]
  )
  return (
    <ThemeContext.Provider value={value}>
      {mood === SUNRISE_MOOD && <EmberSunriseStyles />}
      {children}
    </ThemeContext.Provider>
  )
}

/** Returns the active mood's color token object. */
export function useTheme() {
  return useContext(ThemeContext).theme
}

/** Returns mood state + controls for building a mood switcher UI. */
export function useMoodControl() {
  const { mood, setMood, moods, isLocked } = useContext(ThemeContext)
  return { mood, setMood, moods, isLocked }
}
