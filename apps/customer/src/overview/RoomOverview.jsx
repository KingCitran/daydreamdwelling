import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import OverviewFlows from './OverviewFlows'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { computeRoomLayout } from './layout'
import OverviewRoomGroup from './OverviewRoomGroup'
import { ITEM_CATALOGUE } from '../data/items'

const SNAP_DIST = 1.5  // feet — how close to snap to wall-flush position
const GRID_STEP = 1    // feet — grid snap increment during drag

const overviewStyles = {
  overviewOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  overviewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  overviewTitle: { fontSize: 16, fontWeight: 700, color: '#e0d9ff' },
  overviewHeaderBtn: {
    padding: '6px 14px', borderRadius: 6,
    background: '#3a3a55', border: '1px solid #5a5a8a', color: '#c0b8ff',
    fontSize: 12, cursor: 'pointer',
  },
  overviewClose: {
    padding: '6px 12px', borderRadius: 6,
    background: 'transparent', border: '1px solid #5a5a8a', color: '#8888bb',
    fontSize: 14, cursor: 'pointer', marginLeft: 8,
  },
}

// userZoomedRef is shared between OverviewZoom and OverviewCamera
// so that manual wheel zoom prevents span-change from resetting it.
function OverviewZoom({ userZoomedRef }) {
  const { camera, gl } = useThree()
  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      e.preventDefault()
      userZoomedRef.current = true
      camera.zoom = Math.max(4, Math.min(600, camera.zoom * (e.deltaY < 0 ? 1.12 : 0.89)))
      camera.updateProjectionMatrix()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [camera, gl, userZoomedRef])
  return null
}

function OverviewCamera({ span, userZoomedRef }) {
  const { camera, size } = useThree()

  // Initial zoom — only on first open or canvas resize before user has zoomed
  useEffect(() => {
    if (userZoomedRef.current) return
    const s = Math.max(span, 1)
    const isoSpan = s * Math.SQRT2
    camera.zoom = (Math.min(size.width, size.height) * 0.7) / isoSpan
    camera.updateProjectionMatrix()
  }, [camera, span, size.width, size.height, userZoomedRef])

  // Position tracks span so newly added rooms don't fall off screen
  useEffect(() => {
    const s = Math.max(span, 1)
    const d = s * 1.1
    camera.position.set(d, d * 0.7, d)
    camera.lookAt(0, 2.0 * 0.4, 0)
    camera.updateProjectionMatrix()
  }, [camera, span])

  return null
}

export default function RoomOverview({ allRoomsData, currentRoomId, roomNames, showLabels, onToggleLabels, onNavigate, onRename, onDeleteRoom, onClose, layoutOverrides, onSetLayoutOverrides, onUnlinkDoors, onAddRoom, onAddDoor, onAddExteriorDoor, onUpdateRoomShape, onAddStairs }) {
  // Compute unique floor levels (rooms without .level default to 0 = ground floor)
  const allLevels = useMemo(() => {
    const lvls = new Set(Object.values(allRoomsData).map(r => r.level ?? 0))
    return [...lvls].sort((a, b) => b - a)  // descending: upper floors first
  }, [allRoomsData])

  const [selectedLevel, setSelectedLevel] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [dragWarning, setDragWarning] = useState(null)  // null or string message
  const userZoomedRef = useRef(false)
  // Reset zoom-lock each time the overview is mounted (re-opened)
  useEffect(() => { userZoomedRef.current = false }, [])
  const pendingUnlinksRef = useRef([])  // array of {rid, doorId, connectedRoomId} to unlink on drop

  // ── Flow selection mode ────────────────────────────────────────────
  const [selectionMode,   setSelectionMode]   = useState(null)  // null | 'room'
  const [editShapeRoomId, setEditShapeRoomId] = useState(null)
  const roomSelectCbRef = useRef(null)
  const setRoomSelectCb = useCallback((cb) => { roomSelectCbRef.current = cb }, [])

  // Keep selectedLevel valid when levels change
  const validLevel = allLevels.includes(selectedLevel) ? selectedLevel : (allLevels[0] ?? 0)

  // Filter to rooms on the selected floor
  const floorRooms = useMemo(() => Object.fromEntries(
    Object.entries(allRoomsData).filter(([, r]) => (r.level ?? 0) === validLevel)
  ), [allRoomsData, validLevel])

  // scale=1 (1 world unit = 1 ft), gap=0 so rooms share wall edges
  const { positions, totalW, totalH } = useMemo(
    () => computeRoomLayout(floorRooms, 1, 0),
    [floorRooms],
  )
  const span = Math.max(totalW, totalH, 1)

  // Merge BFS positions with manual overrides (overrides stored as world-space ox/oz)
  const finalOxOz = useMemo(() => {
    const result = {}
    for (const [idStr, pos] of Object.entries(positions)) {
      const rid = Number(idStr)
      result[rid] = layoutOverrides[rid] ?? {
        ox: pos.x - totalW / 2 + pos.w / 2,
        oz: pos.y - totalH / 2 + pos.h / 2,
      }
    }
    return result
  }, [positions, layoutOverrides, totalW, totalH])

  // Keep a ref to current floorRooms + finalOxOz for stable drag callbacks
  const floorRoomsRef = useRef(floorRooms)
  const finalOxOzRef  = useRef(finalOxOz)
  useEffect(() => { floorRoomsRef.current = floorRooms }, [floorRooms])
  useEffect(() => { finalOxOzRef.current  = finalOxOz  }, [finalOxOz])

  // Wall-flush snap: snap dragging room so its faces align with neighbour faces
  const computeSnapWallFlush = useCallback((draggingRid, ox, oz) => {
    const rooms = floorRoomsRef.current
    const oxOz  = finalOxOzRef.current
    const room_A = rooms[draggingRid]
    if (!room_A) return null
    const aW = room_A.gridW, aD = room_A.gridD

    let bestSnap = null, bestDist = SNAP_DIST

    for (const [bRidStr, room_B] of Object.entries(rooms)) {
      const bRid = Number(bRidStr)
      if (bRid === draggingRid) continue
      const bPos = oxOz[bRid]
      if (!bPos) continue
      const { ox: bOx, oz: bOz } = bPos
      const bW = room_B.gridW, bD = room_B.gridD

      // Check N face of A vs S face of B
      const distNS_A = Math.abs((oz - aD / 2) - (bOz + bD / 2))
      if (distNS_A < bestDist) {
        bestDist = distNS_A
        bestSnap = { ox, oz: bOz + bD / 2 + aD / 2 }
      }
      // Check S face of A vs N face of B
      const distSN_A = Math.abs((oz + aD / 2) - (bOz - bD / 2))
      if (distSN_A < bestDist) {
        bestDist = distSN_A
        bestSnap = { ox, oz: bOz - bD / 2 - aD / 2 }
      }
      // Check W face of A vs E face of B
      const distWE_A = Math.abs((ox - aW / 2) - (bOx + bW / 2))
      if (distWE_A < bestDist) {
        bestDist = distWE_A
        bestSnap = { ox: bOx + bW / 2 + aW / 2, oz }
      }
      // Check E face of A vs W face of B
      const distEW_A = Math.abs((ox + aW / 2) - (bOx - bW / 2))
      if (distEW_A < bestDist) {
        bestDist = distEW_A
        bestSnap = { ox: bOx - bW / 2 - aW / 2, oz }
      }
    }
    return bestSnap
  }, [])

  // Returns { constrainedOx, constrainedOz, wouldUnlink: bool }
  // When the moving room has linked doors, restrict movement to keep door openings within the partner wall.
  // If dragged beyond UNLINK_SLACK, flag as wouldUnlink.
  const UNLINK_SLACK = 2.5  // ft beyond constraint before unlink triggers

  const computeDragConstraint = useCallback((rid, rawOx, rawOz) => {
    const rooms = floorRoomsRef.current
    const oxOz  = finalOxOzRef.current
    const roomA = rooms[rid]
    if (!roomA) return { constrainedOx: rawOx, constrainedOz: rawOz, wouldUnlink: false }

    const aW = roomA.gridW, aD = roomA.gridD

    let constrainedOx = rawOx, constrainedOz = rawOz
    let wouldUnlink = false
    const unlinks = []

    for (const doorA of (roomA.items || [])) {
      if (!ITEM_CATALOGUE[doorA.typeKey]?.door || !doorA.connectedRoomId) continue
      if (ITEM_CATALOGUE[doorA.typeKey]?.entryway) continue
      const bRid  = doorA.connectedRoomId
      const roomB = rooms[bRid]
      if (!roomB) continue
      const bPos = oxOz[bRid]
      if (!bPos) continue
      const { ox: bOx, oz: bOz } = bPos
      const bW = roomB.gridW, bD = roomB.gridD

      // Door A's position in wall: u measured from left edge of wall
      const isNS = doorA.wall === 'N' || doorA.wall === 'S'
      const uA = doorA.wallU ?? (isNS ? aW / 2 : aD / 2)
      const def = ITEM_CATALOGUE[doorA.typeKey]
      const size = def.sizes[doorA.sizeIndex ?? 0]
      const fwA = doorA.customW ?? size.footprint[0]

      // Constraint: door A opening must overlap with room B's wall face
      if (isNS) {
        // Moving along X; Z is constrained by wall-flush (handled by snap)
        // Door A world X center = constrainedOx - aW/2 + uA
        // Must lie within [bOx - bW/2 + fwA/2, bOx + bW/2 - fwA/2]
        const minOx = bOx - bW / 2 + fwA / 2 - uA + aW / 2
        const maxOx = bOx + bW / 2 - fwA / 2 - uA + aW / 2

        if (minOx <= maxOx) {
          // Valid range
          if (rawOx < minOx) {
            const excess = minOx - rawOx
            if (excess > UNLINK_SLACK) {
              wouldUnlink = true
              unlinks.push({ rid, doorId: doorA.id, connectedRoomId: bRid })
            } else {
              constrainedOx = minOx + (rawOx - minOx) * 0.1  // resistance
            }
          } else if (rawOx > maxOx) {
            const excess = rawOx - maxOx
            if (excess > UNLINK_SLACK) {
              wouldUnlink = true
              unlinks.push({ rid, doorId: doorA.id, connectedRoomId: bRid })
            } else {
              constrainedOx = maxOx + (rawOx - maxOx) * 0.1  // resistance
            }
          }
        }
      } else {
        // E/W door: moving along Z; X is constrained by wall-flush
        const uAz = doorA.wallU ?? aD / 2
        const minOz = bOz - bD / 2 + fwA / 2 - uAz + aD / 2
        const maxOz = bOz + bD / 2 - fwA / 2 - uAz + aD / 2

        if (minOz <= maxOz) {
          if (rawOz < minOz) {
            const excess = minOz - rawOz
            if (excess > UNLINK_SLACK) {
              wouldUnlink = true
              unlinks.push({ rid, doorId: doorA.id, connectedRoomId: bRid })
            } else {
              constrainedOz = minOz + (rawOz - minOz) * 0.1
            }
          } else if (rawOz > maxOz) {
            const excess = rawOz - maxOz
            if (excess > UNLINK_SLACK) {
              wouldUnlink = true
              unlinks.push({ rid, doorId: doorA.id, connectedRoomId: bRid })
            } else {
              constrainedOz = maxOz + (rawOz - maxOz) * 0.1
            }
          }
        }
      }
    }

    pendingUnlinksRef.current = unlinks
    return { constrainedOx, constrainedOz, wouldUnlink }
  }, [])

  const handleDrag = useCallback((rid, newOx, newOz) => {
    const { constrainedOx, constrainedOz, wouldUnlink } = computeDragConstraint(rid, newOx, newOz)
    const snappedOx = Math.round(constrainedOx / GRID_STEP) * GRID_STEP
    const snappedOz = Math.round(constrainedOz / GRID_STEP) * GRID_STEP
    setDragWarning(wouldUnlink ? 'Door will be unlinked if you continue' : null)
    onSetLayoutOverrides(prev => ({ ...prev, [rid]: { ox: snappedOx, oz: snappedOz } }))
  }, [computeDragConstraint, onSetLayoutOverrides])

  const handleDragEnd = useCallback((rid, newOx, newOz) => {
    setDragWarning(null)
    // Fire pending unlinks from drag constraint
    const separatedUnlinks = [...(pendingUnlinksRef.current)]
    pendingUnlinksRef.current = []

    // After snap, check ALL linked door pairs to see if rooms are now separated
    const snapped = computeSnapWallFlush(rid, newOx, newOz)
    const finalOx = snapped ? snapped.ox : newOx
    const finalOz = snapped ? snapped.oz : newOz
    const EPS = 0.15

    const rooms = floorRoomsRef.current
    const oxOz  = { ...finalOxOzRef.current, [rid]: { ox: finalOx, oz: finalOz } }

    const roomA = rooms[rid]
    if (roomA) {
      for (const doorA of (roomA.items || [])) {
        if (!ITEM_CATALOGUE[doorA.typeKey]?.door || !doorA.connectedRoomId) continue
        if (ITEM_CATALOGUE[doorA.typeKey]?.entryway) continue
        const bRid = doorA.connectedRoomId
        const bPos = oxOz[bRid]
        const bRoom = rooms[bRid]
        if (!bPos || !bRoom) continue

        let flush = false
        if (doorA.wall === 'N') flush = Math.abs((finalOz - roomA.gridD / 2) - (bPos.oz + bRoom.gridD / 2)) < EPS
        if (doorA.wall === 'S') flush = Math.abs((finalOz + roomA.gridD / 2) - (bPos.oz - bRoom.gridD / 2)) < EPS
        if (doorA.wall === 'W') flush = Math.abs((finalOx - roomA.gridW / 2) - (bPos.ox + bRoom.gridW / 2)) < EPS
        if (doorA.wall === 'E') flush = Math.abs((finalOx + roomA.gridW / 2) - (bPos.ox - bRoom.gridW / 2)) < EPS

        if (!flush && !separatedUnlinks.find(u => u.doorId === doorA.id)) {
          separatedUnlinks.push({ rid, doorId: doorA.id, connectedRoomId: bRid })
        }
      }
    }

    if (separatedUnlinks.length > 0 && onUnlinkDoors) {
      onUnlinkDoors(separatedUnlinks)
    }

    onSetLayoutOverrides(prev => ({ ...prev, [rid]: { ox: finalOx, oz: finalOz } }))
  }, [computeSnapWallFlush, onSetLayoutOverrides, onUnlinkDoors])

  const levelLabel = (lvl) =>
    lvl === 0 ? 'Ground Floor' : lvl > 0 ? `Floor ${lvl + 1}` : `Basement ${Math.abs(lvl)}`

  return (
    <div style={overviewStyles.overviewOverlay}>
      <div style={overviewStyles.overviewHeader}>
        <span style={overviewStyles.overviewTitle}>🏠 Room Map</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Floor / level selector */}
          <select
            value={validLevel}
            onChange={e => setSelectedLevel(Number(e.target.value))}
            style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              background: '#3a3a55', border: '1px solid #5a5a8a', color: '#c0b8ff',
            }}
          >
            {allLevels.map(lvl => (
              <option key={lvl} value={lvl}>{levelLabel(lvl)}</option>
            ))}
          </select>
          <button
            style={{
              ...overviewStyles.overviewHeaderBtn,
              background: editMode ? '#4a3a8a' : undefined,
              borderColor: editMode ? '#9a7aee' : undefined,
              color: editMode ? '#e0d8ff' : undefined,
            }}
            onClick={() => setEditMode(m => !m)}
          >
            {editMode ? 'Editing...' : 'Edit Layout'}
          </button>
          {editMode && (
            <button
              style={{ ...overviewStyles.overviewHeaderBtn, color: '#ff9090' }}
              onClick={() => onSetLayoutOverrides({})}
              title="Reset all rooms to auto-computed positions"
            >
              Reset
            </button>
          )}
          <button style={overviewStyles.overviewHeaderBtn} onClick={onToggleLabels}>
            {showLabels ? 'Labels On' : 'Labels Off'}
          </button>
          <button style={overviewStyles.overviewClose} onClick={onClose}>✕ Close</button>
        </div>
      </div>
      {editMode && (
        <div style={{
          padding: '4px 14px', fontSize: 11, color: '#a090cc',
          background: 'rgba(40,30,70,0.7)', borderBottom: '1px solid #3a3060',
          textAlign: 'center',
        }}>
          Drag rooms to reposition. Rooms snap to wall alignment when released.
        </div>
      )}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <Canvas
          orthographic
          gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <OverviewCamera span={span} userZoomedRef={userZoomedRef} />
          <OverviewZoom userZoomedRef={userZoomedRef} />
          <ambientLight intensity={0.52} />
          <directionalLight position={[8, 14, 6]} intensity={1.1} color="#fffdf0" />
          <directionalLight position={[-4, 8, -4]} intensity={0.18} color="#d0e0ff" />
          {Object.entries(positions).map(([idStr]) => {
            const rid  = Number(idStr)
            const room = floorRooms[rid]
            if (!room) return null
            const { ox, oz } = finalOxOz[rid] ?? { ox: 0, oz: 0 }
            return (
              <OverviewRoomGroup
                key={rid}
                rid={rid}
                room={room}
                ox={ox} oz={oz}
                isActive={rid === currentRoomId}
                name={showLabels ? (roomNames[rid] || `Room ${rid + 1}`) : ''}
                onSelect={() => {
                  if (selectionMode === 'room') {
                    roomSelectCbRef.current?.(rid)
                  } else if (!editMode) {
                    onNavigate(rid)
                  }
                }}
                onDelete={() => onDeleteRoom(rid)}
                editMode={editMode}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                allRoomsData={floorRooms}
                finalOxOz={finalOxOz}
                onEditShape={editMode ? (rid2) => setEditShapeRoomId(rid2) : undefined}
              />
            )
          })}
        </Canvas>
        <OverviewFlows
          floorRooms={floorRooms}
          selectedLevel={validLevel}
          roomNames={roomNames}
          onAddRoom={onAddRoom}
          onAddDoor={onAddDoor}
          onAddExteriorDoor={onAddExteriorDoor}
          onUpdateRoomShape={onUpdateRoomShape}
          onAddStairs={onAddStairs}
          onSetSelectionMode={setSelectionMode}
          onSetRoomSelectCb={setRoomSelectCb}
          editShapeRoomId={editShapeRoomId}
          onClearEditShapeRoomId={() => setEditShapeRoomId(null)}
        />
        {/* Drag warning status — lower left, outside Canvas so it's pure HTML */}
        {dragWarning && (
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'rgba(180, 40, 40, 0.92)',
            border: '1px solid #ff6060',
            borderRadius: 6,
            padding: '7px 14px',
            fontSize: 12,
            color: '#ffe0e0',
            fontFamily: 'system-ui, sans-serif',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            ⚠ {dragWarning}
          </div>
        )}
      </div>
    </div>
  )
}
