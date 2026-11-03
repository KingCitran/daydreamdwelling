// Project Manager — save/load/switch between dwelling projects
// Each project is a complete snapshot of all rooms, items, settings

const INDEX_KEY = 'ddd_projects_index'
const PROJECT_PREFIX = 'ddd_project_'
const ACTIVE_KEY = 'ddd_active_project'

export function getProjectList() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]') } catch { return [] }
}

export function getActiveProjectId() {
  return localStorage.getItem(ACTIVE_KEY) || 'default'
}

export function setActiveProjectId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function saveProject(id, name, data) {
  // Save project data
  const serialized = {
    ...data,
    cells: data.cells instanceof Set ? [...data.cells] : data.cells,
    allRooms: Object.fromEntries(
      Object.entries(data.allRooms ?? {}).map(([rid, room]) => [
        rid,
        {
          ...room,
          cells: room.cells instanceof Set ? [...room.cells] : (room.cells ?? []),
          internalWalls: room.internalWalls instanceof Set ? [...room.internalWalls] : (room.internalWalls ?? []),
          doorOpenings: room.doorOpenings instanceof Set ? [...room.doorOpenings] : (room.doorOpenings ?? []),
        },
      ])
    ),
    internalWalls: data.internalWalls instanceof Set ? [...data.internalWalls] : (data.internalWalls ?? []),
    doorOpenings: data.doorOpenings instanceof Set ? [...data.doorOpenings] : (data.doorOpenings ?? []),
  }
  localStorage.setItem(PROJECT_PREFIX + id, JSON.stringify(serialized))

  // Update index
  const index = getProjectList()
  const existing = index.findIndex(p => p.id === id)
  if (existing >= 0) {
    index[existing].name = name
    index[existing].updated = Date.now()
    index[existing].roomCount = Object.keys(data.allRooms ?? {}).length + 1
  } else {
    index.push({ id, name, created: Date.now(), updated: Date.now(), roomCount: Object.keys(data.allRooms ?? {}).length + 1 })
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(index))
}

export function loadProject(id) {
  try {
    const raw = localStorage.getItem(PROJECT_PREFIX + id)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export function deleteProject(id) {
  localStorage.removeItem(PROJECT_PREFIX + id)
  const index = getProjectList().filter(p => p.id !== id)
  localStorage.setItem(INDEX_KEY, JSON.stringify(index))
  if (getActiveProjectId() === id) setActiveProjectId('default')
}

export function createProjectId() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
