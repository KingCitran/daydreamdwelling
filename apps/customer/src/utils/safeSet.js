// Convert any iterable (Array, Set, or other) to a Set.
// Used everywhere rooms are loaded — cells, internalWalls, doorOpenings
// can be stored as Arrays (JSON) or Sets (live state).
export default function safeSet(v) {
  if (v instanceof Set) return v
  if (Array.isArray(v)) return new Set(v)
  if (v && typeof v[Symbol.iterator] === 'function') return new Set(v)
  return new Set()
}
