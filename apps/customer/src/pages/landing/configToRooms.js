// Convert landing_hero_config rooms (admin format) → endlessRooms format
// so RotatingRoom + LandingRoomScene can render them identically.

import { supabase } from '@shared/supabase'

const DARK_MOODS = new Set(['Neon Nights', 'Moonlight'])

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

// Auto-generate palette from room data (wall/floor colors + accent)
function autoPalette(d, accent) {
  const wc = d.wallColor || '#f0ece4'
  const fc = d.floorColor || '#d8c4a8'
  return {
    chips: [wc, fc, accent, darken(fc, 40)],
    fab: [[darken(wc, 30), 'rgba(120,100,70,0.25)'], [accent, 'rgba(100,80,50,0.25)'], [fc, 'rgba(110,90,60,0.25)']],
    lamp: `radial-gradient(circle at 35% 30%,${wc},${fc})`,
    wood: [fc, darken(fc, 30)],
    dot: `linear-gradient(135deg,${fc},${accent})`,
  }
}

function convertRoom(adminRoom, liveData) {
  // Use live data from saved_rooms if available, fall back to config snapshot
  const d = liveData || (adminRoom.data ? (typeof adminRoom.data === 'string' ? JSON.parse(adminRoom.data) : adminRoom.data) : {})
  const mood = d.mood || d.lightMood || adminRoom.mood || 'Bright Day'
  const isDark = DARK_MOODS.has(mood)
  const accent = MOOD_ACCENTS[mood] || '#a9744a'
  const wc = d.wallColor || '#f0ece4'
  const fc = d.floorColor || '#d8c4a8'

  // Use custom palette if set, otherwise auto-generate from room colors
  const palette = adminRoom.palette || autoPalette(d, accent)

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
    palette,
  }
}

const BRAND_ROOM = {
  name: 'DaydreamDwelling', mood: 'Dream State', accent: '#9870c0', dark: false, brand: true,
  gridW: 10, gridD: 10, wallHeight: 10, floorTex: 'woodDark', wallTex: 'plaster',
  sky: 'linear-gradient(180deg,#ffe8d0,#ffd8d0 35%,#e8c8e0 65%,#a890d4)',
  wall: 'linear-gradient(160deg,#c8b0d8,#b898c8)', side: 'linear-gradient(160deg,#bca4cc,#a890bc)',
  floor: 'linear-gradient(160deg,#d8c4b0,#b8a490)',
  seat: 'linear-gradient(180deg,#c8a8d0,#a880b8)', seatType: 'none', feature: 'dWindows',
  table: 'linear-gradient(180deg,#d8c8b8,#b8a898)', shade: 'radial-gradient(ellipse at 50% 30%,#f8e8ff,#d8c0e8)',
  art: 'linear-gradient(160deg,#c8a0d8,#9868b0)', plant: '#88a878',
  items: [],
  palette: { chips: ['#f0e8f4','#d8c4b0','#9870c0','#88a878'],
    fab: [['#c8a8d0','rgba(120,80,150,0.22)'],['#b898c4','rgba(100,60,130,0.25)'],['#d8c8b8','rgba(140,120,100,0.20)']],
    lamp: 'radial-gradient(circle at 35% 30%,#f8e8ff,#d8c0e8)', wood: ['#d8c8b8','#b8a898'], dot: 'linear-gradient(135deg,#c8a0d8,#9868b0)' },
  brandBack: 'Daydream Dwelling',
  brandSide: '✦ every room, in every light',
}

/**
 * Fetch published config and convert to endlessRooms format.
 * Fetches LIVE room data from saved_rooms (not stale config snapshots).
 * Returns null if no published config.
 */
export async function fetchPublishedRooms() {
  const { data: configs } = await supabase
    .from('landing_hero_config')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)

  const config = configs?.[0]
  if (!config?.rooms?.length) return null

  // Collect all room IDs that need live data from saved_rooms
  const savedIds = config.rooms
    .filter(r => r.sourceType === 'saved' && r.sourceId)
    .map(r => r.sourceId)
  const communityRoomIds = config.rooms
    .filter(r => r.sourceType === 'community' && r.roomId)
    .map(r => r.roomId)
  const allIds = [...new Set([...savedIds, ...communityRoomIds])]

  let liveDataMap = {}
  if (allIds.length > 0) {
    const { data: liveRows } = await supabase
      .from('saved_rooms')
      .select('id, data')
      .in('id', allIds)
    if (liveRows) {
      liveDataMap = Object.fromEntries(liveRows.map(r => [r.id, r.data]))
    }
  }

  // Convert each room using live data — skip rooms with no usable data
  const rooms = config.rooms
    .map(adminRoom => {
      const fetchId = adminRoom.sourceType === 'saved' ? adminRoom.sourceId : adminRoom.roomId
      const liveData = fetchId ? liveDataMap[fetchId] : null
      // Skip community rooms with no linked room data
      if (!liveData && !adminRoom.data) return null
      return convertRoom(adminRoom, liveData)
    })
    .filter(Boolean)

  // Always start with brand room, then interleave after every N rooms
  const brandInterval = config.brand_interval || 2
  const result = [BRAND_ROOM]
  for (let i = 0; i < rooms.length; i++) {
    result.push(rooms[i])
    if ((i + 1) % brandInterval === 0) result.push(BRAND_ROOM)
  }
  return result
}
