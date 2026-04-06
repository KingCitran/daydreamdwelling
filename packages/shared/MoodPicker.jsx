import { useState, useEffect, useRef } from 'react'
import { useTheme, useMoodControl } from './ThemeProvider'

/**
 * Mood switcher widget — drop into any nav bar.
 * Returns null if the app has mood locked (seller hub).
 */
export default function MoodPicker() {
  const t                             = useTheme()
  const { mood, setMood, moods, isLocked } = useMoodControl()
  const [open, setOpen]               = useState(false)
  const ref                           = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (isLocked) return null

  const current = moods.find(m => m.key === mood) ?? moods[0]

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>

      {/* Trigger pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 13px',
          background: open ? `${t.accent}18` : t.surface,
          border: `1px solid ${open ? t.accent : t.surfaceBorder}`,
          borderRadius: 20,
          color: t.text, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <span style={{ fontSize: 14 }}>{current.icon}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 9, color: t.textSoft, marginTop: 1 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 270, maxHeight: 380, overflowY: 'auto',
          background: t.navBg, backdropFilter: 'blur(20px)',
          border: `1px solid ${t.surfaceBorder}`,
          borderRadius: 14, padding: 6,
          boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
          zIndex: 999,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '1px', padding: '6px 10px 4px' }}>
            Choose a mood
          </p>
          {moods.map(m => {
            const isActive = m.key === mood
            return (
              <button
                key={m.key}
                onClick={() => { setMood(m.key); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 10px', borderRadius: 9,
                  background: isActive ? `${t.accent}18` : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? t.accent : t.text, lineHeight: 1.2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: t.textSoft, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.desc}</div>
                </div>
                {isActive && <span style={{ fontSize: 12, color: t.accent, flexShrink: 0 }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
