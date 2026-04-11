import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@shared/supabase'

export default function useWishlists(userId) {
  const [lists,   setLists]   = useState([])
  const [loading, setLoading] = useState(false)

  const fetchLists = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('wishlist_lists')
      .select('*, wishlist_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setLists(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchLists() }, [fetchLists])

  const createList = useCallback(async (name, isGiftRegistry = false) => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('wishlist_lists')
      .insert({ user_id: userId, name, is_gift_registry: isGiftRegistry })
      .select()
      .single()
    if (!error) await fetchLists()
    return data
  }, [userId, fetchLists])

  const deleteList = useCallback(async (listId) => {
    await supabase.from('wishlist_lists').delete().eq('id', listId)
    setLists(prev => prev.filter(l => l.id !== listId))
  }, [])

  const renameList = useCallback(async (listId, name) => {
    await supabase.from('wishlist_lists').update({ name }).eq('id', listId)
    setLists(prev => prev.map(l => l.id === listId ? { ...l, name } : l))
  }, [])

  const addItem = useCallback(async (listId, typeKey, sizeIndex = 0, swatchIndex = 0) => {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ list_id: listId, type_key: typeKey, size_index: sizeIndex, swatch_index: swatchIndex })
    if (!error) await fetchLists()
    return !error
  }, [fetchLists])

  const removeItem = useCallback(async (itemId) => {
    await supabase.from('wishlist_items').delete().eq('id', itemId)
    setLists(prev => prev.map(l => ({
      ...l,
      wishlist_items: (l.wishlist_items ?? []).filter(i => i.id !== itemId),
    })))
  }, [])

  return { lists, loading, createList, deleteList, renameList, addItem, removeItem, fetchLists }
}
