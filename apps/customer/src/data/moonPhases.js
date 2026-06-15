// Moon asset manifest — 35 photorealistic moon PNGs in public/fx-moons/.
// Each entry has an id (matches filename), phase label for the picker,
// and which moods it looks best in. All moons work on any dark mood —
// the "moods" array is just a suggested default when auto-picking.

export const MOONS = [
  // ── Pack 1: mix of phases ──────────────────────────────────────
  { id: 1,  phase: 'Waxing Crescent',    tone: 'light' },
  { id: 2,  phase: 'Waxing Crescent',    tone: 'light' },
  { id: 3,  phase: 'First Quarter',      tone: 'medium' },
  { id: 4,  phase: 'Waxing Gibbous',     tone: 'medium' },
  { id: 5,  phase: 'Full Moon',          tone: 'light' },
  { id: 6,  phase: 'Full Moon',          tone: 'light' },
  { id: 7,  phase: 'Full Moon',          tone: 'medium' },
  { id: 8,  phase: 'Full Moon',          tone: 'light' },
  // ── Pack 2 ──────────────────────────────────────────────────────
  { id: 9,  phase: 'Full Moon',          tone: 'light' },
  { id: 10, phase: 'Full Moon',          tone: 'medium' },
  { id: 11, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 12, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 13, phase: 'Full Moon',          tone: 'light' },
  // ── Pack 3 ──────────────────────────────────────────────────────
  { id: 14, phase: 'Full Moon',          tone: 'light' },
  { id: 15, phase: 'Full Moon',          tone: 'light' },
  { id: 16, phase: 'Waxing Gibbous',     tone: 'medium' },
  { id: 17, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 18, phase: 'Waxing Gibbous',     tone: 'medium' },
  { id: 19, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 20, phase: 'Waning Crescent',    tone: 'light' },
  // ── Pack 4 (numbered + alt series) ──────────────────────────────
  { id: 21, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 22, phase: 'Waxing Crescent',    tone: 'light' },
  { id: 23, phase: 'Waxing Gibbous',     tone: 'medium' },
  { id: 24, phase: 'Full Moon',          tone: 'dark' },
  { id: 25, phase: 'Full Moon',          tone: 'dark' },
  { id: 26, phase: 'Waning Gibbous',     tone: 'dark' },
  { id: 27, phase: 'First Quarter',      tone: 'dark' },
  { id: 28, phase: 'Waxing Crescent',    tone: 'medium' },
  { id: 29, phase: 'Waning Crescent',    tone: 'medium' },
  // ── Pack 5 (alt series cont.) ──────────────────────────────────
  { id: 30, phase: 'Full Moon',          tone: 'medium' },
  { id: 31, phase: 'Full Moon',          tone: 'dark' },
  { id: 32, phase: 'Waning Gibbous',     tone: 'dark' },
  { id: 33, phase: 'Full Moon',          tone: 'light' },
  { id: 34, phase: 'Waning Gibbous',     tone: 'medium' },
  { id: 35, phase: 'Full Moon',          tone: 'light' },
]

// Moods where the moon overlay renders in the sky
export const MOON_MOODS = new Set([
  'Moonlight',
  'Northern Lights',
  'Neon Nights',
  'Candlelit Cozy Evening',
])

export const MOON_COUNT = MOONS.length

export function moonUrl(id) {
  return `/fx-moons/moon-${id}.png`
}

// Default moon per mood (opinionated starting pick — user overrides via picker)
export const MOOD_DEFAULT_MOON = {
  'Moonlight':               5,   // classic bright full
  'Northern Lights':         10,  // detailed full
  'Neon Nights':             33,  // glowing full with halo
  'Dark Academia':           24,  // moody dark full
  'Candlelit Cozy Evening':  1,   // thin crescent
}
