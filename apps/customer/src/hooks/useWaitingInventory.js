import { useState, useEffect, useCallback } from 'react'

const KEY = 'ddd_waiting_inventory'
const SEEN_KEY = 'ddd_waiting_seen'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export default function useWaitingInventory() {
  const [items, setItems] = useState(load)
  const [seenCount, setSeenCount] = useState(() => Number(localStorage.getItem(SEEN_KEY) || 0))

  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEY) setItems(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((entry) => {
    setItems(prev => {
      const next = [...prev, { ...entry, addedAt: Date.now(), id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]
      save(next)
      return next
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      save(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    save([])
    setItems([])
  }, [])

  const markSeen = useCallback(() => {
    const c = items.length
    localStorage.setItem(SEEN_KEY, String(c))
    setSeenCount(c)
  }, [items.length])

  const unseenCount = Math.max(0, items.length - seenCount)

  return { items, addItem, removeItem, clearAll, markSeen, unseenCount, count: items.length }
}
