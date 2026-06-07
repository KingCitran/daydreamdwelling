// Mood themes — subset of the product's token system, extended with nav + scene
// tokens so the whole builder chrome re-tints to the active mood.
// Tokens: bg, surface, surfaceBorder, text, textSoft, accent, accentText,
//         navBg, glow, isDark, floor, wallL, wallR, grid
window.MOODS = {
  'Dream State': {
    label: 'Dream State', desc: 'Soft pastel lavender', isDark: false,
    bg: '#ece7ff', surface: 'rgba(255,255,255,0.74)', surfaceBorder: 'rgba(150,120,200,0.30)',
    text: '#2a1848', textSoft: '#7c6aa0', accent: '#7a48cc', accentText: '#fff',
    navBg: 'rgba(255,255,255,0.82)', glow: 'rgba(158,118,240,0.20)',
    sky: 'linear-gradient(180deg, #ddd2ff 0%, #f3e6ff 55%, #fde6f2 100%)',
    floor: '#d9cdf0', wallL: '#c3b3e4', wallR: '#b3a1da', grid: 'rgba(90,60,150,0.16)',
  },
  'Golden Hour': {
    label: 'Golden Hour', desc: 'Warm amber sunset', isDark: false,
    bg: '#fbf1dd', surface: 'rgba(255,251,242,0.80)', surfaceBorder: 'rgba(190,140,55,0.32)',
    text: '#2e1e08', textSoft: '#8a6a30', accent: '#c87820', accentText: '#fff',
    navBg: 'rgba(255,250,238,0.86)', glow: 'rgba(220,150,40,0.20)',
    sky: 'linear-gradient(180deg, #ffe6b8 0%, #ffeccb 50%, #ffe0d0 100%)',
    floor: '#ecd6ab', wallL: '#e3c391', wallR: '#d8b67e', grid: 'rgba(140,90,20,0.16)',
  },
  'Moonlight': {
    label: 'Moonlight', desc: 'Cool blue-silver night', isDark: true,
    bg: '#0b0f1c', surface: 'rgba(255,255,255,0.06)', surfaceBorder: 'rgba(130,155,220,0.20)',
    text: '#d2d9ef', textSoft: '#7e8cba', accent: '#5e7ee0', accentText: '#fff',
    navBg: 'rgba(17,22,40,0.86)', glow: 'rgba(80,110,210,0.22)',
    sky: 'linear-gradient(180deg, #0a0e1c 0%, #131a32 60%, #1d2440 100%)',
    floor: '#1c2440', wallL: '#222c4e', wallR: '#1a2340', grid: 'rgba(150,175,240,0.14)',
  },
};
window.MOOD_KEYS = Object.keys(window.MOODS);

// Neutral "Studio" theme — the plain, un-themed baseline for design handoff.
// Claude Code swaps these tokens for the mood palettes above; layout stays put.
window.STUDIO = {
  label: 'Studio', desc: 'Neutral baseline — recolor me', isDark: false,
  bg: '#eef0f3', surface: 'rgba(255,255,255,0.92)', surfaceBorder: 'rgba(30,40,60,0.14)',
  text: '#1f2632', textSoft: '#6b7686', accent: '#3d4a5c', accentText: '#fff',
  navBg: 'rgba(255,255,255,0.94)', glow: 'rgba(60,74,92,0.14)',
  sky: 'linear-gradient(180deg, #e4e7ec 0%, #eef0f3 60%, #f4f5f7 100%)',
  floor: '#dfe3e8', wallL: '#cfd5dd', wallR: '#c2c9d2', grid: 'rgba(40,55,75,0.14)',
};

// Tool identity — small per-tool accent chips (kept playful across moods).
window.TOOLS = {
  place: { label: 'Place', icon: 'place', tint: '#e87fc8', desc: 'Shop & place furniture' },
  build: { label: 'Build', icon: 'build', tint: '#3fb88a', desc: 'Walls, doors, windows' },
  style: { label: 'Style', icon: 'swatch', tint: '#9b7ae0', desc: 'Paint, floor & mood' },
  view:  { label: 'View',  icon: 'eye',    tint: '#5ea8c8', desc: 'Zoom, camera, capture' },
  music: { label: 'Music', icon: 'music',  tint: '#8a78e0', desc: 'Stations & playlists' },
  plan:  { label: 'Plan',  icon: 'plan',   tint: '#5bb0c8', desc: 'Budget & measurements' },
  social:{ label: 'Social',icon: 'users',  tint: '#e87fa0', desc: 'Community & contests' },
  account:{label: 'Account',icon:'user',   tint: '#5fb88a', desc: 'Profile & orders' },
};
