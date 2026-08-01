import { useState, useCallback } from 'react'
import { supabase } from '@shared/supabase'

// Capture the 3D canvas as a PNG blob for use as a room thumbnail
async function captureCanvasThumbnail() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })
}

// Upload a thumbnail blob to Supabase storage, return the public URL
async function uploadThumbnail(userId, blob) {
  if (!blob) return null
  const path = `${userId}/room-${Date.now()}.png`
  const { error } = await supabase.storage.from('community-screenshots').upload(path, blob, {
    contentType: 'image/png', upsert: false,
  })
  if (error) return null
  const { data } = supabase.storage.from('community-screenshots').getPublicUrl(path)
  return data?.publicUrl || null
}

export default function useCloudSave({ user, gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames, allRooms, currentRoomId, internalWalls }) {
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [rooms,   setRooms]   = useState([])   // list fetched from cloud
  const [error,   setError]   = useState(null)

  const buildRoomData = useCallback(() => ({
    version: 1,
    gridW, gridD, wallHeight,
    cells: [...cells],
    internalWalls: [...(internalWalls ?? [])],
    doorOpenings: [...(doorOpenings ?? [])],
    items, cart, floorColor, wallColor, bgColor,
    musicStation, lightMood, roomNames,
    allRooms: Object.fromEntries(
      Object.entries(allRooms).map(([id, room]) => [
        id,
        { ...room, cells: [...(room.cells instanceof Set ? room.cells : new Set(room.cells))], internalWalls: [...(room.internalWalls instanceof Set ? room.internalWalls : [])], doorOpenings: [...(room.doorOpenings instanceof Set ? room.doorOpenings : [])] },
      ])
    ),
    currentRoomId,
  }), [gridW, gridD, wallHeight, cells, items, cart, floorColor, wallColor, bgColor, musicStation, lightMood, roomNames, allRooms, currentRoomId, internalWalls, doorOpenings])

  const saveRoom = useCallback(async (name) => {
    if (!user) return { error: 'Not signed in' }
    setSaving(true); setError(null)
    const data = buildRoomData()
    // Capture thumbnail from the live canvas
    const thumbBlob = await captureCanvasThumbnail()
    const thumbnailUrl = await uploadThumbnail(user.id, thumbBlob)
    const { data: inserted, error } = await supabase.from('saved_rooms').insert({
      user_id: user.id,
      name:    name || 'My Room',
      data,
      ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
    }).select('id').single()
    setSaving(false)
    if (error) setError(error.message)
    return { error, id: inserted?.id }
  }, [user, buildRoomData])

  const updateRoom = useCallback(async (roomId, name) => {
    if (!user) return { error: 'Not signed in' }
    setSaving(true); setError(null)
    const data = buildRoomData()
    // Refresh thumbnail on every save
    const thumbBlob = await captureCanvasThumbnail()
    const thumbnailUrl = await uploadThumbnail(user.id, thumbBlob)
    const { error } = await supabase.from('saved_rooms')
      .update({
        data, name, updated_at: new Date().toISOString(),
        ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
      })
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
