import { useState, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const FLOOR_PRESETS = [
  { label: 'Small 10×10',     w: 10, d: 10 },
  { label: 'Standard 10×12', w: 10, d: 12 },
  { label: 'Large 12×16',    w: 12, d: 16 },
]

const HEIGHT_PRESETS = [8, 9, 10]

export default function Panel({ gridW, gridD, cells, onCellToggle, onApplyGrid, wallHeight, onSetWallHeight, neighborCells }) {
  const t = useTheme()
  const s = makeStyles(t)
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
    <div style={s.panel}>
      <p style={s.sectionLabel}>Floor Plan</p>
      <p style={s.hint}>Click or drag to toggle cells</p>

      <div style={s.gridCenter}>
        <div
          style={s.gridWrap}
          onMouseLeave={stopPaint}
          onMouseUp={stopPaint}
          onContextMenu={e => e.preventDefault()}
        >
          {Array.from({ length: gridD }, (_, row) => (
            <div key={row} style={s.gridRow}>
              {Array.from({ length: gridW }, (_, col) => {
                const key = `${col},${row}`
                const active   = cells.has(key)
                const neighbor = neighborCells?.has(key) ?? false
                const bgColor  = neighbor ? t.surface
                               : active   ? '#c0b49e'
                               :             t.bg
                return (
                  <div
                    key={col}
                    title={neighbor ? 'Occupied by adjacent room' : undefined}
                    style={{
                      width: cellPx, height: cellPx,
                      background: bgColor,
                      border: `1px solid ${t.surfaceBorder}`,
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

      <p style={{ ...s.sectionLabel, marginTop: 14 }}>Quick Size</p>
      <div style={s.presetRow}>
        {FLOOR_PRESETS.map(({ label, w, d }) => (
          <button
            key={label}
            style={{ ...s.presetBtn, ...(gridW === w && gridD === d ? s.presetBtnActive : {}) }}
            onClick={() => { setDraftW(w); setDraftD(d); onApplyGrid(w, d) }}
          >{label}</button>
        ))}
      </div>

      <p style={{ ...s.sectionLabel, marginTop: 14 }}>Custom (ft)</p>
      <div style={s.inputRow}>
        <input
          type="number" min={4} max={30} value={draftW}
          className="ddd-input"
          style={s.input}
          onChange={e => setDraftW(Math.min(30, Math.max(4, Number(e.target.value) || 4)))}
        />
        <span style={s.x}>×</span>
        <input
          type="number" min={4} max={30} value={draftD}
          className="ddd-input"
          style={s.input}
          onChange={e => setDraftD(Math.min(30, Math.max(4, Number(e.target.value) || 4)))}
        />
        <button style={s.applyBtn}
          onClick={() => onApplyGrid(
            Math.min(30, Math.max(4, draftW)),
            Math.min(30, Math.max(4, draftD)),
          )}
        >Apply</button>
      </div>

      <div style={s.divider} />
      <p style={s.sectionLabel}>Wall Height (ft)</p>
      <div style={s.presetRow}>
        {HEIGHT_PRESETS.map(h => (
          <button
            key={h}
            style={{ ...s.presetBtn, ...(wallHeight === h ? s.presetBtnActive : {}) }}
            onClick={() => { setDraftH(h); onSetWallHeight(h) }}
          >{h} ft</button>
        ))}
      </div>
      <div style={{ ...s.inputRow, marginTop: 6 }}>
        <input
          type="number" min={6} max={20} value={draftH}
          className="ddd-input"
          style={s.input}
          onChange={e => setDraftH(Math.min(20, Math.max(6, Number(e.target.value) || 8)))}
        />
        <span style={s.x}>ft</span>
        <button style={s.applyBtn}
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

function makeStyles(t) {
  const accentTint = `${t.accent}22`
  return {
    panel: {
      position: 'absolute', top: 20, left: 20, width: 248,
      background: t.navBg, border: `1.5px solid ${t.surfaceBorder}`,
      borderRadius: 10, padding: '14px 14px 16px',
      userSelect: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    },
    sectionLabel: {
      margin: '0 0 5px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft,
    },
    hint: { margin: '0 0 8px', fontSize: 11, color: t.textSoft },
    gridCenter: { display: 'flex', justifyContent: 'center' },
    gridWrap: {
      display: 'inline-flex', flexDirection: 'column',
      maxHeight: 216, overflowX: 'hidden', overflowY: 'auto',
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 3,
      lineHeight: 0, scrollbarWidth: 'thin',
    },
    gridRow: { display: 'flex' },
    divider: { borderTop: `1px solid ${t.surfaceBorder}`, margin: '14px 0 10px' },
    presetRow: { display: 'flex', gap: 5, flexWrap: 'wrap' },
    presetBtn: {
      padding: '4px 9px', background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 5, cursor: 'pointer', fontSize: 11,
    },
    presetBtnActive: {
      background: accentTint, borderColor: t.accent, color: t.accent,
    },
    inputRow: { display: 'flex', alignItems: 'center', gap: 6 },
    input: {
      width: 46, padding: '5px 6px', background: t.bg, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, fontSize: 13,
    },
    x: { color: t.textSoft, fontSize: 13 },
    applyBtn: {
      padding: '5px 10px', background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, cursor: 'pointer', fontSize: 12,
    },
  }
}
