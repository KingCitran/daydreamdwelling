import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

export default function EditBanner({ roomName, saving, onSave, onCancel }) {
  const t = useTheme()
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      padding: '10px 20px',
      background: 'rgba(15,12,30,0.92)', backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${t.accent}40`,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: "'Outfit', system-ui, sans-serif",
      boxShadow: `0 -4px 20px rgba(0,0,0,0.4)`,
    }}>
      <span style={{ fontSize: 14 }}>✎</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Editing: {roomName || 'Untitled Room'}
        </div>
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: '8px 20px', borderRadius: 8,
          background: `${t.accent}30`, border: `1px solid ${t.accent}70`,
          color: t.accent, fontSize: 13, fontWeight: 700,
          cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0,
          opacity: saving ? 0.6 : 1,
        }}
      >{saving ? 'Saving…' : '💾 Save'}</button>
      {confirming ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onCancel} style={{
            padding: '8px 14px', borderRadius: 8,
            background: '#8a3a3a55', border: '1px solid #ff6b6b50',
            color: '#ff9a9a', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Discard changes</button>
          <button onClick={() => setConfirming(false)} style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${t.accent}30`,
            color: '#aaa', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Keep editing</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} style={{
          padding: '8px 16px', borderRadius: 8,
          background: 'transparent', border: `1px solid ${t.accent}30`,
          color: '#aaa', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>✕ Cancel</button>
      )}
    </div>
  )
}
