// Floor Plan Editor — full home overview from above.
// Two tools: shape the building footprint, then draw internal walls.
// This IS the home overview — shows the entire floor layout.
import { useRef, useEffect, useState, useCallback } from 'react'

const MIN_CELL = 14
const MAX_CELL = 28

export default function WallDrawPanel({
  gridW, gridD, cells, internalWalls,
  onToggleCell, onToggleWall, onResizeGrid, onDone,
}) {
  const canvasRef = useRef(null)
  const [hoverInfo, setHoverInfo] = useState(null)
  const [mode, setMode] = useState('shape')  // 'shape' | 'walls'
  const paintRef = useRef(null)
  const wallDragRef = useRef(null)

  const cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(Math.min(600 / gridW, 500 / gridD))))
  const pad = 32
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

    ctx.fillStyle = '#0e0e1e'
    ctx.fillRect(0, 0, totalW, totalH)

    // All cells
    for (let c = 0; c < gridW; c++) {
      for (let r = 0; r < gridD; r++) {
        const active = cells.has(`${c},${r}`)
        ctx.fillStyle = active ? '#2a3040' : '#141420'
        ctx.fillRect(pad + c * cellSize + 0.5, pad + r * cellSize + 0.5, cellSize - 1, cellSize - 1)
      }
    }

    // Grid dots (subtle, not lines)
    ctx.fillStyle = '#2a2a3a'
    for (let c = 0; c <= gridW; c++)
      for (let r = 0; r <= gridD; r++)
        ctx.fillRect(pad + c * cellSize - 1, pad + r * cellSize - 1, 2, 2)

    // Boundary walls
    ctx.strokeStyle = '#a0a0c0'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      const x = pad + c * cellSize, y = pad + r * cellSize
      if (!cells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke() }
      if (!cells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke() }
      if (!cells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke() }
    }

    // Internal walls
    ctx.strokeStyle = '#50c878'
    ctx.lineWidth = 2.5
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

    // Hover
    if (hoverInfo) {
      if (mode === 'shape') {
        const { col, row } = hoverInfo
        if (col >= 0 && col < gridW && row >= 0 && row < gridD) {
          ctx.fillStyle = cells.has(`${col},${row}`) ? 'rgba(255,70,70,0.25)' : 'rgba(70,220,120,0.25)'
          ctx.fillRect(pad + col * cellSize, pad + row * cellSize, cellSize, cellSize)
        }
      } else if (hoverInfo.edge) {
        const { col, row, dir } = hoverInfo.edge
        const x = pad + col * cellSize, y = pad + row * cellSize
        ctx.strokeStyle = '#ffd060'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y) }
        if (dir === 'S') { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize) }
        if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize) }
        if (dir === 'E') { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize) }
        ctx.stroke()
      }
    }

    // Dimensions
    ctx.fillStyle = '#5050780'
    ctx.font = '10px Outfit, sans-serif'
    const activeCount = cells.size
    ctx.fillStyle = '#505078'
    ctx.fillText(`${gridW}×${gridD} grid · ${activeCount} sq ft`, pad, pad - 8)
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

  const getEdge = (col, row, fx, fy) => {
    const edges = [
      { dir: 'N', dist: fy }, { dir: 'S', dist: 1 - fy },
      { dir: 'W', dist: fx }, { dir: 'E', dist: 1 - fx },
    ]
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)
    if (nearest.dist > 0.3) return null
    const nb = nearest.dir === 'N' ? `${col},${row-1}` : nearest.dir === 'S' ? `${col},${row+1}` :
               nearest.dir === 'W' ? `${col-1},${row}` : `${col+1},${row}`
    if (!cells.has(`${col},${row}`) || !cells.has(nb)) return null
    return { col, row, dir: nearest.dir }
  }

  const handleDown = (e) => {
    const info = getCellFromMouse(e)
    if (!info) return
    if (mode === 'shape') {
      const key = `${info.col},${info.row}`
      paintRef.current = { action: cells.has(key) ? 'remove' : 'add' }
      onToggleCell(info.col, info.row)
    } else {
      const edge = getEdge(info.col, info.row, info.fx, info.fy)
      if (!edge) return
      const key = `${edge.col},${edge.row}:${edge.dir}`
      wallDragRef.current = { erasing: internalWalls?.has(key), placed: new Set([key]) }
      onToggleWall(key)
    }
  }

  const handleMove = (e) => {
    const info = getCellFromMouse(e)
    if (!info) { setHoverInfo(null); return }
    if (mode === 'shape') {
      setHoverInfo({ col: info.col, row: info.row })
      if (paintRef.current) {
        const key = `${info.col},${info.row}`
        if (paintRef.current.action === 'add' && !cells.has(key)) onToggleCell(info.col, info.row)
        if (paintRef.current.action === 'remove' && cells.has(key)) onToggleCell(info.col, info.row)
      }
    } else {
      const edge = getEdge(info.col, info.row, info.fx, info.fy)
      setHoverInfo(edge ? { edge } : { col: info.col, row: info.row })
      if (wallDragRef.current && edge) {
        const key = `${edge.col},${edge.row}:${edge.dir}`
        if (wallDragRef.current.placed.has(key)) return
        wallDragRef.current.placed.add(key)
        if (wallDragRef.current.erasing) { if (internalWalls?.has(key)) onToggleWall(key) }
        else { if (!internalWalls?.has(key)) onToggleWall(key) }
      }
    }
  }

  const handleUp = () => { paintRef.current = null; wallDragRef.current = null }

  const btnS = { padding: '5px 10px', borderRadius: 6, border: '1px solid #3a3a5a', background: '#1e1e30', color: '#a0a0c0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 200, background: '#0e0e1e',
      border: '1.5px solid #2a2a40', borderRadius: 14,
      padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      fontFamily: "'Outfit',sans-serif", maxWidth: '95vw', maxHeight: '95vh', overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#e0e0f0' }}>Floor Plan</div>
        <button onClick={onDone} style={{ ...btnS, background: '#2a8a5a', color: '#fff', border: 'none' }}>Done</button>
      </div>

      {/* Tool toggle + grid resize */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2, background: '#1a1a2a', borderRadius: 7, padding: 2, flex: 1 }}>
          {[
            { id: 'shape', label: 'Floor Shape' },
            { id: 'walls', label: 'Divide Rooms' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, padding: '6px 10px', borderRadius: 5, border: 'none',
              background: mode === m.id ? '#2a8a5a25' : 'transparent',
              color: mode === m.id ? '#50c878' : '#505078',
              fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>{m.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          <button style={btnS} onClick={() => onResizeGrid?.(gridW + 2, gridD)} title="Wider">W+</button>
          <button style={btnS} onClick={() => onResizeGrid?.(gridW, gridD + 2)} title="Deeper">D+</button>
          <button style={btnS} onClick={() => onResizeGrid?.(Math.max(4, gridW - 2), gridD)} title="Narrower">W-</button>
          <button style={btnS} onClick={() => onResizeGrid?.(gridW, Math.max(4, gridD - 2))} title="Shallower">D-</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={() => { setHoverInfo(null); paintRef.current = null; wallDragRef.current = null }}
        style={{ cursor: 'crosshair', borderRadius: 6, display: 'block' }}
      />
    </div>
  )
}
