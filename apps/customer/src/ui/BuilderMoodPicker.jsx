import { useState, useEffect, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { useBuilderStyles } from './styles/appStyles'

const STUDIO_VARIANT_KEY = 'ddd_studio_variant'

// Resolve which Studio variant to apply when the user first taps the Studio
// button (i.e. they're not already in Studio mode). Order:
//   1. Last variant they used (sticky toggle)
//   2. System prefers-color-scheme — only honors an EXPLICIT dark match
//   3. Dark fallback (the majority of our users keep dark mode on; Windows
//      Chrome can return false for prefers-color-scheme even when the OS is
//      dark, so we default to dark rather than light when ambiguous)
function pickInitialStudio() {
  if (typeof window === 'undefined') return 'Studio Dark'
  const saved = localStorage.getItem(STUDIO_VARIANT_KEY)
  if (saved === 'Studio' || saved === 'Studio Dark') return saved
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches
  return prefersLight ? 'Studio' : 'Studio Dark'
}

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

  // Persist the user's last Studio variant so the next "enter Studio mode" tap
  // remembers their preference instead of falling back to system every time.
  useEffect(() => {
    if (mood === 'Studio' || mood === 'Studio Dark') {
      try { localStorage.setItem(STUDIO_VARIANT_KEY, mood) } catch {}
    }
  }, [mood])

  // Studio Dark folds under the Studio button — swap icon to reflect the
  // dark variant when it's active.
  const isStudioMode = mood === 'Studio' || mood === 'Studio Dark'
  const studioIcon = mood === 'Studio Dark' ? '⬛' : '🔲'

  function displayEntry(m) {
    if (m.key === 'Studio') {
      const variantLabel = isStudioMode ? (mood === 'Studio Dark' ? '⬛ dark' : '🔲 light') : ''
      return {
        ...m,
        icon: studioIcon,
        label: 'Studio',
        desc: isStudioMode ? `Currently ${variantLabel} — tap to toggle` : m.desc,
      }
    }
    return m
  }

  function isActive(m) {
    if (m.key === 'Studio') return isStudioMode
    return m.key === mood
  }

  function handlePick(m) {
    if (m.key === 'Studio') {
      if (mood === 'Studio') setMood('Studio Dark')
      else if (mood === 'Studio Dark') setMood('Studio')
      else setMood(pickInitialStudio())
      // Keep the picker open so the user can see the variant swap and tap
      // again to toggle without re-opening.
      return
    }
    setMood(m.key)
    setOpen(false)
  }

  const currentRaw = moods.find(m => m.key === mood)
    ?? (mood === 'Studio Dark' ? moods.find(m => m.key === 'Studio') : null)
    ?? moods[0]
  const current = displayEntry(currentRaw)

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
          {moods.map(rawM => {
            const m = displayEntry(rawM)
            const active = isActive(rawM)
            return (
              <button
                key={m.key}
                onClick={() => handlePick(rawM)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 9,
                  background: active ? s.hubBtn.background : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center' }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? s.hubPanel.color ?? s.roomPanelTitle.color : s.hubBtn.color, lineHeight: 1.2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: s.hubSectionLabel.color, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.desc}</div>
                </div>
                {active && <span style={{ fontSize: 11, color: s.hubBtnActive.color, flexShrink: 0 }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
