import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// order-photos bucket is private (migration 050). Use this hook anywhere
// you'd previously have done storage.from('order-photos').getPublicUrl(...).
// Returns a 1-hour signed URL, refetching when the path changes.
//
// RLS gates whether the signed-URL request succeeds: sellers can read
// their own folder; buyers can read paths attached to their own orders.
// If neither matches, error is logged and url stays null (component falls
// back to no-image render).

export default function useSignedOrderPhoto(path) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!path) { setUrl(null); return }
    let cancelled = false
    supabase.storage.from('order-photos').createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[order-photo signed url]', error.message)
          setUrl(null)
          return
        }
        setUrl(data?.signedUrl ?? null)
      })
    return () => { cancelled = true }
  }, [path])

  return url
}
