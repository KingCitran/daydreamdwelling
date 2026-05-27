import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

// Hook around music_playlists + music_playlist_tracks (migration 054).
// Returns the signed-in user's playlists with embedded track lists, plus
// CRUD helpers and a save-to-playlist helper. Anonymous viewers get an
// empty list — they can browse public playlists but can't own one.

export function useMusicPlaylists() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) { setPlaylists([]); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('music_playlists')
      .select(`
        id, name, description, is_public, created_at, updated_at,
        music_playlist_tracks (
          id, sort_order, added_at,
          artist_tracks (
            id, title, audio_url, duration_seconds, station_tags, mood_tags,
            descriptive_tags, rotation_status, play_count, raindrop_count, artist_id,
            artist_profiles(artist_name, avatar_url, external_links, preferred_destination, ppc_balance_cents, ppc_rate_cents)
          )
        )
      `)
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
    if (err) setError(err.message)
    else setPlaylists(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (name, { isPublic = false, description = null } = {}) => {
    if (!user) return { error: 'Sign in to create a playlist' }
    const trimmed = (name ?? '').trim()
    if (!trimmed) return { error: 'Name is required' }
    const { data, error: err } = await supabase
      .from('music_playlists')
      .insert({ owner_id: user.id, name: trimmed, is_public: isPublic, description })
      .select()
      .single()
    if (err) return { error: err.message }
    await refresh()
    return { data }
  }, [user, refresh])

  const rename = useCallback(async (playlistId, name) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed) return { error: 'Name is required' }
    const { error: err } = await supabase
      .from('music_playlists')
      .update({ name: trimmed })
      .eq('id', playlistId)
    if (err) return { error: err.message }
    await refresh()
    return {}
  }, [refresh])

  const remove = useCallback(async (playlistId) => {
    const { error: err } = await supabase
      .from('music_playlists')
      .delete()
      .eq('id', playlistId)
    if (err) return { error: err.message }
    await refresh()
    return {}
  }, [refresh])

  const togglePublic = useCallback(async (playlistId, isPublic) => {
    const { error: err } = await supabase
      .from('music_playlists')
      .update({ is_public: isPublic })
      .eq('id', playlistId)
    if (err) return { error: err.message }
    await refresh()
    return {}
  }, [refresh])

  const addTrack = useCallback(async (playlistId, trackId) => {
    if (!user) return { error: 'Sign in to add to a playlist' }
    // Compute next sort_order — cheap; we expect playlists to stay small in v1.
    const { count } = await supabase
      .from('music_playlist_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('playlist_id', playlistId)
    const { error: err } = await supabase
      .from('music_playlist_tracks')
      .insert({ playlist_id: playlistId, track_id: trackId, sort_order: count ?? 0 })
    if (err) {
      // The (playlist_id, track_id) unique constraint surfaces here when a
      // user tries to re-add the same track. Friendly message beats raw "23505".
      if (err.code === '23505') return { error: 'Already in this playlist' }
      return { error: err.message }
    }
    // Touch the playlist so the updated_at order reflects the recent edit.
    await supabase
      .from('music_playlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', playlistId)
    await refresh()
    return {}
  }, [user, refresh])

  const removeTrack = useCallback(async (playlistId, trackId) => {
    const { error: err } = await supabase
      .from('music_playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId)
    if (err) return { error: err.message }
    await refresh()
    return {}
  }, [refresh])

  return {
    playlists, loading, error, refresh,
    create, rename, remove, togglePublic,
    addTrack, removeTrack,
  }
}
