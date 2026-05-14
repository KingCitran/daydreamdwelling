import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth/AuthContext'
import { supabase } from './supabase'

export const MOODS = [
  { key: 'Golden Hour',            label: 'Golden Hour',            desc: 'Warm amber sunset, lamp pools',         icon: '🌅' },
  { key: 'Bright Day',             label: 'Bright Day',             desc: 'Crisp natural light, airy and clean',   icon: '☀️' },
  { key: 'Vivid Sunset',           label: 'Vivid Sunset',           desc: 'Magenta sky, gold horizon, still water', icon: '🌇' },
  { key: "Ember's Sunrise",        label: "Ember's Sunrise",        desc: 'Bonfire fades into a slow pastel dawn (5 min)', icon: '🔥' },
  { key: 'Candlelit Cozy Evening', label: 'Candlelit Cozy Evening', desc: 'Dim warm interior, flickering glow',    icon: '🕯' },
  { key: 'Moonlight',              label: 'Moonlight',              desc: 'Cool blue-silver, peaceful night',      icon: '🌙' },
  { key: 'Northern Lights',        label: 'Northern Lights',        desc: 'Aurora over a midnight sky',            icon: '🌌' },
  { key: 'Dark Academia',          label: 'Dark Academia',          desc: 'Jewel tones, leather, candlelit library', icon: '📚' },
  { key: 'Blush Hour',       label: 'Blush Hour',       desc: 'Warm pink morning light',               icon: '🌸' },
  { key: 'Coastal Morning',        label: 'Coastal Morning',        desc: 'Cool bright blue-white, breezy',        icon: '🌊' },
  { key: 'Dream State',            label: 'Dream State',            desc: 'Soft pastel lavender-blush, dreamy',    icon: '☁️' },
  { key: 'Neon Nights',            label: 'Neon Nights',            desc: 'Tokyo neon nightlife, electric',        icon: '🌈' },
  { key: 'Greenhouse',             label: 'Greenhouse',             desc: 'Sunlight through leaves, scattered flowers', icon: '🌿' },
  { key: 'Studio',                 label: 'Studio',                 desc: 'Neutral flat light, true colors',       icon: '🔲' },
  { key: 'Studio Dark',            label: 'Studio Dark',            desc: 'Even flat studio light, dark neutral',  icon: '⬛' },
]

// Per-app default overrides (used when no user preference is set)
const APP_DEFAULTS = {
  customer: 'Bright Day',
  outdoor:  'Bright Day',
  seller:   'Dream State', // always locked, never user-controlled
}

/**
 * useMood(appKey)
 * appKey: 'customer' | 'outdoor' | 'seller'
 *
 * Returns:
 *   mood        — the active mood key string
 *   setMood     — save a new global mood (updates Supabase profile)
 *   moods       — full MOODS list
 *   isLocked    — true if this app overrides mood (seller)
 */
export function useMood(appKey = 'customer') {
  const { user, profile } = useAuth()

  // Seller is always Dream State — locked
  if (appKey === 'seller') {
    return { mood: 'Dream State', setMood: () => {}, moods: MOODS, isLocked: true }
  }

  // Determine effective mood. globalMood is intentionally left undefined when
  // there's no user/profile so the cascade can reach appDefault — otherwise
  // appDefault would be dead code.
  const globalMood    = profile?.mood_preference
  const appOverrides  = profile?.app_mood_overrides ?? {}
  const appDefault    = APP_DEFAULTS[appKey]

  // User-set app override > global preference > app default > hard fallback
  const effectiveMood = appOverrides[appKey] ?? globalMood ?? appDefault ?? 'Bright Day'

  const [mood, setMoodLocal] = useState(effectiveMood)

  // Sync when profile loads
  useEffect(() => {
    setMoodLocal(appOverrides[appKey] ?? globalMood ?? appDefault ?? 'Bright Day')
  }, [profile])

  const setMood = useCallback(async (newMood) => {
    setMoodLocal(newMood)
    if (!user) return
    await supabase
      .from('profiles')
      .update({ mood_preference: newMood })
      .eq('id', user.id)
  }, [user])

  return { mood, setMood, moods: MOODS, isLocked: false }
}
