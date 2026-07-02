import { useState, useEffect, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

export default function useHistoryUndo({
  gridW, gridD, cells, items, floorColor, floorTexture, wallColor, wallTexture, wallFinish,
  setGridW, setGridD, setCells, setItems, setFloorColor, setFloorTexture, setWallColor, setWallTexture, setWallFinish, setSelectedId,
}) {
  const historyRef = useRef([])
  const histIdx    = useRef(-1)
  const skipHist   = useRef(false)
  const isDragging = useRef(false)
  const [histTrigger, setHistTrigger] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const refreshFlags = () => {
      setCanUndo(histIdx.current > 0)
      setCanRedo(histIdx.current < historyRef.current.length - 1)
    }
    if (skipHist.current) { skipHist.current = false; refreshFlags(); return }
    if (isDragging.current) return
    const snap = { gridW, gridD, cells: [...cells], items: [...items], floorColor, floorTexture, wallColor, wallTexture, wallFinish }
    let hist = historyRef.current.slice(0, histIdx.current + 1)
    hist.push(snap)
    if (hist.length > MAX_HISTORY) hist = hist.slice(-MAX_HISTORY)
    historyRef.current = hist
    histIdx.current    = hist.length - 1
    refreshFlags()
  }, [gridW, gridD, cells, items, floorColor, floorTexture, wallColor, wallTexture, wallFinish, histTrigger])

  const onDragStart = useCallback(() => { isDragging.current = true }, [])
  const onDragEnd   = useCallback(() => {
    isDragging.current = false
    setHistTrigger(v => v + 1)
  }, [])

  const restoreSnap = useCallback((snap) => {
    skipHist.current = true
    setGridW(snap.gridW); setGridD(snap.gridD)
    setCells(new Set(snap.cells)); setItems(snap.items)
    setFloorColor(snap.floorColor); setFloorTexture(snap.floorTexture ?? 'flat')
    setWallColor(snap.wallColor); setWallTexture(snap.wallTexture ?? 'flat'); setWallFinish(snap.wallFinish ?? 'eggshell')
    setSelectedId(null)
  }, [setGridW, setGridD, setCells, setItems, setFloorColor, setFloorTexture, setWallColor, setWallTexture, setWallFinish, setSelectedId])

  const undo = useCallback(() => {
    if (histIdx.current <= 0) return
    isDragging.current = false
    histIdx.current--
    restoreSnap(historyRef.current[histIdx.current])
  }, [restoreSnap])

  const redo = useCallback(() => {
    if (histIdx.current >= historyRef.current.length - 1) return
    isDragging.current = false
    histIdx.current++
    restoreSnap(historyRef.current[histIdx.current])
  }, [restoreSnap])

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return { undo, redo, onDragStart, onDragEnd, canUndo, canRedo, isDragging }
}
