// FloorPlanPage — full-screen 2D floor plan editor.
// Shows the entire building layout from above.
// Tools: Floor Shape, Draw Walls, Place Doors, Place Stairs, Room Labels.
// Replaces the 3D canvas when active.
import { useRef, useEffect, useState, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const TOOLS = [
  { id: 'shape',  label: 'Floor Shape',  icon: '▦', desc: 'Drag rectangles to add/remove floor area' },
  { id: 'walls',  label: 'Walls',        icon: '┼', desc: 'Click edges between cells to draw walls' },
  { id: 'door',   label: 'Doors',        icon: '▯', desc: 'Click a wall to place a door opening' },
  { id: 'stairs', label: 'Stairs',       icon: '⟋', desc: 'Click a cell to place stairs' },
  { id: 'label',  label: 'Room Names',   icon: 'Aa', desc: 'Click a room area to name it' },
]

export default function FloorPlanPage({
  gridW, gridD, cells, internalWalls, items,
  onToggleCell, onToggleWall, onResizeGrid, onDone,
  onAddStairs, onAddDoor,
  floorColor, wallColor,
}) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tool, setTool] = useState('shape')
  const [hoverInfo, setHoverInfo] = useState(null)
  const rectRef = useRef(null)
  const wallDragRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })

  // Auto-size canvas to fill the available space
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

  const pad = 40
  const cellSize = Math.max(8, Math.min(32, Math.floor(Math.min(
    (canvasSize.w - pad * 2) / gridW,
    (canvasSize.h - pad * 2) / gridD
  ))))
  const gridPxW = gridW * cellSize
  const gridPxH = gridD * cellSize
  const offsetX = Math.floor((canvasSize.w - gridPxW) / 2)
  const offsetY = Math.floor((canvasSize.h - gridPxH) / 2)

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

    // Background
    ctx.fillStyle = '#0c0c1a'
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    // Grid dots
    ctx.fillStyle = '#1e1e30'
    for (let c = 0; c <= gridW; c++)
      for (let r = 0; r <= gridD; r++)
        ctx.fillRect(offsetX + c * cellSize - 0.5, offsetY + r * cellSize - 0.5, 1, 1)

    // Active cells
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      ctx.fillStyle = '#222838'
      ctx.fillRect(offsetX + c * cellSize + 0.5, offsetY + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
    }

    // Boundary walls
    ctx.strokeStyle = '#8888b0'
    ctx.lineWidth = 2.5
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
    ctx.lineWidth = 2.5
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
      ctx.fillStyle = 'rgba(180,140,80,0.3)'
      ctx.fillRect(x, y, ew * cellSize, ed * cellSize)
      ctx.strokeStyle = '#b08a50'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x + 1, y + 1, ew * cellSize - 2, ed * cellSize - 2)
      // Step lines
      const steps = it.stairCount ?? 14
      for (let i = 1; i < steps; i++) {
        const frac = i / steps
        ctx.beginPath()
        if (rot) {
          const sx = x + frac * ew * cellSize
          ctx.moveTo(sx, y); ctx.lineTo(sx, y + ed * cellSize)
        } else {
          const sy = y + frac * ed * cellSize
          ctx.moveTo(x, sy); ctx.lineTo(x + ew * cellSize, sy)
        }
        ctx.stroke()
      }
      // Label
      ctx.fillStyle = '#b08a50'
      ctx.font = `${Math.max(8, cellSize * 0.4)}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('↕ Stairs', x + ew * cellSize / 2, y + ed * cellSize / 2 + 4)
    }

    // Hover / drag preview
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
        ctx.strokeStyle = '#ffd060'
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
        ctx.strokeStyle = '#b08a50'
        ctx.lineWidth = 1
        ctx.strokeRect(offsetX + col * cellSize, offsetY + row * cellSize, 3 * cellSize, 5 * cellSize)
      }
    }

    // Info bar
    ctx.fillStyle = '#404060'
    ctx.font = '11px Outfit, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${gridW} × ${gridD} ft · ${cells.size} sq ft · ${internalWalls?.size ?? 0} walls`, offsetX, offsetY - 8)
  }, [canvasSize, gridW, gridD, cells, internalWalls, items, cellSize, offsetX, offsetY, hoverInfo, tool])

  useEffect(() => { draw() }, [draw])

  // ── Mouse interaction ───────────────────────────────────────────
  const getCellFromMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left - offsetX
    const py = e.clientY - rect.top - offsetY
    const col = Math.floor(px / cellSize)
    const row = Math.floor(py / cellSize)
    if (col < 0 || col >= gridW || row < 0 || row >= gridD) return null
    return { col, row, fx: (px / cellSize) - col, fy: (py / cellSize) - row }
  }

  const getEdge = (col, row, fx, fy) => {
    const edges = [
      { dir: 'N', dist: fy }, { dir: 'S', dist: 1 - fy },
      { dir: 'W', dist: fx }, { dir: 'E', dist: 1 - fx },
    ]
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)
    if (nearest.dist > 0.4) return null
    const nb = nearest.dir === 'N' ? `${col},${row-1}` : nearest.dir === 'S' ? `${col},${row+1}` :
               nearest.dir === 'W' ? `${col-1},${row}` : `${col+1},${row}`
    if (!cells.has(`${col},${row}`) || !cells.has(nb)) return null
    return { col, row, dir: nearest.dir }
  }

  const handleDown = (e) => {
    const info = getCellFromMouse(e)
    if (!info) return

    if (tool === 'shape') {
      const key = `${info.col},${info.row}`
      rectRef.current = { startCol: info.col, startRow: info.row, endCol: info.col, endRow: info.row, action: cells.has(key) ? 'remove' : 'add' }
      setHoverInfo({ rect: rectRef.current })
    } else if (tool === 'walls') {
      const edge = getEdge(info.col, info.row, info.fx, info.fy)
      if (!edge) return
      const key = `${edge.col},${edge.row}:${edge.dir}`
      wallDragRef.current = { erasing: internalWalls?.has(key), placed: new Set([key]), axis: (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v' }
      onToggleWall(key)
    } else if (tool === 'stairs') {
      if (cells.has(`${info.col},${info.row}`)) {
        onAddStairs?.(info.col, info.row)
      }
    }
  }

  const handleMove = (e) => {
    const info = getCellFromMouse(e)
    if (!info) { setHoverInfo(null); return }

    if (tool === 'shape') {
      if (rectRef.current) {
        rectRef.current.endCol = info.col
        rectRef.current.endRow = info.row
        setHoverInfo({ rect: { ...rectRef.current } })
      } else {
        setHoverInfo({ col: info.col, row: info.row })
      }
    } else if (tool === 'walls') {
      const edge = getEdge(info.col, info.row, info.fx, info.fy)
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
    } else if (tool === 'stairs' || tool === 'door') {
      setHoverInfo({ col: info.col, row: info.row })
    }
  }

  const handleUp = () => {
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
      rectRef.current = null
      setHoverInfo(null)
    }
    wallDragRef.current = null
  }

  const sidebarW = 160
  const toolBtnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderRadius: 8, border: 'none', width: '100%',
    background: active ? '#2a8a5a22' : 'transparent',
    color: active ? '#50c878' : '#707090',
    fontWeight: active ? 700 : 600, fontSize: 12,
    cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
    textAlign: 'left', outline: active ? '1px solid #2a8a5a44' : 'none',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0c0c1a', display: 'flex', fontFamily: "'Outfit',sans-serif" }}>
      {/* Left sidebar — tools */}
      <div style={{
        width: sidebarW, borderRight: '1px solid #1e1e30', padding: '12px 8px',
        display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0f0', padding: '8px 12px', marginBottom: 4 }}>Floor Plan</div>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={toolBtnStyle(tool === t.id)} title={t.desc}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Grid size inputs */}
        <div style={{ padding: '8px 12px', fontSize: 11, color: '#505070' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
            <span>Size</span>
            <input type="number" min={4} max={80} value={gridW}
              onChange={e => onResizeGrid?.(Math.max(4, Math.min(80, Number(e.target.value) || 4)), gridD)}
              style={{ width: 36, padding: '2px 4px', background: '#1a1a2a', border: '1px solid #2a2a40', borderRadius: 3, color: '#a0a0c0', fontSize: 11, textAlign: 'center' }}
            />
            <span>×</span>
            <input type="number" min={4} max={80} value={gridD}
              onChange={e => onResizeGrid?.(gridW, Math.max(4, Math.min(80, Number(e.target.value) || 4)))}
              style={{ width: 36, padding: '2px 4px', background: '#1a1a2a', border: '1px solid #2a2a40', borderRadius: 3, color: '#a0a0c0', fontSize: 11, textAlign: 'center' }}
            />
            <span>ft</span>
          </div>
        </div>
        <button onClick={onDone} style={{
          padding: '10px 16px', borderRadius: 8, border: 'none',
          background: '#2a8a5a', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', margin: '0 8px 8px',
        }}>← Back to Builder</button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={() => { setHoverInfo(null); rectRef.current = null; wallDragRef.current = null }}
          style={{ cursor: 'crosshair', display: 'block', position: 'absolute', inset: 0 }}
        />
        {/* Tool hint */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 14px', borderRadius: 8, background: '#1a1a30', color: '#707090',
          fontSize: 11, fontWeight: 600, pointerEvents: 'none',
        }}>
          {TOOLS.find(t => t.id === tool)?.desc}
        </div>
      </div>
    </div>
  )
}
