import { useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'ddd_community_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useCommunityCart() {
  const [items, setItems] = useState(loadCart)

  const persist = useCallback((next) => {
    setItems(next)
    saveCart(next)
  }, [])

  const addItem = useCallback((typeKey, sizeIndex = 0, swatchIndex = 0) => {
    setItems(prev => {
      const existing = prev.find(i => i.typeKey === typeKey && i.sizeIndex === sizeIndex && i.swatchIndex === swatchIndex)
      const next = existing
        ? prev.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { typeKey, sizeIndex, swatchIndex, qty: 1 }]
      saveCart(next)
      return next
    })
  }, [])

  const addRoomItems = useCallback((resolvedItems) => {
    setItems(prev => {
      let next = [...prev]
      for (const item of resolvedItems) {
        const existing = next.find(i =>
          i.typeKey === item.typeKey && i.sizeIndex === item.sizeIndex && i.swatchIndex === item.swatchIndex
        )
        if (existing) {
          next = next.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i)
        } else {
          next.push({ typeKey: item.typeKey, sizeIndex: item.sizeIndex ?? 0, swatchIndex: item.swatchIndex ?? 0, qty: 1 })
        }
      }
      saveCart(next)
      return next
    })
  }, [])

  const updateQty = useCallback((idx, qty) => {
    setItems(prev => {
      const next = qty <= 0 ? prev.filter((_, i) => i !== idx) : prev.map((item, i) => i === idx ? { ...item, qty } : item)
      saveCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((idx) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveCart(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    persist([])
  }, [persist])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])

  return { items, addItem, addRoomItems, updateQty, removeItem, clear, count }
}
