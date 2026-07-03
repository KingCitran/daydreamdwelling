// FloorPlanPage — full-screen 2D floor plan editor.
// Tools: Floor Shape, Walls, Doors, Stairs, Room Labels.
// Zoom/pan, floor switcher, ghost floor below.
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'

const TOOLS = [
  { id: 'shape',  label: 'Floor Shape',  icon: '▦', desc: 'Drag rectangles to add/remove floor area' },
  { id: 'walls',  label: 'Walls',        icon: '┼', desc: 'Click edges between cells to draw walls' },
  { id: 'door',   label: 'Doors',        icon: '▯', desc: 'Click a wall edge to place a door' },
  { id: 'stairs', label: 'Stairs',       icon: '⟋', desc: 'Click a cell to place stairs' },
  { id: 'label',  label: 'Room Names',   icon: 'Aa', desc: 'Click a room area to name it' },
]

// Flood-fill to detect room zones from internal walls
export function detectRoomZones(cells, internalWalls) {
  const visited = new Set()
  const zones = []
  const hasWall = (col, row, dir) => {
    if (internalWalls?.has(`${col},${row}:${dir}`)) return true
    const opp = { N: 'S', S: 'N', W: 'E', E: 'W' }
    const nc = dir === 'W' ? col-1 : dir === 'E' ? col+1 : col
    const nr = dir === 'N' ? row-1 : dir === 'S' ? row+1 : row
    return internalWalls?.has(`${nc},${nr}:${opp[dir]}`)
  }

  for (const key of cells) {
    if (visited.has(key)) continue
    const zone = new Set()
    const queue = [key]
    while (queue.length > 0) {
      const cur = queue.pop()
      if (visited.has(cur) || !cells.has(cur)) continue
      visited.add(cur)
      zone.add(cur)
      const [c, r] = cur.split(',').map(Number)
      if (!hasWall(c, r, 'N') && cells.has(`${c},${r-1}`) && !visited.has(`${c},${r-1}`)) queue.push(`${c},${r-1}`)
      if (!hasWall(c, r, 'S') && cells.has(`${c},${r+1}`) && !visited.has(`${c},${r+1}`)) queue.push(`${c},${r+1}`)
      if (!hasWall(c, r, 'W') && cells.has(`${c-1},${r}`) && !visited.has(`${c-1},${r}`)) queue.push(`${c-1},${r}`)
      if (!hasWall(c, r, 'E') && cells.has(`${c+1},${r}`) && !visited.has(`${c+1},${r}`)) queue.push(`${c+1},${r}`)
    }
    if (zone.size > 0) zones.push(zone)
  }
  return zones
}

// Assign stable colors to zones
const ZONE_COLORS = ['#3a5a8a40','#8a5a3a40','#3a8a5a40','#8a3a5a40','#5a8a3a40','#5a3a8a40','#8a8a3a40','#3a8a8a40']

export default function FloorPlanPage({
  gridW, gridD, cells, internalWalls, items,
  onToggleCell, onToggleWall, onResizeGrid, onDone,
  onAddStairs, onRemoveStairs, onAddDoor,
  onBulkAddCells,
  roomZoneLabels, onSetZoneLabel,
  onEditZone,  // (zoneIdx) => void — switch to 3D builder for this zone
  // Multi-floor
  activeFloorLevel, floorStack, allRoomsData, onSwitchFloor,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tool, setTool] = useState('shape')
  const [hoverInfo, setHoverInfo] = useState(null)
  const rectRef = useRef(null)
  const wallDragRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panStartRef = useRef(null)
  const [editingLabel, setEditingLabel] = useState(null)
  // Background image for tracing
  const [bgImage, setBgImage] = useState(null)  // { img: HTMLImageElement, opacity: 0.4 }
  const [bgScale, setBgScale] = useState(1)
  // Import modals
  const [showImport, setShowImport] = useState(false)
  const [dimInput, setDimInput] = useState({ name: '', w: 12, d: 10 })
  const fileInputRef = useRef(null)
  const roomPlanInputRef = useRef(null)

  // Auto-detect room zones
  const roomZones = useMemo(() => detectRoomZones(cells, internalWalls), [cells, internalWalls])

  // Ghost floor data (floor below current)
  const ghostFloorData = useMemo(() => {
    if (!floorStack || activeFloorLevel <= 0) return null
    const belowEntry = floorStack?.find(f => f.level === activeFloorLevel - 1)
    if (!belowEntry) return null
    return allRoomsData?.[belowEntry.roomId] ?? null
  }, [floorStack, activeFloorLevel, allRoomsData])

  // Space key for pan mode
  const spaceRef = useRef(false)
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space' && !e.repeat) { spaceRef.current = true; e.preventDefault() } }
    const up = (e) => { if (e.code === 'Space') spaceRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

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
    roomZones.forEach((zone, zi) => {
      ctx.fillStyle = ZONE_COLORS[zi % ZONE_COLORS.length]
      for (const key of zone) {
        const [c, r] = key.split(',').map(Number)
        ctx.fillRect(offsetX + c * cellSize + 0.5, offsetY + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
      }
      // Zone label at centroid
      let sumC = 0, sumR = 0
      for (const key of zone) { const [c, r] = key.split(',').map(Number); sumC += c; sumR += r }
      const cx = offsetX + (sumC / zone.size + 0.5) * cellSize
      const cy = offsetY + (sumR / zone.size + 0.5) * cellSize
      const label = roomZoneLabels?.[zi] ?? `Room ${zi + 1}`
      ctx.fillStyle = '#a0a0b0'
      ctx.font = `bold ${Math.max(9, cellSize * 0.45)}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(label, cx, cy)
      ctx.fillStyle = '#606080'
      ctx.font = `${Math.max(8, cellSize * 0.35)}px Outfit, sans-serif`
      ctx.fillText(`${zone.size} sq ft`, cx, cy + Math.max(12, cellSize * 0.45))
      ctx.fillStyle = '#50c87880'
      ctx.font = `${Math.max(7, cellSize * 0.3)}px Outfit, sans-serif`
      ctx.fillText('double-click to edit', cx, cy + Math.max(22, cellSize * 0.8))
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

    // Stairs
    for (const it of (items ?? [])) {
      if (!it.stairs || it.returnStair) continue
      const sw = it.stairW ?? 3, sd = it.stairD ?? 5
      const rot = it.rotation === 90 || it.rotation === 270
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
      if (tool === 'shape' && hoverInfo.rect) {
        const { startCol, startRow, endCol, endRow, action } = hoverInfo.rect
        const c0 = Math.min(startCol, endCol), c1 = Math.max(startCol, endCol)
        const r0 = Math.min(startRow, endRow), r1 = Math.max(startRow, endRow)
        ctx.fillStyle = action === 'add' ? 'rgba(70,200,120,0.25)' : 'rgba(255,70,70,0.25)'
        ctx.fillRect(offsetX + c0 * cellSize, offsetY + r0 * cellSize, (c1-c0+1) * cellSize, (r1-r0+1) * cellSize)
        ctx.strokeStyle = action === 'add' ? '#50c878' : '#ff5050'
        ctx.lineWidth = 1.5
        ctx.strokeRect(offsetX + c0 * cellSize, offsetY + r0 * cellSize, (c1-c0+1) * cellSize, (r1-r0+1) * cellSize)
      } else if (tool === 'shape' && hoverInfo.col != null) {
        const { col, row } = hoverInfo
        ctx.fillStyle = cells.has(`${col},${row}`) ? 'rgba(255,70,70,0.2)' : 'rgba(70,200,120,0.2)'
        ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize, cellSize)
      } else if (hoverInfo.edge) {
        const { col, row, dir } = hoverInfo.edge
        const x = offsetX + col * cellSize, y = offsetY + row * cellSize
        ctx.strokeStyle = tool === 'door' ? '#60a0ff' : '#ffd060'
        ctx.lineWidth = 3
        ctx.beginPath()
        if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
        if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
        if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
        if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
        ctx.stroke()
      } else if (tool === 'stairs' && hoverInfo.col != null) {
        const { col, row } = hoverInfo
        ctx.fillStyle = 'rgba(180,140,80,0.3)'
        ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, 3 * cellSize, 5 * cellSize)
      }
    }

    // Info
    ctx.fillStyle = '#404060'
    ctx.font = '11px Outfit, sans-serif'
    ctx.textAlign = 'left'
    const floorLabel = activeFloorLevel === 0 ? 'Ground Floor' : activeFloorLevel < 0 ? `Basement ${-activeFloorLevel}` : `Floor ${activeFloorLevel + 1}`
    ctx.fillText(`${floorLabel} · ${gridW}×${gridD} ft · ${cells.size} sq ft · ${roomZones.length} rooms · ${Math.round(zoom * 100)}%`, 8, canvasSize.h - 8)
  }, [canvasSize, gridW, gridD, cells, internalWalls, items, cellSize, offsetX, offsetY, hoverInfo, tool, zoom, roomZones, roomZoneLabels, ghostFloorData, activeFloorLevel, bgImage, bgScale])

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

  const getEdge = (col, row, fx, fy, lockedAxis) => {
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
    if (!cells.has(`${col},${row}`) || !cells.has(nb)) return null
    return { col, row, dir: nearest.dir }
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

    if (tool === 'shape') {
      const key = `${info.col},${info.row}`
      rectRef.current = { startCol: info.col, startRow: info.row, endCol: info.col, endRow: info.row, action: cells.has(key) ? 'remove' : 'add' }
      setHoverInfo({ rect: rectRef.current })
    } else if (tool === 'walls') {
      const edge = getEdge(info.col, info.row, info.fx, info.fy, null)
      if (!edge) return
      const axis = (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v'
      const key = `${edge.col},${edge.row}:${edge.dir}`
      wallDragRef.current = { erasing: internalWalls?.has(key), placed: new Set([key]), axis }
      onToggleWall(key)
    } else if (tool === 'door') {
      const edge = getEdge(info.col, info.row, info.fx, info.fy, null)
      if (edge) onAddDoor?.(info.col, info.row, edge.dir)
    } else if (tool === 'stairs') {
      if (cells.has(`${info.col},${info.row}`)) onAddStairs?.(info.col, info.row)
    } else if (tool === 'label') {
      // Find which zone was clicked
      const key = `${info.col},${info.row}`
      const zoneIdx = roomZones.findIndex(z => z.has(key))
      if (zoneIdx >= 0) {
        const rect = canvasRef.current.getBoundingClientRect()
        setEditingLabel({ zoneIdx, x: e.clientX - rect.left, y: e.clientY - rect.top })
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

    if (tool === 'shape') {
      if (rectRef.current) {
        rectRef.current.endCol = info.col; rectRef.current.endRow = info.row
        setHoverInfo({ rect: { ...rectRef.current } })
      } else {
        setHoverInfo({ col: info.col, row: info.row })
      }
    } else if (tool === 'walls' || tool === 'door') {
      const lockedAxis = wallDragRef.current?.axis ?? null
      const edge = getEdge(info.col, info.row, info.fx, info.fy, lockedAxis)
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
    } else if (tool === 'stairs') {
      setHoverInfo({ col: info.col, row: info.row })
    }
  }

  const handleUp = () => {
    panStartRef.current = null
    if (rectRef.current) {
      const { startCol, startRow, endCol, endRow, action } = rectRef.current
      const c0 = Math.min(startCol, endCol), c1 = Math.max(startCol, endCol)
      const r0 = Math.min(startRow, endRow), r1 = Math.max(startRow, endRow)
      for (let c = c0; c <= c1; c++)
        for (let r = r0; r <= r1; r++) {
          const key = `${c},${r}`
          if (action === 'add' && !cells.has(key)) onToggleCell(c, r)
          if (action === 'remove' && cells.has(key)) onToggleCell(c, r)
        }
      rectRef.current = null; setHoverInfo(null)
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
      {/* Sidebar */}
      <div style={{ width: sideW, borderRight: '1px solid #1a1a2a', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#d0d0e0', padding: '8px 10px 12px' }}>Floor Plan</div>

        {/* Floor tabs */}
        {floorStack && floorStack.length > 1 && (
          <div style={{ display: 'flex', gap: 2, margin: '0 6px 8px', background: '#12122a', borderRadius: 6, padding: 2 }}>
            {floorStack.map(f => (
              <button key={f.roomId} onClick={() => onSwitchFloor?.(f.roomId, f.level)}
                style={{
                  flex: 1, padding: '4px 6px', borderRadius: 4, border: 'none', fontSize: 10, fontWeight: 700,
                  background: f.level === activeFloorLevel ? '#2a8a5a30' : 'transparent',
                  color: f.level === activeFloorLevel ? '#50c878' : '#505070',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{f.level < 0 ? `B${-f.level}` : `F${f.level + 1}`}</button>
            ))}
          </div>
        )}

        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={toolBtn(tool === t.id)} title={t.desc}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}

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

        <div style={{ flex: 1 }} />

        {/* Grid size */}
        <div style={{ padding: '6px 10px', fontSize: 11, color: '#505070', display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="number" min={4} max={80} value={gridW}
            onChange={e => onResizeGrid?.(Math.max(4, Math.min(80, Number(e.target.value) || 4)), gridD)}
            style={{ width: 36, padding: '2px', background: '#12122a', border: '1px solid #2a2a40', borderRadius: 3, color: '#a0a0c0', fontSize: 11, textAlign: 'center' }}
          />
          <span>×</span>
          <input type="number" min={4} max={80} value={gridD}
            onChange={e => onResizeGrid?.(gridW, Math.max(4, Math.min(80, Number(e.target.value) || 4)))}
            style={{ width: 36, padding: '2px', background: '#12122a', border: '1px solid #2a2a40', borderRadius: 3, color: '#a0a0c0', fontSize: 11, textAlign: 'center' }}
          />
          <span>ft</span>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 10px' }}>
          <button onClick={() => setZoom(z => Math.min(5, z * 1.25))} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 13 }}>+</button>
          <button onClick={() => setZoom(1)} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 10 }}>{Math.round(zoom*100)}%</button>
          <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} style={{ flex: 1, padding: '4px', borderRadius: 4, border: '1px solid #2a2a40', background: '#12122a', color: '#a0a0c0', cursor: 'pointer', fontSize: 13 }}>−</button>
        </div>

        <button onClick={onDone} style={{
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
          onDoubleClick={(e) => {
            const info = getCellFromMouse(e)
            if (!info) return
            const key = `${info.col},${info.row}`
            const zoneIdx = roomZones.findIndex(z => z.has(key))
            if (zoneIdx >= 0) onEditZone?.(zoneIdx)
          }}
          onWheel={handleWheel}
          onContextMenu={e => e.preventDefault()}
          onMouseLeave={() => { setHoverInfo(null); rectRef.current = null; wallDragRef.current = null; panStartRef.current = null }}
          style={{ cursor: panStartRef.current ? 'grabbing' : tool === 'label' ? 'text' : 'crosshair', display: 'block', position: 'absolute', inset: 0 }}
        />

        {/* Inline label editor */}
        {editingLabel && (
          <input
            autoFocus
            defaultValue={roomZoneLabels?.[editingLabel.zoneIdx] ?? ''}
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

        {/* Tool hint */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 14px', borderRadius: 8, background: '#1a1a30', color: '#606080',
          fontSize: 11, fontWeight: 600, pointerEvents: 'none',
        }}>
          {TOOLS.find(t => t.id === tool)?.desc} · Right-click or Space to pan · Scroll to zoom
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
