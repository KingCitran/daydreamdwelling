import { useState, useEffect } from 'react'
import { supabase } from '@shared/supabase'

// Returns a Set of type_keys the user has purchased (from completed orders).
export default function useOwnedItems(userId) {
  const [owned, setOwned] = useState(new Set())

  useEffect(() => {
    if (!userId) return
    supabase
      .from('order_items')
      .select('type_key, orders!inner(user_id, status)')
      .eq('orders.user_id', userId)
      .in('orders.status', ['paid', 'fulfilled'])
      .then(({ data }) => {
        if (!data) return
        setOwned(new Set(data.map(d => d.type_key).filter(Boolean)))
      })
  }, [userId])

  return owned
}
