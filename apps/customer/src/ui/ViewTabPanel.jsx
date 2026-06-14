import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme, useMoodControl } from '@shared/ThemeProvider'

// View tab — camera, visibility, atmosphere/mood. Mood picker pops out as a
// side popover so the tab stays compact.

const POPOVER_W = 300
const POPOVER_PAD = 12

// Special-case moods pinned to the top of the picker — Ember's Sunrise + the
// two Studio modes are common quick-picks worth surfacing first.
const PINNED_MOODS = ["Ember's Sunrise", 'Studio', 'Studio Dark']

export default function ViewTabPanel({
  onRotateLeft, onRotateRight,
  ceilingView, onToggleCeiling,
  onSummonWispy,
  showMeasurements, onToggleMeasurements,
  showGrid, onToggleGrid,
  cloudsOn, onToggleClouds,
  forceEasterEggs, onToggleEasterEggs,
}) {
  const t = useTheme()
  const { mood, setMood, moods } = useMoodControl()
  const [showMoods, setShowMoods] = useState(false)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [popoverPos, setPopoverPos] = useState(null)

  useLayoutEffect(() => {
    if (!showMoods || !triggerRef.current) { setPopoverPos(null); return }
    const rect = triggerRef.current.getBoundingClientRect()
    const rightPos = rect.right + 8
    const fitsRight = rightPos + POPOVER_W + POPOVER_PAD <= window.innerWidth
    const left = fitsRight ? rightPos : Math.max(POPOVER_PAD, rect.left - POPOVER_W - 8)
    setPopoverPos({ left, top: Math.max(POPOVER_PAD, rect.top) })
  }, [showMoods])

  useEffect(() => {
    if (!showMoods) return
    function onAway(e) {
      if (triggerRef.current?.contains(e.target)) return
      if (popoverRef.current?.contains(e.target)) return
      setShowMoods(false)
    }
    document.addEventListener('mousedown', onAway)
    return () => document.removeEventListener('mousedown', onAway)
  }, [showMoods])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Section title="Camera">
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onRotateLeft} style={btn()}>↻ Rotate Left</button>
          <button onClick={onRotateRight} style={btn()}>↺ Rotate Right</button>
        </div>
      </Section>

      <Section title="Visibility">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={onToggleCeiling} style={btn(ceilingView)}>
            {ceilingView ? '▾ Floor View' : '▴ Ceiling View'}
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onToggleMeasurements} style={btn(showMeasurements)}>
              📏 Measure {showMeasurements && '✓'}
            </button>
            <button onClick={onToggleGrid} style={btn(showGrid)}>
              ▦ Grid {showGrid && '✓'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Atmosphere">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button ref={triggerRef} onClick={() => setShowMoods(s => !s)} style={btn(showMoods)}>
            ◐ {mood}
          </button>
          <button onClick={onToggleClouds} style={btn(cloudsOn)}>
            {cloudsOn ? '⛅ Clouds On' : '◯ Clouds Off'}
          </button>
          {cloudsOn && onToggleEasterEggs && (
            <button onClick={onToggleEasterEggs} style={btn(forceEasterEggs)} title="Dev: forces every cloud to be an Easter-egg shape so you can audit them. Edit cloudShapes.js to tune the manifest.">
              {forceEasterEggs ? '✨ Cycling shapes ✓' : '✨ Cycle Easter Eggs (dev)'}
            </button>
          )}
        </div>
      </Section>

      <Section title="Wispy">
        <button onClick={onSummonWispy} style={btn()}>☁ Talk to Wispy</button>
      </Section>

      {/* Mood popover — portaled to document.body to escape DockablePanel's
          transform (which would otherwise break position:fixed). 3-column
          grid; Ember's Sunrise + both Studio modes pinned to the top. */}
      {showMoods && popoverPos && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            left: popoverPos.left,
            top: popoverPos.top,
            width: POPOVER_W,
            zIndex: 1000,
            padding: 6, borderRadius: 12,
            background: 'rgba(20,15,38,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            maxHeight: 360, overflowY: 'auto',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          {[
            ...PINNED_MOODS.map(key => moods.find(m => m.key === key)).filter(Boolean),
            ...moods.filter(m => !PINNED_MOODS.includes(m.key)),
          ].map(m => {
            const active = m.key === mood
            return (
              <button
                key={m.key}
                onClick={() => { setMood(m.key); setShowMoods(false) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px', borderRadius: 8,
                  border: `1px solid ${active ? t.accent : 'rgba(255,255,255,0.08)'}`,
                  background: active ? `${t.accent}25` : 'rgba(255,255,255,0.04)',
                  color: '#f0eaff', cursor: 'pointer',
                  fontSize: 10, fontWeight: 600, textAlign: 'center',
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  lineHeight: 1.25,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#a090c8', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

const btn = (active = false) => ({
  flex: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '9px 12px',
  borderRadius: 10,
  border: `1px solid ${active ? '#c8a8ff' : 'rgba(255,255,255,0.1)'}`,
  background: active ? 'rgba(200,168,255,0.15)' : 'rgba(255,255,255,0.04)',
  color: '#f0eaff',
  cursor: 'pointer',
  fontSize: 12, fontWeight: 600,
  fontFamily: "'Outfit', system-ui, sans-serif",
})
