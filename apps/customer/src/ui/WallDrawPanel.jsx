// WallDrawPanel — 2D top-down grid for drawing internal walls.
// Click between cells to add/remove walls. Like Sims build mode.
import { useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const CELL_SIZE = 28  // pixels per cell
const EDGE_HIT = 8    // click zone around edges (pixels)

export default function WallDrawPanel({ gridW, gridD, cells, internalWalls, onToggleWall, onDone }) {
  const t = useTheme()
  const canvasRef = useRef(null)

  const totalW = gridW * CELL_SIZE + 1
  const totalH = gridD * CELL_SIZE + 1

  const draw = useCallback((canvas) => {
    if (!canvas) return
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = totalW * dpr
    canvas.height = totalH * dpr
    canvas.style.width = totalW + 'px'
    canvas.style.height = totalH + 'px'
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = t.panelSurface ?? '#1a1a2e'
    ctx.fillRect(0, 0, totalW, totalH)

    // Draw cells
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      ctx.fillStyle = t.panelBg ?? '#2a2a4a'
      ctx.fillRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 1, CELL_SIZE - 1)
    }

    // Draw grid lines (faint)
    ctx.strokeStyle = (t.panelBorder ?? '#3a3a5a') + '60'
    ctx.lineWidth = 0.5
    for (let c = 0; c <= gridW; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL_SIZE, 0); ctx.lineTo(c * CELL_SIZE, totalH); ctx.stroke()
    }
    for (let r = 0; r <= gridD; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL_SIZE); ctx.lineTo(totalW, r * CELL_SIZE); ctx.stroke()
    }

    // Draw boundary walls (thick dark lines at cell edges where neighbor is missing)
    ctx.strokeStyle = t.panelText ?? '#e0d8f0'
    ctx.lineWidth = 3
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      const x = c * CELL_SIZE, y = r * CELL_SIZE
      if (!cells.has(`${c},${r-1}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL_SIZE, y); ctx.stroke() }
      if (!cells.has(`${c},${r+1}`)) { ctx.beginPath(); ctx.moveTo(x, y + CELL_SIZE); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE); ctx.stroke() }
      if (!cells.has(`${c-1},${r}`)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL_SIZE); ctx.stroke() }
      if (!cells.has(`${c+1},${r}`)) { ctx.beginPath(); ctx.moveTo(x + CELL_SIZE, y); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE); ctx.stroke() }
    }

    // Draw internal walls (colored lines)
    ctx.strokeStyle = '#4ac88a'
    ctx.lineWidth = 3
    for (const edgeKey of (internalWalls ?? [])) {
      const sep = edgeKey.lastIndexOf(':')
      const [c, r] = edgeKey.slice(0, sep).split(',').map(Number)
      const dir = edgeKey.slice(sep + 1)
      const x = c * CELL_SIZE, y = r * CELL_SIZE
      ctx.beginPath()
      if (dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + CELL_SIZE, y) }
      if (dir === 'S') { ctx.moveTo(x, y + CELL_SIZE); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE) }
      if (dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL_SIZE) }
      if (dir === 'E') { ctx.moveTo(x + CELL_SIZE, y); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE) }
      ctx.stroke()
    }
  }, [gridW, gridD, cells, internalWalls, totalW, totalH, t])

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const col = Math.floor(px / CELL_SIZE)
    const row = Math.floor(py / CELL_SIZE)
    const fx = (px / CELL_SIZE) - col  // fractional within cell
    const fy = (py / CELL_SIZE) - row

    // Find nearest edge
    const edges = [
      { dir: 'N', dist: fy },
      { dir: 'S', dist: 1 - fy },
      { dir: 'W', dist: fx },
      { dir: 'E', dist: 1 - fx },
    ]
    const nearest = edges.reduce((a, b) => a.dist < b.dist ? a : b)

    // Only allow internal walls between two existing cells
    if (col < 0 || col >= gridW || row < 0 || row >= gridD) return
    if (!cells.has(`${col},${row}`)) return

    // Check the neighbor exists (internal walls only between two cells)
    const neighbor = nearest.dir === 'N' ? `${col},${row-1}` :
                     nearest.dir === 'S' ? `${col},${row+1}` :
                     nearest.dir === 'W' ? `${col-1},${row}` :
                     `${col+1},${row}`
    if (!cells.has(neighbor)) return  // boundary wall already exists

    onToggleWall(`${col},${row}:${nearest.dir}`)
  }

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 200, background: t.panelBg ?? '#1a1a2e',
      border: `1.5px solid ${t.panelBorder ?? '#3a3a5a'}`,
      borderRadius: 16, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: "'Outfit',sans-serif", maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.panelText ?? '#f0eaff' }}>Draw Walls</div>
          <div style={{ fontSize: 11, color: t.panelTextSoft ?? '#a090c8', marginTop: 2 }}>Click between cells to add/remove walls</div>
        </div>
        <button onClick={onDone} style={{
          padding: '6px 16px', borderRadius: 8, border: 'none',
          background: '#4ac88a', color: '#fff', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Done</button>
      </div>
      <canvas
        ref={draw}
        onClick={handleClick}
        style={{ cursor: 'crosshair', borderRadius: 8, display: 'block' }}
      />
      <div style={{ fontSize: 10, color: t.panelTextSoft ?? '#8878aa', marginTop: 8 }}>
        White lines = outer walls &nbsp;·&nbsp; Green lines = internal walls you drew
      </div>
    </div>
  )
}
