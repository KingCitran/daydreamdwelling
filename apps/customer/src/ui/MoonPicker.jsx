import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { MOONS, moonUrl } from '../data/moonPhases'

// ── Moon picker ────────────────────────────────────────────────────
// Grid of all 35 moon thumbnails. Selecting one updates the room's
// moonId. Renders inside the Style panel on dark moods.
//
// Grouped by phase for easier scanning. Each thumbnail is a small
// circle with the moon PNG scaled down.

const PHASES = ['Full Moon', 'Waxing Gibbous', 'Waning Gibbous', 'First Quarter', 'Waxing Crescent', 'Waning Crescent']

export default function MoonPicker({ value, onChange }) {
  const t = useTheme()
  const [expanded, setExpanded] = useState(false)

  const current = MOONS.find(m => m.id === value) ?? MOONS[4] // default moon-5

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: t.text }}>Moon</span>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 8,
            border: `1px solid ${t.surfaceBorder}`,
            background: `${t.bg}aa`, color: t.text,
            cursor: 'pointer', fontSize: 11,
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          <img
            src={moonUrl(current.id)}
            alt=""
            style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: '50%', background: '#111' }}
          />
          {current.phase} #{current.id}
          <span style={{ color: t.textSoft }}>{expanded ? '▾' : '▸'}</span>
        </button>
      </div>

      {expanded && (
        <div style={{
          padding: 8, borderRadius: 10,
          background: `${t.bg}dd`, border: `1px solid ${t.surfaceBorder}`,
          maxHeight: 280, overflowY: 'auto',
        }}>
          {PHASES.map(phase => {
            const moons = MOONS.filter(m => m.phase === phase)
            if (!moons.length) return null
            return (
              <div key={phase} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: t.textSoft, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {phase} ({moons.length})
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {moons.map(m => {
                    const active = m.id === (value ?? current.id)
                    return (
                      <button
                        key={m.id}
                        onClick={() => { onChange(m.id); setExpanded(false) }}
                        title={`${m.phase} #${m.id}`}
                        style={{
                          width: 44, height: 44, borderRadius: 8, padding: 2,
                          border: active ? `2px solid ${t.accent}` : `1px solid ${t.surfaceBorder}`,
                          background: '#0a0a18',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: active ? `0 0 8px ${t.accent}40` : 'none',
                        }}
                      >
                        <img
                          src={moonUrl(m.id)}
                          alt=""
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
