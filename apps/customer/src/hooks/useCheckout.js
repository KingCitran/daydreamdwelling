import { useState, useCallback } from 'react'
import { supabase } from '@shared/supabase'
import { useMood } from '@shared/useMood'
import { ITEM_CATALOGUE } from '../data/items'

export default function useCheckout({ cart, catalogue, roomName, shipping, address }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const { mood }              = useMood('customer')

  const startCheckout = useCallback(async () => {
    if (!cart.length) return
    setLoading(true); setError(null)

    const cat   = catalogue ?? ITEM_CATALOGUE
    const items = cart.map(entry => {
      const def  = cat[entry.typeKey] ?? ITEM_CATALOGUE[entry.typeKey]
      const size = def?.sizes?.[entry.sizeIndex]
      const sw   = def?.swatches?.[entry.swatchIndex]
      return {
        typeKey:    entry.typeKey,
        label:      def?.label ?? entry.typeKey,
        sizeLabel:  size?.label ?? '',
        swatchName: sw?.name ?? '',
        unitPrice:  size?.price ?? 0,
        qty:        entry.qty,
        sellerId:   def?._sellerId ?? null,
      }
    })

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          buyerMood:    mood ?? null,
          buyerRoom:    roomName ?? null,
          shipping:     shipping ?? null,   // { rateId, amount, carrier, service }
          address:      address ?? null,    // shipping address chosen at quote time
          successUrl:   `${window.location.origin}?checkout=success`,
          cancelUrl:    `${window.location.origin}?checkout=cancelled`,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      if (data?.url) window.location.href = data.url
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cart, catalogue, mood, roomName, shipping, address])

  return { startCheckout, loading, error }
}
