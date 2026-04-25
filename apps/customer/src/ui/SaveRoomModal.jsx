import { useState } from 'react'
import { Icon } from '@shared/ui/Icon'

export default function SaveRoomModal({ existingName, onSave, onClose, saving }) {
  const [name, setName] = useState(existingName || '')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter a name.'); return }
    const { error } = await onSave(name.trim())
    if (error) setError(error)
  }

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.card} onClick={e => e.stopPropagation()}>
        <p style={st.title}>Save Room to Cloud</p>
        <form style={st.form} onSubmit={handleSubmit}>
          <input
            style={st.input}
            type="text"
            placeholder="Room name…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            maxLength={80}
          />
          {error && <p style={st.error}>{error}</p>}
          <div style={st.btnRow}>
            <button type="button" style={st.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={{ ...st.saveBtn, opacity: saving ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} disabled={saving}>
              {saving ? 'Saving…' : <><Icon name="save" size={14} /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const st = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
  card: { background: '#1e1e30', border: '1px solid #3a3a5a', borderRadius: 14, width: 340, maxWidth: '92vw', padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e0d9ff' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 12px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 8, fontSize: 14, outline: 'none' },
  error: { margin: 0, fontSize: 12, color: '#ff7a7a' },
  btnRow: { display: 'flex', gap: 10 },
  cancelBtn: { flex: 1, padding: '10px 0', background: 'transparent', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  saveBtn: { flex: 1, padding: '10px 0', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
}
