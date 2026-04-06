import { createContext, useContext, useMemo } from 'react'
import { useMood, MOODS } from './useMood'
import { MOOD_THEMES, APP_MOOD_DEFAULTS } from './themes'

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
 */
export function ThemeProvider({ appKey, children }) {
  const { mood, setMood, moods, isLocked } = useMood(appKey)
  const theme = useMemo(
    () => MOOD_THEMES[mood] ?? MOOD_THEMES[APP_MOOD_DEFAULTS[appKey]] ?? MOOD_THEMES['Bright Day'],
    [mood, appKey]
  )
  const value = useMemo(
    () => ({ theme, mood, setMood, moods, isLocked }),
    [theme, mood, setMood, moods, isLocked]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
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
