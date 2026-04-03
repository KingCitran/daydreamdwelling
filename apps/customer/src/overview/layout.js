import { ITEM_CATALOGUE } from '../data/items'

export const MINI_WH = 2.0   // overview wall height — short so room floor is visible

export function buildMiniWalls(cells, gridW, gridD) {
  const set = cells instanceof Set ? cells : new Set(cells)
  const DIRS = [
    { dc:  0, dr: -1, axis: 'z', face: 'N', oppFace: 'S' },
    { dc:  0, dr:  1, axis: 'z', face: 'S', oppFace: 'N' },
    { dc: -1, dr:  0, axis: 'x', face: 'W', oppFace: 'E' },
    { dc:  1, dr:  0, axis: 'x', face: 'E', oppFace: 'W' },
  ]
  const walls = []
  for (const key of set) {
    const [col, row] = key.split(',').map(Number)
    for (const { dc, dr, axis, face, oppFace } of DIRS) {
      if (!set.has(`${col + dc},${row + dr}`)) {
        walls.push({
          x: (col + 0.5) - gridW / 2 + dc * 0.5,
          z: (row + 0.5) - gridD / 2 + dr * 0.5,
          axis, face, oppFace,
        })
      }
    }
  }
  return walls
}

export function buildOpeningMarkers(room) {
  const out = [], { gridW, gridD } = room
  for (const item of (room.items || [])) {
    const def = ITEM_CATALOGUE[item.typeKey]
    if (!def || (!def.door && !def.window) || !item.wall) continue
    const size = def.sizes[item.sizeIndex]
    const fw   = item.customW ?? size.footprint[0]
    const isNS = item.wall === 'N' || item.wall === 'S'
    const u    = item.wallU ?? (isNS ? gridW : gridD) / 2
    let wx, wz, horiz
    switch (item.wall) {
      case 'N': wx = u - gridW / 2; wz = -gridD / 2; horiz = true;  break
      case 'S': wx = u - gridW / 2; wz =  gridD / 2; horiz = true;  break
      case 'W': wx = -gridW / 2;    wz = u - gridD / 2; horiz = false; break
      case 'E': wx =  gridW / 2;    wz = u - gridD / 2; horiz = false; break
      default: continue
    }
    out.push({
      wx, wz, fw, horiz, isDoor: !!def.door,
      isUnlinked: !!def.door && !def.entryway && item.wasLinked === true && !item.connectedRoomId,
      isEntryway: !!def.entryway,
    })
  }
  return out
}

export function findSpatialNeighbors(doorWall, currentRoomId, allRoomsData) {
  const { positions } = computeRoomLayout(allRoomsData, 1, 0)
  const myPos = positions[currentRoomId]
  if (!myPos) return []
  const EPS = 0.8   // allow small misalignment from floating-point / slide-apart
  const results = []
  for (const [rid, pos] of Object.entries(positions)) {
    const roomId = Number(rid)
    if (roomId === currentRoomId) continue
    const xOverlap = Math.min(myPos.x + myPos.w, pos.x + pos.w) - Math.max(myPos.x, pos.x)
    const yOverlap = Math.min(myPos.y + myPos.h, pos.y + pos.h) - Math.max(myPos.y, pos.y)
    let adjacent = false
    switch (doorWall) {
      case 'N': adjacent = Math.abs((pos.y + pos.h) - myPos.y) < EPS && xOverlap > 0; break
      case 'S': adjacent = Math.abs(pos.y - (myPos.y + myPos.h)) < EPS && xOverlap > 0; break
      case 'W': adjacent = Math.abs((pos.x + pos.w) - myPos.x) < EPS && yOverlap > 0; break
      case 'E': adjacent = Math.abs(pos.x - (myPos.x + myPos.w)) < EPS && yOverlap > 0; break
    }
    if (adjacent) results.push(roomId)
  }
  return results
}

export function computeRoomLayout(allRoomsData, SCALE = 14, GAP = 28) {
  const roomIds = Object.keys(allRoomsData).map(Number)
  if (roomIds.length === 0) return { positions: {}, totalW: 0, totalH: 0 }

  const rootId = roomIds[0]
  const positions = {}
  const queue = [{ id: rootId, x: 0, y: 0 }]
  const visited = new Set()

  while (queue.length) {
    const { id, x, y } = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)

    const room = allRoomsData[id]
    if (!room) continue

    const rw = room.gridW * SCALE
    const rh = room.gridD * SCALE
    positions[id] = { x, y, w: rw, h: rh }

    for (const item of (room.items || [])) {
      if (!item.wall || !item.connectedRoomId) continue
      const def = ITEM_CATALOGUE[item.typeKey]
      if (!def?.door) continue
      const cid = item.connectedRoomId
      if (visited.has(cid) || !allRoomsData[cid]) continue

      const cRoom = allRoomsData[cid]
      const crw   = cRoom.gridW * SCALE
      const crh   = cRoom.gridD * SCALE
      const wallLen = (item.wall === 'N' || item.wall === 'S') ? room.gridW : room.gridD
      const u     = item.wallU ?? wallLen / 2

      // Find the return door in the connected room to align door positions precisely
      const retDoor = (cRoom.items || []).find(
        it => ITEM_CATALOGUE[it.typeKey]?.door && it.connectedRoomId === id
      )
      let nx, ny
      switch (item.wall) {
        case 'N': { const u1 = (retDoor?.wallU ?? cRoom.gridW / 2) * SCALE; nx = x + u * SCALE - u1; ny = y - crh - GAP; break }
        case 'S': { const u1 = (retDoor?.wallU ?? cRoom.gridW / 2) * SCALE; nx = x + u * SCALE - u1; ny = y + rh + GAP;  break }
        case 'W': { const u1 = (retDoor?.wallU ?? cRoom.gridD / 2) * SCALE; nx = x - crw - GAP;      ny = y + u * SCALE - u1; break }
        case 'E': { const u1 = (retDoor?.wallU ?? cRoom.gridD / 2) * SCALE; nx = x + rw + GAP;       ny = y + u * SCALE - u1; break }
        default:    nx = x; ny = y + rh + GAP
      }
      // Slide sideways along the wall axis to clear any overlap with already-placed rooms.
      for (let attempt = 0; attempt < 12; attempt++) {
        let hit = false
        for (const ppos of Object.values(positions)) {
          const cx = Math.min(nx + crw, ppos.x + ppos.w) - Math.max(nx, ppos.x)
          const cy = Math.min(ny + crh, ppos.y + ppos.h) - Math.max(ny, ppos.y)
          if (cx <= 0.01 || cy <= 0.01) continue
          if (item.wall === 'N' || item.wall === 'S') {
            nx += (nx + crw / 2 >= ppos.x + ppos.w / 2) ? (cx + 0.1) : -(cx + 0.1)
          } else {
            ny += (ny + crh / 2 >= ppos.y + ppos.h / 2) ? (cy + 0.1) : -(cy + 0.1)
          }
          hit = true; break
        }
        if (!hit) break
      }
      queue.push({ id: cid, x: nx, y: ny })
    }
  }

  if (Object.keys(positions).length === 0) return { positions, totalW: 0, totalH: 0 }

  const allX = Object.values(positions).map(p => p.x)
  const allY = Object.values(positions).map(p => p.y)
  const minX = Math.min(...allX)
  const minY = Math.min(...allY)
  const maxX = Math.max(...Object.values(positions).map(p => p.x + p.w))
  const maxY = Math.max(...Object.values(positions).map(p => p.y + p.h))
  for (const p of Object.values(positions)) { p.x -= minX; p.y -= minY }
  return { positions, totalW: maxX - minX + GAP, totalH: maxY - minY + GAP }
}
