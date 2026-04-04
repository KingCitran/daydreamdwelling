import { useState, useCallback } from 'react'
import { supabase } from '@shared/supabase'
import { ITEM_CATALOGUE } from '../data/items'

export default function useCheckout({ cart }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const startCheckout = useCallback(async () => {
    if (!cart.length) return
    setLoading(true); setError(null)

    const items = cart.map(entry => {
      const def  = ITEM_CATALOGUE[entry.typeKey]
      const size = def.sizes[entry.sizeIndex]
      const sw   = def.swatches[entry.swatchIndex]
      return {
        typeKey:    entry.typeKey,
        label:      def.label,
        sizeLabel:  size.label,
        swatchName: sw.name,
        unitPrice:  size.price,
        qty:        entry.qty,
      }
    })

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          successUrl: `${window.location.origin}?checkout=success`,
          cancelUrl:  `${window.location.origin}?checkout=cancelled`,
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
  }, [cart])

  return { startCheckout, loading, error }
}
