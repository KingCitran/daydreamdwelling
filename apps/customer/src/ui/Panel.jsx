import { useState, useRef, useCallback } from 'react'

const FLOOR_PRESETS = [
  { label: 'Small 10×10',     w: 10, d: 10 },
  { label: 'Standard 10×12', w: 10, d: 12 },
  { label: 'Large 12×16',    w: 12, d: 16 },
]

const HEIGHT_PRESETS = [8, 9, 10]

export default function Panel({ gridW, gridD, cells, onCellToggle, onApplyGrid, wallHeight, onSetWallHeight, neighborCells }) {
  const [draftW, setDraftW] = useState(gridW)
  const [draftD, setDraftD] = useState(gridD)
  const [draftH, setDraftH] = useState(wallHeight)
  const painting = useRef(null)

  const cellPx = Math.max(4, Math.min(20, Math.floor(216 / Math.max(gridW, gridD))))

  const startPaint = useCallback((col, row) => {
    if (neighborCells?.has(`${col},${row}`)) return
    const key = `${col},${row}`
    const op = cells.has(key) ? 'remove' : 'add'
    painting.current = op
    onCellToggle(col, row)
  }, [cells, onCellToggle, neighborCells])

  const continuePaint = useCallback((col, row) => {
    if (!painting.current) return
    if (neighborCells?.has(`${col},${row}`)) return
    const key = `${col},${row}`
    const isActive = cells.has(key)
    if (painting.current === 'add'    && !isActive) onCellToggle(col, row)
    if (painting.current === 'remove' &&  isActive) onCellToggle(col, row)
  }, [cells, onCellToggle, neighborCells])

  const stopPaint = () => { painting.current = null }

  return (
    <div style={styles.panel}>
      <p style={styles.sectionLabel}>Floor Plan</p>
      <p style={styles.hint}>Click or drag to toggle cells</p>

      <div style={styles.gridCenter}>
        <div
          style={styles.gridWrap}
          onMouseLeave={stopPaint}
          onMouseUp={stopPaint}
          onContextMenu={e => e.preventDefault()}
        >
          {Array.from({ length: gridD }, (_, row) => (
            <div key={row} style={styles.gridRow}>
              {Array.from({ length: gridW }, (_, col) => {
                const key = `${col},${row}`
                const active   = cells.has(key)
                const neighbor = neighborCells?.has(key) ?? false
                const bgColor  = neighbor ? '#2e3040'
                               : active   ? '#c0b49e'
                               :             '#1a1a2e'
                return (
                  <div
                    key={col}
                    title={neighbor ? 'Occupied by adjacent room' : undefined}
                    style={{
                      width: cellPx, height: cellPx,
                      background: bgColor,
                      border: `1px solid ${neighbor ? '#404060' : '#3a3a55'}`,
                      boxSizing: 'border-box',
                      cursor: neighbor ? 'not-allowed' : 'crosshair',
                      flexShrink: 0,
                      opacity: neighbor ? 0.7 : 1,
                    }}
                    onMouseDown={() => !neighbor && startPaint(col, row)}
                    onMouseEnter={() => !neighbor && continuePaint(col, row)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p style={{ ...styles.sectionLabel, marginTop: 14 }}>Quick Size</p>
      <div style={styles.presetRow}>
        {FLOOR_PRESETS.map(({ label, w, d }) => (
          <button
            key={label}
            style={styles.presetBtn}
            onClick={() => { setDraftW(w); setDraftD(d); onApplyGrid(w, d) }}
          >{label}</button>
        ))}
      </div>

      <p style={{ ...styles.sectionLabel, marginTop: 14 }}>Custom (ft)</p>
      <div style={styles.inputRow}>
        <input
          type="number" min={4} max={30} value={draftW}
          style={styles.input}
          onChange={e => setDraftW(Math.min(30, Math.max(4, Number(e.target.value) || 4)))}
        />
        <span style={styles.x}>×</span>
        <input
          type="number" min={4} max={30} value={draftD}
          style={styles.input}
          onChange={e => setDraftD(Math.min(30, Math.max(4, Number(e.target.value) || 4)))}
        />
        <button style={styles.applyBtn}
          onClick={() => onApplyGrid(
            Math.min(30, Math.max(4, draftW)),
            Math.min(30, Math.max(4, draftD)),
          )}
        >Apply</button>
      </div>

      <div style={styles.divider} />
      <p style={styles.sectionLabel}>Wall Height (ft)</p>
      <div style={styles.presetRow}>
        {HEIGHT_PRESETS.map(h => (
          <button
            key={h}
            style={{ ...styles.presetBtn, ...(wallHeight === h ? styles.presetBtnActive : {}) }}
            onClick={() => { setDraftH(h); onSetWallHeight(h) }}
          >{h} ft</button>
        ))}
      </div>
      <div style={{ ...styles.inputRow, marginTop: 6 }}>
        <input
          type="number" min={6} max={20} value={draftH}
          style={styles.input}
          onChange={e => setDraftH(Math.min(20, Math.max(6, Number(e.target.value) || 8)))}
        />
        <span style={styles.x}>ft</span>
        <button style={styles.applyBtn}
          onClick={() => {
            const h = Math.min(20, Math.max(6, draftH))
            setDraftH(h)
            onSetWallHeight(h)
          }}
        >Apply</button>
      </div>

    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute', top: 20, left: 20, width: 248,
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 10, padding: '14px 14px 16px',
    userSelect: 'none',
  },
  sectionLabel: {
    margin: '0 0 5px', fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa',
  },
  hint: { margin: '0 0 8px', fontSize: 11, color: '#555770' },
  gridCenter: { display: 'flex', justifyContent: 'center' },
  gridWrap: {
    display: 'inline-flex', flexDirection: 'column',
    maxHeight: 216, overflowX: 'hidden', overflowY: 'auto',
    border: '1px solid #4a4a6a', borderRadius: 3,
    lineHeight: 0, scrollbarWidth: 'thin',
  },
  gridRow: { display: 'flex' },
  divider: { borderTop: '1px solid #3a3a55', margin: '14px 0 10px' },
  presetRow: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  presetBtn: {
    padding: '4px 9px', background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a', borderRadius: 5, cursor: 'pointer', fontSize: 11,
  },
  presetBtnActive: {
    background: '#5050a0', borderColor: '#8080d0', color: '#ffffff',
  },
  inputRow: { display: 'flex', alignItems: 'center', gap: 6 },
  input: {
    width: 46, padding: '5px 6px', background: '#1e1e2e', color: '#e0d9ff',
    border: '1px solid #4a4a6a', borderRadius: 4, fontSize: 13,
  },
  x: { color: '#7878aa', fontSize: 13 },
  applyBtn: {
    padding: '5px 10px', background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a', borderRadius: 4, cursor: 'pointer', fontSize: 12,
  },
}
