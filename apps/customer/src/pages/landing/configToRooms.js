// Convert landing_hero_config rooms (admin format) → endlessRooms format
// so RotatingRoom + LandingRoomScene can render them identically.

const DARK_MOODS = new Set(['Neon Nights', 'Moonlight'])

// Mood → sky gradient (matches LandingPage.jsx SKY_BY_MOOD)
const SKY_GRADIENTS = {
  'Golden Hour':     'linear-gradient(180deg,#b85a55,#e88a3e 55%,#ffe39a)',
  'Coastal Morning': 'linear-gradient(180deg,#5a8cb8,#a8c4d8 55%,#ffd896)',
  'Dream State':     'linear-gradient(180deg,#ffe8d0,#ffd8d0 35%,#e8c8e0 65%,#a890d4)',
  'Greenhouse':      'linear-gradient(180deg,#a8d896,#e0e8b0 55%,#fff5d0)',
  'Neon Nights':     'linear-gradient(180deg,#0c0828,#160e3a 55%,#2a1862)',
  'Blush Hour':      'linear-gradient(180deg,#f0c4b8,#f4d0c0 40%,#e4d0dc 70%,#c8b8dc)',
  'Moonlight':       'linear-gradient(180deg,#050918,#0c1530 55%,#2a3868)',
  'Vivid Sunset':    'linear-gradient(180deg,#1a2a5a,#a8b8d0 55%,#e8a040)',
  'Bright Day':      'linear-gradient(180deg,#3a6fb8,#a8c8e4 55%,#ffe4c0)',
  "Ember's Sunrise": 'linear-gradient(180deg,#1a0a08,#3a1808 40%,#8a3818 70%,#e8a040)',
  'Studio':          'linear-gradient(180deg,#e8e8e8,#f0f0f0 55%,#fafafa)',
  'Studio Dark':     'linear-gradient(180deg,#1a1a1a,#2a2a2a 55%,#3a3a3a)',
}

const MOOD_ACCENTS = {
  'Golden Hour': '#c87820', 'Coastal Morning': '#1a60b8', 'Dream State': '#9870c0',
  'Greenhouse': '#389848', 'Neon Nights': '#c848f0', 'Blush Hour': '#c06858',
  'Moonlight': '#5070c8', 'Vivid Sunset': '#e8602a', 'Bright Day': '#a9744a',
  "Ember's Sunrise": '#e8602a', 'Studio': '#888888', 'Studio Dark': '#aaaaaa',
}

function grad(hex) { return `linear-gradient(160deg,${hex},${hex})` }
function darken(hex, amt = 20) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - amt), g = Math.max(0, ((n >> 8) & 0xff) - amt), b = Math.max(0, (n & 0xff) - amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * Convert one admin config room → endlessRooms format
 * @param {object} adminRoom - from config.rooms[] (has sourceId, name, data, palette, mood)
 * @returns {object} room in endlessRooms format
 */
export function convertRoom(adminRoom) {
  const d = adminRoom.data ? (typeof adminRoom.data === 'string' ? JSON.parse(adminRoom.data) : adminRoom.data) : {}
  const mood = adminRoom.mood || d.mood || d.lightMood || 'Bright Day'
  const isDark = DARK_MOODS.has(mood)
  const accent = MOOD_ACCENTS[mood] || '#a9744a'
  const wc = d.wallColor || '#f0ece4'
  const fc = d.floorColor || '#d8c4a8'

  return {
    name: adminRoom.name || 'Untitled',
    mood,
    accent,
    dark: isDark,
    gridW: d.gridW || 10,
    gridD: d.gridD || 10,
    wallHeight: d.wallHeight || 10,
    floorTex: d.floorTexture || 'wood',
    wallTex: d.wallTexture || 'plaster',
    sky: SKY_GRADIENTS[mood] || SKY_GRADIENTS['Bright Day'],
    wall: grad(wc),
    side: grad(darken(wc, 15)),
    floor: grad(fc),
    art: grad(accent),
    seat: grad(darken(wc, 30)),
    feature: 'window',
    items: d.items || [],
    palette: adminRoom.palette || null,
  }
}

// Brand room — kept as the default DaydreamDwelling signature room
const BRAND_ROOM = {
  name: 'DaydreamDwelling', mood: 'Bright Day', accent: '#a9744a', dark: false, brand: true,
  gridW: 10, gridD: 10, wallHeight: 10, floorTex: 'woodDark', wallTex: 'plaster',
  sky: 'linear-gradient(180deg,#3a6fb8,#a8c8e4 55%,#ffe4c0)',
  wall: 'linear-gradient(160deg,#f6efe2,#ede1cc)', side: 'linear-gradient(160deg,#f0e6d4,#e4d5bc)',
  floor: 'linear-gradient(160deg,#bd8a52,#96683a)',
  seat: 'linear-gradient(180deg,#c08a4e,#96662f)', seatType: 'none', feature: 'dWindows',
  table: 'linear-gradient(180deg,#bd8a52,#8a5f34)', shade: 'radial-gradient(ellipse at 50% 30%,#fff6e0,#f0d9ac)',
  art: 'linear-gradient(160deg,#c89a62,#a9744a)', plant: '#8aa06a',
  items: [],
  palette: { chips: ['#f6efe2','#e6d0ae','#bd8a52','#7a5a34'],
    fab: [['#dcb98a','rgba(150,105,60,0.28)'],['#c89a62','rgba(120,80,40,0.28)'],['#efe2cc','rgba(150,120,80,0.22)']],
    lamp: 'radial-gradient(circle at 35% 30%,#fff6e0,#f0d9ac)', wood: ['#bd8a52','#8a5f34'], dot: 'linear-gradient(135deg,#dcb98a,#bd8a52)' },
  brandBack: 'Daydream Dwelling',
  brandSide: '✦ every room, in every light',
}

/**
 * Convert full admin config → rooms array with brand room inserted
 * @param {object} config - landing_hero_config row
 * @returns {object[]} rooms in endlessRooms format, with brand room interleaved
 */
export function configToRooms(config) {
  const rooms = (config.rooms || []).map(convertRoom)
  const brandInterval = config.brand_interval || config.brandInterval || 2
  const result = []
  for (let i = 0; i < rooms.length; i++) {
    result.push(rooms[i])
    if ((i + 1) % brandInterval === 0) result.push(BRAND_ROOM)
  }
  return result
}
