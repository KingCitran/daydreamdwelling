import { useState, useCallback } from 'react'
import { supabase } from '@shared/supabase'

export default function useCloudSave({ user, gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames, allRooms, currentRoomId }) {
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [rooms,   setRooms]   = useState([])   // list fetched from cloud
  const [error,   setError]   = useState(null)

  const buildRoomData = useCallback(() => ({
    version: 1,
    gridW, gridD, wallHeight,
    cells: [...cells],
    items, cart, floorColor, wallColor, bgColor,
    musicStation, lightMood, roomNames,
    allRooms: Object.fromEntries(
      Object.entries(allRooms).map(([id, room]) => [
        id,
        { ...room, cells: [...(room.cells instanceof Set ? room.cells : new Set(room.cells))] },
      ])
    ),
    currentRoomId,
  }), [gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames, allRooms, currentRoomId])

  const saveRoom = useCallback(async (name) => {
    if (!user) return { error: 'Not signed in' }
    setSaving(true); setError(null)
    const data = buildRoomData()
    const { error } = await supabase.from('saved_rooms').insert({
      user_id: user.id,
      name:    name || 'My Room',
      data,
    })
    setSaving(false)
    if (error) setError(error.message)
    return { error }
  }, [user, buildRoomData])

  const updateRoom = useCallback(async (roomId, name) => {
    if (!user) return { error: 'Not signed in' }
    setSaving(true); setError(null)
    const data = buildRoomData()
    const { error } = await supabase.from('saved_rooms')
      .update({ data, name, updated_at: new Date().toISOString() })
      .eq('id', roomId)
      .eq('user_id', user.id)
    setSaving(false)
    if (error) setError(error.message)
    return { error }
  }, [user, buildRoomData])

  const fetchRooms = useCallback(async () => {
    if (!user) return
    setLoading(true); setError(null)
    const { data, error } = await supabase
      .from('saved_rooms')
      .select('id, name, updated_at, thumbnail_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    setLoading(false)
    if (error) { setError(error.message); return }
    setRooms(data ?? [])
  }, [user])

  const loadRoom = useCallback(async (roomId) => {
    if (!user) return { error: 'Not signed in', data: null }
    const { data, error } = await supabase
      .from('saved_rooms')
      .select('data, name')
      .eq('id', roomId)
      .eq('user_id', user.id)
      .single()
    if (error) return { error: error.message, data: null }
    return { error: null, data: data.data, name: data.name }
  }, [user])

  const deleteRoom = useCallback(async (roomId) => {
    if (!user) return
    await supabase.from('saved_rooms').delete().eq('id', roomId).eq('user_id', user.id)
    setRooms(prev => prev.filter(r => r.id !== roomId))
  }, [user])

  return { saving, loading, rooms, error, saveRoom, updateRoom, fetchRooms, loadRoom, deleteRoom }
}
