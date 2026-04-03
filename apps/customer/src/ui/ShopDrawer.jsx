import { useState, useMemo, useEffect } from 'react'
import { ITEM_CATALOGUE, CATEGORIES, SUBCATEGORIES, ALL_STYLES, ALL_ROOMS, ALL_THEMES, ALL_COLOR_FAMILIES } from '../data/items'

// ── Top-level navigation modes ────────────────────────────────────
const SHOP_MODES = [
  { key: 'object',   label: 'By Object',   emoji: '🛋️',  tagline: 'Furniture, lighting, decor & surfaces',  accent: '#3a2a5a' },
  { key: 'room',     label: 'By Room',     emoji: '🏠',  tagline: 'Curated by where it lives in your home',  accent: '#1e3a4a' },
  { key: 'vibe',     label: 'By Vibe',     emoji: '✨',  tagline: 'Match your aesthetic or discover a new one', accent: '#3a2a1a' },
  { key: 'color',    label: 'By Color',    emoji: '🎨',  tagline: 'Build your palette from the floor up',    accent: '#1a3a2a' },
  { key: 'function', label: 'By Function', emoji: '⚙️',  tagline: 'Shop for what the space needs to do',    accent: '#3a1a1a' },
]

// Object mode — maps to existing categories
const OBJECT_BUCKETS = {
  'Furniture': { emoji: '🛋️', tagline: 'Seating, tables, storage & bedroom', categories: ['Seating', 'Tables', 'Storage', 'Bedroom'] },
  'Lighting':  { emoji: '💡', tagline: 'Lamps, pendants, sconces & string lights', categories: ['Lighting'] },
  'Decor':     { emoji: '🌿', tagline: 'Art, textiles, plants & specialty pieces', categories: ['Wall Decor', 'Textiles', 'Decor', 'Specialty'] },
  'Surfaces':  { emoji: '🪵', tagline: 'Flooring, wallpaper & wall coverings',    categories: ['Flooring', 'Wallpaper'] },
}

// Room mode — maps to room tags on items
const ROOM_BUCKETS = [
  { key: 'Living Room', emoji: '🛋️', tagline: 'Sofas, tables & ambiance' },
  { key: 'Bedroom',     emoji: '🛏️', tagline: 'Beds, nightstands & linens' },
  { key: 'Kitchen',     emoji: '🍳', tagline: 'Islands, stools & lighting' },
  { key: 'Office',      emoji: '💻', tagline: 'Desks, chairs & storage' },
  { key: 'Dining Room', emoji: '🍽️', tagline: 'Tables, chairs & lighting' },
  { key: 'Kids Room',   emoji: '🧸', tagline: 'Beds, storage & playful decor' },
  { key: 'Bathroom',    emoji: '🛁', tagline: 'Mirrors, shelves & accents' },
  { key: 'Stairs',      emoji: '🪜', tagline: 'Runners & accent pieces' },
]

// Vibe mode — maps to theme tags
const VIBE_BUCKETS = [
  { key: 'Cozy',          emoji: '☕', bg: '#3a2a1a' },
  { key: 'Modern',        emoji: '⬛', bg: '#1e1e28' },
  { key: 'Minimalist',    emoji: '⬜', bg: '#2a2a30' },
  { key: 'Dark Academia', emoji: '📚', bg: '#2a1a2a' },
  { key: 'Industrial',    emoji: '🔩', bg: '#2a2a1a' },
  { key: 'Cottagecore',   emoji: '🌸', bg: '#1a2a14' },
  { key: 'Tropical',      emoji: '🌴', bg: '#1a2a1e' },
  { key: 'Glam',          emoji: '✨', bg: '#2a1a38' },
  { key: 'Rustic',        emoji: '🪵', bg: '#2a180a' },
  { key: 'Zen',           emoji: '🎋', bg: '#182a1a' },
  { key: 'Kids',          emoji: '🧸', bg: '#1a1e30' },
]

// Color mode — maps to swatch families
const COLOR_BUCKETS = [
  { key: 'Neutrals',     emoji: '🤍', preview: '#c8b8a0', families: ['Beige', 'White', 'Gray', 'Wood']   },
  { key: 'Black & Dark', emoji: '🖤', preview: '#282828', families: ['Black', 'Charcoal']               },
  { key: 'White & Cream',emoji: '🏳️', preview: '#f0ece8', families: ['White']                            },
  { key: 'Green',        emoji: '💚', preview: '#4a7a50', families: ['Green']                            },
  { key: 'Blue',         emoji: '💙', preview: '#3a5a8a', families: ['Blue']                             },
  { key: 'Pink & Blush', emoji: '🩷', preview: '#c09090', families: ['Pink']                             },
  { key: 'Purple',       emoji: '💜', preview: '#7a5a9a', families: ['Purple']                           },
  { key: 'Earth Tones',  emoji: '🟫', preview: '#8a5a30', families: ['Brown', 'Red', 'Orange', 'Wood']  },
]

// Function mode — maps to categories / subcategories / room tags
const FUNCTION_BUCKETS = [
  { key: 'Seating',   emoji: '💺', tagline: 'Chairs, sofas & ottomans',     match: def => def.category === 'Seating' },
  { key: 'Storage',   emoji: '🗄️', tagline: 'Organize your space',          match: def => def.category === 'Storage' },
  { key: 'Work',      emoji: '💻', tagline: 'Desks & office setups',         match: def => (def.rooms ?? []).includes('Office') || ['Desks', 'Desk Lamps', 'Gaming'].includes(def.subcategory) },
  { key: 'Relax',     emoji: '😌', tagline: 'Unwind & decompress',           match: def => ['Sofas', 'Ottomans', 'Floor Lamps', 'Rugs', 'Throw Blankets', 'Candles', 'Chaise Lounges', 'Hanging Chairs', 'Bean Bags', 'Floor Cushions'].includes(def.subcategory) },
  { key: 'Entertain', emoji: '🍸', tagline: 'Host & socialize',              match: def => ['Dining Tables', 'Dining Chairs', 'Bar & Counter Tables', 'Bar & Entertaining', 'Chandeliers'].includes(def.subcategory) },
  { key: 'Sleep',     emoji: '🛏️', tagline: 'Bedroom & rest',                match: def => def.category === 'Bedroom' || ['Rugs', 'Curtains', 'Throw Blankets', 'Pillows'].includes(def.subcategory) },
  { key: 'Display',   emoji: '🖼️', tagline: 'Showcase & style',              match: def => ['Wall Shelves', 'Bookshelves', 'Art Prints', 'Mirrors', 'Picture Frames', 'Wall Decals', 'Tapestries', 'Sculptures'].includes(def.subcategory) },
]

// Category metadata (for Object path)
const CATEGORY_META = {
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

// Subcategory metadata
const SUBCATEGORY_META = {
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

const MAX_PRICE = 1500
const ALL_TYPES = [...new Set(Object.values(ITEM_CATALOGUE).map(d => d.subcategory).filter(Boolean))].sort()
const initFilters = () => ({ priceMax: MAX_PRICE, styles: [], rooms: [], themes: [], colorFamilies: [], types: [] })

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function matchesFilters(def, f) {
  if (def.price > f.priceMax) return false
  if (f.styles.length        && !f.styles.some(s        => (def.styles   ?? []).includes(s)))              return false
  if (f.rooms.length         && !f.rooms.some(r          => (def.rooms    ?? []).includes(r)))              return false
  if (f.themes.length        && !f.themes.some(t         => (def.themes   ?? []).includes(t)))             return false
  if (f.colorFamilies.length && !f.colorFamilies.some(c  => (def.swatches ?? []).some(sw => sw.family === c))) return false
  if (f.types.length         && !f.types.includes(def.subcategory))                                         return false
  return true
}

function matchesSearch(def, term) {
  if (!term) return true
  const t = term.toLowerCase()
  return (
    def.label.toLowerCase().includes(t)                                                          ||
    (def.category    || '').toLowerCase().includes(t)                                            ||
    (def.subcategory || '').toLowerCase().includes(t)                                            ||
    (def.brand       || '').toLowerCase().includes(t)                                            ||
    (def.styles   ?? []).some(s  => s.toLowerCase().includes(t))                               ||
    (def.rooms    ?? []).some(r  => r.toLowerCase().includes(t))                               ||
    (def.themes   ?? []).some(th => th.toLowerCase().includes(t))                              ||
    (def.swatches ?? []).some(sw => sw.family && sw.family.toLowerCase().includes(t))
  )
}

// ── Searchable filter chip group ──────────────────────────────────
const CHIP_PREVIEW = 4

function SearchableChipGroup({ label, allValues, active, onToggle }) {
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = q
    ? allValues.filter(v => v.toLowerCase().includes(q.toLowerCase()))
    : allValues

  // Active chips always float to the front
  const sorted = [
    ...filtered.filter(v => active.includes(v)),
    ...filtered.filter(v => !active.includes(v)),
  ]

  const showAll = expanded || !!q
  const visible = showAll ? sorted : sorted.slice(0, CHIP_PREVIEW)
  const hiddenCount = sorted.length - CHIP_PREVIEW

  return (
    <>
      <div style={s.filterGroupHeader}>
        <p style={s.filterLabel}>
          {label}
          {active.length > 0 && <span style={s.filterActiveCount}> ·{active.length}</span>}
        </p>
        <input style={s.filterGroupSearch} placeholder="search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={{ ...s.chipRow, ...(showAll ? s.chipRowScroll : {}) }}>
        {visible.map(v => (
          <button key={v} style={{ ...s.chip, ...(active.includes(v) ? s.chipActive : {}) }} onClick={() => onToggle(v)}>{v}</button>
        ))}
        {filtered.length === 0 && <span style={s.filterNoResults}>No matches</span>}
      </div>
      {!q && hiddenCount > 0 && (
        <button style={s.showMoreBtn} onClick={() => setExpanded(v => !v)}>
          {expanded ? '▲ show less' : `▼ ${hiddenCount} more…`}
        </button>
      )}
    </>
  )
}

// ── Product Modal (named export) ──────────────────────────────────
export function ProductModal({ typeKey, onPlace, onAddToCart, onWishlist, onClose }) {
  const def = ITEM_CATALOGUE[typeKey]
  const [sizeIndex,   setSizeIndex]   = useState(0)
  const [swatchIndex, setSwatchIndex] = useState(0)
  const [tagInput,    setTagInput]    = useState('')
  const [tagSent,     setTagSent]     = useState(false)

  if (!def) return null
  const isFinish = def.isFloorFinish || def.isWallFinish

  return (
    <div style={ms.backdrop} onClick={onClose}>
      <div style={ms.card} onClick={e => e.stopPropagation()}>
        <div style={{ ...ms.thumb, background: def.gradient }} />
        <div style={ms.body}>
          <div style={ms.brandRow}>
            <span style={ms.brand}>{def.brand}</span>
            <span style={ms.rating}>★ {def.rating} <span style={ms.ratingCount}>({def.reviewCount})</span></span>
          </div>
          <p style={ms.title}>{def.label}</p>
          {isFinish && <p style={ms.finishBadge}>{def.isFloorFinish ? '🪵 Floor Finish' : '🏠 Wall Finish'} · ${def.pricePerSqFt}/sq ft</p>}
          <p style={ms.desc}>{def.description}</p>

          <p style={ms.sectionLabel}>Color</p>
          <div style={ms.swatchRow}>
            {def.swatches.map((sw, i) => (
              <button key={sw.name} title={sw.name}
                style={{ ...ms.swatchBtn, background: sw.hex, ...(i === swatchIndex ? ms.swatchBtnActive : {}) }}
                onClick={() => setSwatchIndex(i)}
              >{i === swatchIndex && <span style={ms.swatchCheck}>✓</span>}</button>
            ))}
          </div>
          <p style={ms.swatchName}>{def.swatches[swatchIndex].name}</p>

          <p style={ms.sectionLabel}>{isFinish ? 'Coverage' : 'Size'}</p>
          <div style={ms.sizeRow}>
            {def.sizes.map((sz, i) => (
              <button key={i} style={{ ...ms.sizeChip, ...(i === sizeIndex ? ms.sizeChipActive : {}) }} onClick={() => setSizeIndex(i)}>
                <span>{sz.label}</span>
                <span style={ms.sizePrice}>${sz.price}</span>
              </button>
            ))}
          </div>

          <p style={ms.sectionLabel}>Materials</p>
          <ul style={ms.matList}>{def.materials.map((m, i) => <li key={i} style={ms.matItem}>{m}</li>)}</ul>
          <p style={ms.guarantee}>{def.guarantee}</p>

          {(def.themes?.length > 0 || def.styles?.length > 0) && (
            <div style={ms.tagSection}>
              <p style={ms.tagLabel}>Themes</p>
              <div style={ms.tagRow}>
                {[...(def.themes ?? []), ...(def.styles ?? [])].map(t => <span key={t} style={ms.tag}>{t}</span>)}
              </div>
              <p style={ms.tagLabel}>Suggest a tag</p>
              <div style={ms.tagInputRow}>
                <input style={ms.tagField} placeholder="e.g. Dungeon, Pond, Girly…" value={tagInput}
                  onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (() => { if (!tagInput.trim()) return; setTagSent(true); setTagInput(''); setTimeout(() => setTagSent(false), 3000) })()} />
                <button style={ms.tagSendBtn} onClick={() => { if (!tagInput.trim()) return; setTagSent(true); setTagInput(''); setTimeout(() => setTagSent(false), 3000) }}>{tagSent ? '✓' : 'Send'}</button>
              </div>
              {tagSent && <p style={ms.tagThanks}>Thanks for the suggestion!</p>}
            </div>
          )}

          <div style={ms.actionRow}>
            {isFinish ? (
              <button style={ms.cartBtn} onClick={() => { onAddToCart(typeKey, sizeIndex, swatchIndex); onPlace(typeKey, sizeIndex, swatchIndex); onClose() }}>🛒 Add to Cart & Apply</button>
            ) : (
              <>
                <button style={ms.cartBtn} onClick={() => { onAddToCart(typeKey, sizeIndex, swatchIndex); onClose() }}>🛒 Add to Cart</button>
                <button style={ms.wishlistBtn} onClick={() => { onWishlist(typeKey, sizeIndex, swatchIndex); onClose() }}>♡ Wishlist</button>
              </>
            )}
          </div>
          {!isFinish && <button style={ms.placeBtn} onClick={() => { onPlace(typeKey, sizeIndex, swatchIndex); onClose() }}>Place Only</button>}
          <button style={ms.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Shop Drawer (default export) ──────────────────────────────────
export default function ShopDrawer({
  open, activeTab, onTabChange,
  onPlace, onOpenModal,
  cart, onIncrementCart, onDecrementCart, onRemoveFromCart,
  wishlistedItems, onToggleWishlist,
  gridW, gridD,
  cartHighlight, onCartHighlight,
  drawerWidth,
}) {
  // ── Navigation state ────────────────────────────────────────
  const [shopMode,      setShopMode]      = useState(null)   // null | 'object' | 'room' | 'vibe' | 'color' | 'function'
  const [modeFilter,    setModeFilter]    = useState(null)   // sub-option selected (e.g. 'Furniture', 'Bedroom', 'Cozy')
  const [selectedCat,   setSelectedCat]   = useState(null)   // category (Object path only)
  const [selectedSubcat,setSelectedSubcat]= useState(null)   // subcategory

  // Reset deeper state when a shallower level changes
  useEffect(() => { setModeFilter(null); setSelectedCat(null); setSelectedSubcat(null) }, [shopMode])
  useEffect(() => { setSelectedCat(null); setSelectedSubcat(null) }, [modeFilter])
  useEffect(() => { setSelectedSubcat(null) }, [selectedCat])

  // ── Filter + search state ────────────────────────────────────
  const [filters,     setFilters]     = useState(initFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search,      setSearch]      = useState('')
  const [searchScope, setSearchScope] = useState('context') // 'context' | 'all'

  const setFilter   = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const toggleMulti = (key, val) => setFilters(f => ({ ...f, [key]: toggle(f[key], val) }))
  const hasActiveFilters = filters.priceMax < MAX_PRICE || filters.styles.length > 0 || filters.rooms.length > 0 || filters.themes.length > 0 || filters.colorFamilies.length > 0 || filters.types.length > 0

  const searchTerm = search.trim().toLowerCase()

  // All catalogue items passing global filters + search
  const allFiltered = useMemo(() =>
    Object.entries(ITEM_CATALOGUE).filter(([, def]) =>
      !def.door && !def.isStairs &&
      matchesFilters(def, filters) && matchesSearch(def, searchTerm)
    ),
    [filters, searchTerm] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Items further filtered by current navigation context
  const contextItems = useMemo(() => {
    if (!shopMode || !modeFilter) return allFiltered
    let items = allFiltered
    switch (shopMode) {
      case 'object': {
        const cats = OBJECT_BUCKETS[modeFilter]?.categories ?? []
        items = items.filter(([, def]) => cats.includes(def.category))
        if (selectedCat)    items = items.filter(([, def]) => def.category    === selectedCat)
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      }
      case 'room':
        items = items.filter(([, def]) => (def.rooms ?? []).includes(modeFilter))
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      case 'vibe':
        items = items.filter(([, def]) => (def.themes ?? []).includes(modeFilter))
        break
      case 'color': {
        const families = COLOR_BUCKETS.find(b => b.key === modeFilter)?.families ?? []
        items = items.filter(([, def]) => (def.swatches ?? []).some(sw => families.includes(sw.family)))
        break
      }
      case 'function': {
        const fn = FUNCTION_BUCKETS.find(b => b.key === modeFilter)
        if (fn) items = items.filter(([, def]) => fn.match(def))
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      }
    }
    return items
  }, [shopMode, modeFilter, selectedCat, selectedSubcat, allFiltered])

  // Which items to show in the flat search results view
  const searchResults = searchScope === 'context' ? contextItems : allFiltered

  // Navigation depth — drives panel transforms
  const depth = !shopMode ? 0
    : !modeFilter ? 1
    : shopMode === 'object' && !selectedCat ? 2
    : shopMode === 'object' && !selectedSubcat ? 3
    : shopMode === 'object' ? 4
    : (shopMode === 'room' || shopMode === 'function') && !selectedSubcat ? 2
    : shopMode === 'room' || shopMode === 'function' ? 3
    : 2 // vibe, color: flat items at depth 2

  const panelTransform = idx => `translateX(${(idx - depth) * 100}%)`

  const goBack = () => {
    if (selectedSubcat) { setSelectedSubcat(null); return }
    if (selectedCat)    { setSelectedCat(null);    return }
    if (modeFilter)     { setModeFilter(null);     return }
    setShopMode(null)
  }

  // Human-readable current context label (for scoped search)
  const contextLabel = selectedSubcat ?? selectedCat ?? modeFilter ?? (shopMode ? SHOP_MODES.find(m => m.key === shopMode)?.label : null)

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

  // ── Shared subcategory card grid helper ──────────────────────
  const SubcatGrid = ({ items: srcItems, onSelect }) => {
    const subcats = [...new Set(srcItems.map(([, def]) => def.subcategory).filter(Boolean))]
    return (
      <div style={s.subcatGrid}>
        {subcats.map(sub => {
          const count = srcItems.filter(([, def]) => def.subcategory === sub).length
          const meta  = SUBCATEGORY_META[sub] ?? { emoji: '📦' }
          return (
            <div key={sub} style={s.subcatCard} onClick={() => onSelect(sub)}>
              <span style={s.subcatEmoji}>{meta.emoji}</span>
              <span style={s.subcatCardName}>{sub}</span>
              <span style={s.subcatCardCount}>{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Active color families for thumbnail matching (null when not in color mode)
  const activeFamilies = shopMode === 'color' && modeFilter
    ? COLOR_BUCKETS.find(b => b.key === modeFilter)?.families ?? null
    : null

  // ── Item list helper ─────────────────────────────────────────
  const ItemList = ({ items: srcItems }) => (
    <div style={s.catItemList}>
      {srcItems.length === 0
        ? <p style={s.emptyMsg}>No items match your filters.</p>
        : srcItems.map(([key, def]) => (
            <ProductTile key={key} typeKey={key} def={def} onPlace={onPlace} onOpenModal={onOpenModal} gridW={gridW} gridD={gridD} colorFamilies={activeFamilies} />
          ))
      }
    </div>
  )

  return (
    <div style={{ ...s.drawer, width: '100%', pointerEvents: 'auto' }}>

      {/* ── Header ── */}
      <div style={s.header}>
        <span style={s.headerTitle}>Shop</span>
        {shopMode && (
          <span style={s.headerCrumb}>
            {SHOP_MODES.find(m => m.key === shopMode)?.emoji}{' '}
            {[modeFilter, selectedCat, selectedSubcat].filter(Boolean).join(' › ')}
          </span>
        )}
      </div>

      {/* ── Nav tabs ── */}
      <div style={s.navTabs}>
        <button style={{ ...s.navTab, ...(activeTab === 'shop'     ? s.navTabActive : {}) }} onClick={() => onTabChange('shop')}>Shop</button>
        <button style={{ ...s.navTab, ...(activeTab === 'wishlist' ? s.navTabActive : {}) }} onClick={() => onTabChange('wishlist')}>
          <span style={activeTab === 'wishlist' ? s.wishIconActive : s.wishIcon}>♥</span>
          Wishlist{wishlistedItems.length > 0 && <span style={s.navBadge}>{wishlistedItems.length}</span>}
        </button>
        <button style={{ ...s.navTab, ...(activeTab === 'cart'     ? s.navTabActive : {}) }} onClick={() => onTabChange('cart')}>
          Cart {cartCount > 0 && <span style={s.navBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* ── Non-shop tabs ── */}
      {activeTab === 'cart' && (
        <CartPanel cart={cart} onIncrement={onIncrementCart} onDecrement={onDecrementCart} onRemove={onRemoveFromCart}
          cartHighlight={cartHighlight} onCartHighlight={onCartHighlight} />
      )}
      {activeTab === 'wishlist' && (
        <WishlistPanel items={wishlistedItems} onOpenModal={onOpenModal} onToggleWishlist={onToggleWishlist} />
      )}

      {/* ── Shop tab ── */}
      {activeTab === 'shop' && (<>

        {/* Search bar */}
        <div style={s.searchBar}>
          {depth > 0 && (
            <button style={s.searchBackBtn} onClick={goBack} title="Go back">←</button>
          )}
          <input
            type="text"
            placeholder={contextLabel ? `Search in ${contextLabel}…` : 'Search all items…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
          {search && <button style={s.searchClear} onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Search scope toggle — only when inside a context with a search term */}
        {searchTerm && contextLabel && (
          <div style={s.scopeRow}>
            <span style={s.scopeLabel}>Search:</span>
            <button style={{ ...s.scopeBtn, ...(searchScope === 'context' ? s.scopeBtnActive : {}) }} onClick={() => setSearchScope('context')}>
              in {contextLabel}
            </button>
            <button style={{ ...s.scopeBtn, ...(searchScope === 'all' ? s.scopeBtnActive : {}) }} onClick={() => setSearchScope('all')}>
              All items
            </button>
          </div>
        )}

        {/* Filters (hidden while searching, shown when browsing) */}
        {!searchTerm && (
          <div style={s.filterSection}>
            <button style={s.filterToggle} onClick={() => setFiltersOpen(v => !v)}>
              <span>Filters{hasActiveFilters && <span style={s.filterDot} />}</span>
              <span style={s.filterChevron}>{filtersOpen ? '▲' : '▼'}</span>
            </button>
            {filtersOpen && (
              <div style={s.filterBody}>
                <p style={s.filterLabel}>Max Price: <span style={s.filterValue}>{filters.priceMax >= MAX_PRICE ? 'Any' : `$${filters.priceMax}`}</span></p>
                <input type="range" min={0} max={MAX_PRICE} step={50} value={filters.priceMax} onChange={e => setFilter('priceMax', Number(e.target.value))} style={s.slider} />
                <SearchableChipGroup label="Type"         allValues={ALL_TYPES}          active={filters.types}         onToggle={v => toggleMulti('types', v)} />
                <SearchableChipGroup label="Room"         allValues={ALL_ROOMS}          active={filters.rooms}         onToggle={v => toggleMulti('rooms', v)} />
                <SearchableChipGroup label="Style"        allValues={ALL_STYLES}         active={filters.styles}        onToggle={v => toggleMulti('styles', v)} />
                <SearchableChipGroup label="Vibe"         allValues={ALL_THEMES}         active={filters.themes}        onToggle={v => toggleMulti('themes', v)} />
                <SearchableChipGroup label="Color Family" allValues={ALL_COLOR_FAMILIES} active={filters.colorFamilies} onToggle={v => toggleMulti('colorFamilies', v)} />
                {hasActiveFilters && <button style={s.clearBtn} onClick={() => setFilters(initFilters())}>Clear all filters</button>}
              </div>
            )}
          </div>
        )}

        {/* ── Flat search results ── */}
        {searchTerm ? (
          <div style={s.list}>
            {searchResults.length === 0
              ? <p style={s.emptyMsg}>No results for "{search}"</p>
              : searchResults.map(([key, def]) => (
                  <ProductTile key={key} typeKey={key} def={def} onPlace={onPlace} onOpenModal={onOpenModal} gridW={gridW} gridD={gridD} colorFamilies={activeFamilies} />
                ))
            }
          </div>

        ) : (
          /* ── 5-panel slide navigation ── */
          <div style={s.slideContainer}>

            {/* ── P0: Mode selection (home) ── */}
            <div style={{ ...s.slidePanel, transform: panelTransform(0) }}>
              <div style={s.modeList}>
                {SHOP_MODES.map(mode => (
                  <div key={mode.key} style={{ ...s.modeCard, background: `linear-gradient(135deg, ${mode.accent} 0%, #1e1e2e 100%)` }}
                    onClick={() => setShopMode(mode.key)}
                  >
                    <span style={s.modeEmoji}>{mode.emoji}</span>
                    <div style={s.modeText}>
                      <span style={s.modeLabel}>{mode.label}</span>
                      <span style={s.modeTagline}>{mode.tagline}</span>
                    </div>
                    <span style={s.modeArrow}>›</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── P1: Mode sub-options ── */}
            <div style={{ ...s.slidePanel, transform: panelTransform(1) }}>
              <div style={s.panelHeader}>
                <button style={s.backBtn} onClick={() => setShopMode(null)}>← Back</button>
                <span style={s.panelTitle}>{SHOP_MODES.find(m => m.key === shopMode)?.label ?? ''}</span>
              </div>
              <div style={s.p1Content}>
                {shopMode === 'object' && Object.entries(OBJECT_BUCKETS).map(([name, meta]) => {
                  const count = allFiltered.filter(([, def]) => meta.categories.includes(def.category)).length
                  return (
                    <div key={name} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(name)}>
                      <span style={s.catEmoji}>{meta.emoji}</span>
                      <span style={s.catCardName}>{name}</span>
                      <span style={s.catCardTagline}>{meta.tagline}</span>
                      <span style={s.catCardCount}>{count}</span>
                    </div>
                  )
                })}
                {shopMode === 'room' && ROOM_BUCKETS.map(rb => {
                  const count = allFiltered.filter(([, def]) => (def.rooms ?? []).includes(rb.key)).length
                  return (
                    <div key={rb.key} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(rb.key)}>
                      <span style={s.catEmoji}>{rb.emoji}</span>
                      <span style={s.catCardName}>{rb.key}</span>
                      <span style={s.catCardTagline}>{rb.tagline}</span>
                      <span style={s.catCardCount}>{count}</span>
                    </div>
                  )
                })}
                {shopMode === 'vibe' && (
                  <div style={s.vibeGrid}>
                    {VIBE_BUCKETS.map(vb => {
                      const count = allFiltered.filter(([, def]) => (def.themes ?? []).includes(vb.key)).length
                      return (
                        <div key={vb.key} style={{ ...s.vibeCard, background: vb.bg, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(vb.key)}>
                          <span style={s.vibeEmoji}>{vb.emoji}</span>
                          <span style={s.vibeName}>{vb.key}</span>
                          <span style={s.vibeCount}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {shopMode === 'color' && (
                  <div style={s.colorGrid}>
                    {COLOR_BUCKETS.map(cb => {
                      const count = allFiltered.filter(([, def]) => (def.swatches ?? []).some(sw => cb.families.includes(sw.family))).length
                      return (
                        <div key={cb.key} style={{ ...s.colorCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(cb.key)}>
                          <div style={{ ...s.colorSwatch, background: cb.preview }} />
                          <span style={s.colorName}>{cb.key}</span>
                          <span style={s.colorCount}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {shopMode === 'function' && FUNCTION_BUCKETS.map(fb => {
                  const count = allFiltered.filter(([, def]) => fb.match(def)).length
                  return (
                    <div key={fb.key} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(fb.key)}>
                      <span style={s.catEmoji}>{fb.emoji}</span>
                      <span style={s.catCardName}>{fb.key}</span>
                      <span style={s.catCardTagline}>{fb.tagline}</span>
                      <span style={s.catCardCount}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── P2: Category cards (Object) / Subcategory cards (Room, Function) / Items (Vibe, Color) ── */}
            <div style={{ ...s.slidePanel, transform: panelTransform(2) }}>
              <div style={s.panelHeader}>
                <button style={s.backBtn} onClick={() => setModeFilter(null)}>← Back</button>
                <span style={s.panelTitle}>{modeFilter ?? ''}</span>
              </div>
              {shopMode === 'object' && modeFilter && (
                <div style={s.catGrid}>
                  {(OBJECT_BUCKETS[modeFilter]?.categories ?? []).map(cat => {
                    const count = contextItems.filter(([, def]) => def.category === cat).length
                    const meta  = CATEGORY_META[cat] ?? { emoji: '📦', tagline: '' }
                    return (
                      <div key={cat} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setSelectedCat(cat)}>
                        <span style={s.catEmoji}>{meta.emoji}</span>
                        <span style={s.catCardName}>{cat}</span>
                        <span style={s.catCardTagline}>{meta.tagline}</span>
                        <span style={s.catCardCount}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {(shopMode === 'room' || shopMode === 'function') && modeFilter && (
                <SubcatGrid items={contextItems} onSelect={setSelectedSubcat} />
              )}
              {(shopMode === 'vibe' || shopMode === 'color') && modeFilter && (
                <ItemList items={contextItems} />
              )}
            </div>

            {/* ── P3: Subcategory cards (Object) / Items (Room, Function) ── */}
            <div style={{ ...s.slidePanel, transform: panelTransform(3) }}>
              <div style={s.panelHeader}>
                <button style={s.backBtn} onClick={() => shopMode === 'object' ? setSelectedCat(null) : setSelectedSubcat(null)}>← Back</button>
                <span style={s.panelTitle}>{shopMode === 'object' ? (selectedCat ?? '') : (selectedSubcat ?? '')}</span>
              </div>
              {shopMode === 'object' && selectedCat && (
                <SubcatGrid
                  items={contextItems}
                  onSelect={setSelectedSubcat}
                />
              )}
              {(shopMode === 'room' || shopMode === 'function') && (
                <ItemList items={contextItems} />
              )}
            </div>

            {/* ── P4: Items (Object mode final step) ── */}
            <div style={{ ...s.slidePanel, transform: panelTransform(4) }}>
              <div style={s.panelHeader}>
                <button style={s.backBtn} onClick={() => setSelectedSubcat(null)}>← Back</button>
                <span style={s.panelTitle}>{selectedSubcat ?? ''}</span>
              </div>
              {shopMode === 'object' && <ItemList items={contextItems} />}
            </div>

          </div>
        )}

      </>)}

            {/* ── Seller's Hub footer ── TODO: replace URL with your seller portal address */}
      <div style={{ padding: '8px 14px 14px', borderTop: '1px solid #3a3a5a', flexShrink: 0 }}>
        <div
          role='button' tabIndex={0}
          onClick={() => window.open('https://your-domain.com/sell', '_blank')}
          onKeyDown={e => e.key === 'Enter' && window.open('https://your-domain.com/sell', '_blank')}
          style={{
            padding: '8px 12px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1a4a2a 0%, #2a6a3a 100%)',
            border: '1px solid #3a9a5a', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0,120,60,0.3)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a0ffcc' }}>Seller's Hub</span>
            <span style={{ fontSize: 10, color: '#70cc99' }}>List your products on the marketplace</span>
          </div>
          <span style={{ fontSize: 14, color: '#a0ffcc' }}>→</span>
        </div>
      </div>

    </div>
  )
}

// ── Cart Panel ────────────────────────────────────────────────────
function CartPanel({ cart, onIncrement, onDecrement, onRemove, cartHighlight, onCartHighlight }) {
  if (cart.length === 0) {
    return (
      <div style={s.cartEmpty}>
        <p style={s.cartEmptyIcon}>🛒</p>
        <p style={s.emptyMsg}>Your cart is empty.</p>
        <p style={{ ...s.emptyMsg, fontSize: 11, marginTop: 4 }}>Add items from the Shop tab.</p>
      </div>
    )
  }
  const total = cart.reduce((sum, c) => sum + ITEM_CATALOGUE[c.typeKey].sizes[c.sizeIndex].price * c.qty, 0)
  return (
    <div style={s.cartList}>
      {cart.map(entry => {
        const def   = ITEM_CATALOGUE[entry.typeKey]
        const size  = def.sizes[entry.sizeIndex]
        const sw    = def.swatches[entry.swatchIndex]
        const isHL  = !!(cartHighlight &&
          entry.typeKey === cartHighlight.typeKey &&
          entry.sizeIndex === cartHighlight.sizeIndex &&
          entry.swatchIndex === cartHighlight.swatchIndex)
        return (
          <div key={`${entry.typeKey}-${entry.sizeIndex}-${entry.swatchIndex}`}
            style={{ ...s.cartItem, ...(isHL ? { background: '#2a2a18', borderLeft: '2px solid #ffd700' } : {}) }}
            title="Click to highlight in room"
            onClick={() => onCartHighlight?.(isHL ? null : { typeKey: entry.typeKey, sizeIndex: entry.sizeIndex, swatchIndex: entry.swatchIndex })}
          >
            <div style={{ ...s.cartThumb, background: def.gradient }} />
            <div style={s.cartInfo}>
              <p style={s.cartLabel}>{def.label}</p>
              <p style={s.cartMeta}>{size.label} · {sw.name}</p>
              <p style={s.cartLineTotal}>${(size.price * entry.qty).toLocaleString()}</p>
            </div>
            <div style={s.cartControls}>
              <div style={s.qtyRow}>
                <button style={s.qtyBtn} onClick={() => onDecrement(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>−</button>
                <span style={s.qtyNum}>{entry.qty}</span>
                <button style={s.qtyBtn} onClick={() => onIncrement(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>+</button>
              </div>
              <button style={s.removeBtn} onClick={() => onRemove(entry.typeKey, entry.sizeIndex, entry.swatchIndex)}>Remove</button>
            </div>
          </div>
        )
      })}
      <div style={s.cartFooter}>
        <div style={s.cartTotal}>
          <span style={s.cartTotalLabel}>Subtotal</span>
          <span style={s.cartTotalPrice}>${total.toLocaleString()}</span>
        </div>
        <button style={s.checkoutBtn}>Proceed to Checkout</button>
        <p style={s.checkoutNote}>Checkout is handled by the marketplace.</p>
      </div>
    </div>
  )
}

// ── Wishlist Panel ────────────────────────────────────────────────
function WishlistPanel({ items, onOpenModal, onToggleWishlist }) {
  const [shared, setShared] = useState(false)
  if (items.length === 0) {
    return (
      <div style={s.cartEmpty}>
        <p style={s.cartEmptyIcon}>♡</p>
        <p style={s.emptyMsg}>Your wishlist is empty.</p>
        <p style={{ ...s.emptyMsg, fontSize: 11, marginTop: 4 }}>Select any placed item and tap ♡ to save it here.</p>
      </div>
    )
  }
  const total = items.reduce((sum, it) => sum + ITEM_CATALOGUE[it.typeKey].sizes[it.sizeIndex].price, 0)
  return (
    <div style={s.cartList}>
      {items.map(it => {
        const def  = ITEM_CATALOGUE[it.typeKey]
        const size = def.sizes[it.sizeIndex]
        const sw   = def.swatches[it.swatchIndex]
        return (
          <div key={it.id} style={s.cartItem} onClick={() => onOpenModal(it.typeKey)}>
            <div style={{ ...s.cartThumb, background: def.gradient }} />
            <div style={s.cartInfo}>
              <p style={s.cartLabel}>{def.label}</p>
              <p style={s.cartMeta}>{size.label} · {sw.name}</p>
              <p style={s.cartLineTotal}>${size.price}</p>
            </div>
            <button style={s.unwishBtn} onClick={e => { e.stopPropagation(); onToggleWishlist(it.id) }} title="Remove from wishlist">♥</button>
          </div>
        )
      })}
      <div style={s.cartFooter}>
        <div style={s.cartTotal}>
          <span style={s.cartTotalLabel}>Est. Total</span>
          <span style={s.cartTotalPrice}>${total.toLocaleString()}</span>
        </div>
        <button style={s.shareBtn} onClick={() => {
          const lines = items.map(it => {
            const def = ITEM_CATALOGUE[it.typeKey]
            return `• ${def.label} (${def.sizes[it.sizeIndex].label}, ${def.swatches[it.swatchIndex].name}) — $${def.sizes[it.sizeIndex].price}`
          })
          navigator.clipboard.writeText(`My Room Wishlist:\n\n${lines.join('\n')}\n\nEst. Total: $${total.toLocaleString()}`).then(() => { setShared(true); setTimeout(() => setShared(false), 2500) })
        }}>{shared ? '✓ Copied to clipboard!' : '🔗 Share Wishlist'}</button>
      </div>
    </div>
  )
}

// ── Product Tile ──────────────────────────────────────────────────
function ProductTile({ typeKey, def, onPlace, onOpenModal, gridW, gridD, colorFamilies }) {
  const isFinish = def.isFloorFinish || def.isWallFinish
  const roomSqFt = gridW && gridD ? Math.round(gridW * gridD) : null

  // When browsing by color, snap the thumbnail to the matching swatch
  const matchedSwatch = colorFamilies
    ? (def.swatches ?? []).find(sw => colorFamilies.includes(sw.family))
    : null
  const thumbBg = matchedSwatch
    ? `linear-gradient(135deg, ${matchedSwatch.hex} 0%, ${matchedSwatch.hex}bb 60%, ${matchedSwatch.hex}55 100%)`
    : def.gradient

  return (
    <div style={s.tile} onClick={() => onOpenModal(typeKey)}>
      <div style={{ ...s.thumb, background: thumbBg }}>
        <span style={s.thumbCategory}>{def.subcategory ?? def.category}</span>
        <span style={s.thumbRight}>
          {matchedSwatch && <span style={{ ...s.thumbSwatchPip, background: matchedSwatch.hex }} title={matchedSwatch.name} />}
          {isFinish && <span style={s.thumbFinishBadge}>{def.isFloorFinish ? '🪵' : '🏠'}</span>}
        </span>
      </div>
      <div style={s.tileBody}>
        <div style={s.tileMeta}>
          <span style={s.tileBrand}>{def.brand}</span>
          <span style={s.tileRating}>★ {def.rating}</span>
        </div>
        <p style={s.tileLabel}>{def.label}</p>
        {isFinish ? (
          <div style={s.tileFinishPrice}>
            <span style={s.tileFinishRate}>${def.pricePerSqFt}<span style={s.tileFinishUnit}>/sq ft</span></span>
            {roomSqFt && <span style={s.tileRoomHint}>~{roomSqFt} sq ft room</span>}
          </div>
        ) : (
          <p style={s.tilePrice}>From <strong>${def.price}</strong><span style={s.tilePriceMax}> – ${def.priceMax}</span></p>
        )}
        <div style={s.swatchRow}>
          {(def.swatches ?? []).map(sw => <span key={sw.name} title={sw.name} style={{ ...s.swatch, background: sw.hex }} />)}
        </div>
        <div style={s.tileBtns}>
          <button style={isFinish ? s.tileApply : s.tilePlace} onClick={e => { e.stopPropagation(); onPlace(typeKey, 0, 0) }}>
            {isFinish ? '✓ Apply' : '+ Place'}
          </button>
          <span style={s.tileDetail}>Details →</span>
        </div>
      </div>
    </div>
  )
}

// ── Drawer styles ─────────────────────────────────────────────────
const s = {
  drawer: {
    position: 'relative',
    width: '100%', height: '100%',
    background: '#1e1e30', borderLeft: '1px solid #3a3a5a',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 20, fontFamily: 'system-ui, sans-serif',
  },
  header: {
    padding: '14px 16px 10px', borderBottom: '1px solid #3a3a5a', flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  headerTitle:  { fontSize: 17, fontWeight: 700, color: '#e0d9ff' },
  headerCrumb:  { fontSize: 10, color: '#7878aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  navTabs: { display: 'flex', flexShrink: 0, borderBottom: '1px solid #3a3a5a' },
  navTab: {
    flex: 1, padding: '10px 0',
    background: 'transparent', color: '#9898cc',
    border: 'none', borderBottom: '2px solid transparent',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  navTabActive: { color: '#e0d9ff', borderBottom: '2px solid #9a7aee' },
  navBadge: {
    background: '#9a7aee', color: '#fff', borderRadius: '50%',
    width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700,
  },

  // Search
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  searchBackBtn: {
    padding: '5px 9px', background: 'transparent', color: '#9898cc',
    border: '1px solid #4a4a6a', borderRadius: 6,
    cursor: 'pointer', fontSize: 14, flexShrink: 0, lineHeight: 1,
  },
  searchInput: {
    flex: 1, padding: '7px 10px',
    background: '#2a2a3d', color: '#e0d9ff',
    border: '1px solid #4a4a6a', borderRadius: 6,
    fontSize: 13, outline: 'none',
  },
  searchClear: {
    background: 'transparent', border: 'none', color: '#7878aa',
    cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0,
  },

  // Search scope toggle
  scopeRow: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderBottom: '1px solid #2a2a3a', flexShrink: 0,
  },
  scopeLabel: { fontSize: 10, color: '#7878aa', flexShrink: 0 },
  scopeBtn: {
    padding: '3px 10px', fontSize: 10,
    background: '#2a2a3d', color: '#9898cc',
    border: '1px solid #4a4a6a', borderRadius: 12, cursor: 'pointer',
  },
  scopeBtnActive: { background: '#5a4a8a', borderColor: '#9a7aee', color: '#e0d9ff', fontWeight: 700 },

  // Filters
  filterSection: { borderBottom: '1px solid #3a3a5a', flexShrink: 0 },
  filterToggle: {
    width: '100%', padding: '9px 18px',
    background: 'transparent', color: '#9898cc',
    border: 'none', cursor: 'pointer', fontSize: 12,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  filterDot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#9a7aee', marginLeft: 6, verticalAlign: 'middle' },
  filterChevron: { fontSize: 9, color: '#7878aa' },
  filterBody: { padding: '2px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
  filterGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  filterLabel: { margin: '0 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  filterGroupSearch: { padding: '2px 8px', fontSize: 10, background: '#2a2a3d', color: '#c0b8ff', border: '1px solid #3a3a5a', borderRadius: 10, outline: 'none', width: 100 },
  filterNoResults: { fontSize: 10, color: '#5a5a7a', fontStyle: 'italic' },
  filterValue: { color: '#c0b8ff', fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
  slider: { width: '100%', accentColor: '#9a7aee', cursor: 'pointer' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  chipRowScroll: { maxHeight: 110, overflowY: 'auto', paddingRight: 2 },
  chip: { padding: '3px 10px', background: '#2a2a3d', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 12, cursor: 'pointer', fontSize: 10 },
  chipActive: { background: '#5a4a8a', borderColor: '#9a7aee', color: '#e0d9ff' },
  filterActiveCount: { color: '#9a7aee', fontWeight: 700 },
  showMoreBtn: { alignSelf: 'flex-start', marginTop: 2, padding: '2px 0', background: 'transparent', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 10 },
  clearBtn: { alignSelf: 'flex-start', marginTop: 4, padding: '4px 12px', background: 'transparent', color: '#7878aa', border: '1px solid #4a4a6a', borderRadius: 5, cursor: 'pointer', fontSize: 10 },

  // Flat list (search results)
  list: { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 },

  // 5-panel slide system
  slideContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  slidePanel: {
    position: 'absolute', inset: 0,
    overflowY: 'auto', overflowX: 'hidden',
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    display: 'flex', flexDirection: 'column',
  },

  // P0 — Mode list
  modeList: { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px' },
  modeCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  modeEmoji: { fontSize: 26, flexShrink: 0, lineHeight: 1 },
  modeText:  { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
  modeLabel: { fontSize: 14, fontWeight: 700, color: '#e0d9ff' },
  modeTagline: { fontSize: 11, color: '#9898cc', lineHeight: 1.4 },
  modeArrow: { fontSize: 20, color: '#7878aa', flexShrink: 0 },

  // P1 — sub-option cards (standard grid)
  p1Content: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },

  // Vibe grid (3-col to fit more)
  vibeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, padding: '10px 14px' },
  vibeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '12px 6px 10px', borderRadius: 10, cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.07)', position: 'relative', textAlign: 'center',
  },
  vibeEmoji: { fontSize: 22, lineHeight: 1 },
  vibeName:  { fontSize: 10, fontWeight: 600, color: '#e0d9ff' },
  vibeCount: { fontSize: 9, color: '#7878aa' },

  // Color grid — centered column cards (3-up)
  colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 14px' },
  colorCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '14px 6px 12px', borderRadius: 12, cursor: 'pointer',
    background: '#2a2a3d', border: '1px solid #3a3a5a',
    position: 'relative', textAlign: 'center',
    transition: 'border-color 0.15s',
  },
  colorSwatch: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 },
  colorName: { fontSize: 10, fontWeight: 600, color: '#e0d9ff', lineHeight: 1.3 },
  colorCount: { position: 'absolute', top: 6, right: 7, fontSize: 9, fontWeight: 700, color: '#c0b8ff', background: '#3a3a58', borderRadius: 10, padding: '1px 5px' },

  // Category cards (P1 Object, P2 Object)
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },
  catCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '16px 10px 14px',
    background: '#2a2a3d', border: '1px solid #3a3a5a', borderRadius: 12,
    cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
    position: 'relative', textAlign: 'center',
  },
  catCardEmpty: { opacity: 0.3, cursor: 'default' },
  catEmoji:    { fontSize: 26, lineHeight: 1 },
  catCardName: { fontSize: 13, fontWeight: 700, color: '#e0d9ff' },
  catCardTagline: { fontSize: 10, color: '#7878aa', lineHeight: 1.4 },
  catCardCount: { position: 'absolute', top: 8, right: 10, fontSize: 10, fontWeight: 700, color: '#c0b8ff', background: '#3a3a58', borderRadius: 10, padding: '1px 6px' },

  // Panel header (P1-P4) — sticky so it stays visible while scrolling
  panelHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px 6px',
    borderBottom: '1px solid #2a2a40',
    position: 'sticky', top: 0, zIndex: 1,
    background: '#1e1e30',
    flexShrink: 0,
  },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#e0d9ff' },
  backBtn: { padding: '5px 12px', background: 'transparent', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 20, cursor: 'pointer', fontSize: 11, flexShrink: 0 },

  // Subcategory card grid (P2-P3)
  subcatGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '10px 14px' },
  subcatCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '12px 8px 10px',
    background: '#2a2a3d', border: '1px solid #3a3a5a', borderRadius: 10,
    cursor: 'pointer', position: 'relative', textAlign: 'center',
    transition: 'border-color 0.15s',
  },
  subcatEmoji:     { fontSize: 22, lineHeight: 1 },
  subcatCardName:  { fontSize: 11, fontWeight: 600, color: '#e0d9ff' },
  subcatCardCount: { position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 700, color: '#c0b8ff', background: '#3a3a58', borderRadius: 10, padding: '1px 5px' },

  // Item list — no own overflow; the parent slidePanel (overflowY: auto) handles scrolling
  catItemList: { padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
  emptyMsg: { color: '#7878aa', fontSize: 13, textAlign: 'center', paddingTop: 20, margin: 0 },

  // Cart / Wishlist
  cartEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cartEmptyIcon: { fontSize: 36, margin: 0 },
  cartList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  cartItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid #2a2a3a', cursor: 'pointer' },
  cartThumb: { width: 52, height: 52, borderRadius: 8, flexShrink: 0 },
  cartInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  cartLabel: { margin: 0, fontSize: 13, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cartMeta:  { margin: 0, fontSize: 11, color: '#7878aa' },
  cartLineTotal: { margin: 0, fontSize: 12, color: '#c0b8ff', fontWeight: 600 },
  cartControls: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, background: '#3a3a55', color: '#d0cfff', border: '1px solid #4a4a6a', cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 13, fontWeight: 700, color: '#e0d9ff', minWidth: 22, textAlign: 'center' },
  removeBtn: { background: 'transparent', color: '#7878aa', border: 'none', cursor: 'pointer', fontSize: 10, textDecoration: 'underline', padding: 0 },
  cartFooter: { padding: '14px 14px 18px', borderTop: '1px solid #3a3a5a', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 },
  cartTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  cartTotalLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  cartTotalPrice: { fontSize: 20, fontWeight: 700, color: '#e0d9ff' },
  checkoutBtn: { width: '100%', padding: '12px 0', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  checkoutNote: { margin: 0, fontSize: 10, color: '#7878aa', textAlign: 'center' },
  wishIcon:       { fontSize: 15, color: '#9898cc' },
  wishIconActive: { fontSize: 19, color: '#ff7aa0' },
  unwishBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ff7aa0', flexShrink: 0, padding: '0 4px', lineHeight: 1 },
  shareBtn: { width: '100%', padding: '10px 0', background: '#2a3a4a', color: '#c0d8ff', border: '1px solid #4a6a8a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },

  // Product tile
  tile: { background: '#2a2a3d', border: '1px solid #3a3a5a', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' },
  thumb: { height: 110, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 8 },
  thumbCategory: { background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '2px 8px', borderRadius: 10 },
  thumbRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  thumbSwatchPip: { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 },
  thumbFinishBadge: { background: 'rgba(90,74,138,0.85)', color: '#e0d9ff', fontSize: 12, padding: '1px 6px', borderRadius: 10 },
  tileBody: { padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  tileMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tileBrand: { fontSize: 10, color: '#7878aa' },
  tileRating: { fontSize: 10, color: '#f0c060' },
  tileLabel: { margin: 0, fontSize: 14, fontWeight: 700, color: '#e0d9ff' },
  tilePrice: { margin: 0, fontSize: 12, color: '#c0b8ff' },
  tilePriceMax: { fontWeight: 400, color: '#7878aa' },
  tileFinishPrice: { display: 'flex', alignItems: 'baseline', gap: 8, margin: '2px 0' },
  tileFinishRate:  { fontSize: 15, fontWeight: 700, color: '#c0b8ff' },
  tileFinishUnit:  { fontSize: 11, fontWeight: 400, color: '#7878aa' },
  tileRoomHint:    { fontSize: 10, color: '#7878aa' },
  swatchRow: { display: 'flex', gap: 5, marginTop: 2 },
  swatch: { width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, display: 'inline-block' },
  tileBtns: { display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' },
  tilePlace: { flex: 1, padding: '7px 0', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  tileApply: { flex: 1, padding: '7px 0', background: '#2a4a3a', color: '#70e090', border: '1px solid #40a060', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  tileDetail: { flex: 1, fontSize: 12, color: '#7878aa', textAlign: 'center', userSelect: 'none' },
}

// ── Modal styles ──────────────────────────────────────────────────
const ms = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { background: '#2a2a3d', border: '1px solid #4a4a6a', borderRadius: 14, width: 440, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' },
  thumb: { height: 160, flexShrink: 0 },
  body:  { overflowY: 'auto', padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 },
  brandRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 11, color: '#7878aa' },
  rating: { fontSize: 11, color: '#f0c060' },
  ratingCount: { color: '#7878aa' },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#e0d9ff' },
  finishBadge: { margin: 0, fontSize: 12, color: '#70e090', fontWeight: 600 },
  desc:  { margin: 0, fontSize: 13, color: '#a0a0cc', lineHeight: 1.65 },
  sectionLabel: { margin: '6px 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  swatchRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  swatchBtn: { width: 28, height: 28, borderRadius: '50%', border: '2px solid transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s, transform 0.15s' },
  swatchBtnActive: { border: '2px solid #fff', transform: 'scale(1.15)' },
  swatchCheck: { fontSize: 12, color: '#fff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },
  swatchName: { margin: 0, fontSize: 11, color: '#9898cc' },
  sizeRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  sizeChip: { padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', background: '#3a3a55', color: '#c0b8ff', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer', fontSize: 11 },
  sizeChipActive: { background: '#5a4a8a', borderColor: '#9a7aee', color: '#fff' },
  sizePrice: { fontSize: 12, fontWeight: 700, color: '#e0d9ff' },
  matList: { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 3 },
  matItem: { fontSize: 12, color: '#a0a0cc' },
  guarantee: { margin: 0, fontSize: 11, color: '#6868aa', fontStyle: 'italic' },
  tagSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  tagLabel: { margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { padding: '3px 10px', fontSize: 10, background: '#3a3a55', color: '#c0b8ff', border: '1px solid #4a4a6a', borderRadius: 12 },
  tagInputRow: { display: 'flex', gap: 6 },
  tagField: { flex: 1, padding: '6px 10px', fontSize: 12, background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 6, outline: 'none' },
  tagSendBtn: { padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 6, cursor: 'pointer' },
  tagThanks: { margin: 0, fontSize: 11, color: '#70c070' },
  actionRow: { display: 'flex', gap: 8, marginTop: 4 },
  cartBtn: { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer' },
  wishlistBtn: { flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, background: '#2a2a3d', color: '#ff7aa0', border: '1px solid #6a4a6a', borderRadius: 8, cursor: 'pointer' },
  placeBtn: { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer' },
  closeBtn: { width: '100%', padding: '9px 0', fontSize: 12, background: 'transparent', color: '#6868aa', border: 'none', cursor: 'pointer', marginTop: 2 },
  sellFooter: { padding: '12px 14px 18px', borderTop: '1px solid #3a3a5a', flexShrink: 0 },
  sellBtn: {
    width: '100%', padding: '13px 16px',
    background: 'linear-gradient(135deg, #b06820 0%, #d48828 100%)',
    border: '1px solid #e8a040', borderRadius: 10,
    color: '#fff8e8', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    textAlign: 'left', fontFamily: 'inherit',
    appearance: 'none', WebkitAppearance: 'none',
    boxShadow: '0 2px 8px rgba(180,100,0,0.35)',
  },
  sellBtnLeft: { display: 'flex', flexDirection: 'column', gap: 3 },
  sellBtnTitle: { fontSize: 13, fontWeight: 700, color: '#fff8e8' },
  sellBtnSub:   { fontSize: 11, color: '#ffe0a0' },
  sellBtnArrow: { fontSize: 18, color: '#fff8e8' },
}
