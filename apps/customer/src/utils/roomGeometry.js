import { ITEM_CATALOGUE } from '../data/items'

export const DIAMOND_MAP = [
  { tl: 'W', tr: 'N', br: 'E', bl: 'S' }, // q0 — default view
  { tl: 'N', tr: 'E', br: 'S', bl: 'W' }, // q1 — 90°
  { tl: 'E', tr: 'S', br: 'W', bl: 'N' }, // q2 — 180°
  { tl: 'S', tr: 'W', br: 'N', bl: 'E' }, // q3 — 270°
]

export function roomQuadrant(ry) {
  const r = ((ry % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return Math.floor((r + Math.PI / 4) / (Math.PI / 2)) % 4
}

// All occupied cells for an item, in ½-ft integer units
export function makeGrid(w, d, offsetC = 0, offsetR = 0) {
  const s = new Set()
  for (let c = 0; c < w; c++)
    for (let r = 0; r < d; r++)
      s.add(`${c + offsetC},${r + offsetR}`)
  return s
}

// All occupied cells for an item, in ½-ft integer units
export function getItemCells(item, catalogue = ITEM_CATALOGUE) {
  const def  = catalogue[item.typeKey] ?? ITEM_CATALOGUE[item.typeKey]
  const size = def?.sizes?.[item.sizeIndex] ?? def?.sizes?.[0]
  // Stairs store their own footprint (stairW × stairD) which may differ from catalogue
  const fw = item.stairW ?? (size?.footprint ?? [1, 1])[0]
  const fd = item.stairD ?? (size?.footprint ?? [1, 1])[1]
  const rotated  = item.rotation === 90 || item.rotation === 270
  const ew = rotated ? fd : fw
  const ed = rotated ? fw : fd
  const cells = new Set()
  const c0 = Math.round(item.col * 2)
  const r0 = Math.round(item.row * 2)
  for (let c = c0; c < c0 + Math.max(1, Math.round(ew * 2)); c++)
    for (let r = r0; r < r0 + Math.max(1, Math.round(ed * 2)); r++)
      cells.add(`${c},${r}`)
  return cells
}

// Items that have a flat top surface where other items can sit
const SURFACE_CATEGORIES = new Set(['Tables', 'Storage'])
const SURFACE_SUBCATEGORIES = new Set([
  'Desks', 'Dining Tables', 'Coffee Tables', 'Side Tables', 'Console Tables',
  'Dressers', 'Nightstands', 'Bookshelves', 'Shelving', 'Credenzas',
  'Sideboards', 'Cabinets', 'Counters', 'Benches',
])

export function isSurfaceItem(def) {
  if (def?.surface === true) return true
  if (def?.surface === false) return false
  if (SURFACE_CATEGORIES.has(def?.category)) return true
  if (SURFACE_SUBCATEGORIES.has(def?.subcategory)) return true
  return false
}

export function isWallItem(def) {
  return def.category === 'Wall Decor' || def.subcategory === 'Wall Sconces' || def.category === 'Windows' || def.category === 'Doors'
}

export function isCeilingItem(def) {
  return !!def.ceiling
}

export function hasOverlap(items, testId, testItem, catalogue = ITEM_CATALOGUE) {
  const testCells = getItemCells(testItem, catalogue)
  for (const other of items) {
    if (other.id === testId) continue
    if (other.wall) continue  // wall items don't occupy floor space
    if (other.ceiling) continue
    // Surface items don't collide with their parent
    if (testItem.parentId === other.id || other.parentId === testId) continue
    // Surface items only collide with items at the same level
    if ((testItem.parentId != null) !== (other.parentId != null)) continue
    for (const cell of getItemCells(other, catalogue))
      if (testCells.has(cell)) return true
  }
  return false
}

// Like hasOverlap, but returns the IDs of all items that collide.
export function findOverlappingItems(items, testId, testItem, catalogue = ITEM_CATALOGUE) {
  const testCells = getItemCells(testItem, catalogue)
  const ids = []
  for (const other of items) {
    if (other.id === testId) continue
    if (other.wall || other.ceiling) continue
    if (testItem.parentId === other.id || other.parentId === testId) continue
    if ((testItem.parentId != null) !== (other.parentId != null)) continue
    for (const cell of getItemCells(other, catalogue)) {
      if (testCells.has(cell)) { ids.push(other.id); break }
    }
  }
  return ids
}

// Check if testItem is positioned over a surface item and fits on it.
// Returns the parent surface item or null.
export function findSurfaceAt(items, testItem, catalogue = ITEM_CATALOGUE) {
  const def = catalogue[testItem.typeKey] ?? ITEM_CATALOGUE[testItem.typeKey]
  const size = def?.sizes?.[testItem.sizeIndex] ?? def?.sizes?.[0]
  const [tw, td] = size?.footprint ?? [1, 1]
  const tRotated = testItem.rotation === 90 || testItem.rotation === 270
  const tew = tRotated ? td : tw
  const ted = tRotated ? tw : td

  for (const other of items) {
    if (other.id === testItem.id) continue
    if (other.wall || other.ceiling || other.parentId != null) continue
    const oDef = catalogue[other.typeKey] ?? ITEM_CATALOGUE[other.typeKey]
    if (!isSurfaceItem(oDef)) continue
    const oSize = oDef?.sizes?.[other.sizeIndex] ?? oDef?.sizes?.[0]
    const [ow, od] = oSize?.footprint ?? [1, 1]
    const oRotated = other.rotation === 90 || other.rotation === 270
    const oew = oRotated ? od : ow
    const oed = oRotated ? ow : od

    // Check if the item fits within the surface bounds
    const itemLeft = testItem.col
    const itemRight = testItem.col + tew
    const itemTop = testItem.row
    const itemBottom = testItem.row + ted
    const surfLeft = other.col
    const surfRight = other.col + oew
    const surfTop = other.row
    const surfBottom = other.row + oed

    // Item must overlap the surface and its center must be on it
    const tcx = testItem.col + tew / 2
    const tcz = testItem.row + ted / 2
    if (tcx >= surfLeft && tcx <= surfRight &&
        tcz >= surfTop && tcz <= surfBottom) {
      return other
    }
  }
  return null
}

// Get the surface height (top of the parent item) in feet
export function getSurfaceHeight(parentItem, catalogue = ITEM_CATALOGUE) {
  const def = catalogue[parentItem.typeKey] ?? ITEM_CATALOGUE[parentItem.typeKey]
  const size = def?.sizes?.[parentItem.sizeIndex] ?? def?.sizes?.[0]
  return size?.height ?? 1
}

export function hasWallOverlap(items, testId, testItem, catalogue = ITEM_CATALOGUE) {
  const def  = catalogue[testItem.typeKey] ?? ITEM_CATALOGUE[testItem.typeKey]
  const size = def?.sizes?.[testItem.sizeIndex] ?? def?.sizes?.[0]
  const fw   = testItem.customW ?? size?.footprint?.[0] ?? 1
  const fh   = testItem.customH ?? size?.height ?? 1
  for (const other of items) {
    if (other.id === testId || !other.wall || other.wall !== testItem.wall) continue
    // Items on different physical faces (different anchor) cannot collide
    if (testItem.wallAnchor !== undefined && other.wallAnchor !== undefined &&
        testItem.wallAnchor !== other.wallAnchor) continue
    const oDef  = catalogue[other.typeKey] ?? ITEM_CATALOGUE[other.typeKey]
    const oSize = oDef?.sizes?.[other.sizeIndex] ?? oDef?.sizes?.[0]
    const oFw   = other.customW ?? oSize?.footprint?.[0] ?? 1
    const oFh   = other.customH ?? oSize?.height ?? 1
    const uClear = Math.abs(testItem.wallU - other.wallU) >= (fw + oFw) / 2
    const hClear = Math.abs(testItem.wallH - other.wallH) >= (fh + oFh) / 2
    if (!uClear && !hClear) return true
  }
  return false
}

// Spiral search for the nearest free grid position near the center.
// Rotation is always 0 on initial placement, so we use raw footprint.
export function findFreePosition(existingItems, templateItem, gridW, gridD, catalogue = ITEM_CATALOGUE) {
  const def  = catalogue[templateItem.typeKey] ?? ITEM_CATALOGUE[templateItem.typeKey]
  const size = def?.sizes?.[templateItem.sizeIndex] ?? def?.sizes?.[0]
  const [fw, fd] = size?.footprint ?? [1, 1]
  const maxCol = gridW - fw
  const maxRow = gridD - fd
  const cx = Math.floor(maxCol / 2)
  const cy = Math.floor(maxRow / 2)

  for (let dist = 0; dist <= Math.max(gridW, gridD); dist++) {
    for (let dc = -dist; dc <= dist; dc++) {
      for (let dr = -dist; dr <= dist; dr++) {
        if (Math.abs(dc) !== dist && Math.abs(dr) !== dist) continue // shell only
        const col = Math.max(0, Math.min(maxCol, cx + dc))
        const row = Math.max(0, Math.min(maxRow, cy + dr))
        if (!hasOverlap(existingItems, templateItem.id, { ...templateItem, col, row }, catalogue))
          return { col, row }
      }
    }
  }
  return { col: cx, row: cy } // room full — fall back to centre
}

// All wall-face anchor values of the given direction accessible from an item's column/row.
// For N/S walls: returns row indices (ascending for N, descending for S so [0] = outermost).
// For W/E walls: returns col indices (ascending for W, descending for E so [0] = outermost).
export function getParallelWallFaces(wall, wallU, cells, gridW, gridD) {
  const faces = []
  if (wall === 'N' || wall === 'S') {
    const col = Math.max(0, Math.min(gridW - 1, Math.floor(wallU)))
    if (wall === 'N') {
      for (let r = 0; r < gridD; r++)
        if (cells.has(`${col},${r}`) && !cells.has(`${col},${r - 1}`)) faces.push(r)
    } else {
      for (let r = gridD - 1; r >= 0; r--)
        if (cells.has(`${col},${r}`) && !cells.has(`${col},${r + 1}`)) faces.push(r)
    }
  } else {
    const row = Math.max(0, Math.min(gridD - 1, Math.floor(wallU)))
    if (wall === 'W') {
      for (let c = 0; c < gridW; c++)
        if (cells.has(`${c},${row}`) && !cells.has(`${c - 1},${row}`)) faces.push(c)
    } else {
      for (let c = gridW - 1; c >= 0; c--)
        if (cells.has(`${c},${row}`) && !cells.has(`${c + 1},${row}`)) faces.push(c)
    }
  }
  return faces
}
