import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

export default function EditBanner({ roomName, saving, onSave, onCancel }) {
  const t = useTheme()
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, padding: '8px 16px',
      background: 'rgba(20,20,45,0.85)', backdropFilter: 'blur(10px)',
      border: `1px solid ${t.accent}40`, borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 4px 20px ${t.accent}20`,
      fontFamily: "'Outfit', system-ui, sans-serif",
      maxWidth: 'calc(100vw - 40px)',
    }}>
      <span style={{ fontSize: 14 }}>✎</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Editing: {roomName || 'Untitled Room'}
        </div>
        <div style={{ fontSize: 10, color: `${t.accent}cc`, marginTop: 1 }}>
          Make changes, then save or cancel
        </div>
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: '6px 14px', borderRadius: 8,
          background: `${t.accent}30`, border: `1px solid ${t.accent}70`,
          color: t.accent, fontSize: 11, fontWeight: 700,
          cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0,
          opacity: saving ? 0.6 : 1,
        }}
      >{saving ? 'Saving…' : 'Save'}</button>
      {confirming ? (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={onCancel} style={{
            padding: '6px 10px', borderRadius: 8,
            background: '#8a3a3a55', border: '1px solid #ff6b6b50',
            color: '#ff9a9a', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Discard</button>
          <button onClick={() => setConfirming(false)} style={{
            padding: '6px 10px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${t.accent}30`,
            color: '#aaa', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Keep editing</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} style={{
          padding: '6px 12px', borderRadius: 8,
          background: 'transparent', border: `1px solid ${t.accent}30`,
          color: '#aaa', fontSize: 11, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>Cancel</button>
      )}
    </div>
  )
}
