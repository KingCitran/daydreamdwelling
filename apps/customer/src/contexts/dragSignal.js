import { useEffect, useState } from 'react'

// Module-level drag flag shared between DockablePanel (writer) and other
// systems that should pause expensive periodic work while a panel is being
// dragged. Implemented as a subscribable signal so React consumers can also
// react via the useIsDragging() hook (used to flip R3F Canvas frameloop).
//
// Read imperatively in event handlers via dragSignal.isDragging — that path
// doesn't trigger re-renders. Writers go through the setter so subscribers
// get notified.

const subscribers = new Set()
let _isDragging = false

export const dragSignal = {
  get isDragging() { return _isDragging },
  set isDragging(val) {
    if (_isDragging === val) return
    _isDragging = val
    subscribers.forEach(cb => cb(val))
  },
}

export function useIsDragging() {
  const [val, setVal] = useState(_isDragging)
  useEffect(() => {
    subscribers.add(setVal)
    return () => { subscribers.delete(setVal) }
  }, [])
  return val
}
