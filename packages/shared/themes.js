/**
 * DaydreamDwelling — Shared Mood Color Tokens
 *
 * Each mood defines a full color palette used by all 3 apps.
 * Components use useTheme() to get the active palette — never hardcode colors.
 *
 * Tokens:
 *   bg            — page/app background
 *   surface       — card / panel background (rgba)
 *   surfaceBorder — card border (rgba)
 *   navBg         — sticky header background (rgba + blur)
 *   navBorder     — header bottom border
 *   text          — primary text
 *   textSoft      — secondary / muted text
 *   accent        — primary action color (buttons, links, active states)
 *   accentText    — text on accent-colored buttons
 *   glow          — rgba for atmospheric orb / glow effects
 *
 * Builder-specific tokens (always dark — for panels overlaid on the 3D scene):
 *   canvasBg      — 3D canvas / app wrapper background (always very dark)
 *   panelBg       — builder panel / card background
 *   panelSurface  — elevated elements within panels (buttons, list items)
 *   panelBorder   — border color for builder panels
 *   panelText     — primary text on dark builder panels
 *   panelTextSoft — muted text on dark builder panels
 */

export const MOOD_THEMES = {
  'Golden Hour': {
    bg:            '#fdf5e4',
    surface:       'rgba(255,252,240,0.75)',
    surfaceBorder: 'rgba(200,155,60,0.35)',
    navBg:         'rgba(253,245,228,0.92)',
    navBorder:     'rgba(200,155,60,0.12)',
    text:          '#2e1e08',
    textSoft:      '#8a6a30',
    accent:        '#c87820',
    accentText:    '#fff',
    glow:          'rgba(220,150,40,0.18)',
    canvasBg:      '#0f0a04',
    panelBg:       '#fdf0d4',
    panelSurface:  '#f8e8c0',
    panelBorder:   'rgba(180,130,40,0.30)',
    panelText:     '#3a2808',
    panelTextSoft: '#8a6a30',
  },
  'Bright Day': {
    bg:            '#f7faf4',
    surface:       'rgba(255,255,255,0.78)',
    surfaceBorder: 'rgba(100,160,90,0.32)',
    navBg:         'rgba(247,250,244,0.92)',
    navBorder:     'rgba(100,160,90,0.12)',
    text:          '#182814',
    textSoft:      '#5a7a48',
    accent:        '#3a7a4a',
    accentText:    '#fff',
    glow:          'rgba(70,170,70,0.15)',
    canvasBg:      '#061008',
    panelBg:       '#eef6ec',
    panelSurface:  '#e0f0dc',
    panelBorder:   'rgba(60,140,60,0.25)',
    panelText:     '#1a3018',
    panelTextSoft: '#4a7840',
  },
  // Vivid Sunset — striking sunset reflected on still water.
  // Magenta/purple sky, gold/orange horizon. Peak warmth without going dark.
  'Vivid Sunset': {
    bg:            '#1a0820',
    surface:       'rgba(180,60,140,0.35)',
    surfaceBorder: 'rgba(255,170,80,0.32)',
    navBg:         'rgba(20,8,28,0.92)',
    navBorder:     'rgba(255,170,80,0.18)',
    text:          '#fff5d4',
    textSoft:      '#e8a8c4',
    accent:        '#ffaa3d',
    accentText:    '#1a0820',
    glow:          'rgba(255,140,100,0.28)',
    canvasBg:      '#0e041a',
    panelBg:       '#180828',
    panelSurface:  '#221038',
    panelBorder:   'rgba(237,106,184,0.32)',
    panelText:     '#fff5d4',
    panelTextSoft: '#c890a8',
  },
  // Ember's Sunrise — animated theme that lightens over 5 minutes from
  // pre-dawn (this static palette = t=0 fallback) through golden sunrise to a
  // pale pastel morning. ThemeProvider interpolates EMBER_SUNRISE_KEYFRAMES.
  // Named after the founder's daughter Ember.
  "Ember's Sunrise": {
    bg:            '#1a1438',
    surface:       'rgba(60,40,90,0.6)',
    surfaceBorder: 'rgba(255,220,150,0.3)',
    navBg:         'rgba(20,16,44,0.92)',
    navBorder:     'rgba(255,220,150,0.18)',
    text:          '#f0e8d8',
    textSoft:      '#c8a8d8',
    accent:        '#ffe0a0',
    accentText:    '#1a1438',
    glow:          'rgba(255,210,140,0.22)',
    canvasBg:      '#0e0820',
    panelBg:       '#1c1638',
    panelSurface:  '#28204a',
    panelBorder:   'rgba(220,180,210,0.3)',
    panelText:     '#f0e8d8',
    panelTextSoft: '#a890c0',
  },
  'Moonlight': {
    bg:            '#090c16',
    surface:       'rgba(255,255,255,0.04)',
    surfaceBorder: 'rgba(130,155,220,0.15)',
    navBg:         'rgba(7,9,20,0.92)',
    navBorder:     'rgba(130,155,220,0.1)',
    text:          '#c8d0e8',
    textSoft:      '#6070a8',
    accent:        '#5070c8',
    accentText:    '#fff',
    glow:          'rgba(80,100,200,0.18)',
    canvasBg:      '#06080e',
    panelBg:       '#0e1220',
    panelSurface:  '#161c30',
    panelBorder:   'rgba(100,130,210,0.28)',
    panelText:     '#c0cce8',
    panelTextSoft: '#5060a0',
  },
  // Northern Lights — deep midnight sky with aurora green/cyan washes.
  'Northern Lights': {
    bg:            '#040814',
    surface:       'rgba(1,200,174,0.14)',
    surfaceBorder: 'rgba(1,239,172,0.28)',
    navBg:         'rgba(4,8,20,0.92)',
    navBorder:     'rgba(1,239,172,0.14)',
    text:          '#d8f0e8',
    textSoft:      '#7090b0',
    accent:        '#01efac',
    accentText:    '#040814',
    glow:          'rgba(1,239,172,0.25)',
    canvasBg:      '#02060e',
    panelBg:       '#080e1c',
    panelSurface:  '#0e1830',
    panelBorder:   'rgba(82,64,148,0.4)',
    panelText:     '#d8f0e8',
    panelTextSoft: '#5070a0',
  },
  'Dark Academia': {
    bg:            '#130d07',
    surface:       'rgba(50,32,12,0.65)',
    surfaceBorder: 'rgba(180,138,55,0.2)',
    navBg:         'rgba(14,9,4,0.92)',
    navBorder:     'rgba(180,138,55,0.12)',
    text:          '#e8d8a8',
    textSoft:      '#a08838',
    accent:        '#b88828',
    accentText:    '#1a1004',
    glow:          'rgba(180,128,38,0.18)',
    canvasBg:      '#0a0806',
    panelBg:       '#180f08',
    panelSurface:  '#241608',
    panelBorder:   'rgba(160,120,45,0.32)',
    panelText:     '#e8d8a8',
    panelTextSoft: '#9a8038',
  },
  'Blush Hour': {
    bg:            '#fdf0ee',
    surface:       'rgba(255,248,246,0.78)',
    surfaceBorder: 'rgba(200,138,128,0.35)',
    navBg:         'rgba(253,240,238,0.92)',
    navBorder:     'rgba(200,138,128,0.12)',
    text:          '#3a1816',
    textSoft:      '#9a5e58',
    accent:        '#c06858',
    accentText:    '#fff',
    glow:          'rgba(220,138,120,0.18)',
    canvasBg:      '#100808',
    panelBg:       '#fdf0ec',
    panelSurface:  '#f8e4de',
    panelBorder:   'rgba(200,120,110,0.28)',
    panelText:     '#3a1816',
    panelTextSoft: '#9a5e58',
  },
  'Coastal Morning': {
    bg:            '#f0f6fc',
    surface:       'rgba(255,255,255,0.78)',
    surfaceBorder: 'rgba(70,138,200,0.32)',
    navBg:         'rgba(240,246,252,0.92)',
    navBorder:     'rgba(70,138,200,0.12)',
    text:          '#0c1e40',
    textSoft:      '#4070a8',
    accent:        '#1a60b8',
    accentText:    '#fff',
    glow:          'rgba(60,128,200,0.18)',
    canvasBg:      '#060c14',
    panelBg:       '#e8f0fa',
    panelSurface:  '#dae8f6',
    panelBorder:   'rgba(60,120,185,0.25)',
    panelText:     '#0c1e40',
    panelTextSoft: '#4070a8',
  },
  'Dream State': {
    bg:            '#ede9ff',
    surface:       'rgba(255,255,255,0.65)',
    surfaceBorder: 'rgba(180,158,220,0.35)',
    navBg:         'rgba(237,233,255,0.92)',
    navBorder:     'rgba(180,158,220,0.12)',
    text:          '#2a1848',
    textSoft:      '#8a78a8',
    accent:        '#7a48cc',
    accentText:    '#fff',
    glow:          'rgba(158,118,240,0.18)',
    canvasBg:      '#100e20',
    panelBg:       '#ece8ff',
    panelSurface:  '#e0daff',
    panelBorder:   'rgba(150,120,210,0.28)',
    panelText:     '#2a1848',
    panelTextSoft: '#7a68a8',
  },
  'Neon Nights': {
    bg:            '#07070f',
    surface:       'rgba(255,255,255,0.04)',
    surfaceBorder: 'rgba(158,55,240,0.2)',
    navBg:         'rgba(5,5,12,0.92)',
    navBorder:     'rgba(158,55,240,0.12)',
    text:          '#e8e0ff',
    textSoft:      '#7855c8',
    accent:        '#9828f0',
    accentText:    '#fff',
    glow:          'rgba(158,38,240,0.22)',
    canvasBg:      '#04040c',
    panelBg:       '#0a0a18',
    panelSurface:  '#100e24',
    panelBorder:   'rgba(140,35,220,0.32)',
    panelText:     '#e0d8ff',
    panelTextSoft: '#7060b8',
  },
  // Candlelit Cozy Evening — warm interior: lamp + amber + intimate glow.
  // (Renamed from "Candlelight" — absorbs the original cozy interior feel.)
  'Candlelit Cozy Evening': {
    bg:            '#0f0902',
    surface:       'rgba(58,28,6,0.65)',
    surfaceBorder: 'rgba(220,158,58,0.18)',
    navBg:         'rgba(10,6,1,0.92)',
    navBorder:     'rgba(220,158,58,0.1)',
    text:          '#f0d8a0',
    textSoft:      '#a07530',
    accent:        '#e09828',
    accentText:    '#1a0c02',
    glow:          'rgba(238,158,38,0.2)',
    canvasBg:      '#0c0802',
    panelBg:       '#180e04',
    panelSurface:  '#221606',
    panelBorder:   'rgba(200,140,30,0.32)',
    panelText:     '#f0d8a0',
    panelTextSoft: '#9a7030',
  },
  'Greenhouse': {
    bg:            '#07100a',
    surface:       'rgba(255,255,255,0.04)',
    surfaceBorder: 'rgba(75,158,75,0.15)',
    navBg:         'rgba(5,10,6,0.92)',
    navBorder:     'rgba(75,158,75,0.1)',
    text:          '#c8e8c8',
    textSoft:      '#558855',
    accent:        '#389848',
    accentText:    '#fff',
    glow:          'rgba(58,148,58,0.18)',
    canvasBg:      '#040a06',
    panelBg:       '#0a1410',
    panelSurface:  '#121e18',
    panelBorder:   'rgba(60,140,60,0.28)',
    panelText:     '#c8e8c8',
    panelTextSoft: '#508850',
  },
  'Studio': {
    bg:            '#f4f4f4',
    surface:       'rgba(255,255,255,0.88)',
    surfaceBorder: 'rgba(0,0,0,0.22)',
    navBg:         'rgba(244,244,244,0.96)',
    navBorder:     'rgba(0,0,0,0.08)',
    text:          '#101010',
    textSoft:      '#646464',
    accent:        '#181818',
    accentText:    '#fff',
    glow:          'rgba(0,0,0,0.07)',
    canvasBg:      '#111111',
    panelBg:       '#f8f8f8',
    panelSurface:  '#efefef',
    panelBorder:   'rgba(0,0,0,0.12)',
    panelText:     '#101010',
    panelTextSoft: '#646464',
  },
  'Studio Dark': {
    bg:            '#181818',
    surface:       'rgba(255,255,255,0.05)',
    surfaceBorder: 'rgba(255,255,255,0.1)',
    navBg:         'rgba(18,18,18,0.96)',
    navBorder:     'rgba(255,255,255,0.08)',
    text:          '#f0f0f0',
    textSoft:      '#808080',
    accent:        '#c0c0c0',
    accentText:    '#111111',
    glow:          'rgba(200,200,200,0.07)',
    canvasBg:      '#101010',
    panelBg:       '#1e1e1e',
    panelSurface:  '#2a2a2a',
    panelBorder:   'rgba(120,120,120,0.3)',
    panelText:     '#f0f0f0',
    panelTextSoft: '#808080',
  },
}

// Per-app default mood (shown before profile loads / for logged-out users)
export const APP_MOOD_DEFAULTS = {
  customer: 'Dream State',
  outdoor:  'Dream State',
  seller:   'Dream State',
  admin:    'Dream State',
}

// ─── Ember's Sunrise — animated theme ────────────────────────────────────────
// Five keyframes interpolated by ThemeProvider over EMBER_SUNRISE_DURATION_MS.
// Starts in deep bonfire ember, lightens through dawn, ends on pastel pink/blue/lilac.
// Special — named after the founder's daughter Ember.
export const EMBER_SUNRISE_DURATION_MS = 5 * 60 * 1000

export const EMBER_SUNRISE_KEYFRAMES = [
  // t=0 — PRE-DAWN: deep purple-blue sky, lavender mid, pale yellow horizon glow, sun below
  {
    bg:'#1a1438', surface:'rgba(60,40,90,0.6)', surfaceBorder:'rgba(255,220,150,0.3)',
    navBg:'rgba(20,16,44,0.92)', navBorder:'rgba(255,220,150,0.18)',
    text:'#f0e8d8', textSoft:'#c8a8d8',
    accent:'#ffe0a0', accentText:'#1a1438',
    glow:'rgba(255,210,140,0.22)',
    canvasBg:'#0e0820', panelBg:'#1c1638', panelSurface:'#28204a',
    panelBorder:'rgba(220,180,210,0.3)', panelText:'#f0e8d8', panelTextSoft:'#a890c0',
  },
  // t=0.25 — SUN BREAKING: orange dominating horizon, pink mid, lavender high sky
  {
    bg:'#3a1f48', surface:'rgba(120,50,70,0.6)', surfaceBorder:'rgba(255,180,90,0.4)',
    navBg:'rgba(40,20,52,0.94)', navBorder:'rgba(255,180,90,0.24)',
    text:'#fff0d8', textSoft:'#ffc0b0',
    accent:'#fe9b22', accentText:'#3a1f48',
    glow:'rgba(255,140,80,0.28)',
    canvasBg:'#221038', panelBg:'#341a48', panelSurface:'#44225c',
    panelBorder:'rgba(255,140,100,0.36)', panelText:'#fff0d8', panelTextSoft:'#ffc0c0',
  },
  // t=0.5 — GOLDEN SUNRISE: blue-purple top, pink mid, gold + orange horizon
  {
    bg:'#5a3878', surface:'rgba(120,60,100,0.65)', surfaceBorder:'rgba(255,200,120,0.45)',
    navBg:'rgba(60,36,80,0.94)', navBorder:'rgba(255,200,120,0.3)',
    text:'#fff8e0', textSoft:'#ffd0d8',
    accent:'#ffc870', accentText:'#3a1f48',
    glow:'rgba(255,180,120,0.26)',
    canvasBg:'#3c1f5a', panelBg:'#4a2868', panelSurface:'#5a3478',
    panelBorder:'rgba(255,180,160,0.4)', panelText:'#fff8e0', panelTextSoft:'#ffd0d8',
  },
  // t=0.75 — RISING SUN: pale blue spreading, soft pink + peach + golden horizon
  {
    bg:'#9088c8', surface:'rgba(110,90,160,0.65)', surfaceBorder:'rgba(255,220,180,0.5)',
    navBg:'rgba(120,108,170,0.94)', navBorder:'rgba(255,220,180,0.36)',
    text:'#fffaee', textSoft:'#ffe8e8',
    accent:'#ffd070', accentText:'#2a1858',
    glow:'rgba(255,220,170,0.24)',
    canvasBg:'#7060b8', panelBg:'#8074c0', panelSurface:'#9084d0',
    panelBorder:'rgba(255,200,180,0.42)', panelText:'#fffaee', panelTextSoft:'#ffe0e8',
  },
  // t=1.0 — MORNING: pale blue sky, pale yellow sun, soft pink hints, white clouds
  {
    bg:'#cce0f0', surface:'rgba(255,253,235,0.75)', surfaceBorder:'rgba(220,210,180,0.5)',
    navBg:'rgba(220,232,242,0.92)', navBorder:'rgba(220,210,180,0.3)',
    text:'#1e3a5f', textSoft:'#5e7a9a',
    accent:'#fcd34d', accentText:'#1e3a5f',
    glow:'rgba(255,245,200,0.3)',
    canvasBg:'#b8d0e8', panelBg:'#fffbeb', panelSurface:'#fff5d4',
    panelBorder:'rgba(200,200,170,0.45)', panelText:'#1e3a5f', panelTextSoft:'#5e7a9a',
  },
]

// Ambient sky gradient — rendered as a fixed-position layer behind app content.
// Each keyframe is [top, upper-mid, lower-mid, horizon] going from sky to horizon.
// Includes pale yellow sun light at the endpoint per the founder's request.
export const EMBER_SUNRISE_GRADIENT_KEYFRAMES = [
  // t=0 — PRE-DAWN: deep purple-blue top, lavender, pink, pale yellow horizon (sun below)
  ['#1a1438', '#3a2858', '#a06080', '#fde0a0'],
  // t=0.25 — SUN BREAKING: dusky lavender top, pink mid, orange bright horizon
  ['#2a1c50', '#5a3878', '#d06090', '#fe9b22'],
  // t=0.5 — GOLDEN SUNRISE: blue-purple, pink, gold halo, bright orange horizon
  ['#3a2870', '#7c3a78', '#ed6ab8', '#ffaa3d'],
  // t=0.75 — RISING: pale blue-lavender, soft pink, peach, golden horizon
  ['#7080c0', '#c098d0', '#ffb890', '#ffd070'],
  // t=1.0 — MORNING: pale blue sky, white-blue, pale yellow sun, soft peach-pink horizon
  ['#a8c8e8', '#cfe2f0', '#fff5d4', '#ffe0d0'],
]

// Returns array of 4 hex stops for the current sunrise progress.
export function computeSunriseGradient(progress) {
  const kf = EMBER_SUNRISE_GRADIENT_KEYFRAMES
  const p = Math.max(0, Math.min(1, progress))
  if (p >= 1) return kf[kf.length - 1]
  const segs = kf.length - 1
  const seg = Math.floor(p * segs)
  const localT = (p * segs) - seg
  const a = kf[seg]
  const b = kf[seg + 1]
  return a.map((c, i) => lerpColor(c, b[i], localT))
}

// Color interpolation helpers
function lerpHex(a, b, t) {
  const ra = parseInt(a.slice(1,3),16), ga = parseInt(a.slice(3,5),16), ba = parseInt(a.slice(5,7),16)
  const rb = parseInt(b.slice(1,3),16), gb = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16)
  const r = Math.round(ra + (rb-ra)*t), g = Math.round(ga + (gb-ga)*t), v = Math.round(ba + (bb-ba)*t)
  return '#' + [r,g,v].map(n => n.toString(16).padStart(2,'0')).join('')
}
function lerpRgba(a, b, t) {
  const m = (s) => s.match(/[\d.]+/g).map(Number)
  const [ra,ga,ba,aa=1] = m(a)
  const [rb,gb,bb,ab=1] = m(b)
  const r = Math.round(ra + (rb-ra)*t)
  const g = Math.round(ga + (gb-ga)*t)
  const v = Math.round(ba + (bb-ba)*t)
  const av = +(aa + (ab-aa)*t).toFixed(3)
  return `rgba(${r},${g},${v},${av})`
}
function lerpColor(a, b, t) {
  if (typeof a !== 'string' || typeof b !== 'string') return a
  return a.startsWith('#') ? lerpHex(a, b, t) : lerpRgba(a, b, t)
}

// Returns the interpolated palette for a 0..1 progress value through the keyframes.
export function interpolateTheme(keyframes, progress) {
  const p = Math.max(0, Math.min(1, progress))
  const segs = keyframes.length - 1
  if (p >= 1) return keyframes[segs]
  const seg = Math.floor(p * segs)
  const localT = (p * segs) - seg
  const a = keyframes[seg]
  const b = keyframes[seg + 1]
  const out = {}
  for (const key of Object.keys(a)) out[key] = lerpColor(a[key], b[key], localT)
  return out
}
