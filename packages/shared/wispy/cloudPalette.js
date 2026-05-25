// Per-mood cloud gradients — picked to match the cloud field rendered in
// the customer app's scene (CloudConveyorPuffs.jsx MOOD_THEMES), so
// Wispy reads as "one of the clouds in this room" instead of a fixed
// dusk-pastel imported from the bundle.
//
// Strategy: cloud-silhouette.png is the white-on-alpha shape from
// claude-design's bundle. We use it as a CSS mask + apply a per-mood
// linear-gradient background. Drop shadow added via CSS filter since the
// silhouette doesn't carry the bundle's baked-in shadow.
//
// Moods not in this table fall back to the original cloud-base.png (the
// neutral dusk-pastel from the bundle), since the scene also doesn't
// theme them (Northern Lights, Dark Academia, Candlelit Cozy Evening,
// Studio / Studio Dark, Ember's Sunrise). When the scene starts theming
// those, add them here.

export const MOOD_CLOUD_GRADIENTS = {
  'Dream State':   'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
  'Golden Hour':   'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
  'Moonlight':     'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
  'Blush Hour':    'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
  'Coastal Morning':'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
  'Greenhouse':    'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
  'Neon Nights':   'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
  'Vivid Sunset':  'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
  'Bright Day':    'linear-gradient(180deg, #ffffff 0%, #f0f8ff 15%, #c8dcf0 38%, #88b0d8 60%, #5080b8 82%, #2858a0 100%)',
}

// Soft drop-shadow per mood so the recolored cloud has presence against
// the scene background. Pulled from the scene's tintShadow filters where
// available; tuned for Wispy's smaller size (corner mascot, not a full
// scene cloud) so shadow blur is gentler.
export const MOOD_CLOUD_SHADOWS = {
  'Dream State':    'drop-shadow(0 8px 16px rgba(120,80,180,0.20))',
  'Golden Hour':    'drop-shadow(0 8px 16px rgba(120,40,30,0.25))',
  'Moonlight':      'drop-shadow(0 8px 18px rgba(8,12,28,0.55))',
  'Blush Hour':     'drop-shadow(0 8px 18px rgba(180,72,122,0.28))',
  'Coastal Morning':'drop-shadow(0 8px 14px rgba(40,70,110,0.35))',
  'Greenhouse':     'drop-shadow(0 8px 14px rgba(120,160,90,0.30))',
  'Neon Nights':    'drop-shadow(0 -4px 14px rgba(255,80,220,0.55)) drop-shadow(0 8px 18px rgba(80,160,255,0.40))',
  'Vivid Sunset':   'drop-shadow(0 8px 16px rgba(20,28,80,0.45))',
  'Bright Day':     'drop-shadow(0 8px 16px rgba(40,88,160,0.32))',
}

/** Returns { gradient, shadow } for a mood, or null if mood isn't themed
 * (caller should fall back to the bundle's cloud-base.png). */
export function cloudStyleForMood(mood) {
  const gradient = MOOD_CLOUD_GRADIENTS[mood]
  if (!gradient) return null
  return {
    gradient,
    shadow: MOOD_CLOUD_SHADOWS[mood] || 'drop-shadow(0 8px 16px rgba(0,0,0,0.22))',
  }
}
