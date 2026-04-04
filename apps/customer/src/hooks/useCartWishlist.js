import { useState, useCallback } from 'react'

export default function useCartWishlist({ initSave, items, setItems }) {
  const [cart, setCart] = useState(initSave?.cart ?? [])

  const addToCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => {
      const idx = prev.findIndex(
        c => c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { typeKey, sizeIndex, swatchIndex, qty: 1 }]
    })
  }, [])

  const decrementCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => {
      const idx = prev.findIndex(
        c => c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex
      )
      if (idx < 0) return prev
      if (prev[idx].qty <= 1) return prev.filter((_, i) => i !== idx)
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty - 1 }
      return next
    })
  }, [])

  const removeFromCart = useCallback((typeKey, sizeIndex, swatchIndex) => {
    setCart(prev => prev.filter(
      c => !(c.typeKey === typeKey && c.sizeIndex === sizeIndex && c.swatchIndex === swatchIndex)
    ))
    const matches = items.filter(
      it => it.typeKey === typeKey && it.sizeIndex === sizeIndex && it.swatchIndex === swatchIndex
    )
    if (matches.length > 0 && window.confirm(
      `Remove ${matches.length === 1 ? 'this item' : `all ${matches.length} copies`} from your room too?`
    )) {
      const ids = new Set(matches.map(it => it.id))
      setItems(prev => prev.filter(it => !ids.has(it.id)))
    }
  }, [items, setItems])

  const toggleWishlist = useCallback((id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, wishlisted: !it.wishlisted } : it
    ))
  }, [setItems])

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const wishlistedItems = items.filter(it => it.wishlisted)

  return { cart, setCart, cartCount, addToCart, decrementCart, removeFromCart, toggleWishlist, wishlistedItems }
}
