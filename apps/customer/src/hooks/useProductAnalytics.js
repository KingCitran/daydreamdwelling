import { useRef, useCallback } from 'react'
import { supabase } from '@shared/supabase'
import { useAuth } from '@shared/auth/AuthContext'

/**
 * Multi-click intent analytics.
 *
 * Tracks three intent levels per product interaction:
 *   1 = browse   (viewed tile in grid / drawer)
 *   2 = interest (opened product detail / modal)
 *   3 = high     (added to cart, wishlist, or room)
 *
 * Deduplicates per session+product+level so repeated views
 * of the same product don't inflate browse counts.
 */
export default function useProductAnalytics() {
  const { user } = useAuth()
  const sessionId = useRef(getOrCreateSessionId())
  const logged = useRef(new Set()) // "productId:level" dedup

  const track = useCallback((productId, intentLevel, action) => {
    if (!productId) return
    const key = `${productId}:${intentLevel}`
    if (logged.current.has(key)) return
    logged.current.add(key)

    supabase.from('product_interactions').insert({
      product_id: productId,
      user_id: user?.id ?? null,
      session_id: sessionId.current,
      intent_level: intentLevel,
      action,
    }).then(() => {}) // fire-and-forget, don't block UI
  }, [user])

  const trackBrowse   = useCallback((productId) => track(productId, 1, 'view'),            [track])
  const trackInterest = useCallback((productId) => track(productId, 2, 'detail'),           [track])
  const trackIntent   = useCallback((action, productId) => track(productId, 3, action),     [track])

  return { trackBrowse, trackInterest, trackIntent }
}

function getOrCreateSessionId() {
  const key = 'ddd_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}
