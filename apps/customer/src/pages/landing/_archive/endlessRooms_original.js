// The six rooms of the Endless Room hero — one per revolution.
// Each has interior materials, a designer palette for the exterior boards,
// a mood sky, dark flag for text color flips, and curated item layouts.
// Item typeKeys reference ITEM_CATALOGUE entries (data/items.js).

// Shared room dimensions (in builder feet — scaled down for the miniature)
const GW = 10, GD = 10, WH = 10
// Wall decor: window on back wall, art on side wall
// windowX = position along back wall (0-1), artZ = position along side wall (0-1)
// artColor = the art's accent color

export const ROOMS = [
  { name: 'The reading nook', mood: 'Golden Hour', accent: '#c87820', dark: false,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'wood', wallTex: 'plaster',
    sky: 'linear-gradient(180deg,#b85a55,#e88a3e 55%,#ffe39a)',
    wall: 'linear-gradient(160deg,#f6ede0,#ecdcc6)', side: 'linear-gradient(160deg,#eaddc9,#dcc9ac)',
    floor: 'linear-gradient(160deg,#e7cfa8,#d3ac7e)', rug: 'radial-gradient(ellipse,#d99b6a,#c47f4c)',
    seat: 'linear-gradient(180deg,#b98f5e,#9a6f42)', seatType: 'sofa', feature: 'window',
    table: 'linear-gradient(180deg,#a9855c,#8a663f)', shade: 'radial-gradient(ellipse at 50% 30%,#ffe6b0,#e8b860)',
    art: 'linear-gradient(160deg,#e89a5a,#c8683c)', plant: '#6a8a52',
    items: [
      { typeKey: 'sofa',        col: 2.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 1 },
      { typeKey: 'coffeeTable', col: 3.5, row: 4,    rotation: 0, sizeIndex: 0, swatchIndex: 2 },
      { typeKey: 'floorLamp',   col: 8.5, row: 0.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'chair',       col: 7,   row: 4.5,  rotation: 270, sizeIndex: 1, swatchIndex: 1 },
      { typeKey: 'plant',       col: 0.5, row: 8,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'rug',         col: 2,   row: 2.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'bookshelf',   col: 0.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 1 },
    ],
    palette: { chips: ['#f6ede0','#d3ac7e','#9a6f42','#6a8a52'],
      fab: [['#e8c9a0','rgba(160,120,70,0.25)'],['#c47f4c','rgba(120,70,30,0.25)'],['#b98f5e','rgba(110,80,40,0.25)']],
      lamp: 'radial-gradient(circle at 35% 30%,#ffe6b0,#e8b860)', wood: ['#c9a87e','#a9855c'], dot: 'linear-gradient(135deg,#e7cfa8,#d3ac7e)' } },

  { name: 'The coastal studio', mood: 'Coastal Morning', accent: '#1a60b8', dark: false,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'tile', wallTex: 'drywall',
    sky: 'linear-gradient(180deg,#5a8cb8,#a8c4d8 55%,#ffd896)',
    wall: 'linear-gradient(160deg,#f2f7fb,#dceaf5)', side: 'linear-gradient(160deg,#e2eef7,#c8dcec)',
    floor: 'linear-gradient(160deg,#eee3d2,#dcc9ad)', rug: 'radial-gradient(ellipse,#a9c6dd,#7ba6c8)',
    seat: 'linear-gradient(180deg,#6f9bc4,#4c78a4)', seatType: 'sofa', feature: 'window',
    table: 'linear-gradient(180deg,#d8c6a8,#b89e78)', shade: 'radial-gradient(ellipse at 50% 30%,#eaf4fb,#bcd8ee)',
    art: 'linear-gradient(160deg,#7db0d4,#4c88b8)', plant: '#7aa06a',
    items: [
      { typeKey: 'loveseat',    col: 3,   row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 2 },
      { typeKey: 'sideTable',   col: 7,   row: 1,    rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'floorLamp',   col: 0.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'plant',       col: 0.5, row: 8,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'coffeeTable', col: 3.5, row: 4,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'rug',         col: 2,   row: 2,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'floorLamp',   col: 8.5, row: 5,    rotation: 0, sizeIndex: 0, swatchIndex: 0 },
    ],
    palette: { chips: ['#f2f7fb','#a8c4d8','#4c78a4','#d8c6a8'],
      fab: [['#a9c6dd','rgba(60,100,140,0.25)'],['#7ba6c8','rgba(40,80,120,0.28)'],['#dcc9ad','rgba(140,110,70,0.22)']],
      lamp: 'radial-gradient(circle at 35% 30%,#eaf4fb,#bcd8ee)', wood: ['#e2d5bd','#c4ac85'], dot: 'linear-gradient(135deg,#a9c6dd,#7ba6c8)' } },

  { name: 'The daydream', mood: 'Dream State', accent: '#9870c0', dark: false,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'carpet', wallTex: 'plaster',
    sky: 'linear-gradient(180deg,#ffe8d0,#ffd8d0 35%,#e8c8e0 65%,#a890d4)',
    wall: 'linear-gradient(160deg,#f0e8f4,#e4d8ee)', side: 'linear-gradient(160deg,#ece0f0,#d8c8e4)',
    floor: 'linear-gradient(160deg,#e8ddd0,#d4c4b0)', rug: 'radial-gradient(ellipse,#d0b8d8,#b898c4)',
    seat: 'linear-gradient(180deg,#c8a8d0,#a880b8)', seatType: 'sofa', feature: 'window',
    table: 'linear-gradient(180deg,#d8c8b8,#b8a898)', shade: 'radial-gradient(ellipse at 50% 30%,#f8e8ff,#d8c0e8)',
    art: 'linear-gradient(160deg,#c8a0d8,#9868b0)', plant: '#88a878',
    items: [
      { typeKey: 'sofa',        col: 2.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'coffeeTable', col: 3.5, row: 4,    rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'floorLamp',   col: 8.5, row: 0.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'floorLamp',   col: 0.5, row: 4,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'rug',         col: 2,   row: 2.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'plant',       col: 0.5, row: 8,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'chair',       col: 7,   row: 4.5,  rotation: 270, sizeIndex: 0, swatchIndex: 0 },
    ],
    palette: { chips: ['#f0e8f4','#d0b8d8','#a880b8','#88a878'],
      fab: [['#c8a8d0','rgba(120,80,150,0.22)'],['#b898c4','rgba(100,60,130,0.25)'],['#d8c8b8','rgba(140,120,100,0.20)']],
      lamp: 'radial-gradient(circle at 35% 30%,#f8e8ff,#d8c0e8)', wood: ['#d8c8b8','#b8a898'], dot: 'linear-gradient(135deg,#c8a0d8,#9868b0)' } },

  { name: 'The greenhouse', mood: 'Greenhouse', accent: '#389848', dark: false,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'wood', wallTex: 'shiplap',
    sky: 'linear-gradient(180deg,#a8d896,#e0e8b0 55%,#fff5d0)',
    wall: 'linear-gradient(160deg,#eef6e6,#d6e8c8)', side: 'linear-gradient(160deg,#e0eed2,#c2dcae)',
    floor: 'linear-gradient(160deg,#d8b48c,#bd935f)', rug: 'radial-gradient(ellipse,#c9d6a0,#a8bd78)',
    seat: 'linear-gradient(180deg,#c8a878,#a8875a)', seatType: 'sofa', feature: 'window',
    table: 'linear-gradient(180deg,#b89a6a,#96774a)', shade: 'radial-gradient(ellipse at 50% 30%,#f4ffe0,#c2e89a)',
    art: 'linear-gradient(160deg,#7ec06a,#4a9848)', plant: '#4a9848',
    items: [
      { typeKey: 'sofa',        col: 2.5, row: 0.5,  rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'coffeeTable', col: 3,   row: 4,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'plant',       col: 0.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'plant',       col: 8,   row: 8,    rotation: 0, sizeIndex: 0, swatchIndex: 2 },
      { typeKey: 'rug',         col: 2,   row: 2,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'chair',       col: 7,   row: 3,    rotation: 270, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'floorLamp',   col: 8.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
    ],
    palette: { chips: ['#eef6e6','#c2dcae','#8aa06a','#d8b48c'],
      fab: [['#c9d6a0','rgba(100,120,60,0.25)'],['#a8bd78','rgba(80,100,45,0.28)'],['#c8a878','rgba(130,100,60,0.25)']],
      lamp: 'radial-gradient(circle at 35% 30%,#f4ffe0,#c2e89a)', wood: ['#d8b48c','#bd935f'], dot: 'linear-gradient(135deg,#7ec06a,#4a9848)' } },

  { name: 'The loft', mood: 'Neon Nights', accent: '#c848f0', dark: true,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'concrete', wallTex: 'concrete',
    sky: 'linear-gradient(180deg,#0c0828,#160e3a 55%,#2a1862)',
    wall: 'linear-gradient(160deg,#241c34,#181026)', side: 'linear-gradient(160deg,#1c1428,#120c1e)',
    floor: 'linear-gradient(160deg,#302840,#201a2e)', rug: 'radial-gradient(ellipse,#7a2ea8,#4a1a6a)',
    seat: 'linear-gradient(180deg,#3a3050,#282038)', seatType: 'sofa', feature: 'window',
    table: 'linear-gradient(180deg,#4a3a5c,#302442)', shade: 'radial-gradient(ellipse at 50% 30%,#f4b0ff,#c848f0)',
    art: 'linear-gradient(160deg,#e858c8,#8a2ef0)', plant: '#5aa0c8',
    items: [
      { typeKey: 'sofa',        col: 2.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 2 },
      { typeKey: 'coffeeTable', col: 3.5, row: 4,    rotation: 0, sizeIndex: 0, swatchIndex: 2 },
      { typeKey: 'floorLamp',   col: 8.5, row: 0.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'rug',         col: 2,   row: 2,    rotation: 0, sizeIndex: 0, swatchIndex: 2 },
      { typeKey: 'tvStand',     col: 5.5, row: 0.5,  rotation: 0, sizeIndex: 0, swatchIndex: 0 },
      { typeKey: 'plant',       col: 0.5, row: 8,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'floorLamp',   col: 0.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
    ],
    palette: { chips: ['#241c34','#302840','#7a2ea8','#c848f0'],
      fab: [['#3a3050','rgba(255,255,255,0.10)'],['#7a2ea8','rgba(255,255,255,0.12)'],['#282038','rgba(200,72,240,0.20)']],
      lamp: 'radial-gradient(circle at 35% 30%,#f4b0ff,#c848f0)', wood: ['#4a3a5c','#302442'], dot: 'linear-gradient(135deg,#e858c8,#8a2ef0)' } },

  { name: 'The retreat', mood: 'Blush Hour', accent: '#c06858', dark: false,
    gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'woodDark', wallTex: 'drywall',
    sky: 'linear-gradient(180deg,#ffc0b4,#f4b0c0 55%,#c8b8dc)',
    wall: 'linear-gradient(160deg,#faeee9,#f2d8d2)', side: 'linear-gradient(160deg,#f2ded8,#e4c4bc)',
    floor: 'linear-gradient(160deg,#eaddce,#d4bda8)', rug: 'radial-gradient(ellipse,#e0aca0,#c98878)',
    seat: 'linear-gradient(180deg,#d4a0a8,#b87e88)', seatType: 'bed', feature: 'window',
    table: 'linear-gradient(180deg,#c9a898,#a98576)', shade: 'radial-gradient(ellipse at 50% 30%,#ffe4dc,#f0b4a8)',
    art: 'linear-gradient(160deg,#e8a0a0,#c86868)', plant: '#8aa06a',
    items: [
      { typeKey: 'bed',         col: 2.5, row: 0.5,  rotation: 0, sizeIndex: 2, swatchIndex: 2 },
      { typeKey: 'sideTable',   col: 7,   row: 1,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'sideTable',   col: 0.5, row: 1,    rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'floorLamp',   col: 8.5, row: 0.5,  rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'plant',       col: 0.5, row: 8,    rotation: 0, sizeIndex: 1, swatchIndex: 0 },
      { typeKey: 'rug',         col: 2,   row: 2.5,  rotation: 0, sizeIndex: 0, swatchIndex: 1 },
      { typeKey: 'floorLamp',   col: 0.5, row: 5,    rotation: 0, sizeIndex: 0, swatchIndex: 0 },
    ],
    palette: { chips: ['#faeee9','#e4c4bc','#b87e88','#8aa06a'],
      fab: [['#e0aca0','rgba(150,80,70,0.22)'],['#c98878','rgba(120,60,50,0.25)'],['#d4a0a8','rgba(140,70,85,0.22)']],
      lamp: 'radial-gradient(circle at 35% 30%,#ffe4dc,#f0b4a8)', wood: ['#d9c4ae','#b89a80'], dot: 'linear-gradient(135deg,#e8a0a0,#c86868)' } },
]

// Brand room — warm earthy signature room with D-shaped windows + D rug.
// Appears after every 2 regular rooms in the cycle.
const BRAND_ROOM = {
  name: 'DaydreamDwelling', mood: 'Bright Day', accent: '#a9744a', dark: false, brand: true,
  gridW: GW, gridD: GD, wallHeight: WH, floorTex: 'woodDark', wallTex: 'plaster',
  sky: 'linear-gradient(180deg,#3a6fb8,#a8c8e4 55%,#ffe4c0)',
  wall: 'linear-gradient(160deg,#f6efe2,#ede1cc)', side: 'linear-gradient(160deg,#f0e6d4,#e4d5bc)',
  floor: 'linear-gradient(160deg,#bd8a52,#96683a)', rug: 'radial-gradient(ellipse,#dcbb8e,#c9a06a)',
  seat: 'linear-gradient(180deg,#c08a4e,#96662f)', seatType: 'none', feature: 'dWindows',
  table: 'linear-gradient(180deg,#bd8a52,#8a5f34)', shade: 'radial-gradient(ellipse at 50% 30%,#fff6e0,#f0d9ac)',
  art: 'linear-gradient(160deg,#c89a62,#a9744a)', plant: '#8aa06a',
  items: [], // no furniture — just the D windows and D rug
  palette: { chips: ['#f6efe2','#e6d0ae','#bd8a52','#7a5a34'],
    fab: [['#dcb98a','rgba(150,105,60,0.28)'],['#c89a62','rgba(120,80,40,0.28)'],['#efe2cc','rgba(150,120,80,0.22)']],
    lamp: 'radial-gradient(circle at 35% 30%,#fff6e0,#f0d9ac)', wood: ['#bd8a52','#8a5f34'], dot: 'linear-gradient(135deg,#dcb98a,#bd8a52)' },
  brandBack: 'Daydream Dwelling',
  brandSide: '✦ every room, in every light',
}

// Build the final rotation: regular rooms with brand room inserted after every 2
const _regular = ROOMS
export const ROOMS_WITH_BRAND = []
for (let i = 0; i < _regular.length; i++) {
  ROOMS_WITH_BRAND.push(_regular[i])
  if ((i + 1) % 2 === 0) ROOMS_WITH_BRAND.push(BRAND_ROOM)
}

// Neutral cloud-white exterior — what you see from behind
export const EXT_BG = 'linear-gradient(158deg,#f2f6fb,#dbe4ef)'
export const EXT_SHADOW = 'inset 0 0 60px rgba(90,120,160,0.16), inset 0 2px 0 rgba(255,255,255,0.7)'
