// WallDrawPanel — 2D top-down floor plan for drawing internal walls.
// Shows the grid from above, click between cells to add/remove walls.
// Like The Sims build mode floor plan view.
import { useRef, useCallback, useEffect, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const MIN_CELL = 20
const MAX_CELL = 40
const EDGE_HIT = 0.3  // fraction of cell size for edge detection

export default function WallDrawPanel({ gridW, gridD, cells, internalWalls, onToggleWall, onDone }) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const [hoverEdge, setHoverEdge] = useState(null)

  // Auto-size cells to fit the panel
  const cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(Math.min(500 / gridW, 400 / gridD))))
  const pad = 20
  const totalW = gridW * cellSize + pad * 2
  const totalH = gridD * cellSize + pad * 2

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = totalW * dpr
    canvas.height = totalH * dpr
    canvas.style.width = totalW + 'px'
    canvas.style.height = totalH + 'px'
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, totalW, totalH)

    // Draw cells
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      ctx.fillStyle = '#2a2a3e'
      ctx.fillRect(pad + c * cellSize + 1, pad + r * cellSize + 1, cellSize - 2, cellSize - 2)
    }

    // Faint grid
    ctx.strokeStyle = '#3a3a50'
    ctx.lineWidth = 0.5
    for (let c = 0; c <= gridW; c++) {
      ctx.beginPath()
      ctx.moveTo(pad + c * cellSize, pad)
      ctx.lineTo(pad + c * cellSize, pad + gridD * cellSize)
      ctx.stroke()
    }
    for (let r = 0; r <= gridD; r++) {
      ctx.beginPath()
      ctx.moveTo(pad, pad + r * cellSize)
      ctx.lineTo(pad + gridW * cellSize, pad + r * cellSize)
      ctx.stroke()
    }

    // Boundary walls (white)
    ctx.strokeStyle = '#c0b8d8'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      const x = pad + c * cellSize, y = pad + r * cellSize
      if (!cells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke() }
      if (!cells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
    }

    // Internal walls (green)
    ctx.strokeStyle = '#4ac88a'
    ctx.lineWidth = 3
    for (const edgeKey of (internalWalls ?? [])) {
      const sep = edgeKey.lastIndexOf(':')
      const [c, r] = edgeKey.slice(0, sep).split(',').map(Number)
      const dir = edgeKey.slice(sep + 1)
      const x = pad + c * cellSize, y = pad + r * cellSize
      ctx.beginPath()
      if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
      if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
      if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
      if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
      ctx.stroke()
    }

    // Hover highlight (yellow)
    if (hoverEdge) {
      const { col, row, dir } = hoverEdge
      const x = pad + col * cellSize, y = pad + row * cellSize
      ctx.strokeStyle = '#ffd060'
      ctx.lineWidth = 4
      ctx.beginPath()
      if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
      if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
      if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
      if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
      ctx.stroke()
    }

    // Room dimensions label
    ctx.fillStyle = '#8878aa'
    ctx.font = '11px Outfit, sans-serif'
    ctx.fillText(`${gridW} × ${gridD} ft`, pad, pad - 6)
  }, [gridW, gridD, cells, internalWalls, cellSize, totalW, totalH, pad, hoverEdge])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  const getEdgeFromMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left - pad
    const py = e.clientY - rect.top - pad
    const col = Math.floor(px / cellSize)
    const row = Math.floor(py / cellSize)
    if (col < 0 || col >= gridW || row < 0 || row >= gridD) return null
    if (!cells.has(`${col},${row}`)) return null

    const fx = (px / cellSize) - col
    const fy = (py / cellSize) - row
    const edges = [
      { dir: 'N', dist: fy },
      { dir: 'S', dist: 1 - fy },
      { dir: 'W', dist: fx },
      { dir: 'E', dist: 1 - fx },
    ]
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)
    if (nearest.dist > EDGE_HIT) return null  // too far from edge

    // Only internal walls — neighbor must exist
    const nb = nearest.dir === 'N' ? `${col},${row-1}` :
               nearest.dir === 'S' ? `${col},${row+1}` :
               nearest.dir === 'W' ? `${col-1},${row}` : `${col+1},${row}`
    if (!cells.has(nb)) return null

    return { col, row, dir: nearest.dir }
  }

  // Drag to draw/erase a whole wall line
  const dragRef = useRef(null)  // { axis: 'h'|'v', erasing: bool, placed: Set }

  const handleDown = (e) => {
    const edge = getEdgeFromMouse(e)
    if (!edge) return
    const key = `${edge.col},${edge.row}:${edge.dir}`
    const erasing = internalWalls?.has(key)
    dragRef.current = { axis: (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v', erasing, placed: new Set([key]) }
    onToggleWall(key)
  }

  const handleMove = (e) => {
    const edge = getEdgeFromMouse(e)
    setHoverEdge(edge)
    if (!dragRef.current || !edge) return
    // Lock to the initial axis (horizontal or vertical wall line)
    const edgeAxis = (edge.dir === 'N' || edge.dir === 'S') ? 'h' : 'v'
    if (edgeAxis !== dragRef.current.axis) return
    const key = `${edge.col},${edge.row}:${edge.dir}`
    if (dragRef.current.placed.has(key)) return
    dragRef.current.placed.add(key)
    // If we started by erasing, keep erasing. If adding, keep adding.
    if (dragRef.current.erasing) {
      if (internalWalls?.has(key)) onToggleWall(key)
    } else {
      if (!internalWalls?.has(key)) onToggleWall(key)
    }
  }

  const handleUp = () => { dragRef.current = null }

  // Clean up drag on mouse leave
  const handleLeave = () => { setHoverEdge(null); dragRef.current = null }

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 200, background: '#16162a',
      border: '1.5px solid #3a3a5a', borderRadius: 16,
      padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      fontFamily: "'Outfit',sans-serif",
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0eaff' }}>Floor Plan — Draw Walls</div>
          <div style={{ fontSize: 11, color: '#8878aa', marginTop: 2 }}>Click between cells to add/remove internal walls</div>
        </div>
        <button onClick={onDone} style={{
          padding: '7px 20px', borderRadius: 8, border: 'none',
          background: '#4ac88a', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Done</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleLeave}
        style={{ cursor: 'crosshair', borderRadius: 8, display: 'block' }}
      />
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: '#8878aa' }}>
        <span><span style={{ color: '#c0b8d8', fontWeight: 700 }}>——</span> Outer walls</span>
        <span><span style={{ color: '#4ac88a', fontWeight: 700 }}>——</span> Internal walls</span>
        <span><span style={{ color: '#ffd060', fontWeight: 700 }}>——</span> Hover target</span>
      </div>
    </div>
  )
}
