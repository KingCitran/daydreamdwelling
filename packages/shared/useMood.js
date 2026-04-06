import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth/AuthContext'
import { supabase } from './supabase'

export const MOODS = [
  { key: 'Golden Hour',      label: 'Golden Hour',      desc: 'Warm amber sunset, lamp pools',        icon: '🌅' },
  { key: 'Bright Day',       label: 'Bright Day',       desc: 'Crisp natural light, airy and clean',  icon: '☀️' },
  { key: 'Cozy Evening',     label: 'Cozy Evening',     desc: 'Dim warm glow, intimate',              icon: '🕯️' },
  { key: 'Moonlight',        label: 'Moonlight',        desc: 'Cool blue-silver, peaceful night',     icon: '🌙' },
  { key: 'Dark Academia',    label: 'Dark Academia',    desc: 'Moody amber, candlelit library',       icon: '📚' },
  { key: 'Cottagecore Dawn', label: 'Cottagecore Dawn', desc: 'Warm pink morning light',              icon: '🌸' },
  { key: 'Coastal Morning',  label: 'Coastal Morning',  desc: 'Cool bright blue-white, breezy',      icon: '🌊' },
  { key: 'Dream State',      label: 'Dream State',      desc: 'Soft pastel lavender-blush, dreamy',  icon: '☁️' },
  { key: 'Neon Nights',      label: 'Neon Nights',      desc: 'RGB LED cycling, vibrant',             icon: '🌈' },
  { key: 'Candlelight',      label: 'Candlelight',      desc: 'Very warm, flickering glow, romantic', icon: '🕯' },
  { key: 'Greenhouse',       label: 'Greenhouse',       desc: 'Natural warm light, green cast',       icon: '🌿' },
  { key: 'Studio',           label: 'Studio',           desc: 'Neutral flat light, true colors',      icon: '🔲' },
]

// Per-app default overrides (used when no user preference is set)
const APP_DEFAULTS = {
  outdoor: 'Bright Day',
  seller:  'Dream State', // always locked, never user-controlled
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

  // Determine effective mood
  const globalMood    = profile?.mood_preference ?? 'Golden Hour'
  const appOverrides  = profile?.app_mood_overrides ?? {}
  const appDefault    = APP_DEFAULTS[appKey]

  // User-set app override > global preference > app default
  const effectiveMood = appOverrides[appKey] ?? globalMood ?? appDefault

  const [mood, setMoodLocal] = useState(effectiveMood)

  // Sync when profile loads
  useEffect(() => {
    setMoodLocal(appOverrides[appKey] ?? globalMood ?? appDefault ?? 'Golden Hour')
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
