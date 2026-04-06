import { createContext, useContext, useMemo } from 'react'
import { useMood } from './useMood'
import { MOOD_THEMES, APP_MOOD_DEFAULTS } from './themes'

const ThemeContext = createContext(MOOD_THEMES['Bright Day'])

/**
 * Wrap each app's root with <ThemeProvider appKey="outdoor|seller|customer">.
 * Child components call useTheme() to get the active mood's color tokens.
 * When the user's mood preference changes, all themed components re-render.
 */
export function ThemeProvider({ appKey, children }) {
  const { mood } = useMood(appKey)
  const theme = useMemo(
    () => MOOD_THEMES[mood] ?? MOOD_THEMES[APP_MOOD_DEFAULTS[appKey]] ?? MOOD_THEMES['Bright Day'],
    [mood, appKey]
  )
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
