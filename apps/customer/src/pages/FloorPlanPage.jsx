// FloorPlanPage — full-screen 2D floor plan editor.
// Tools: Floor Shape, Walls, Doors, Stairs, Room Labels.
// Zoom/pan, floor switcher, ghost floor below.
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { exportFloorPlanPNG } from '../utils/exportFloorPlan'
import { ROOM_TEMPLATES } from '../data/roomTemplates'
import { BUILDING_TEMPLATES } from '../data/buildingTemplates'

// Is rotation effectively sideways? Handles any angle, not just exact 90/270
function isRotatedSideways(rotation) {
  const r = ((rotation ?? 0) % 360 + 360) % 360
  return (r > 45 && r < 135) || (r > 225 && r < 315)
}

// Get effective width/depth for an item accounting for rotation
function getItemFootprint(it, catalogue) {
  if (it.stairs) {
    const sw = it.stairW ?? 3, sd = it.stairD ?? 10
    const rot = isRotatedSideways(it.rotation)
    return [rot ? sd : sw, rot ? sw : sd]
  }
  const def = (catalogue ?? {})[it.typeKey]
  const size = def?.sizes?.[it.sizeIndex ?? 0] ?? def?.sizes?.[0]
  const [fw, fd] = size?.footprint ?? [1, 1]
  const rot = isRotatedSideways(it.rotation)
  return [rot ? fd : fw, rot ? fw : fd]
}

const TOOLS = [
  { id: 'shape',  label: 'Floor Shape',  icon: '▦', desc: 'Drag rectangles to add/remove floor area', group: 'structure', primary: true },
  { id: 'walls',  label: 'Walls',        icon: '┼', desc: 'Click edges between cells to draw walls', group: 'structure', primary: true },
  { id: 'door',   label: 'Openings',     icon: '▯', desc: 'Click a wall for a doorway — works on interior and exterior walls', group: 'structure', primary: true },
  { id: 'stairs', label: 'Stairs',       icon: '⟋', desc: 'Click a cell to mark stair connection', group: 'stairs', primary: true },
  { id: 'resize', label: 'Move Wall',    icon: '↔', desc: 'Drag a wall edge to resize rooms', group: 'structure' },
  { id: 'addroom',label: 'Add Room',     icon: '⊞', desc: 'Drag a rectangle to add a walled room', group: 'structure' },
  { id: 'label',  label: 'Room Names',   icon: 'Aa', desc: 'Click a room area to name it', group: 'rooms' },
  { id: 'copy',   label: 'Copy Room',    icon: '⊟', desc: 'Click a room to copy, then click to paste', group: 'rooms' },
]
const PRIMARY_TOOLS   = TOOLS.filter(t => t.primary)
const SECONDARY_TOOLS = TOOLS.filter(t => !t.primary)

// Flood-fill to detect room zones from internal walls.
// Returns [{ id: "3,4", cells: Set, seedCell: "3,4" }]
// ID = smallest cell key in the zone (stable across wall edits).
export function detectRoomZones(cells, internalWalls, doorOpenings) {
  const visited = new Set()
  const zones = []
  const hasBarrier = (col, row, dir) => {
    // Both walls AND doors block zone detection (doors are visual openings, not zone mergers)
    const key = `${col},${row}:${dir}`
    if (internalWalls?.has(key) || doorOpenings?.has(key)) return true
    const opp = { N: 'S', S: 'N', W: 'E', E: 'W' }
    const nc = dir === 'W' ? col-1 : dir === 'E' ? col+1 : col
    const nr = dir === 'N' ? row-1 : dir === 'S' ? row+1 : row
    const altKey = `${nc},${nr}:${opp[dir]}`
    return internalWalls?.has(altKey) || doorOpenings?.has(altKey)
  }

  // Sort cells for deterministic order
  const sortedCells = [...cells].sort()

  for (const key of sortedCells) {
    if (visited.has(key)) continue
    const zoneCells = new Set()
    const queue = [key]
    while (queue.length > 0) {
      const cur = queue.pop()
      if (visited.has(cur) || !cells.has(cur)) continue
      visited.add(cur)
      zoneCells.add(cur)
      const [c, r] = cur.split(',').map(Number)
      if (!hasBarrier(c, r, 'N') && cells.has(`${c},${r-1}`) && !visited.has(`${c},${r-1}`)) queue.push(`${c},${r-1}`)
      if (!hasBarrier(c, r, 'S') && cells.has(`${c},${r+1}`) && !visited.has(`${c},${r+1}`)) queue.push(`${c},${r+1}`)
      if (!hasBarrier(c, r, 'W') && cells.has(`${c-1},${r}`) && !visited.has(`${c-1},${r}`)) queue.push(`${c-1},${r}`)
      if (!hasBarrier(c, r, 'E') && cells.has(`${c+1},${r}`) && !visited.has(`${c+1},${r}`)) queue.push(`${c+1},${r}`)
    }
    if (zoneCells.size > 0) {
      // Stable ID = smallest cell key in the zone
      const sorted = [...zoneCells].sort()
      zones.push({ id: sorted[0], cells: zoneCells, seedCell: sorted[0] })
    }
  }
  return zones
}

// Assign stable colors to zones
const ZONE_COLORS = ['#3a5a8a40','#8a5a3a40','#3a8a5a40','#8a3a5a40','#5a8a3a40','#5a3a8a40','#8a8a3a40','#3a8a8a40']

export default function FloorPlanPage({
  gridW, gridD, cells, internalWalls, doorOpenings, items,
  onToggleCell, onToggleWall, onResizeGrid, onDone,
  onAddStairs, onRemoveStairs, onAddDoor, onRemoveDoor, onAddExteriorDoor,
  onBulkAddCells,
  roomZoneLabels, onSetZoneLabel,
  onEditZone,
  onAddFloor,  // ('above' | 'below', count?) => void — create empty floor(s)
  onDeleteFloors, // (roomIds[]) => void — batch delete floors
  onLoadBuilding, // (buildingTemplate) => void — load a full building plan
  onPlaceTemplateItems, // (items[], baseCol, baseRow) => void — add furniture from template
  onRestoreSnapshot, // ({ cells, internalWalls, doorOpenings }) => void — undo/redo
  onMoveItem, // (id, col, row) => void — move an item
  onSelectItem, // (id) => void — select an item
  onDeleteItem, // (id) => void — delete an item
  onRotateItem, // (id, deg) => void — rotate an item
  onResizeItem, // (id, sizeIndex) => void — change item size
  selectedId,
  catalogue,
  // Multi-floor
  activeFloorLevel, floorStack, allRoomsData, onSwitchFloor,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tool, setTool] = useState(null)
  const [showMoreTools, setShowMoreTools] = useState(false)
  const [stairRotation, setStairRotation] = useState(0)
  const [hoverInfo, setHoverInfo] = useState(null)
  const rectRef = useRef(null)
  const wallDragRef = useRef(null)
  const resizeDragRef = useRef(null) // { wall: 'N'|'S'|'E'|'W', cells: [col,row keys along the wall], startPos: int, currentPos: int }
  // Copy room: { cells: Set of relative "dc,dr", walls: Set of relative edges, w, d }
  const [clipboard, setClipboard] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panStartRef = useRef(null)
  const [editingLabel, setEditingLabel] = useState(null)
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(null)
  const [draggingLabel, setDraggingLabel] = useState(null) // { label, x, y } when dragging a room tag
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteSelection, setDeleteSelection] = useState(new Set()) // roomIds to delete
  // Background image for tracing
  const [bgImage, setBgImage] = useState(null)  // { img: HTMLImageElement, opacity: 0.4 }
  const [bgScale, setBgScale] = useState(1)
  // Import modals
  const [showImport, setShowImport] = useState(false)
  const [dimInput, setDimInput] = useState({ name: '', w: 12, d: 10 })
  const [gridInput, setGridInput] = useState({ w: gridW, d: gridD })
  const fileInputRef = useRef(null)

  // ── Undo stack for floor plan actions ──────────────────────────────
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])
  const saveUndoSnapshot = useCallback(() => {
    undoStackRef.current.push({
      cells: new Set(cells),
      internalWalls: new Set(internalWalls ?? []),
      doorOpenings: new Set(doorOpenings ?? []),
    })
    if (undoStackRef.current.length > 40) undoStackRef.current.shift()
    redoStackRef.current = []
  }, [cells, internalWalls, doorOpenings])
  const roomPlanInputRef = useRef(null)

  // Auto-detect room zones
  const roomZones = useMemo(() => detectRoomZones(cells, internalWalls, doorOpenings), [cells, internalWalls, doorOpenings])

  // Ghost floor data (floor below current) — uses allRoomsData, not floorStack
  const ghostFloorData = useMemo(() => {
    if (!allRoomsData) return null
    for (const [id, r] of Object.entries(allRoomsData)) {
      if ((r.level ?? 0) === activeFloorLevel - 1) return r
    }
    return null
  }, [allRoomsData, activeFloorLevel])

  // ESC clears clipboard; Ctrl+Z/Y undo/redo floor plan changes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setClipboard(null)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const snap = undoStackRef.current.pop()
        if (snap) {
          redoStackRef.current.push({ cells: new Set(cells), internalWalls: new Set(internalWalls ?? []), doorOpenings: new Set(doorOpenings ?? []) })
          onRestoreSnapshot?.(snap)
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const snap = redoStackRef.current.pop()
        if (snap) {
          undoStackRef.current.push({ cells: new Set(cells), internalWalls: new Set(internalWalls ?? []), doorOpenings: new Set(doorOpenings ?? []) })
          onRestoreSnapshot?.(snap)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cells, internalWalls, doorOpenings, onRestoreSnapshot])

  // Space key for pan mode
  const spaceRef = useRef(false)
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space' && !e.repeat) { spaceRef.current = true; e.preventDefault() } }
    const up = (e) => { if (e.code === 'Space') spaceRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // R key rotates stairs when stairs tool is active
  useEffect(() => {
    const onKey = (e) => {
      if (tool !== 'stairs') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); setStairRotation(r => (r + 90) % 360) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tool])

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasSize({ w: rect.width, h: rect.height })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const baseCellSize = Math.max(6, Math.min(28, Math.floor(Math.min(
    (canvasSize.w - 80) / gridW,
    (canvasSize.h - 80) / gridD
  ))))
  const cellSize = baseCellSize * zoom
  const gridPxW = gridW * cellSize
  const gridPxH = gridD * cellSize
  const offsetX = Math.floor((canvasSize.w - gridPxW) / 2) + pan.x
  const offsetY = Math.floor((canvasSize.h - gridPxH) / 2) + pan.y

  // ── Canvas drawing ──────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize.w * dpr
    canvas.height = canvasSize.h * dpr
    canvas.style.width = canvasSize.w + 'px'
    canvas.style.height = canvasSize.h + 'px'
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0c0c1a'
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    // Background trace image
    if (bgImage?.img) {
      ctx.globalAlpha = bgImage.opacity ?? 0.4
      const imgW = bgImage.img.width * bgScale * (cellSize / 10)
      const imgH = bgImage.img.height * bgScale * (cellSize / 10)
      ctx.drawImage(bgImage.img, offsetX, offsetY, imgW, imgH)
      ctx.globalAlpha = 1
    }

    // Ghost floor below (faint)
    if (ghostFloorData) {
      const gCells = ghostFloorData.cells instanceof Set ? ghostFloorData.cells : new Set(ghostFloorData.cells ?? [])
      for (const key of gCells) {
        const [c, r] = key.split(',').map(Number)
        ctx.fillStyle = '#1a1a2a'
        ctx.fillRect(offsetX + c * cellSize + 0.5, offsetY + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
      }
      // Ghost boundary walls
      ctx.strokeStyle = '#2a2a4040'
      ctx.lineWidth = 1.5
      for (const key of gCells) {
        const [c, r] = key.split(',').map(Number)
        const x = offsetX + c * cellSize, y = offsetY + r * cellSize
        if (!gCells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke() }
        if (!gCells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
        if (!gCells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke() }
        if (!gCells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
      }
    }

    // Grid dots
    if (cellSize >= 10) {
      ctx.fillStyle = '#1e1e30'
      for (let c = 0; c <= gridW; c++)
        for (let r = 0; r <= gridD; r++)
          ctx.fillRect(offsetX + c * cellSize - 0.5, offsetY + r * cellSize - 0.5, 1, 1)
    }

    // Room zone fills
    roomZones.forEach(({ id: zoneId, cells: zoneCells }, zi) => {
      const isSelectedZone = zi === selectedZoneIdx
      ctx.fillStyle = isSelectedZone ? 'rgba(120,90,238,0.25)' : ZONE_COLORS[zi % ZONE_COLORS.length]
      for (const key of zoneCells) {
        const [c, r] = key.split(',').map(Number)
        ctx.fillRect(offsetX + c * cellSize + 0.5, offsetY + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
      }
      // Selected zone border
      if (isSelectedZone) {
        ctx.strokeStyle = '#7a5aee'
        ctx.lineWidth = 2
        for (const key of zoneCells) {
          const [c, r] = key.split(',').map(Number)
          const x = offsetX + c * cellSize, y = offsetY + r * cellSize
          if (!zoneCells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke() }
          if (!zoneCells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
          if (!zoneCells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke() }
          if (!zoneCells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
        }
      }
      // Zone label at centroid
      let sumC = 0, sumR = 0
      for (const key of zoneCells) { const [c, r] = key.split(',').map(Number); sumC += c; sumR += r }
      const cx = offsetX + (sumC / zoneCells.size + 0.5) * cellSize
      const cy = offsetY + (sumR / zoneCells.size + 0.5) * cellSize
      const label = roomZoneLabels?.[`zone_${zoneId}`] ?? `Room ${zi + 1}`
      ctx.fillStyle = '#a0a0b0'
      ctx.font = `bold ${Math.max(9, cellSize * 0.45)}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(label, cx, cy)
      // Compute zone bounding box for dimensions
      let zMinC = Infinity, zMinR = Infinity, zMaxC = -Infinity, zMaxR = -Infinity
      for (const key of zoneCells) { const [c, r] = key.split(',').map(Number); zMinC = Math.min(zMinC, c); zMinR = Math.min(zMinR, r); zMaxC = Math.max(zMaxC, c); zMaxR = Math.max(zMaxR, r) }
      const zW = zMaxC - zMinC + 1, zD = zMaxR - zMinR + 1
      ctx.fillStyle = '#606080'
      ctx.font = `${Math.max(8, cellSize * 0.35)}px Outfit, sans-serif`
      ctx.fillText(`${zW}×${zD} ft · ${zoneCells.size} sq ft`, cx, cy + Math.max(12, cellSize * 0.45))
      ctx.fillStyle = '#50c87880'
      ctx.font = `${Math.max(7, cellSize * 0.3)}px Outfit, sans-serif`
      ctx.fillText('double-click to edit', cx, cy + Math.max(22, cellSize * 0.8))
      // Dimension rulers along zone edges (when zoomed in enough)
      if (cellSize >= 14) {
        ctx.strokeStyle = '#40608030'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        // Top edge dimension
        const tx = offsetX + zMinC * cellSize, ty = offsetY + zMinR * cellSize - 8
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + zW * cellSize, ty); ctx.stroke()
        ctx.fillStyle = '#607090'
        ctx.font = `${Math.max(8, cellSize * 0.28)}px Outfit, sans-serif`
        ctx.fillText(`${zW}'`, tx + zW * cellSize / 2, ty - 2)
        // Left edge dimension
        const lx = offsetX + zMinC * cellSize - 8, ly = offsetY + zMinR * cellSize
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + zD * cellSize); ctx.stroke()
        ctx.save()
        ctx.translate(lx - 2, ly + zD * cellSize / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${zD}'`, 0, 0)
        ctx.restore()
        ctx.setLineDash([])
      }
    })

    // Active cells (on top of zone fill)
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      ctx.strokeStyle = '#2a3448'
      ctx.lineWidth = 0.3
      ctx.strokeRect(offsetX + c * cellSize + 0.5, offsetY + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
    }

    // Boundary walls
    ctx.strokeStyle = '#8888b0'
    ctx.lineWidth = Math.max(2, cellSize * 0.1)
    ctx.lineCap = 'round'
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      const x = offsetX + c * cellSize, y = offsetY + r * cellSize
      if (!cells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke() }
      if (!cells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
    }

    // Internal walls
    ctx.strokeStyle = '#40b070'
    ctx.lineWidth = Math.max(2, cellSize * 0.1)
    for (const edgeKey of (internalWalls ?? [])) {
      const sep = edgeKey.lastIndexOf(':')
      const [c, r] = edgeKey.slice(0, sep).split(',').map(Number)
      const dir = edgeKey.slice(sep + 1)
      const x = offsetX + c * cellSize, y = offsetY + r * cellSize
      ctx.beginPath()
      if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
      if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
      if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
      if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
      ctx.stroke()
    }

    // Door openings (dashed blue lines)
    ctx.strokeStyle = '#60a0ff'
    ctx.lineWidth = Math.max(2, cellSize * 0.1)
    ctx.setLineDash([cellSize * 0.15, cellSize * 0.1])
    for (const edgeKey of (doorOpenings ?? [])) {
      const sep = edgeKey.lastIndexOf(':')
      const [c, r] = edgeKey.slice(0, sep).split(',').map(Number)
      const dir = edgeKey.slice(sep + 1)
      const x = offsetX + c * cellSize, y = offsetY + r * cellSize
      ctx.beginPath()
      if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
      if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
      if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
      if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Furniture items — rotated footprints from catalogue
    if (cellSize >= 6) {
      const ITEM_CAT = catalogue ?? {}
      for (const it of (items ?? [])) {
        if (it.stairs || it.wall || it.ceiling || it.returnStair) continue
        const def = ITEM_CAT[it.typeKey]
        const size = def?.sizes?.[it.sizeIndex ?? 0] ?? def?.sizes?.[0]
        const [fw, fd] = size?.footprint ?? [1, 1]
        const w = fw * cellSize, h = fd * cellSize
        const rot = ((it.rotation ?? 0) * Math.PI) / 180
        // Use AABB for position (col/row defines top-left of effective footprint)
        const [ew, ed] = getItemFootprint(it, ITEM_CAT)
        const cx = offsetX + (it.col + ew / 2) * cellSize
        const cy = offsetY + (it.row + ed / 2) * cellSize
        const isSel = it.id === selectedId
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rot)
        // Fill
        ctx.fillStyle = isSel ? 'rgba(120,90,238,0.4)' : 'rgba(140,120,180,0.3)'
        ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2)
        // Border
        ctx.strokeStyle = isSel ? '#7a5aee' : '#8070a0'
        ctx.lineWidth = isSel ? 2 : 1
        ctx.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2)
        // Label
        if (cellSize >= 12 && def?.name) {
          ctx.rotate(-rot) // keep text upright
          ctx.fillStyle = isSel ? '#c0b0f0' : '#9080b0'
          ctx.font = `${Math.max(7, cellSize * 0.28)}px Outfit, sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(def.name, 0, 3)
        }
        ctx.restore()
      }
    }

    // Stairs
    for (const it of (items ?? [])) {
      if (!it.stairs || it.returnStair) continue
      const sw = it.stairW ?? 3, sd = it.stairD ?? 5
      const rot = isRotatedSideways(it.rotation)
      const ew = rot ? sd : sw, ed = rot ? sw : sd
      const x = offsetX + it.col * cellSize, y = offsetY + it.row * cellSize
      ctx.fillStyle = 'rgba(180,140,80,0.35)'
      ctx.fillRect(x, y, ew * cellSize, ed * cellSize)
      ctx.strokeStyle = '#b08a50'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x + 1, y + 1, ew * cellSize - 2, ed * cellSize - 2)
      const steps = it.stairCount ?? 14
      ctx.lineWidth = 0.5
      for (let i = 1; i < steps; i++) {
        const frac = i / steps
        ctx.beginPath()
        if (rot) { const sx = x + frac * ew * cellSize; ctx.moveTo(sx, y); ctx.lineTo(sx, y + ed * cellSize) }
        else { const sy = y + frac * ed * cellSize; ctx.moveTo(x, sy); ctx.lineTo(x + ew * cellSize, sy) }
        ctx.stroke()
      }
      ctx.fillStyle = '#b08a50'
      ctx.font = `${Math.max(8, cellSize * 0.35)}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(it.direction === 'down' ? '↓ Down' : '↑ Up', x + ew * cellSize / 2, y + ed * cellSize / 2 + 4)
    }

    // Hover previews
    if (hoverInfo) {
      if ((tool === 'shape' || tool === 'addroom') && hoverInfo.rect) {
        const { startCol, startRow, endCol, endRow, action } = hoverInfo.rect
        const c0 = Math.min(startCol, endCol), c1 = Math.max(startCol, endCol)
        const r0 = Math.min(startRow, endRow), r1 = Math.max(startRow, endRow)
        ctx.fillStyle = action === 'addroom' ? 'rgba(100,160,255,0.3)' : action === 'add' ? 'rgba(70,200,120,0.25)' : 'rgba(255,70,70,0.25)'
        ctx.fillRect(offsetX + c0 * cellSize, offsetY + r0 * cellSize, (c1-c0+1) * cellSize, (r1-r0+1) * cellSize)
        ctx.strokeStyle = action === 'addroom' ? '#60a0ff' : action === 'add' ? '#50c878' : '#ff5050'
        ctx.lineWidth = 1.5
        ctx.strokeRect(offsetX + c0 * cellSize, offsetY + r0 * cellSize, (c1-c0+1) * cellSize, (r1-r0+1) * cellSize)
      } else if ((tool === 'shape' || tool === 'addroom') && hoverInfo.col != null) {
        const { col, row } = hoverInfo
        ctx.fillStyle = cells.has(`${col},${row}`) ? 'rgba(255,70,70,0.2)' : 'rgba(70,200,120,0.2)'
        ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize, cellSize)
      } else if (hoverInfo.edge) {
        const { col, row, dir, isBoundary } = hoverInfo.edge
        const x = offsetX + col * cellSize, y = offsetY + row * cellSize
        ctx.strokeStyle = tool === 'door' ? (isBoundary ? '#ffa040' : '#60a0ff') : '#ffd060'
        ctx.lineWidth = 3
        ctx.beginPath()
        if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
        if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
        if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
        if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
        ctx.stroke()
      } else if (tool === 'stairs' && hoverInfo.col != null) {
        const { col, row } = hoverInfo
        const rot90 = stairRotation === 90 || stairRotation === 270
        const hw = rot90 ? 5 : 3, hd = rot90 ? 3 : 5
        ctx.fillStyle = 'rgba(180,140,80,0.3)'
        ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, hw * cellSize, hd * cellSize)
        ctx.strokeStyle = '#c09040'
        ctx.lineWidth = 1.5
        ctx.strokeRect(offsetX + col * cellSize + 1, offsetY + row * cellSize + 1, hw * cellSize - 2, hd * cellSize - 2)
        // Tread lines
        const steps = 7
        ctx.lineWidth = 0.5; ctx.strokeStyle = '#b08a50'
        for (let i = 1; i < steps; i++) {
          const frac = i / steps
          ctx.beginPath()
          if (rot90) { const sx = offsetX + col * cellSize + frac * hw * cellSize; ctx.moveTo(sx, offsetY + row * cellSize); ctx.lineTo(sx, offsetY + (row + hd) * cellSize) }
          else { const sy = offsetY + row * cellSize + frac * hd * cellSize; ctx.moveTo(offsetX + col * cellSize, sy); ctx.lineTo(offsetX + (col + hw) * cellSize, sy) }
          ctx.stroke()
        }
        // Direction arrow
        ctx.fillStyle = '#c09040'
        ctx.font = `bold ${Math.max(11, cellSize * 0.6)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(['↑','→','↓','←'][stairRotation / 90], offsetX + (col + hw / 2) * cellSize, offsetY + (row + hd / 2) * cellSize + 5)
        // "R to rotate" hint
        ctx.fillStyle = '#a08040'
        ctx.font = `${Math.max(8, cellSize * 0.32)}px Outfit, sans-serif`
        ctx.fillText(`R to rotate (${stairRotation}°)`, offsetX + (col + hw / 2) * cellSize, offsetY + (row + hd + 0.5) * cellSize)
      } else if (tool === 'copy' && clipboard && hoverInfo.col != null) {
        // Show paste preview
        const { col, row } = hoverInfo
        ctx.fillStyle = 'rgba(100,180,255,0.25)'
        for (const k of clipboard.cells) {
          const [dc, dr] = k.split(',').map(Number)
          ctx.fillRect(offsetX + (col + dc) * cellSize, offsetY + (row + dr) * cellSize, cellSize, cellSize)
        }
        ctx.strokeStyle = '#60b0ff'
        ctx.lineWidth = 2
        for (const wk of clipboard.walls) {
          const sep = wk.lastIndexOf(':')
          const [dc, dr] = wk.slice(0, sep).split(',').map(Number)
          const dir = wk.slice(sep + 1)
          const x = offsetX + (col + dc) * cellSize, y = offsetY + (row + dr) * cellSize
          ctx.beginPath()
          if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
          if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
          if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
          if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
          ctx.stroke()
        }
      }
    }

    // Resize drag preview
    if (hoverInfo?.resize && hoverInfo.resize.wallCells) {
      const r = hoverInfo.resize
      const delta = r.currentPos - r.startPos
      if (delta !== 0) {
        ctx.fillStyle = delta > 0 ? 'rgba(70,200,120,0.25)' : 'rgba(255,70,70,0.25)'
        for (const key of r.wallCells) {
          const [c, row] = key.split(',').map(Number)
          for (let d = 1; d <= Math.abs(delta); d++) {
            let nc = c, nr = row
            if (r.wall === 'S') nr = delta > 0 ? row + d : row + 1 - d
            else if (r.wall === 'N') nr = delta < 0 ? row - d : row - 1 + d
            else if (r.wall === 'E') nc = delta > 0 ? c + d : c + 1 - d
            else if (r.wall === 'W') nc = delta < 0 ? c - d : c - 1 + d
            ctx.fillRect(offsetX + nc * cellSize, offsetY + nr * cellSize, cellSize, cellSize)
          }
        }
        // Show delta label
        ctx.fillStyle = delta > 0 ? '#50c878' : '#ff5050'
        ctx.font = `bold ${Math.max(10, cellSize * 0.5)}px Outfit, sans-serif`
        ctx.textAlign = 'center'
        const [fc, fr] = r.wallCells[Math.floor(r.wallCells.length / 2)].split(',').map(Number)
        ctx.fillText(`${delta > 0 ? '+' : ''}${delta} ft`, offsetX + (fc + 0.5) * cellSize, offsetY + (fr + 0.5) * cellSize)
      }
    }

    // Info
    ctx.fillStyle = '#404060'
    ctx.font = '11px Outfit, sans-serif'
    ctx.textAlign = 'left'
    const floorLabel = activeFloorLevel === 0 ? 'Ground Floor' : activeFloorLevel < 0 ? `Basement ${-activeFloorLevel}` : `Floor ${activeFloorLevel + 1}`
    ctx.fillText(`${floorLabel} · ${gridW}×${gridD} ft · ${cells.size} sq ft · ${roomZones.length} rooms · ${Math.round(zoom * 100)}%`, 8, canvasSize.h - 8)
  }, [canvasSize, gridW, gridD, cells, internalWalls, doorOpenings, items, cellSize, offsetX, offsetY, hoverInfo, tool, zoom, roomZones, roomZoneLabels, ghostFloorData, activeFloorLevel, bgImage, bgScale, clipboard, stairRotation, selectedId, catalogue, selectedZoneIdx])

  useEffect(() => { draw() }, [draw])

  // ── Mouse helpers ───────────────────────────────────────────────
  const getCellFromMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left - offsetX
    const py = e.clientY - rect.top - offsetY
    const col = Math.floor(px / cellSize)
    const row = Math.floor(py / cellSize)
    if (col < 0 || col >= gridW || row < 0 || row >= gridD) return null
    return { col, row, fx: (px / cellSize) - col, fy: (py / cellSize) - row }
  }

  const getEdge = (col, row, fx, fy, lockedAxis, allowBoundary = false) => {
    let edges = [
      { dir: 'N', dist: fy, axis: 'h' }, { dir: 'S', dist: 1 - fy, axis: 'h' },
      { dir: 'W', dist: fx, axis: 'v' }, { dir: 'E', dist: 1 - fx, axis: 'v' },
    ]
    if (lockedAxis) edges = edges.filter(e => e.axis === lockedAxis)
    if (edges.length === 0) return null
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)
    if (nearest.dist > 0.45) return null
    const nb = nearest.dir === 'N' ? `${col},${row-1}` : nearest.dir === 'S' ? `${col},${row+1}` :
               nearest.dir === 'W' ? `${col-1},${row}` : `${col+1},${row}`
    if (!cells.has(`${col},${row}`)) return null
    const isBoundary = !cells.has(nb)
    if (isBoundary && !allowBoundary) return null
    return { col, row, dir: nearest.dir, isBoundary }
  }

  // ── Interactions ────────────────────────────────────────────────
  const handleDown = (e) => {
    // Middle mouse OR space+click OR right-click = pan
    if (e.button === 1 || e.button === 2 || spaceRef.current) {
      e.preventDefault()
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      return
    }

    const info = getCellFromMouse(e)
    if (!info) return

    // No tool: select/drag items (including stairs)
    if (!tool) {
      const ITEM_CAT = catalogue ?? {}
      // Use fractional position for precise hit testing
      const clickCol = info.col + info.fx
      const clickRow = info.row + info.fy
      const hit = (items ?? []).find(it => {
        if (it.wall || it.ceiling || it.returnStair) return false
        const [ew, ed] = getItemFootprint(it, ITEM_CAT)
        return clickCol >= it.col && clickCol < it.col + ew && clickRow >= it.row && clickRow < it.row + ed
      })
      if (hit) {
        onSelectItem?.(hit.id)
        const dragId = hit.id
        const offC = info.col - hit.col, offR = info.row - hit.row
        // Get dragged item's size for smart snap
        const hitDef = ITEM_CAT[hit.typeKey]
        const hitSize = hitDef?.sizes?.[hit.sizeIndex ?? 0]
        const [hitFw, hitFd] = hit.stairs ? [hit.stairW ?? 3, hit.stairD ?? 10] : (hitSize?.footprint ?? [1, 1])
        const hitRot = hit.rotation === 90 || hit.rotation === 270
        const hitEw = hitRot ? hitFd : hitFw, hitEd = hitRot ? hitFw : hitFd

        const handleItemMove = (ev) => {
          const g = getCellFromMouse(ev)
          if (!g) return
          let newCol = Math.round((g.col - offC) * 4) / 4
          let newRow = Math.round((g.row - offR) * 4) / 4

          // Smart snap: align to other items in the floor plan
          const SNAP = 0.5
          let bestDx = SNAP, bestDz = SNAP
          let snapCol = newCol, snapRow = newRow
          for (const other of (items ?? [])) {
            if (other.id === dragId || other.wall || other.ceiling || other.returnStair) continue
            const [oew, oed] = getItemFootprint(other, ITEM_CAT)
            const GAP = 0.08  // tight gap for chairs-to-table alignment
            // X alignment: edge-to-edge, center-to-center, adjacent with gap
            for (const [from, to] of [
              [newCol, other.col], [newCol + hitEw, other.col + oew],  // edge align
              [newCol, other.col + oew + GAP], [newCol + hitEw, other.col - GAP],  // adjacent
              [newCol + hitEw/2, other.col + oew/2],  // center
            ]) {
              const dx = Math.abs(from - to)
              if (dx < bestDx) { bestDx = dx; snapCol = newCol + (to - from) }
            }
            // Z alignment
            for (const [from, to] of [
              [newRow, other.row], [newRow + hitEd, other.row + oed],
              [newRow, other.row + oed + GAP], [newRow + hitEd, other.row - GAP],
              [newRow + hitEd/2, other.row + oed/2],
            ]) {
              const dz = Math.abs(from - to)
              if (dz < bestDz) { bestDz = dz; snapRow = newRow + (to - from) }
            }
          }
          newCol = snapCol; newRow = snapRow
          onMoveItem?.(dragId, newCol, newRow)
        }
        const handleItemUp = () => {
          window.removeEventListener('pointermove', handleItemMove)
          window.removeEventListener('pointerup', handleItemUp)
        }
        window.addEventListener('pointermove', handleItemMove)
        window.addEventListener('pointerup', handleItemUp)
      } else {
        onSelectItem?.(null)
        // Also check if clicking a zone — select it for labeling
        const key = `${Math.floor(info.col)},${Math.floor(info.row)}`
        const zIdx = roomZones.findIndex(z => z.cells.has(key))
        setSelectedZoneIdx(zIdx >= 0 ? zIdx : null)
      }
      return
    }

    if (tool === 'shape' || tool === 'addroom') {
      saveUndoSnapshot()
      const key = `${info.col},${info.row}`
      const action = tool === 'addroom' ? 'addroom' : (cells.has(key) ? 'remove' : 'add')
      rectRef.current = { startCol: info.col, startRow: info.row, endCol: info.col, endRow: info.row, action }
      setHoverInfo({ rect: rectRef.current })
    } else if (tool === 'walls') {
      saveUndoSnapshot()
      const edge = getEdge(info.col, info.row, info.fx, info.fy, null)
      if (!edge) return
      const axis = (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v'
      const key = `${edge.col},${edge.row}:${edge.dir}`
      wallDragRef.current = { erasing: internalWalls?.has(key), placed: new Set([key]), axis }
      onToggleWall(key)
    } else if (tool === 'door') {
      const edge = getEdge(info.col, info.row, info.fx, info.fy, null, true)
      if (!edge) return
      saveUndoSnapshot()
      // Check if there's already an opening here — remove it
      const openKey = `${edge.col},${edge.row}:${edge.dir}`
      if (doorOpenings?.has(openKey)) {
        onRemoveDoor?.(edge.col, edge.row, edge.dir)
        return
      }
      if (edge.isBoundary) {
        const wallU = (edge.dir === 'N' || edge.dir === 'S') ? info.col + 0.5 : info.row + 0.5
        onAddExteriorDoor?.(edge.dir, wallU)
      } else {
        onAddDoor?.(info.col, info.row, edge.dir)
      }
    } else if (tool === 'stairs') {
      if (!cells.has(`${info.col},${info.row}`)) return
      // Check if clicking on an existing stair — remove it instead
      const existingStair = (items ?? []).find(it => {
        if (!it.stairs || it.returnStair) return false
        const sw = it.stairW ?? 3, sd = it.stairD ?? 5
        const rot = isRotatedSideways(it.rotation)
        const ew = rot ? sd : sw, ed = rot ? sw : sd
        return info.col >= it.col && info.col < it.col + ew && info.row >= it.row && info.row < it.row + ed
      })
      if (existingStair) {
        if (window.confirm('Remove these stairs?')) onRemoveStairs?.(existingStair.id)
      } else {
        onAddStairs?.(info.col, info.row, stairRotation)
      }
    } else if (tool === 'resize') {
      // Find which boundary wall the user clicked near
      const edge = getEdge(info.col, info.row, info.fx, info.fy, null, true)
      if (!edge || !edge.isBoundary) return
      saveUndoSnapshot()
      // Collect all cells along this boundary edge (contiguous cells sharing the same wall direction)
      const wallCells = []
      const isHoriz = edge.dir === 'N' || edge.dir === 'S'
      for (const key of cells) {
        const [c, r] = key.split(',').map(Number)
        const nb = edge.dir === 'N' ? `${c},${r-1}` : edge.dir === 'S' ? `${c},${r+1}` : edge.dir === 'W' ? `${c-1},${r}` : `${c+1},${r}`
        if (!cells.has(nb)) {
          if (isHoriz && r === info.row) wallCells.push(key)
          else if (!isHoriz && c === info.col) wallCells.push(key)
        }
      }
      const startPos = isHoriz ? info.row : info.col
      resizeDragRef.current = { wall: edge.dir, wallCells, startPos, currentPos: startPos, isHoriz }
      setHoverInfo({ resize: { ...resizeDragRef.current } })
    } else if (tool === 'label') {
      const key = `${info.col},${info.row}`
      const zoneIdx = roomZones.findIndex(z => z.cells.has(key))
      if (zoneIdx >= 0) {
        const rect = canvasRef.current.getBoundingClientRect()
        setEditingLabel({ zoneIdx, x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    } else if (tool === 'copy') {
      const key = `${info.col},${info.row}`
      if (!clipboard) {
        // COPY: capture the zone under cursor
        const zoneIdx = roomZones.findIndex(z => z.cells.has(key))
        if (zoneIdx < 0) return
        const zone = roomZones[zoneIdx]
        // Find bounds and make relative
        let minC = Infinity, minR = Infinity
        for (const k of zone.cells) {
          const [c, r] = k.split(',').map(Number)
          minC = Math.min(minC, c); minR = Math.min(minR, r)
        }
        const relCells = new Set()
        for (const k of zone.cells) {
          const [c, r] = k.split(',').map(Number)
          relCells.add(`${c - minC},${r - minR}`)
        }
        // Capture relative internal walls within this zone
        const relWalls = new Set()
        for (const edgeKey of (internalWalls ?? [])) {
          const sep = edgeKey.lastIndexOf(':')
          const cellKey = edgeKey.slice(0, sep)
          if (zone.cells.has(cellKey)) {
            const [c, r] = cellKey.split(',').map(Number)
            relWalls.add(`${c - minC},${r - minR}:${edgeKey.slice(sep + 1)}`)
          }
        }
        let maxC = 0, maxR = 0
        for (const k of zone.cells) {
          const [c, r] = k.split(',').map(Number)
          maxC = Math.max(maxC, c - minC); maxR = Math.max(maxR, r - minR)
        }
        // Capture items within this zone (relative positions)
        const relItems = (items ?? []).filter(it => !it.stairs && zone.cells.has(`${it.col},${it.row}`))
          .map(it => ({ typeKey: it.typeKey, col: it.col - minC, row: it.row - minR, rotation: it.rotation ?? 0, sizeIndex: it.sizeIndex ?? 0, swatchIndex: it.swatchIndex ?? 0 }))
        setClipboard({ cells: relCells, walls: relWalls, items: relItems, w: maxC + 1, d: maxR + 1 })
      } else {
        // PASTE: place copied room at cursor position
        const { cells: relCells, walls: relWalls } = clipboard
        const baseC = info.col, baseR = info.row
        for (const k of relCells) {
          const [dc, dr] = k.split(',').map(Number)
          const key = `${baseC + dc},${baseR + dr}`
          if (!cells.has(key)) onToggleCell(baseC + dc, baseR + dr)
        }
        for (const wk of relWalls) {
          const sep = wk.lastIndexOf(':')
          const [dc, dr] = wk.slice(0, sep).split(',').map(Number)
          const dir = wk.slice(sep + 1)
          const newKey = `${baseC + dc},${baseR + dr}:${dir}`
          if (!internalWalls?.has(newKey)) onToggleWall(newKey)
        }
        // Paste copied items (offset to paste position)
        if (clipboard.items?.length > 0) onPlaceTemplateItems?.(clipboard.items, baseC, baseR)
        setClipboard(null)  // Clear after paste (click again on source to re-copy)
      }
    }
  }

  const handleMove = (e) => {
    // Pan
    if (panStartRef.current) {
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y })
      return
    }

    const info = getCellFromMouse(e)
    if (!info) { setHoverInfo(null); return }

    if (tool === 'shape' || tool === 'addroom') {
      if (rectRef.current) {
        rectRef.current.endCol = info.col; rectRef.current.endRow = info.row
        setHoverInfo({ rect: { ...rectRef.current } })
      } else {
        setHoverInfo({ col: info.col, row: info.row })
      }
    } else if (tool === 'walls' || tool === 'door') {
      const lockedAxis = wallDragRef.current?.axis ?? null
      const edge = getEdge(info.col, info.row, info.fx, info.fy, lockedAxis, tool === 'door')
      setHoverInfo(edge ? { edge } : null)
      if (wallDragRef.current && edge) {
        const edgeAxis = (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v'
        if (edgeAxis !== wallDragRef.current.axis) return
        const key = `${edge.col},${edge.row}:${edge.dir}`
        if (wallDragRef.current.placed.has(key)) return
        wallDragRef.current.placed.add(key)
        if (wallDragRef.current.erasing) { if (internalWalls?.has(key)) onToggleWall(key) }
        else { if (!internalWalls?.has(key)) onToggleWall(key) }
      }
    } else if (tool === 'resize') {
      if (resizeDragRef.current) {
        const r = resizeDragRef.current
        r.currentPos = r.isHoriz ? info.row : info.col
        setHoverInfo({ resize: { ...r } })
      } else {
        // Show hover for boundary edges
        const edge = getEdge(info.col, info.row, info.fx, info.fy, null, true)
        setHoverInfo(edge?.isBoundary ? { edge, resize: true } : null)
      }
    } else if (tool === 'stairs' || tool === 'copy') {
      setHoverInfo({ col: info.col, row: info.row })
    }
  }

  const handleUp = () => {
    panStartRef.current = null
    if (rectRef.current) {
      const { startCol, startRow, endCol, endRow, action } = rectRef.current
      const c0 = Math.min(startCol, endCol), c1 = Math.max(startCol, endCol)
      const r0 = Math.min(startRow, endRow), r1 = Math.max(startRow, endRow)

      if (action === 'addroom') {
        // Add Room: add cells, then add internal walls where new room
        // touches EXISTING cells (shared edges become internal walls)
        // First, note which cells already exist (neighbors)
        const existingBefore = new Set(cells)
        // Add all cells in the rectangle
        for (let c = c0; c <= c1; c++)
          for (let r = r0; r <= r1; r++)
            if (!cells.has(`${c},${r}`)) onToggleCell(c, r)
        // Now add internal walls ONLY where the new room borders existing floor
        // (not at outer edges — those get boundary walls automatically)
        const wallsToAdd = []
        for (let c = c0; c <= c1; c++) {
          if (existingBefore.has(`${c},${r0 - 1}`)) wallsToAdd.push(`${c},${r0}:N`)
          if (existingBefore.has(`${c},${r1 + 1}`)) wallsToAdd.push(`${c},${r1}:S`)
        }
        for (let r = r0; r <= r1; r++) {
          if (existingBefore.has(`${c0 - 1},${r}`)) wallsToAdd.push(`${c0},${r}:W`)
          if (existingBefore.has(`${c1 + 1},${r}`)) wallsToAdd.push(`${c1},${r}:E`)
        }
        // Add walls (not toggle — only add if not already present)
        for (const wk of wallsToAdd) {
          if (!internalWalls?.has(wk)) onToggleWall(wk)
        }
      } else {
        for (let c = c0; c <= c1; c++)
          for (let r = r0; r <= r1; r++) {
            const key = `${c},${r}`
            if (action === 'add' && !cells.has(key)) onToggleCell(c, r)
            if (action === 'remove' && cells.has(key)) onToggleCell(c, r)
          }
      }
      rectRef.current = null; setHoverInfo(null)
    }
    // Apply resize drag
    if (resizeDragRef.current) {
      const r = resizeDragRef.current
      const delta = r.currentPos - r.startPos
      if (delta !== 0) {
        // Expand or shrink: add/remove rows of cells along the wall
        for (const key of r.wallCells) {
          const [c, row] = key.split(',').map(Number)
          if (r.wall === 'S') {
            // Dragging south wall: add cells below or remove from bottom
            for (let d = 1; d <= Math.abs(delta); d++) {
              const nr = delta > 0 ? row + d : row + 1 - d
              if (delta > 0 && !cells.has(`${c},${nr}`)) onToggleCell(c, nr)
              if (delta < 0 && cells.has(`${c},${nr}`)) onToggleCell(c, nr)
            }
          } else if (r.wall === 'N') {
            for (let d = 1; d <= Math.abs(delta); d++) {
              const nr = delta < 0 ? row - d : row - 1 + d
              if (delta < 0 && !cells.has(`${c},${nr}`)) onToggleCell(c, nr)
              if (delta > 0 && cells.has(`${c},${nr}`)) onToggleCell(c, nr)
            }
          } else if (r.wall === 'E') {
            for (let d = 1; d <= Math.abs(delta); d++) {
              const nc = delta > 0 ? c + d : c + 1 - d
              if (delta > 0 && !cells.has(`${nc},${row}`)) onToggleCell(nc, row)
              if (delta < 0 && cells.has(`${nc},${row}`)) onToggleCell(nc, row)
            }
          } else if (r.wall === 'W') {
            for (let d = 1; d <= Math.abs(delta); d++) {
              const nc = delta < 0 ? c - d : c - 1 + d
              if (delta < 0 && !cells.has(`${nc},${row}`)) onToggleCell(nc, row)
              if (delta > 0 && cells.has(`${nc},${row}`)) onToggleCell(nc, row)
            }
          }
        }
      }
      resizeDragRef.current = null; setHoverInfo(null)
    }
    wallDragRef.current = null
  }

  // Zoom with scroll wheel
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 1.12 : 0.89
    setZoom(z => Math.max(0.3, Math.min(5, z * delta)))
  }

  const sideW = 170
  const toolBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px', borderRadius: 8, border: 'none', width: '100%',
    background: active ? '#2a8a5a20' : 'transparent',
    color: active ? '#50c878' : '#606080',
    fontWeight: active ? 700 : 600, fontSize: 12,
    cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
    textAlign: 'left', outline: active ? '1px solid #2a8a5a40' : 'none',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0c0c1a', display: 'flex', fontFamily: "'Outfit',sans-serif" }}>
      {/* Sidebar — scrollable so many floors don't push controls off screen */}
      <div style={{ width: sideW, borderRight: '1px solid #1a1a2a', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#d0d0e0', padding: '8px 10px 12px' }}>Floor Plan</div>

        {/* Floor management */}
        <div style={{ padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#505070', textTransform: 'uppercase', letterSpacing: 0.5 }}>Floors</div>
        <div style={{ display: 'flex', gap: 2, margin: '0 6px 4px', background: '#12122a', borderRadius: 6, padding: 2, flexWrap: 'wrap', maxHeight: 120, overflowY: 'auto' }}>
          {/* Show ALL rooms sorted by level — deduplicated by level */}
          {Object.entries(allRoomsData ?? {})
            .map(([id, r]) => ({ roomId: Number(id), level: r.level ?? 0 }))
            .sort((a, b) => a.level - b.level)
            .filter((f, i, arr) => i === 0 || f.level !== arr[i-1].level)
            .map(f => (
              <button key={f.roomId} onClick={() => onSwitchFloor?.(f.roomId, f.level)}
                style={{
                  flex: 1, minWidth: 28, padding: '5px 6px', borderRadius: 4, border: 'none', fontSize: 10, fontWeight: 700,
                  background: f.level === activeFloorLevel ? '#2a8a5a30' : 'transparent',
                  color: f.level === activeFloorLevel ? '#50c878' : '#505070',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{f.level < 0 ? `B${-f.level}` : `F${f.level + 1}`}</button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 3, margin: '0 6px 2px' }}>
          <button onClick={() => onAddFloor?.('above')} style={{ flex: 1, padding: '5px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#707090', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'inherit' }}>+ Floor Above</button>
          <button onClick={() => onAddFloor?.('below')} style={{ flex: 1, padding: '5px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#707090', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'inherit' }}>+ Floor Below</button>
        </div>
        {/* Batch add — type a number and add many floors at once */}
        <div style={{ display: 'flex', gap: 3, margin: '0 6px 6px', alignItems: 'center' }}>
          <input id="ddd-batch-floors" type="number" min="2" max="50" defaultValue="5" style={{
            width: 40, padding: '4px 6px', borderRadius: 4, border: '1px solid #2a2a40',
            background: '#12122a', color: '#b0b0c0', fontSize: 10, fontFamily: 'inherit',
            textAlign: 'center', outline: 'none',
          }} />
          <button onClick={() => {
            const n = parseInt(document.getElementById('ddd-batch-floors')?.value, 10)
            if (n >= 2 && n <= 50) onAddFloor?.('above', n)
          }} style={{
            flex: 1, padding: '5px', borderRadius: 4, border: '1px solid #2a2a40',
            background: '#12122a', color: '#707090', cursor: 'pointer', fontSize: 10,
            fontWeight: 600, fontFamily: 'inherit',
          }}>+ Add Floors</button>
        </div>
        {/* Delete floors toggle */}
        {(() => {
          const allFloors = Object.entries(allRoomsData ?? {})
            .map(([id, r]) => ({ roomId: Number(id), level: r.level ?? 0 }))
            .sort((a, b) => a.level - b.level)
            .filter((f, i, arr) => i === 0 || f.level !== arr[i-1].level)
          return allFloors.length > 1 && (
            <div style={{ margin: '0 6px 6px' }}>
              <button onClick={() => { setDeleteMode(d => !d); setDeleteSelection(new Set()) }} style={{
                width: '100%', padding: '5px', borderRadius: 4,
                border: `1px solid ${deleteMode ? '#5a2a2a' : '#2a2a40'}`,
                background: deleteMode ? '#2a1515' : '#12122a',
                color: deleteMode ? '#e06060' : '#707090',
                cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'inherit',
              }}>{deleteMode ? '✕ Cancel Delete' : '🗑 Delete Floors...'}</button>
              {deleteMode && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', background: '#1a1218', borderRadius: 6, padding: 3, maxHeight: 100, overflowY: 'auto', marginBottom: 4 }}>
                    {allFloors.map(f => {
                      const isCurrent = f.level === activeFloorLevel
                      const isSelected = deleteSelection.has(f.roomId)
                      return (
                        <button key={f.roomId} disabled={isCurrent}
                          onClick={() => setDeleteSelection(prev => {
                            const next = new Set(prev)
                            next.has(f.roomId) ? next.delete(f.roomId) : next.add(f.roomId)
                            return next
                          })}
                          title={isCurrent ? "Can't delete the floor you're on" : `${isSelected ? 'Deselect' : 'Select'} ${f.level < 0 ? `B${-f.level}` : `F${f.level + 1}`}`}
                          style={{
                            flex: 1, minWidth: 28, padding: '5px 6px', borderRadius: 4, border: 'none',
                            fontSize: 10, fontWeight: 700, cursor: isCurrent ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            background: isSelected ? '#5a2a2a' : isCurrent ? '#1a1a2a' : 'transparent',
                            color: isSelected ? '#ff6060' : isCurrent ? '#303050' : '#707090',
                            opacity: isCurrent ? 0.4 : 1,
                          }}>{f.level < 0 ? `B${-f.level}` : `F${f.level + 1}`}</button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button onClick={() => {
                      const all = allFloors.filter(f => f.level !== activeFloorLevel).map(f => f.roomId)
                      setDeleteSelection(new Set(all))
                    }} style={{
                      flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #3a2020',
                      background: '#1a1010', color: '#c06060', cursor: 'pointer', fontSize: 9,
                      fontWeight: 600, fontFamily: 'inherit',
                    }}>Select All</button>
                    <button disabled={deleteSelection.size === 0} onClick={() => {
                      const count = deleteSelection.size
                      if (!window.confirm(`Delete ${count} floor${count > 1 ? 's' : ''}? This cannot be undone.`)) return
                      onDeleteFloors?.([...deleteSelection])
                      setDeleteSelection(new Set())
                      setDeleteMode(false)
                    }} style={{
                      flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #5a2020',
                      background: deleteSelection.size > 0 ? '#3a1515' : '#1a1010',
                      color: deleteSelection.size > 0 ? '#ff5050' : '#503030',
                      cursor: deleteSelection.size > 0 ? 'pointer' : 'not-allowed',
                      fontSize: 9, fontWeight: 700, fontFamily: 'inherit',
                    }}>Delete {deleteSelection.size > 0 ? `(${deleteSelection.size})` : ''}</button>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        <div style={{ height: 1, background: '#1e1e30', margin: '2px 10px' }} />

        {/* ── 4 Primary tools (2×2 grid) ─────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '4px 8px' }}>
          {PRIMARY_TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(tool === t.id ? null : t.id)} title={t.desc} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 4px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
              border: tool === t.id ? '1.5px solid #7a5aee' : '1px solid #2a2a40',
              background: tool === t.id ? 'rgba(120,90,238,0.18)' : '#12122a',
              color: tool === t.id ? '#a090ff' : '#7070a0',
              fontSize: 10, fontWeight: 600,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── "More tools" overflow toggle ─────────────────── */}
        <button onClick={() => setShowMoreTools(p => !p)} style={{
          width: 'calc(100% - 16px)', margin: '2px 8px',
          padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 5, border: '1px solid #2a2a40', borderRadius: 5,
          background: showMoreTools ? '#1a1a30' : '#12122a',
          color: '#6060a0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 600,
        }}>
          <span style={{ fontSize: 13 }}>{showMoreTools ? '▲' : '···'}</span>
          {showMoreTools ? 'Less' : 'More tools'}
        </button>
        {showMoreTools && (
          <div style={{ padding: '0 0 4px' }}>
            {SECONDARY_TOOLS.map(t => (
              <button key={t.id} onClick={() => setTool(tool === t.id ? null : t.id)} style={toolBtn(tool === t.id)} title={t.desc}>
                <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#1e1e30', margin: '6px 10px' }} />

        {/* Import section */}
        <div style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#505070', textTransform: 'uppercase', letterSpacing: 0.5 }}>Import</div>
        <button onClick={() => fileInputRef.current?.click()} style={toolBtn(false)} title="Upload a floor plan image to trace over">
          <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>📷</span>
          <span>Trace Image</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const img = new Image()
            img.onload = () => setBgImage({ img, opacity: 0.35 })
            img.src = URL.createObjectURL(file)
            e.target.value = ''
          }}
        />
        <button onClick={() => setShowImport('dims')} style={toolBtn(false)} title="Quick-add a room by typing dimensions">
          <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>📐</span>
          <span>Room Size</span>
        </button>
        <button onClick={() => roomPlanInputRef.current?.click()} style={toolBtn(false)} title="Import Apple RoomPlan LiDAR scan (JSON)">
          <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>📱</span>
          <span>LiDAR Scan</span>
        </button>
        <input ref={roomPlanInputRef} type="file" accept=".json,.zip" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
              try {
                const data = JSON.parse(ev.target.result)
                // RoomPlan JSON has walls[] with start/end points
                // Convert to cells by rasterizing wall bounding box
                const walls = data.walls ?? data.rooms?.[0]?.walls ?? []
                if (walls.length === 0) { alert('No walls found in scan file'); return }
                let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity
                for (const w of walls) {
                  const pts = w.start ? [w.start, w.end] : w.vertices ?? []
                  for (const p of pts) {
                    const x = p.x ?? p[0] ?? 0, z = p.z ?? p[2] ?? p.y ?? 0
                    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
                    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
                  }
                }
                // Convert meters to feet, create cells
                const scale = 3.281  // meters to feet
                const w = Math.ceil((maxX - minX) * scale)
                const d = Math.ceil((maxZ - minZ) * scale)
                if (w > 0 && d > 0 && w < 200 && d < 200) {
                  onResizeGrid?.(Math.max(gridW, w + 2), Math.max(gridD, d + 2))
                  // Fill cells for the scanned area
                  for (let c = 1; c <= w; c++)
                    for (let r = 1; r <= d; r++)
                      if (!cells.has(`${c},${r}`)) onToggleCell(c, r)
                  alert(`Imported ${w}×${d} ft floor plan from scan`)
                }
              } catch (err) { alert('Could not parse scan file: ' + err.message) }
            }
            reader.readAsText(file)
            e.target.value = ''
          }}
        />

        {/* Background image controls */}
        {bgImage && (
          <div style={{ padding: '4px 10px', fontSize: 11, color: '#505070' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <span>Opacity</span>
              <input type="range" min={0} max={100} value={(bgImage.opacity ?? 0.35) * 100}
                onChange={e => setBgImage(prev => ({ ...prev, opacity: e.target.value / 100 }))}
                style={{ flex: 1, height: 14 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>Scale</span>
              <input type="range" min={20} max={300} value={bgScale * 100}
                onChange={e => setBgScale(e.target.value / 100)}
                style={{ flex: 1, height: 14 }}
              />
              <button onClick={() => setBgImage(null)} style={{ background: 'none', border: 'none', color: '#ff6060', cursor: 'pointer', fontSize: 11 }}>✕</button>
            </div>
          </div>
        )}

        {/* Room type labels — click a zone on the canvas, then click a label to name it */}
        <div style={{ height: 1, background: '#1e1e30', margin: '6px 10px' }} />
        <div style={{ padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#505070', textTransform: 'uppercase', letterSpacing: 0.5 }}>Room Labels</div>
        <div style={{ fontSize: 9, color: '#404060', padding: '0 10px 4px' }}>
          {selectedZoneIdx != null
            ? <span>Selected: <strong style={{ color: '#a0a0c0' }}>{roomZoneLabels?.[`zone_${roomZones[selectedZoneIdx]?.id}`] || `Room ${selectedZoneIdx + 1}`}</strong> — click a label</span>
            : 'Click a room on the plan to select it, then click a label'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '0 6px 4px', flexShrink: 0 }}>
          {[
            { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
            { id: 'living', label: 'Living Room', icon: '🛋' },
            { id: 'bedroom', label: 'Bedroom', icon: '🛏' },
            { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
            { id: 'dining', label: 'Dining Room', icon: '🍽' },
            { id: 'office', label: 'Office', icon: '💻' },
            { id: 'entry', label: 'Entryway', icon: '🚪' },
            { id: 'hallway', label: 'Hallway', icon: '🚶' },
            { id: 'laundry', label: 'Laundry', icon: '🧺' },
            { id: 'garage', label: 'Garage', icon: '🚗' },
            { id: 'closet', label: 'Closet', icon: '👔' },
            { id: 'nursery', label: 'Nursery', icon: '👶' },
            { id: 'guest', label: 'Guest Room', icon: '🏨' },
            { id: 'patio', label: 'Patio', icon: '☀️' },
            { id: 'storage', label: 'Storage', icon: '📦' },
          ].map(rt => (
            <button key={rt.id}
              onClick={() => {
                if (selectedZoneIdx != null) onSetZoneLabel?.(selectedZoneIdx, rt.label)
                else if (roomZones.length === 1) onSetZoneLabel?.(0, rt.label)
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', rt.label)
                setDraggingLabel({ label: rt.label, icon: rt.icon })
              }}
              onDragEnd={() => setDraggingLabel(null)}
              style={{
                padding: '3px 8px', borderRadius: 5, border: '1px solid #2a2a40',
                background: '#12122a', color: '#808090', cursor: 'grab',
                fontSize: 10, fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
              {rt.icon} {rt.label}
            </button>
          ))}
        </div>

        {/* Building templates (full floor plans) */}
        <div style={{ height: 1, background: '#1e1e30', margin: '6px 10px' }} />
        <div style={{ padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#505070', textTransform: 'uppercase', letterSpacing: 0.5 }}>Buildings</div>
        <div style={{ padding: '0 0 4px', flexShrink: 0 }}>
          {BUILDING_TEMPLATES.map(b => (
            <button key={b.id} onClick={() => {
              if (cells.size > 0 && !window.confirm(`Load "${b.name}"? This replaces the current floor plan.`)) return
              onLoadBuilding?.(b)
            }} title={`${b.name}: ${b.desc} (${b.floors.length} floor${b.floors.length > 1 ? 's' : ''})`}
              style={toolBtn(false)}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{b.icon}</span>
              <span>{b.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: '#505070' }}>{b.floors.length}F</span>
            </button>
          ))}
        </div>

        {/* Export */}
        <div style={{ height: 1, background: '#1e1e30', margin: '6px 10px' }} />
        <button onClick={() => exportFloorPlanPNG(cells, internalWalls, gridW, gridD, roomZones, roomZoneLabels, items)}
          style={{ margin: '0 6px', padding: '8px', borderRadius: 6, border: '1px solid #2a2a40', background: '#12122a', color: '#707090', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', width: 'calc(100% - 12px)' }}>
          📄 Export Floor Plan (PNG)
        </button>

        <div style={{ flex: 1 }} />

        {/* Workspace size */}
        <div style={{ padding: '4px 10px', fontSize: 10, color: '#404060' }}>
          <div style={{ marginBottom: 3, fontWeight: 600 }}>Workspace</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input type="number" min={10} max={200} value={gridInput.w}
              onChange={e => setGridInput(g => ({ ...g, w: Number(e.target.value) || gridW }))}
              style={{ width: 40, padding: '3px 4px', borderRadius: 3, border: '1px solid #2a2a40', background: '#12122a', color: '#b0b0c0', fontSize: 10, textAlign: 'center', fontFamily: 'inherit' }}
            />
            <span>×</span>
            <input type="number" min={10} max={200} value={gridInput.d}
              onChange={e => setGridInput(g => ({ ...g, d: Number(e.target.value) || gridD }))}
              style={{ width: 40, padding: '3px 4px', borderRadius: 3, border: '1px solid #2a2a40', background: '#12122a', color: '#b0b0c0', fontSize: 10, textAlign: 'center', fontFamily: 'inherit' }}
            />
            <span>ft</span>
            <button onClick={() => onResizeGrid?.(Math.max(10, Math.min(200, gridInput.w)), Math.max(10, Math.min(200, gridInput.d)))}
              disabled={gridInput.w === gridW && gridInput.d === gridD}
              style={{ padding: '3px 8px', borderRadius: 3, border: '1px solid #2a2a40', background: (gridInput.w !== gridW || gridInput.d !== gridD) ? '#2a5a4a' : '#12122a', color: (gridInput.w !== gridW || gridInput.d !== gridD) ? '#50c878' : '#404060', cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: 'inherit' }}>
              Set
            </button>
          </div>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 10px' }}>
          <button onClick={() => setZoom(z => Math.min(5, z * 1.25))} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 13 }}>+</button>
          <button onClick={() => setZoom(1)} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 10 }}>{Math.round(zoom*100)}%</button>
          <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 13 }}>−</button>
        </div>

        <button onClick={() => {
          // Validate: check for stairs clipping outside room bounds
          const errors = []
          for (const it of (items ?? [])) {
            if (!it.stairs || it.returnStair) continue
            const sw = it.stairW ?? 3, sd = it.stairD ?? 5
            const rot = isRotatedSideways(it.rotation)
            const ew = rot ? sd : sw, ed = rot ? sw : sd
            for (let dc = 0; dc < ew; dc++)
              for (let dr = 0; dr < ed; dr++)
                if (!cells.has(`${it.col + dc},${it.row + dr}`))
                  errors.push(`Stairs at (${it.col},${it.row}) extend outside the floor`)
          }
          if (errors.length > 0) {
            alert('Fix before leaving:\n\n' + [...new Set(errors)].join('\n'))
            return
          }
          onDone()
        }} style={{
          padding: '10px', borderRadius: 8, border: 'none', margin: '6px',
          background: '#2a8a5a', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>← Back to Builder</button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const label = e.dataTransfer.getData('text/plain')
            if (!label) return
            const info = getCellFromMouse(e)
            if (!info) return
            const key = `${Math.floor(info.col)},${Math.floor(info.row)}`
            const zIdx = roomZones.findIndex(z => z.cells.has(key))
            if (zIdx >= 0) {
              onSetZoneLabel?.(zIdx, label)
              setSelectedZoneIdx(zIdx)
            }
            setDraggingLabel(null)
          }}
          onDoubleClick={(e) => {
            const info = getCellFromMouse(e)
            if (!info) return
            const key = `${info.col},${info.row}`
            const zoneIdx = roomZones.findIndex(z => z.cells.has(key))
            if (zoneIdx >= 0) onEditZone?.(zoneIdx)
          }}
          onWheel={handleWheel}
          onContextMenu={e => e.preventDefault()}
          onMouseLeave={() => { setHoverInfo(null); rectRef.current = null; wallDragRef.current = null; resizeDragRef.current = null; panStartRef.current = null }}
          style={{ cursor: panStartRef.current ? 'grabbing' : !tool ? 'default' : tool === 'label' ? 'text' : 'crosshair', display: 'block', position: 'absolute', inset: 0 }}
        />

        {/* Inline label editor */}
        {editingLabel && (
          <input
            autoFocus
            defaultValue={roomZoneLabels?.[`zone_${roomZones[editingLabel.zoneIdx]?.id}`] ?? ''}
            onBlur={(e) => { onSetZoneLabel?.(editingLabel.zoneIdx, e.target.value); setEditingLabel(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onSetZoneLabel?.(editingLabel.zoneIdx, e.target.value); setEditingLabel(null) } if (e.key === 'Escape') setEditingLabel(null) }}
            style={{
              position: 'absolute', left: editingLabel.x - 60, top: editingLabel.y - 14,
              width: 120, padding: '4px 8px', borderRadius: 6,
              background: '#1a1a30', border: '1px solid #50c878', color: '#e0e0f0',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', textAlign: 'center',
              zIndex: 10,
            }}
          />
        )}

        {/* Selected item info panel */}
        {selectedId != null && !tool && (() => {
          const ITEM_CAT = catalogue ?? {}
          const selItem = (items ?? []).find(it => it.id === selectedId)
          if (!selItem) return null
          const def = ITEM_CAT[selItem.typeKey]
          const isStair = !!selItem.stairs
          const name = isStair ? 'Stairs' : def?.name ?? selItem.typeKey
          const curSize = def?.sizes?.[selItem.sizeIndex ?? 0]
          const [ew, ed] = getItemFootprint(selItem, ITEM_CAT)
          const totalSizes = def?.sizes?.length ?? 1
          const sizeLabel = curSize?.label ? `${curSize.label} (${ew}×${ed})` : `${ew}×${ed} ft`
          const btnStyle = { padding: '4px 10px', borderRadius: 6, border: '1px solid #3a3a5a', background: '#1a1a30', color: '#a0a0c0', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
          return (
            <div style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(10,8,24,0.92)', backdropFilter: 'blur(8px)',
              border: '1px solid #3a3a5a', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0' }}>{name}</span>
              <span style={{ fontSize: 10, color: '#8080a0' }}>{sizeLabel}</span>
              {totalSizes > 1 && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {def.sizes.map((s, i) => (
                    <button key={i} onClick={() => onResizeItem?.(selectedId, i)}
                      style={{ ...btnStyle, background: i === (selItem.sizeIndex ?? 0) ? '#2a2a5a' : '#1a1a30', color: i === (selItem.sizeIndex ?? 0) ? '#b0a0f0' : '#606080', padding: '3px 8px', fontSize: 10 }}
                      title={s.label}>{s.label ?? `Size ${i + 1}`}</button>
                  ))}
                </div>
              )}
              <button onClick={() => onRotateItem?.(selectedId, 90)} style={btnStyle} title="Rotate 90°">↻</button>
              <button onClick={() => onDeleteItem?.(selectedId)} style={{ ...btnStyle, border: '1px solid #5a2a2a', background: '#2a1515', color: '#ff6060' }} title="Delete">✕</button>
            </div>
          )
        })()}

        {/* Tool hint */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 14px', borderRadius: 8, background: '#1a1a30', color: '#606080',
          fontSize: 11, fontWeight: 600, pointerEvents: 'none',
        }}>
          {!tool
            ? 'Select a tool to start editing'
            : tool === 'copy' && clipboard
              ? 'Click to paste the copied room · ESC to cancel'
              : tool === 'stairs'
                ? `Click a cell to place stairs · R to rotate (${stairRotation}°)`
                : TOOLS.find(t => t.id === tool)?.desc ?? ''
          } · Right-click to pan · Scroll to zoom
        </div>
      </div>

      {/* Dimension input modal */}
      {showImport === 'dims' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
        }} onClick={() => setShowImport(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#14142a', border: '1px solid #2a2a40', borderRadius: 14,
            padding: 20, width: 320, fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#d0d0e0', marginBottom: 14 }}>Add Room by Dimensions</div>
            <div style={{ fontSize: 11, color: '#606080', marginBottom: 8 }}>Type the room size in feet. It will be added to the floor plan.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input placeholder="Room name (e.g. Kitchen)" value={dimInput.name}
                onChange={e => setDimInput(d => ({ ...d, name: e.target.value }))}
                style={{ padding: '7px 10px', background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 6, color: '#c0c0e0', fontSize: 13, fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" min={2} max={60} value={dimInput.w} placeholder="Width"
                  onChange={e => setDimInput(d => ({ ...d, w: Number(e.target.value) || 10 }))}
                  style={{ flex: 1, padding: '7px 10px', background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 6, color: '#c0c0e0', fontSize: 13, textAlign: 'center' }}
                />
                <span style={{ color: '#606080' }}>×</span>
                <input type="number" min={2} max={60} value={dimInput.d} placeholder="Depth"
                  onChange={e => setDimInput(d => ({ ...d, d: Number(e.target.value) || 10 }))}
                  style={{ flex: 1, padding: '7px 10px', background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 6, color: '#c0c0e0', fontSize: 13, textAlign: 'center' }}
                />
                <span style={{ color: '#606080', fontSize: 12 }}>ft</span>
              </div>
              <button onClick={() => {
                const w = Math.max(2, Math.min(60, dimInput.w))
                const d = Math.max(2, Math.min(60, dimInput.d))
                // Ensure grid is big enough
                onResizeGrid?.(Math.max(gridW, w + 2), Math.max(gridD, d + 2))
                // Add cells for this room (offset by 1 so there's a border)
                for (let c = 1; c <= w; c++)
                  for (let r = 1; r <= d; r++)
                    if (!cells.has(`${c},${r}`)) onToggleCell(c, r)
                setShowImport(false)
              }} style={{
                padding: '10px', borderRadius: 8, border: 'none',
                background: '#2a8a5a', color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
              }}>Add {dimInput.w}×{dimInput.d} ft Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
