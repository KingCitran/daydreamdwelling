// WallDrawPanel — 2D floor plan editor combining:
// 1. Cell painting (click/drag squares to shape the room) — from MiniGrid
// 2. Internal wall drawing (shift+click edges between cells)
import { useRef, useCallback, useEffect, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const MIN_CELL = 20
const MAX_CELL = 36

export default function WallDrawPanel({
  gridW, gridD, cells, internalWalls,
  onToggleCell, onToggleWall, onDone,
}) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const [hoverInfo, setHoverInfo] = useState(null)
  const [mode, setMode] = useState('cells')  // 'cells' | 'walls'
  const paintRef = useRef(null)  // { action: 'add'|'remove' } for cell painting
  const wallDragRef = useRef(null)

  const cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(Math.min(520 / gridW, 420 / gridD))))
  const pad = 24
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

    ctx.fillStyle = '#14142a'
    ctx.fillRect(0, 0, totalW, totalH)

    // Grid background (all possible cells)
    for (let c = 0; c < gridW; c++) {
      for (let r = 0; r < gridD; r++) {
        const isActive = cells.has(`${c},${r}`)
        ctx.fillStyle = isActive ? '#2e3448' : '#1a1a28'
        ctx.fillRect(pad + c * cellSize + 1, pad + r * cellSize + 1, cellSize - 2, cellSize - 2)
      }
    }

    // Grid lines
    ctx.strokeStyle = '#2a2a40'
    ctx.lineWidth = 0.5
    for (let c = 0; c <= gridW; c++) {
      ctx.beginPath(); ctx.moveTo(pad + c * cellSize, pad); ctx.lineTo(pad + c * cellSize, pad + gridD * cellSize); ctx.stroke()
    }
    for (let r = 0; r <= gridD; r++) {
      ctx.beginPath(); ctx.moveTo(pad, pad + r * cellSize); ctx.lineTo(pad + gridW * cellSize, pad + r * cellSize); ctx.stroke()
    }

    // Boundary walls (where cell exists but neighbor doesn't)
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

    // Hover highlight
    if (hoverInfo) {
      if (mode === 'cells') {
        const { col, row } = hoverInfo
        ctx.fillStyle = cells.has(`${col},${row}`) ? 'rgba(255,80,80,0.3)' : 'rgba(80,255,120,0.3)'
        ctx.fillRect(pad + col * cellSize + 1, pad + row * cellSize + 1, cellSize - 2, cellSize - 2)
      } else if (hoverInfo.edge) {
        const { col, row, dir } = hoverInfo.edge
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
    }

    // Labels
    ctx.fillStyle = '#6868a0'
    ctx.font = '11px Outfit, sans-serif'
    ctx.fillText(`${gridW} × ${gridD} ft`, pad, pad - 6)
    ctx.fillText(mode === 'cells' ? 'MODE: Paint Rooms' : 'MODE: Draw Walls', pad + 100, pad - 6)
  }, [gridW, gridD, cells, internalWalls, cellSize, totalW, totalH, pad, hoverInfo, mode])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  const getCellFromMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left - pad
    const py = e.clientY - rect.top - pad
    const col = Math.floor(px / cellSize)
    const row = Math.floor(py / cellSize)
    if (col < 0 || col >= gridW || row < 0 || row >= gridD) return null
    return { col, row, fx: (px / cellSize) - col, fy: (py / cellSize) - row }
  }

  const getEdgeFromCell = (col, row, fx, fy) => {
    const edges = [
      { dir: 'N', dist: fy },
      { dir: 'S', dist: 1 - fy },
      { dir: 'W', dist: fx },
      { dir: 'E', dist: 1 - fx },
    ]
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)
    if (nearest.dist > 0.3) return null
    const nb = nearest.dir === 'N' ? `${col},${row-1}` :
               nearest.dir === 'S' ? `${col},${row+1}` :
               nearest.dir === 'W' ? `${col-1},${row}` : `${col+1},${row}`
    if (!cells.has(`${col},${row}`) || !cells.has(nb)) return null
    return { col, row, dir: nearest.dir }
  }

  const handleDown = (e) => {
    const info = getCellFromMouse(e)
    if (!info) return
    if (mode === 'cells') {
      const key = `${info.col},${info.row}`
      paintRef.current = { action: cells.has(key) ? 'remove' : 'add' }
      onToggleCell(info.col, info.row)
    } else {
      const edge = getEdgeFromCell(info.col, info.row, info.fx, info.fy)
      if (!edge) return
      const key = `${edge.col},${edge.row}:${edge.dir}`
      wallDragRef.current = { erasing: internalWalls?.has(key), placed: new Set([key]) }
      onToggleWall(key)
    }
  }

  const handleMove = (e) => {
    const info = getCellFromMouse(e)
    if (!info) { setHoverInfo(null); return }

    if (mode === 'cells') {
      setHoverInfo({ col: info.col, row: info.row })
      if (paintRef.current) {
        const key = `${info.col},${info.row}`
        if (paintRef.current.action === 'add' && !cells.has(key)) onToggleCell(info.col, info.row)
        if (paintRef.current.action === 'remove' && cells.has(key)) onToggleCell(info.col, info.row)
      }
    } else {
      const edge = getEdgeFromCell(info.col, info.row, info.fx, info.fy)
      setHoverInfo(edge ? { edge } : { col: info.col, row: info.row })
      if (wallDragRef.current && edge) {
        const key = `${edge.col},${edge.row}:${edge.dir}`
        if (wallDragRef.current.placed.has(key)) return
        wallDragRef.current.placed.add(key)
        if (wallDragRef.current.erasing) {
          if (internalWalls?.has(key)) onToggleWall(key)
        } else {
          if (!internalWalls?.has(key)) onToggleWall(key)
        }
      }
    }
  }

  const handleUp = () => { paintRef.current = null; wallDragRef.current = null }

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 200, background: '#14142a',
      border: '1.5px solid #3a3a5a', borderRadius: 16,
      padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      fontFamily: "'Outfit',sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0eaff' }}>Floor Plan Editor</div>
        <button onClick={onDone} style={{
          padding: '7px 20px', borderRadius: 8, border: 'none',
          background: '#4ac88a', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Done</button>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: '#1a1a30', borderRadius: 8, padding: 3 }}>
        {[
          { id: 'cells', label: 'Paint Rooms', desc: 'Click squares to add/remove floor area' },
          { id: 'walls', label: 'Draw Walls', desc: 'Click edges to divide rooms' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} title={m.desc} style={{
            flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none',
            background: mode === m.id ? '#4ac88a22' : 'transparent',
            color: mode === m.id ? '#4ac88a' : '#6868a0',
            fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            outline: mode === m.id ? '1px solid #4ac88a55' : 'none',
          }}>{m.label}</button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={() => { setHoverInfo(null); paintRef.current = null; wallDragRef.current = null }}
        style={{ cursor: 'crosshair', borderRadius: 8, display: 'block' }}
      />

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: '#6868a0' }}>
        {mode === 'cells' ? (
          <>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#2e3448', border: '1px solid #4a4a60', marginRight: 4, verticalAlign: -1 }} /> Floor</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#1a1a28', border: '1px solid #2a2a40', marginRight: 4, verticalAlign: -1 }} /> Empty</span>
            <span>Click & drag to paint</span>
          </>
        ) : (
          <>
            <span><span style={{ color: '#c0b8d8', fontWeight: 700 }}>——</span> Outer walls</span>
            <span><span style={{ color: '#4ac88a', fontWeight: 700 }}>——</span> Internal walls</span>
            <span>Click & drag edges</span>
          </>
        )}
      </div>
    </div>
  )
}
