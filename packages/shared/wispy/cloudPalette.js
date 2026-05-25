// Per-mood Wispy recipes — verbatim port of MOOD_RECIPES from the
// bundle's picker/wispy.jsx. Each recipe ships:
//   stops — 4-stop linear gradient for the cloud body fill
//   ink   — color for the face PNG mask + limb fill
//   glow  — color for the soft aura behind the cloud
//
// This is the canonical mood→palette mapping Hayley curated in the
// picker. Don't substitute scene-cloud gradients here — those are tuned
// for a totally different rendering pipeline (big photographic field
// clouds), and they don't have `ink` or `glow` companion values.

export const MOOD_RECIPES = {
  'Dream State':            { stops: ['#e8e0f5', '#f0d8e8', '#f8d0d8', '#fcd4c8'], ink: '#2a1848', glow: 'rgba(158,118,240,0.40)' },
  'Golden Hour':            { stops: ['#fdf0d8', '#fce0b8', '#fcd0a0', '#f8b890'], ink: '#5a2e08', glow: 'rgba(220,150,40,0.40)' },
  'Bright Day':             { stops: ['#edf5e4', '#dceedc', '#cce4cc', '#bcd8b8'], ink: '#1a3a14', glow: 'rgba(70,170,70,0.35)'  },
  'Blush Hour':             { stops: ['#fde8e4', '#fdd0cc', '#fcb8b0', '#f4a098'], ink: '#5a1816', glow: 'rgba(220,138,120,0.40)' },
  'Coastal Morning':        { stops: ['#e8eef6', '#d8e4f0', '#c4d8ec', '#b0cce4'], ink: '#0c1e40', glow: 'rgba(60,128,200,0.35)'  },
  'Moonlight':              { stops: ['#dde4f0', '#c8d2e4', '#b4c2d8', '#a0b0c8'], ink: '#0b0f1e', glow: 'rgba(80,100,200,0.45)'  },
  'Vivid Sunset':           { stops: ['#fce8d0', '#fcc0a8', '#f898ac', '#d870b0'], ink: '#3a0820', glow: 'rgba(255,140,100,0.55)' },
  'Neon Nights':            { stops: ['#ece4f8', '#e0c8f8', '#d8a8fc', '#c884fa'], ink: '#28006c', glow: 'rgba(158,38,240,0.55)'  },
  'Northern Lights':        { stops: ['#e8f8f0', '#c8f0e0', '#a8e8cc', '#7cd8b4'], ink: '#04201a', glow: 'rgba(1,239,172,0.45)'   },
  'Dark Academia':          { stops: ['#f4e8c8', '#e8d0a0', '#dcb878', '#b89858'], ink: '#1a0a04', glow: 'rgba(180,128,38,0.40)'  },
  'Candlelit Cozy Evening': { stops: ['#fce4b8', '#fcc888', '#fca858', '#ec8838'], ink: '#1a0802', glow: 'rgba(238,158,38,0.50)'  },
  'Greenhouse':             { stops: ['#dcecdc', '#bce0c4', '#9cd0a8', '#7cb88c'], ink: '#04140a', glow: 'rgba(58,148,58,0.45)'   },
  'Studio':                 { stops: ['#fcfcfc', '#f0f0f0', '#e0e0e0', '#cccccc'], ink: '#101010', glow: 'rgba(0,0,0,0.10)'       },
  'Studio Dark':            { stops: ['#48484a', '#5a5a5c', '#6c6c6e', '#7c7c7e'], ink: '#f0f0f0', glow: 'rgba(200,200,200,0.18)' },
  "Ember's Sunrise":        { stops: ['#f8d0c8', '#fcb8a4', '#ec8898', '#a47cbc'], ink: '#2a0820', glow: 'rgba(255,210,140,0.40)' },
}

// Used when no mood is provided. Mirrors picker's PALETTES.dusk.
export const DEFAULT_RECIPE = {
  stops: ['#e8e0f5', '#f0d8e8', '#f8d0d8', '#fcd4c8'],
  ink:   '#2a1638',
  glow:  'rgba(180,140,230,0.40)',
}

/** Resolve a mood name → palette recipe. Falls back to dusk. */
export function recipeForMood(mood) {
  return MOOD_RECIPES[mood] || DEFAULT_RECIPE
}
