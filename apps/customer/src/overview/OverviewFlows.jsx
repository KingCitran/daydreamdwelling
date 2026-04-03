import { useState, useRef } from 'react'

function makeFullGrid(w, d) {
  const s = new Set()
  for (let c = 0; c < w; c++)
    for (let r = 0; r < d; r++)
      s.add(`${c},${r}`)
  return s
}

function MiniGrid({ gridW, gridD, cells, onCellsChange }) {
  const cellPx = Math.max(6, Math.min(18, Math.floor(300 / Math.max(gridW, gridD))))
  const painting = useRef(null)

  const paint = (col, row) => {
    const key = `${col},${row}`
    if (painting.current === 'add' && !cells.has(key))
      onCellsChange(prev => { const n = new Set(prev); n.add(key); return n })
    if (painting.current === 'remove' && cells.has(key))
      onCellsChange(prev => { const n = new Set(prev); n.delete(key); return n })
  }

  return (
    <div
      style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0, border: '1px solid #4a4a6a', borderRadius: 3, overflow: 'auto', maxHeight: 260 }}
      onMouseLeave={() => { painting.current = null }}
      onMouseUp={() => { painting.current = null }}
      onContextMenu={e => e.preventDefault()}
    >
      {Array.from({ length: gridD }, (_, row) => (
        <div key={row} style={{ display: 'flex' }}>
          {Array.from({ length: gridW }, (_, col) => {
            const key = `${col},${row}`
            return (
              <div
                key={col}
                style={{
                  width: cellPx, height: cellPx, flexShrink: 0, boxSizing: 'border-box',
                  background: cells.has(key) ? '#c0b49e' : '#1a1a2e',
                  border: '1px solid #3a3a55', cursor: 'crosshair',
                }}
                onMouseDown={() => {
                  const k = `${col},${row}`
                  painting.current = cells.has(k) ? 'remove' : 'add'
                  paint(col, row)
                }}
                onMouseEnter={() => paint(col, row)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

const CARD = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#1e1e32', border: '1px solid #4a4a6a',
  borderRadius: 12, padding: '20px 24px',
  zIndex: 20, minWidth: 320, maxWidth: 440,
  color: '#e0d9ff', fontFamily: 'system-ui, sans-serif',
  maxHeight: 'calc(100% - 80px)', overflowY: 'auto',
}
const CARD_BTM = {
  position: 'absolute', bottom: 80, left: '50%',
  transform: 'translateX(-50%)',
  background: '#1e1e32', border: '1px solid #4a4a6a',
  borderRadius: 10, padding: '14px 20px',
  zIndex: 20, minWidth: 280,
  color: '#e0d9ff', fontFamily: 'system-ui, sans-serif',
}
const LBL  = { fontSize: 11, fontWeight: 700, color: '#7878aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block', marginTop: 12 }
const INP  = { width: '100%', padding: '7px 10px', background: '#2a2a3d', border: '1px solid #4a4a6a', borderRadius: 6, color: '#e0d9ff', fontSize: 14, boxSizing: 'border-box' }
const BTN  = { padding: '7px 15px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }
const BPRI = { ...BTN, background: '#5a3a9a', border: '1px solid #8a6acc', color: '#fff' }
const BSEC = { ...BTN, background: 'transparent', border: '1px solid #5a5a8a', color: '#9090bb' }
const BROW = { display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }
const WALLS = ['N', 'S', 'W', 'E']

export default function OverviewFlows({
  floorRooms, selectedLevel, roomNames,
  onAddRoom, onAddDoor, onAddExteriorDoor, onUpdateRoomShape, onAddStairs,
  onSetSelectionMode, onSetRoomSelectCb,
  editShapeRoomId, onClearEditShapeRoomId,
}) {
  const [fabOpen, setFabOpen] = useState(false)
  const [flow,    setFlow]    = useState(null)
  const [data,    setData]    = useState({})

  // Triggered externally when user taps a room in edit mode
  const prevEditId = useRef(null)
  if (editShapeRoomId != null && editShapeRoomId !== prevEditId.current && flow !== 'editShape') {
    prevEditId.current = editShapeRoomId
    setFlow('editShape')
    setData({ roomId: editShapeRoomId })
    onClearEditShapeRoomId()
  }

  const reset = () => {
    setFlow(null); setData({})
    onSetSelectionMode(null); onSetRoomSelectCb(null)
  }
  const enter = (f) => { setFabOpen(false); setFlow(f); setData({}) }

  const activateRoomSelect = (tag, cb) => {
    if (data._selTag === tag) return
    setData(d => ({ ...d, _selTag: tag }))
    onSetSelectionMode('room')
    onSetRoomSelectCb(() => (rid) => {
      onSetSelectionMode(null); onSetRoomSelectCb(null)
      cb(rid)
    })
  }

  // ── Add Room ──────────────────────────────────────────────────────
  if (flow === 'addRoom') {
    const dW = data.dW ?? 12
    const dD = data.dD ?? 12
    const dCells = data.dCells ?? makeFullGrid(dW, dD)
    return (
      <div style={CARD}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Add a Room</div>
        <span style={LBL}>Room Name</span>
        <input style={INP} placeholder="e.g. Living Room"
          value={data.name ?? ''}
          onChange={e => setData(d => ({ ...d, name: e.target.value }))}
          autoFocus
        />
        <span style={LBL}>Floor Plan — {dW} × {dD} ft (click/drag to shape)</span>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input type="number" min={4} max={30} value={dW} style={{ ...INP, width: 56 }}
            onChange={e => {
              const w = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              setData(d => ({ ...d, dW: w, dCells: makeFullGrid(w, d.dD ?? 12) }))
            }}
          />
          <span style={{ color: '#7878aa', lineHeight: '34px' }}>×</span>
          <input type="number" min={4} max={30} value={dD} style={{ ...INP, width: 56 }}
            onChange={e => {
              const dep = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              setData(d => ({ ...d, dD: dep, dCells: makeFullGrid(d.dW ?? 12, dep) }))
            }}
          />
        </div>
        <MiniGrid gridW={dW} gridD={dD} cells={dCells}
          onCellsChange={fn => setData(d => ({ ...d, dCells: fn(d.dCells ?? makeFullGrid(d.dW ?? 12, d.dD ?? 12)) }))}
        />
        <div style={BROW}>
          <button style={BSEC} onClick={reset}>Cancel</button>
          <button style={BPRI} onClick={() => {
            onAddRoom({ gridW: dW, gridD: dD, cells: dCells, name: (data.name ?? '').trim() || undefined, wallHeight: 8, level: selectedLevel })
            reset()
          }}>Add Room</button>
        </div>
      </div>
    )
  }

  // ── Add Door / Exterior Door ──────────────────────────────────────
  if (flow === 'addDoor' || flow === 'addExteriorDoor') {
    const isExt = flow === 'addExteriorDoor'

    if (!data.fromId) {
      activateRoomSelect('door_from', (rid) => setData(d => ({ ...d, fromId: rid, _selTag: null })))
      return (
        <div style={CARD_BTM}>
          <div style={{ fontWeight: 600, color: '#c0b8ff' }}>{isExt ? 'Add Exterior Door' : 'Add a Door'}</div>
          <div style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>Click a room to place the door in.</div>
          <div style={BROW}><button style={BSEC} onClick={reset}>Cancel</button></div>
        </div>
      )
    }

    const fromRoom = floorRooms[data.fromId]

    if (!data.wall) {
      const pw = data._pw
      const wallLen = pw ? ((pw === 'N' || pw === 'S') ? fromRoom?.gridW : fromRoom?.gridD) ?? 12 : 12
      const pu = data._pu ?? wallLen / 2
      return (
        <div style={CARD}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{isExt ? 'Add Exterior Door' : 'Add a Door'}</div>
          <div style={{ color: '#8080aa', fontSize: 12, marginBottom: 14 }}>{roomNames?.[data.fromId] ?? `Room ${data.fromId + 1}`}</div>
          <span style={LBL}>Which wall?</span>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {WALLS.map(w => (
              <button key={w} style={{ ...BTN, flex: 1,
                background: pw === w ? '#5a3a9a' : '#2a2a3d',
                border: `1px solid ${pw === w ? '#8a6acc' : '#4a4a6a'}`,
                color: pw === w ? '#fff' : '#a0a0cc',
              }} onClick={() => setData(d => ({ ...d, _pw: w, _pu: ((w === 'N' || w === 'S') ? (fromRoom?.gridW ?? 12) : (fromRoom?.gridD ?? 12)) / 2 }))}>
                {w}
              </button>
            ))}
          </div>
          {pw && (
            <>
              <span style={LBL}>Position: {pu.toFixed(1)} ft from left</span>
              <input type="range" min={1} max={wallLen - 1} step={0.5} value={pu} style={{ width: '100%' }}
                onChange={e => setData(d => ({ ...d, _pu: Number(e.target.value) }))}
              />
            </>
          )}
          <div style={BROW}>
            <button style={BSEC} onClick={() => setData(d => ({ ...d, fromId: undefined, _pw: undefined, _pu: undefined }))}>Back</button>
            <button style={{ ...BPRI, opacity: pw ? 1 : 0.5 }} disabled={!pw} onClick={() => {
              if (!pw) return
              const wl = (pw === 'N' || pw === 'S') ? (fromRoom?.gridW ?? 12) : (fromRoom?.gridD ?? 12)
              const u  = data._pu ?? wl / 2
              if (isExt) { onAddExteriorDoor(data.fromId, pw, u); reset(); return }
              setData(d => ({ ...d, wall: pw, wallU: u }))
            }}>
              {isExt ? 'Place Door' : 'Next →'}
            </button>
          </div>
        </div>
      )
    }

    if (!data.toId) {
      activateRoomSelect('door_to', (rid) => {
        if (rid === data.fromId) return
        setData(d => ({ ...d, toId: rid, _selTag: null }))
      })
      return (
        <div style={CARD_BTM}>
          <div style={{ fontWeight: 600, color: '#c0b8ff' }}>Connect to...</div>
          <div style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>Click the room to connect this door to.</div>
          <div style={BROW}>
            <button style={BSEC} onClick={() => setData(d => ({ ...d, wall: undefined, wallU: undefined }))}>Back</button>
          </div>
        </div>
      )
    }

    return (
      <div style={CARD}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Confirm Door</div>
        <div style={{ fontSize: 13, color: '#a0a0cc', lineHeight: 1.7 }}>
          <b style={{ color: '#e0d9ff' }}>{roomNames?.[data.fromId] ?? `Room ${data.fromId + 1}`}</b>
          {' → '}
          <b style={{ color: '#e0d9ff' }}>{roomNames?.[data.toId] ?? `Room ${data.toId + 1}`}</b>
          <br />Wall: <b style={{ color: '#e0d9ff' }}>{data.wall}</b>{' '}at{' '}
          <b style={{ color: '#e0d9ff' }}>{data.wallU?.toFixed(1)} ft</b>
        </div>
        <div style={BROW}>
          <button style={BSEC} onClick={reset}>Cancel</button>
          <button style={BPRI} onClick={() => { onAddDoor(data.fromId, data.wall, data.wallU, data.toId); reset() }}>Add Door</button>
        </div>
      </div>
    )
  }

  // ── Edit Room Shape ───────────────────────────────────────────────
  if (flow === 'editShape') {
    const room = floorRooms?.[data.roomId]
    if (!room) { reset(); return null }
    const eW = data.eW ?? room.gridW
    const eD = data.eD ?? room.gridD
    const eCells = data.eCells ?? (room.cells instanceof Set ? room.cells : new Set(room.cells))

    const applyShape = (w, d, c) => {
      setData(prev => ({ ...prev, eW: w, eD: d, eCells: c }))
      onUpdateRoomShape(data.roomId, w, d, c)
    }

    return (
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Edit: {roomNames?.[data.roomId] ?? `Room ${data.roomId + 1}`}
          </div>
          <button style={{ ...BSEC, padding: '4px 10px' }} onClick={reset}>Done</button>
        </div>
        <span style={LBL}>Floor Shape — {eW} × {eD} ft</span>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input type="number" min={4} max={30} value={eW} style={{ ...INP, width: 56 }}
            onChange={e => {
              const w = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              applyShape(w, eD, makeFullGrid(w, eD))
            }}
          />
          <span style={{ color: '#7878aa', lineHeight: '34px' }}>×</span>
          <input type="number" min={4} max={30} value={eD} style={{ ...INP, width: 56 }}
            onChange={e => {
              const dep = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              applyShape(eW, dep, makeFullGrid(eW, dep))
            }}
          />
        </div>
        <MiniGrid gridW={eW} gridD={eD} cells={eCells}
          onCellsChange={fn => {
            const next = fn(eCells)
            applyShape(eW, eD, next)
          }}
        />
      </div>
    )
  }

  // ── Add Stairs ────────────────────────────────────────────────────
  if (flow === 'addStairs') {
    if (!data.roomId) {
      activateRoomSelect('stairs_room', (rid) => setData(d => ({ ...d, roomId: rid, _selTag: null })))
      return (
        <div style={CARD_BTM}>
          <div style={{ fontWeight: 600, color: '#c0b8ff' }}>Add Stairs</div>
          <div style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>Click the room to add stairs to.</div>
          <div style={BROW}><button style={BSEC} onClick={reset}>Cancel</button></div>
        </div>
      )
    }

    const room = floorRooms?.[data.roomId]
    if (!room) { reset(); return null }

    if ((data.stairsStep ?? 0) === 0) {
      const bCells = data.bCells ?? new Set()
      const sc = data.sc ?? 12
      return (
        <div style={CARD}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Add Stairs — Step 1 of 2</div>
          <div style={{ color: '#8080aa', fontSize: 12, marginBottom: 12 }}>{roomNames?.[data.roomId] ?? `Room ${data.roomId + 1}`}</div>
          <span style={LBL}>Draw bottom footprint on this floor</span>
          <MiniGrid gridW={room.gridW} gridD={room.gridD} cells={bCells}
            onCellsChange={fn => setData(d => ({ ...d, bCells: fn(d.bCells ?? new Set()) }))}
          />
          <span style={LBL}>Number of stairs: {sc}</span>
          <input type="range" min={3} max={20} step={1} value={sc} style={{ width: '100%' }}
            onChange={e => setData(d => ({ ...d, sc: Number(e.target.value) }))}
          />
          <div style={BROW}>
            <button style={BSEC} onClick={reset}>Cancel</button>
            <button style={{ ...BPRI, opacity: bCells.size > 0 ? 1 : 0.5 }} disabled={bCells.size === 0}
              onClick={() => setData(d => ({ ...d, stairsStep: 1 }))}>
              Next →
            </button>
          </div>
        </div>
      )
    }

    const tW = data.tW ?? room.gridW
    const tD = data.tD ?? room.gridD
    const tCells = data.tCells ?? new Set()
    return (
      <div style={CARD}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Add Stairs — Step 2 of 2</div>
        <span style={LBL}>Upper floor size (ft)</span>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input type="number" min={4} max={30} value={tW} style={{ ...INP, width: 56 }}
            onChange={e => {
              const w = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              setData(d => ({ ...d, tW: w, tCells: new Set() }))
            }}
          />
          <span style={{ color: '#7878aa', lineHeight: '34px' }}>×</span>
          <input type="number" min={4} max={30} value={tD} style={{ ...INP, width: 56 }}
            onChange={e => {
              const dep = Math.min(30, Math.max(4, Number(e.target.value) || 4))
              setData(d => ({ ...d, tD: dep, tCells: new Set() }))
            }}
          />
        </div>
        <span style={LBL}>Draw upper floor landing cells</span>
        <MiniGrid gridW={tW} gridD={tD} cells={tCells}
          onCellsChange={fn => setData(d => ({ ...d, tCells: fn(d.tCells ?? new Set()) }))}
        />
        <div style={BROW}>
          <button style={BSEC} onClick={() => setData(d => ({ ...d, stairsStep: 0 }))}>← Back</button>
          <button style={{ ...BPRI, opacity: tCells.size > 0 ? 1 : 0.5 }} disabled={tCells.size === 0}
            onClick={() => {
              onAddStairs(data.roomId, { bottomCells: data.bCells, stairCount: data.sc ?? 12, topCells: tCells, topW: tW, topD: tD })
              reset()
            }}>
            Add Stairs
          </button>
        </div>
      </div>
    )
  }

  // ── FAB ───────────────────────────────────────────────────────────
  const FAB_OPTS = [
    { key: 'addRoom',         label: 'Add a Room',        icon: '▭' },
    { key: 'addDoor',         label: 'Add a Door',        icon: '▬' },
    { key: 'addExteriorDoor', label: 'Add Exterior Door', icon: '⬒' },
    { key: 'addStairs',       label: 'Add Stairs',        icon: '▲' },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {fabOpen && FAB_OPTS.map(opt => (
        <button key={opt.key} onClick={() => enter(opt.key)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 20,
          background: '#3a2a5a', border: '1px solid #6a4acc',
          color: '#e0d8ff', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <span style={{ fontSize: 10 }}>{opt.icon}</span> {opt.label}
        </button>
      ))}
      <button onClick={() => setFabOpen(v => !v)} style={{
        width: 52, height: 52, borderRadius: '50%',
        background: fabOpen ? '#4a2a7a' : '#5a3a9a',
        border: '2px solid #9a7acc', color: '#fff',
        fontSize: 28, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(90,60,160,0.5)',
        fontFamily: 'system-ui, sans-serif', lineHeight: 1,
      }} title={fabOpen ? 'Close' : 'Add to floor plan'}>
        {fabOpen ? '✕' : '+'}
      </button>
    </div>
  )
}
