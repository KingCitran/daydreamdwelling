// Per-mood Wispy recipes. Each recipe ships:
//   gradient — full CSS gradient string for the cloud body fill
//   ink      — color for the face PNG mask + leg fill
//   glow     — color for the aura behind the cloud (currently unused;
//              kept so callers can render a glow halo if they want)
//
// Body-fill gradients come from TWO sources:
//   - The 9 moods that ALSO theme the scene's cloud field
//     (Dream State, Golden Hour, Moonlight, Blush Hour, Coastal Morning,
//     Greenhouse, Neon Nights, Vivid Sunset, Bright Day) use the EXACT
//     gradient from apps/customer/src/scene/CloudConveyorPuffs.jsx's
//     MOOD_THEMES.tintGradient so Wispy reads as one of the same clouds
//     in the room. These are saturated/dramatic.
//   - The 6 moods the scene doesn't theme (Northern Lights, Dark Academia,
//     Candlelit Cozy Evening, Studio, Studio Dark, Ember's Sunrise) use
//     the picker/wispy.jsx MOOD_RECIPES pastels because there's no scene
//     equivalent to defer to.
//
// ink + glow values come from picker/wispy.jsx MOOD_RECIPES for ALL
// moods — that's where Hayley's curated face-color decisions live.

export const MOOD_RECIPES = {
  // ── Scene-themed moods: use scene's tintGradient ──────────────────────
  'Dream State':            {
    gradient: 'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
    ink: '#2a1848', glow: 'rgba(158,118,240,0.40)',
  },
  'Golden Hour':            {
    gradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    ink: '#5a2e08', glow: 'rgba(220,150,40,0.40)',
  },
  'Moonlight':              {
    gradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    ink: '#0b0f1e', glow: 'rgba(80,100,200,0.45)',
  },
  'Blush Hour':             {
    gradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    ink: '#5a1816', glow: 'rgba(220,138,120,0.40)',
  },
  'Coastal Morning':        {
    gradient: 'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
    ink: '#0c1e40', glow: 'rgba(60,128,200,0.35)',
  },
  'Greenhouse':             {
    gradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    ink: '#04140a', glow: 'rgba(58,148,58,0.45)',
  },
  'Neon Nights':            {
    gradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    ink: '#28006c', glow: 'rgba(158,38,240,0.55)',
  },
  'Vivid Sunset':           {
    gradient: 'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
    ink: '#3a0820', glow: 'rgba(255,140,100,0.55)',
  },
  'Bright Day':             {
    gradient: 'linear-gradient(180deg, #ffffff 0%, #f0f8ff 15%, #c8dcf0 38%, #88b0d8 60%, #5080b8 82%, #2858a0 100%)',
    ink: '#1a3a14', glow: 'rgba(70,170,70,0.35)',
  },

  // ── Picker-only moods: scene doesn't theme these, use picker pastels ──
  'Northern Lights':        {
    gradient: 'linear-gradient(170deg, #e8f8f0 0%, #c8f0e0 38%, #a8e8cc 70%, #7cd8b4 100%)',
    ink: '#04201a', glow: 'rgba(1,239,172,0.45)',
  },
  'Dark Academia':          {
    gradient: 'linear-gradient(170deg, #f4e8c8 0%, #e8d0a0 38%, #dcb878 70%, #b89858 100%)',
    ink: '#1a0a04', glow: 'rgba(180,128,38,0.40)',
  },
  'Candlelit Cozy Evening': {
    gradient: 'linear-gradient(170deg, #fce4b8 0%, #fcc888 38%, #fca858 70%, #ec8838 100%)',
    ink: '#1a0802', glow: 'rgba(238,158,38,0.50)',
  },
  'Studio':                 {
    gradient: 'linear-gradient(170deg, #fcfcfc 0%, #f0f0f0 38%, #e0e0e0 70%, #cccccc 100%)',
    ink: '#101010', glow: 'rgba(0,0,0,0.10)',
  },
  'Studio Dark':            {
    gradient: 'linear-gradient(170deg, #48484a 0%, #5a5a5c 38%, #6c6c6e 70%, #7c7c7e 100%)',
    ink: '#f0f0f0', glow: 'rgba(200,200,200,0.18)',
  },
  "Ember's Sunrise":        {
    gradient: 'linear-gradient(170deg, #f8d0c8 0%, #fcb8a4 38%, #ec8898 70%, #a47cbc 100%)',
    ink: '#2a0820', glow: 'rgba(255,210,140,0.40)',
  },
}

// Used when no mood is provided. Picker's dusk pastel.
export const DEFAULT_RECIPE = {
  gradient: 'linear-gradient(170deg, #e8e0f5 0%, #f0d8e8 38%, #f8d0d8 70%, #fcd4c8 100%)',
  ink:      '#2a1638',
  glow:     'rgba(180,140,230,0.40)',
}

/** Resolve a mood name → palette recipe. Falls back to DEFAULT_RECIPE. */
export function recipeForMood(mood) {
  return MOOD_RECIPES[mood] || DEFAULT_RECIPE
}
