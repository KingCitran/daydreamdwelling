import { useTheme } from '@shared/ThemeProvider'

// View tab — visibility toggles, cloud controls, Wispy.
// Camera rotate/zoom handled by floating BuilderViewControls.
// Mood switching handled by Style panel.

export default function ViewTabPanel({
  ceilingView, onToggleCeiling,
  onSummonWispy,
  showMeasurements, onToggleMeasurements,
  showGrid, onToggleGrid,
  cloudsOn, onToggleClouds,
  forceEasterEggs, onToggleEasterEggs,
}) {
  const t = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

      <Section title="Clouds">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={onToggleClouds} style={btn(cloudsOn)}>
            {cloudsOn ? '⛅ Clouds On' : '◯ Clouds Off'}
          </button>
          {cloudsOn && onToggleEasterEggs && (
            <button onClick={onToggleEasterEggs} style={btn(forceEasterEggs)} title="Dev: forces every cloud to be an Easter-egg shape so you can audit them.">
              {forceEasterEggs ? '✨ Cycling shapes ✓' : '✨ Cycle Easter Eggs (dev)'}
            </button>
          )}
        </div>
      </Section>

      <Section title="Wispy">
        <button onClick={onSummonWispy} style={btn()}>☁ Talk to Wispy</button>
      </Section>

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
