import { useState, useEffect, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { useBuilderStyles } from './styles/appStyles'

// Builder-specific mood picker — matches toolbar button style, opens upward.
export default function BuilderMoodPicker() {
  const s = useBuilderStyles()
  const { mood, setMood, moods } = useMoodControl()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const current = moods.find(m => m.key === mood) ?? moods[0]

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        style={{ ...s.bottomBtn, ...(open ? s.bottomBtnActive : {}), display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => setOpen(o => !o)}
      >
        <span>{current.icon}</span>
        <span style={{ fontSize: 13 }}>{current.label}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: 0,
          width: 260,
          maxHeight: 380,
          overflowY: 'auto',
          background: s.hubPanel.background,
          border: s.hubPanel.border,
          borderRadius: 14,
          padding: 6,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
          zIndex: 500,
        }}>
          <p style={{ ...s.hubSectionLabel, padding: '6px 10px 4px', margin: 0 }}>
            Mood
          </p>
          {moods.map(m => {
            const isActive = m.key === mood
            return (
              <button
                key={m.key}
                onClick={() => { setMood(m.key); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 9,
                  background: isActive ? s.hubBtn.background : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center' }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? s.hubPanel.color ?? s.roomPanelTitle.color : s.hubBtn.color, lineHeight: 1.2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: s.hubSectionLabel.color, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.desc}</div>
                </div>
                {isActive && <span style={{ fontSize: 11, color: s.hubBtnActive.color, flexShrink: 0 }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
