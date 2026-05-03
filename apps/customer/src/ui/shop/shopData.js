import { ITEM_CATALOGUE } from '../../data/items'

export const SHOP_MODES = [
  { key: 'object',   label: 'By Object',   icon: 'byObject',   emoji: '🛋️',  tagline: 'Furniture, lighting, decor & surfaces',    accent: '#3a2a5a' },
  { key: 'room',     label: 'By Room',     icon: 'byRoom',     emoji: '🏠',  tagline: 'Curated by where it lives in your home',   accent: '#1e3a4a' },
  { key: 'vibe',     label: 'By Vibe',     icon: 'byVibe',     emoji: '✨',  tagline: 'Match your aesthetic or discover a new one', accent: '#3a2a1a' },
  { key: 'color',    label: 'By Color',    icon: 'byColor',    emoji: '🎨',  tagline: 'Build your palette from the floor up',     accent: '#1a3a2a' },
  { key: 'function', label: 'By Function', icon: 'byFunction', emoji: '⚙️',  tagline: 'Shop for what the space needs to do',     accent: '#3a1a1a' },
]

export const OBJECT_BUCKETS = {
  'Furniture': { icon: 'furniture', emoji: '🛋️', tagline: 'Seating, tables, storage & bedroom', categories: ['Seating', 'Tables', 'Storage', 'Bedroom'] },
  'Lighting':  { icon: 'lighting',  emoji: '💡', tagline: 'Lamps, pendants, sconces & string lights', categories: ['Lighting'] },
  'Decor':     { icon: 'decor',     emoji: '🌿', tagline: 'Art, textiles, plants & specialty pieces', categories: ['Wall Decor', 'Textiles', 'Decor', 'Specialty'] },
  'Surfaces':  { icon: 'surfaces',  emoji: '🪵', tagline: 'Flooring, wallpaper & wall coverings',    categories: ['Flooring', 'Wallpaper'] },
}

export const ROOM_BUCKETS = [
  { key: 'Living Room', icon: 'livingRoom', emoji: '🛋️', tagline: 'Sofas, tables & ambiance' },
  { key: 'Bedroom',     icon: 'bedroom',    emoji: '🛏️', tagline: 'Beds, nightstands & linens' },
  { key: 'Kitchen',     icon: 'kitchen',    emoji: '🍳', tagline: 'Islands, stools & lighting' },
  { key: 'Office',      icon: 'office',     emoji: '💻', tagline: 'Desks, chairs & storage' },
  { key: 'Dining Room', icon: 'diningRoom', emoji: '🍽️', tagline: 'Tables, chairs & lighting' },
  { key: 'Kids Room',   icon: 'kidsRoom',   emoji: '🧸', tagline: 'Beds, storage & playful decor' },
  { key: 'Bathroom',    icon: 'bathroom',   emoji: '🛁', tagline: 'Mirrors, shelves & accents' },
  { key: 'Stairs',      icon: 'stairs',     emoji: '🪜', tagline: 'Runners & accent pieces' },
]

export const VIBE_BUCKETS = [
  { key: 'Cozy',          icon: 'cozy',         emoji: '☕', bg: '#3a2a1a' },
  { key: 'Modern',        icon: 'modern',       emoji: '⬛', bg: '#1e1e28' },
  { key: 'Minimalist',    icon: 'minimalist',   emoji: '⬜', bg: '#2a2a30' },
  { key: 'Dark Academia', icon: 'darkAcademia', emoji: '📚', bg: '#2a1a2a' },
  { key: 'Industrial',    icon: 'industrial',   emoji: '🔩', bg: '#2a2a1a' },
  { key: 'Cottagecore',   icon: 'cottagecore',  emoji: '🌸', bg: '#1a2a14' },
  { key: 'Tropical',      icon: 'tropical',     emoji: '🌴', bg: '#1a2a1e' },
  { key: 'Glam',          icon: 'glam',         emoji: '✨', bg: '#2a1a38' },
  { key: 'Rustic',        icon: 'rustic',       emoji: '🪵', bg: '#2a180a' },
  { key: 'Zen',           icon: 'zen',          emoji: '🎋', bg: '#182a1a' },
  { key: 'Kids',          icon: 'kids',         emoji: '🧸', bg: '#1a1e30' },
]

// Metallic gradient previews — render as CSS linear-gradient via `background:`.
// Stops mirror the SVG defs in `Shop Mode Icons (1).html`.
const GRAD_GOLD   = 'linear-gradient(to bottom, #fff3b8 0%, #e8c547 35%, #b8861c 65%, #f5d96a 100%)'
const GRAD_SILVER = 'linear-gradient(to bottom, #f8f8fa 0%, #c8c8d0 40%, #8a8a92 70%, #e0e0e6 100%)'
const GRAD_BRONZE = 'linear-gradient(to bottom, #d8a878 0%, #a06838 40%, #6a3c18 75%, #b88858 100%)'
const GRAD_COPPER = 'linear-gradient(to bottom, #f5b89a 0%, #c87848 40%, #8a3a18 75%, #d8845a 100%)'

export const COLOR_BUCKETS = [
  { key: 'Neutrals',      emoji: '🤍', preview: '#c8b8a0', families: ['Beige', 'White', 'Gray', 'Wood']  },
  { key: 'Black & Dark',  emoji: '🖤', preview: '#282828', families: ['Black', 'Charcoal']               },
  { key: 'White & Cream', emoji: '🏳️', preview: '#f0ece8', families: ['White']                           },
  { key: 'Red',           emoji: '🔴', preview: '#c0392b', families: ['Red']                             },
  { key: 'Orange',        emoji: '🟠', preview: '#e07a3a', families: ['Orange']                          },
  { key: 'Yellow',        emoji: '🟡', preview: '#e8c547', families: ['Yellow']                          },
  { key: 'Green',         emoji: '💚', preview: '#4a7a50', families: ['Green']                           },
  { key: 'Blue',          emoji: '💙', preview: '#3a5a8a', families: ['Blue']                            },
  { key: 'Pink & Blush',  emoji: '🩷', preview: '#c09090', families: ['Pink']                            },
  { key: 'Purple',        emoji: '💜', preview: '#7a5a9a', families: ['Purple']                          },
  { key: 'Earth Tones',   emoji: '🟫', preview: '#8a5a30', families: ['Brown', 'Red', 'Orange', 'Wood']  },
  { key: 'Gold',          emoji: '✨', preview: GRAD_GOLD,   families: ['Gold']                          },
  { key: 'Silver',        emoji: '⚪', preview: GRAD_SILVER, families: ['Silver']                        },
  { key: 'Bronze',        emoji: '🟫', preview: GRAD_BRONZE, families: ['Bronze']                        },
  { key: 'Copper',        emoji: '🟠', preview: GRAD_COPPER, families: ['Copper']                        },
]

export const FUNCTION_BUCKETS = [
  { key: 'Seating',   icon: 'seating',   emoji: '💺', tagline: 'Chairs, sofas & ottomans',     match: def => def.category === 'Seating' },
  { key: 'Storage',   icon: 'storage',   emoji: '🗄️', tagline: 'Organize your space',          match: def => def.category === 'Storage' },
  { key: 'Work',      icon: 'work',      emoji: '💻', tagline: 'Desks & office setups',         match: def => (def.rooms ?? []).includes('Office') || ['Desks', 'Desk Lamps', 'Gaming'].includes(def.subcategory) },
  { key: 'Relax',     icon: 'relax',     emoji: '😌', tagline: 'Unwind & decompress',           match: def => ['Sofas', 'Ottomans', 'Floor Lamps', 'Rugs', 'Throw Blankets', 'Candles', 'Chaise Lounges', 'Hanging Chairs', 'Bean Bags', 'Floor Cushions'].includes(def.subcategory) },
  { key: 'Entertain', icon: 'entertain', emoji: '🍸', tagline: 'Host & socialize',              match: def => ['Dining Tables', 'Dining Chairs', 'Bar & Counter Tables', 'Bar & Entertaining', 'Chandeliers'].includes(def.subcategory) },
  { key: 'Sleep',     icon: 'sleep',     emoji: '🛏️', tagline: 'Bedroom & rest',                match: def => def.category === 'Bedroom' || ['Rugs', 'Curtains', 'Throw Blankets', 'Pillows'].includes(def.subcategory) },
  { key: 'Display',   icon: 'display',   emoji: '🖼️', tagline: 'Showcase & style',              match: def => ['Wall Shelves', 'Bookshelves', 'Art Prints', 'Mirrors', 'Picture Frames', 'Wall Decals', 'Tapestries', 'Sculptures'].includes(def.subcategory) },
]

export const CATEGORY_META = {
  'Seating':    { emoji: '🛋️', tagline: 'Sofas, chairs & more' },
  'Tables':     { emoji: '🪑', tagline: 'Dining, coffee & desks' },
  'Storage':    { emoji: '🗄️', tagline: 'Shelves, dressers & cabinets' },
  'Bedroom':    { emoji: '🛏️', tagline: 'Beds, nightstands & more' },
  'Wall Decor': { emoji: '🖼️', tagline: 'Art, mirrors & shelves' },
  'Lighting':   { emoji: '💡', tagline: 'Lamps, pendants & string lights' },
  'Textiles':   { emoji: '🧵', tagline: 'Rugs, pillows & curtains' },
  'Decor':      { emoji: '🌿', tagline: 'Plants, vases & accents' },
  'Specialty':  { emoji: '🎮', tagline: 'Gaming, kids & seasonal' },
  'Flooring':   { emoji: '🪵', tagline: 'Hardwood, tile, carpet & more' },
  'Wallpaper':  { emoji: '🏠', tagline: 'Peel & stick, grasscloth & murals' },
}

export const SUBCATEGORY_META = {
  'Sofas': { emoji: '🛋️' }, 'Accent Chairs': { emoji: '💺' }, 'Recliners': { emoji: '🛋️' },
  'Dining Chairs': { emoji: '🪑' }, 'Benches': { emoji: '🪑' }, 'Ottomans': { emoji: '⬛' },
  'Floor Cushions': { emoji: '🧸' }, 'Bean Bags': { emoji: '💜' }, 'Barstools': { emoji: '🍺' },
  'Chaise Lounges': { emoji: '😌' }, 'Hanging Chairs': { emoji: '🪐' },
  'Dining Tables': { emoji: '🍽️' }, 'Coffee Tables': { emoji: '☕' }, 'Side Tables': { emoji: '📦' },
  'Console Tables': { emoji: '🖼️' }, 'Desks': { emoji: '💻' }, 'Bar & Counter Tables': { emoji: '🍸' },
  'Nesting Tables': { emoji: '🔲' }, 'Kitchen Islands': { emoji: '👨‍🍳' },
  'Bookshelves': { emoji: '📚' }, 'Cabinets': { emoji: '🗄️' }, 'Dressers': { emoji: '🗂️' },
  'TV Stands': { emoji: '📺' }, 'Wardrobes': { emoji: '👔' }, 'Sideboards': { emoji: '🗃️' },
  'Shoe Racks': { emoji: '👟' }, 'Entryway Units': { emoji: '🚪' },
  'Bed Frames': { emoji: '🛏️' }, 'Nightstands': { emoji: '🌙' }, 'Bunk Beds': { emoji: '🪜' },
  'Daybeds': { emoji: '😴' }, 'Cribs & Baby': { emoji: '👶' }, 'Vanity Tables': { emoji: '💄' },
  'Mirrors': { emoji: '🪞' }, 'Art Prints': { emoji: '🖼️' }, 'Wall Shelves': { emoji: '📚' },
  'Tapestries': { emoji: '🎭' }, 'Wall Clocks': { emoji: '🕐' }, 'Macramé': { emoji: '🧵' },
  'Floor Lamps': { emoji: '🔦' }, 'Table Lamps': { emoji: '🕯️' }, 'String Lights': { emoji: '✨' },
  'Chandeliers': { emoji: '💡' }, 'Desk Lamps': { emoji: '🔦' }, 'Wall Sconces': { emoji: '🕯️' },
  'Rugs': { emoji: '🎨' }, 'Pillows': { emoji: '💤' }, 'Curtains': { emoji: '🪟' },
  'Runner Rugs': { emoji: '🛤️' }, 'Throw Blankets': { emoji: '🧶' },
  'Plants': { emoji: '🌿' }, 'Vases': { emoji: '🏺' }, 'Candles': { emoji: '🕯️' },
  'Sculptures': { emoji: '🗿' }, 'Book Displays': { emoji: '📚' }, 'Trays': { emoji: '🫙' },
  'Scent & Ambiance': { emoji: '🌸' }, 'Wall Decals': { emoji: '🎭' }, 'Banners': { emoji: '🚩' },
  'Picture Frames': { emoji: '🖼️' }, 'Terrariums': { emoji: '🌱' },
  'Gaming': { emoji: '🎮' }, 'Kids': { emoji: '🧸' }, 'Bar & Entertaining': { emoji: '🍸' },
  'Fireplaces': { emoji: '🔥' }, 'Fitness': { emoji: '💪' }, 'Seasonal': { emoji: '🎄' },
  'Hardwood': { emoji: '🪵' }, 'Luxury Vinyl': { emoji: '⬜' }, 'Ceramic Tile': { emoji: '🟦' },
  'Carpet': { emoji: '🟫' }, 'Concrete': { emoji: '🏢' },
  'Peel & Stick': { emoji: '📌' }, 'Grasscloth': { emoji: '🌾' },
  'Shiplap & Paneling': { emoji: '🪵' }, 'Murals': { emoji: '🎨' },
}

export const MAX_PRICE = 1500
export const ALL_TYPES = [...new Set(Object.values(ITEM_CATALOGUE).map(d => d.subcategory).filter(Boolean))].sort()

export const initFilters = () => ({ priceMax: MAX_PRICE, styles: [], rooms: [], themes: [], colorFamilies: [], types: [] })

export function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export function matchesFilters(def, f) {
  if (def.price > f.priceMax) return false
  if (f.styles.length        && !f.styles.some(s        => (def.styles   ?? []).includes(s)))              return false
  if (f.rooms.length         && !f.rooms.some(r          => (def.rooms    ?? []).includes(r)))              return false
  if (f.themes.length        && !f.themes.some(t         => (def.themes   ?? []).includes(t)))             return false
  if (f.colorFamilies.length && !f.colorFamilies.some(c  => (def.swatches ?? []).some(sw => sw.family === c))) return false
  if (f.types.length         && !f.types.includes(def.subcategory))                                         return false
  return true
}

export function matchesSearch(def, term) {
  if (!term) return true
  const t = term.toLowerCase()
  return (
    def.label.toLowerCase().includes(t)                                           ||
    (def.category    || '').toLowerCase().includes(t)                             ||
    (def.subcategory || '').toLowerCase().includes(t)                             ||
    (def.brand       || '').toLowerCase().includes(t)                             ||
    (def.styles   ?? []).some(s  => s.toLowerCase().includes(t))                 ||
    (def.rooms    ?? []).some(r  => r.toLowerCase().includes(t))                 ||
    (def.themes   ?? []).some(th => th.toLowerCase().includes(t))                ||
    (def.swatches ?? []).some(sw => sw.family && sw.family.toLowerCase().includes(t))
  )
}
