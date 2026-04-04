import { useState, useCallback } from 'react'
import { supabase } from '@shared/supabase'

export default function useCart() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const cartCount = items.reduce((s, i) => s + i.qty, 0)
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  const addToCart = useCallback((product, sizeIndex, swatchIndex) => {
    const size   = product.product_sizes?.[sizeIndex]
    const swatch = product.product_swatches?.[swatchIndex]
    const key    = `${product.id}-${sizeIndex}-${swatchIndex}`
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        key,
        productId:   product.id,
        label:       product.label,
        brand:       product.brand,
        sizeLabel:   size?.label ?? '',
        swatchName:  swatch?.name ?? '',
        price:       size?.price ?? 0,
        gradient:    product.gradient ?? 'linear-gradient(135deg,#4a6a3a,#2a4a1a)',
        qty:         1,
      }]
    })
  }, [])

  const increment = useCallback((key) => setItems(prev => prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)), [])
  const decrement = useCallback((key) => setItems(prev => {
    const item = prev.find(i => i.key === key)
    if (!item) return prev
    if (item.qty <= 1) return prev.filter(i => i.key !== key)
    return prev.map(i => i.key === key ? { ...i, qty: i.qty - 1 } : i)
  }), [])
  const remove = useCallback((key) => setItems(prev => prev.filter(i => i.key !== key)), [])

  const checkout = useCallback(async () => {
    if (!items.length) return
    setLoading(true); setError(null)
    try {
      const lineItems = items.map(i => ({
        typeKey: i.productId, label: i.label, sizeLabel: i.sizeLabel,
        swatchName: i.swatchName, unitPrice: i.price, qty: i.qty,
      }))
      const { data, error: fnErr } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: lineItems,
          successUrl: `${window.location.origin}?checkout=success`,
          cancelUrl:  `${window.location.origin}?checkout=cancelled`,
        },
      })
      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.error)
      if (data?.url) window.location.href = data.url
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [items])

  return { items, cartCount, cartTotal, addToCart, increment, decrement, remove, checkout, loading, error }
}
