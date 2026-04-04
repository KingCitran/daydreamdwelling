import { useEffect } from 'react'

export default function LoadRoomModal({ rooms, loading, onLoad, onDelete, onFetch, onClose }) {
  useEffect(() => { onFetch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function fmt(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.card} onClick={e => e.stopPropagation()}>
        <div style={st.header}>
          <p style={st.title}>My Saved Rooms</p>
          <button style={st.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading && <p style={st.hint}>Loading…</p>}

        {!loading && rooms.length === 0 && (
          <p style={st.hint}>No saved rooms yet. Use "Save to Cloud" in the Tools panel.</p>
        )}

        {!loading && rooms.length > 0 && (
          <div style={st.list}>
            {rooms.map(room => (
              <div key={room.id} style={st.row}>
                <div style={st.rowInfo}>
                  <span style={st.roomName}>{room.name}</span>
                  <span style={st.roomDate}>{fmt(room.updated_at)}</span>
                </div>
                <div style={st.rowBtns}>
                  <button style={st.loadBtn} onClick={() => onLoad(room.id)}>Load</button>
                  <button style={st.deleteBtn} onClick={() => onDelete(room.id)} title="Delete">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const st = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
  card: { background: '#1e1e30', border: '1px solid #3a3a5a', borderRadius: 14, width: 400, maxWidth: '92vw', maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px', borderBottom: '1px solid #3a3a5a', flexShrink: 0 },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e0d9ff' },
  closeBtn: { background: 'transparent', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 16, padding: 4 },
  hint: { margin: 0, padding: '20px 20px', fontSize: 13, color: '#7878aa', textAlign: 'center' },
  list: { overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #2a2a3a' },
  rowInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  roomName: { fontSize: 14, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roomDate: { fontSize: 11, color: '#7878aa' },
  rowBtns: { display: 'flex', gap: 8, flexShrink: 0 },
  loadBtn: { padding: '6px 14px', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  deleteBtn: { padding: '6px 10px', background: 'transparent', color: '#7878aa', border: '1px solid #4a4a6a', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
}
