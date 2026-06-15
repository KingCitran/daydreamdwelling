import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth/AuthContext'
import { supabase } from './supabase'

// MOODS = the user-facing picker list. Studio Dark folds into Studio (one
// button, tap-again toggles between light/dark). Candlelit Cozy Evening and
// Dark Academia are archived — their theme/scene/sky entries still exist for
// backward compatibility with any saved user preferences, but they don't
// appear in the picker and the onboarding quiz won't recommend them.
export const MOODS = [
  { key: 'Golden Hour',            label: 'Golden Hour',            desc: 'Warm amber sunset, lamp pools',         icon: '🌅' },
  { key: 'Bright Day',             label: 'Bright Day',             desc: 'Crisp natural light, airy and clean',   icon: '☀️' },
  { key: 'Vivid Sunset',           label: 'Vivid Sunset',           desc: 'Magenta sky, gold horizon, still water', icon: '🌇' },
  { key: "Ember's Sunrise",        label: "Ember's Sunrise",        desc: 'Bonfire fades into a slow pastel dawn (5 min)', icon: '🔥' },
  { key: 'Moonlight',              label: 'Moonlight',              desc: 'Cool blue-silver, peaceful night',      icon: '🌙' },
  // Northern Lights archived — revisiting later
  { key: 'Blush Hour',             label: 'Blush Hour',             desc: 'Warm pink morning light',               icon: '🌸' },
  { key: 'Coastal Morning',        label: 'Coastal Morning',        desc: 'Cool bright blue-white, breezy',        icon: '🌊' },
  { key: 'Dream State',            label: 'Dream State',            desc: 'Soft pastel lavender-blush, dreamy',    icon: '☁️' },
  { key: 'Neon Nights',            label: 'Neon Nights',            desc: 'Tokyo neon nightlife, electric',        icon: '🌈' },
  // Greenhouse archived — revisiting later
  { key: 'Studio',                 label: 'Studio',                 desc: 'Neutral flat light — tap again to toggle dark/light', icon: '🔲' },
]

// Archived moods are still recognized as valid mood keys (their themes apply
// if a profile already has one saved) but won't be surfaced or recommended.
// Admin users see them in the picker so they can still test/develop them.
export const ARCHIVED_MOODS = new Set(['Candlelit Cozy Evening', 'Dark Academia', 'Northern Lights', 'Greenhouse'])

const ARCHIVED_MOOD_ENTRIES = [
  { key: 'Candlelit Cozy Evening', label: 'Candlelit Cozy Evening', desc: 'Warm candle glow (archived)',  icon: '🕯️' },
  { key: 'Dark Academia',          label: 'Dark Academia',          desc: 'Moody scholarly warmth (archived)', icon: '📚' },
  { key: 'Northern Lights',        label: 'Northern Lights',        desc: 'Aurora over midnight sky (archived)', icon: '🌌' },
  { key: 'Greenhouse',             label: 'Greenhouse',             desc: 'Sunlight through leaves (archived)',  icon: '🌿' },
]

// Admin email check — admin sees archived moods in the picker
const ADMIN_EMAILS = new Set(['hayley@daydreamdwelling.com'])

// Studio + Studio Dark are merged into one picker button. The Studio entry
// dynamically picks the dark variant when active mood is 'Studio Dark'.
export const STUDIO_VARIANTS = ['Studio', 'Studio Dark']

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

  const isAdmin = user?.email && ADMIN_EMAILS.has(user.email)
  const moods = isAdmin ? [...MOODS, ...ARCHIVED_MOOD_ENTRIES] : MOODS

  return { mood, setMood, moods, isLocked: false }
}
