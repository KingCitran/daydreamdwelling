import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function SavedRoomsPage({ onBack }) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('saved_rooms')
        .select('id, name, updated_at, thumbnail_url')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      setRooms(data ?? [])
      setLoading(false)
    })()
  }, [user])

  async function handleDelete(roomId) {
    if (!window.confirm('Delete this room? This cannot be undone.')) return
    await supabase.from('saved_rooms').delete().eq('id', roomId).eq('user_id', user.id)
    setRooms(prev => prev.filter(r => r.id !== roomId))
  }

  // Chain through all rooms missing thumbnails via auto-save
  function captureAllThumbnails() {
    const missing = rooms.filter(r => !r.thumbnail_url)
    if (missing.length === 0) return
    // Store the queue in sessionStorage so each auto-save leg can pop the next
    sessionStorage.setItem('ddd_thumb_queue', JSON.stringify(missing.slice(1).map(r => r.id)))
    window.location.href = `/?room=${missing[0].id}&auto-save=1`
  }

  function fmt(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const missingThumbs = rooms.filter(r => !r.thumbnail_url).length

  return (
    <div style={st.page}>
      <div style={st.header}>
        <button onClick={onBack} style={st.backBtn}>← Back</button>
        <h1 style={st.title}>My Rooms</h1>
        {missingThumbs > 0 && (
          <button onClick={captureAllThumbnails} style={st.captureBtn}>
            📷 Capture Thumbnails ({missingThumbs})
          </button>
        )}
      </div>

      {!user && (
        <p style={st.empty}>Sign in to see your saved rooms.</p>
      )}

      {user && loading && (
        <p style={st.empty}>Loading…</p>
      )}

      {user && !loading && rooms.length === 0 && (
        <div style={st.emptyState}>
          <p style={st.emptyIcon}>🏠</p>
          <p style={st.emptyTitle}>No saved rooms yet</p>
          <p style={st.emptyHint}>Build a room and use "Save to Cloud" to see it here.</p>
          <button onClick={onBack} style={st.startBtn}>Start building →</button>
        </div>
      )}

      {user && !loading && rooms.length > 0 && (
        <div style={st.grid}>
          {rooms.map(room => (
            <div key={room.id} style={st.card}>
              <div style={st.thumbWrap}>
                {room.thumbnail_url ? (
                  <img src={room.thumbnail_url} alt={room.name} style={st.thumb} />
                ) : (
                  <div style={st.thumbPlaceholder}>🏠</div>
                )}
              </div>
              <div style={st.cardBody}>
                <p style={st.roomName}>{room.name}</p>
                <p style={st.roomDate}>{fmt(room.updated_at)}</p>
                <div style={st.cardActions}>
                  <a href={`/?room=${room.id}`} style={st.editBtn}>Edit →</a>
                  <button onClick={() => handleDelete(room.id)} style={st.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const st = {
  page: {
    minHeight: '100vh',
    background: '#0f0c1e',
    color: '#f0eaff',
    fontFamily: "'Outfit', system-ui, sans-serif",
    padding: '0 24px 60px',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '24px 0 20px',
    borderBottom: '1px solid #2a2a3a',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  backBtn: {
    background: 'transparent', border: '1px solid #3a3a5a', borderRadius: 8,
    color: '#9a8abb', cursor: 'pointer', padding: '8px 14px',
    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
  },
  title: {
    margin: 0, fontSize: 22, fontWeight: 700, color: '#e0d9ff',
    letterSpacing: '0.3px', flex: 1,
  },
  captureBtn: {
    background: '#3a5a8a30', border: '1px solid #6090ff', borderRadius: 8,
    color: '#a0c0ff', cursor: 'pointer', padding: '8px 16px',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
  },
  empty: {
    textAlign: 'center', color: '#7878aa', fontSize: 14, marginTop: 60,
  },
  emptyState: {
    textAlign: 'center', marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48, margin: '0 0 12px',
  },
  emptyTitle: {
    fontSize: 18, fontWeight: 700, color: '#e0d9ff', margin: '0 0 8px',
  },
  emptyHint: {
    fontSize: 13, color: '#7878aa', margin: '0 0 24px',
  },
  startBtn: {
    background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee',
    borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  thumbWrap: {
    width: '100%', aspectRatio: '16/10',
    background: '#12101e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  thumbPlaceholder: {
    fontSize: 36, opacity: 0.3,
  },
  cardBody: {
    padding: '14px 16px 16px',
  },
  roomName: {
    margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#e0d9ff',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  roomDate: {
    margin: '0 0 12px', fontSize: 11, color: '#7878aa',
  },
  cardActions: {
    display: 'flex', gap: 8,
  },
  editBtn: {
    flex: 1, textAlign: 'center',
    padding: '8px 14px', borderRadius: 8,
    background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    textDecoration: 'none', fontFamily: 'inherit',
  },
  deleteBtn: {
    padding: '8px 14px', borderRadius: 8,
    background: 'transparent', color: '#7878aa', border: '1px solid #3a3a5a',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
}
