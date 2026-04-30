import { useState } from 'react'

// Plan tab — history, layout (floor plan editor toggle), paint, save/load.
// Paint section is collapsible: click to expand the wall + floor color
// pickers inline. Share-to-Community moved out — Social tab handles sharing.

export default function PlanTabPanel({
  panelOpen, onTogglePanel,
  canUndo, canRedo, onUndo, onRedo,
  onCloudSave, onCloudLoad,
  bookmark, onSaveBookmark, onRestoreBookmark,
  // Paint props
  floorColor, wallColor, onFloorColor, onWallColor,
}) {
  const [showPaint, setShowPaint] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Section title="History">
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onUndo} disabled={!canUndo} style={btn(false, !canUndo)}>↶ Undo</button>
          <button onClick={onRedo} disabled={!canRedo} style={btn(false, !canRedo)}>↷ Redo</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button onClick={onSaveBookmark} style={btn(!!bookmark)} title="Save a quick checkpoint you can revert to">⚑ {bookmark ? 'Update Mark' : 'Mark Spot'}</button>
          <button onClick={onRestoreBookmark} disabled={!bookmark} style={btn(false, !bookmark)} title="Revert to your saved checkpoint">↻ Restore</button>
        </div>
      </Section>

      <Section title="Layout">
        <button onClick={onTogglePanel} style={btn(panelOpen)}>
          {panelOpen ? '✕ Close Floor Plan' : '⊞ Edit Floor Plan'}
        </button>
      </Section>

      <Section title="Paint">
        <button onClick={() => setShowPaint(s => !s)} style={btn(showPaint)}>
          {showPaint ? '✕ Hide Paint' : '🎨 Open Paint'}
        </button>
        {showPaint && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            <ColorRow label="Walls" value={wallColor} onChange={onWallColor} />
            <ColorRow label="Floor" value={floorColor} onChange={onFloorColor} />
          </div>
        )}
      </Section>

      <Section title="Save">
        <button onClick={onCloudSave} style={btn()}>💾 Save Room</button>
        <button onClick={onCloudLoad} style={{ ...btn(), marginTop: 6 }}>📂 Load Room</button>
      </Section>
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 10,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      cursor: 'pointer',
      position: 'relative',
    }}>
      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#f0eaff' }}>{label}</span>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: value, border: '1px solid rgba(0,0,0,0.3)', flexShrink: 0 }} />
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
      />
    </label>
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

const btn = (active = false, disabled = false) => ({
  flex: 1, width: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '9px 12px',
  borderRadius: 10,
  border: `1px solid ${active ? '#7ac8e0' : 'rgba(255,255,255,0.1)'}`,
  background: active ? 'rgba(122,200,224,0.15)' : 'rgba(255,255,255,0.04)',
  color: '#f0eaff',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  fontSize: 12, fontWeight: 600,
  fontFamily: "'Outfit', system-ui, sans-serif",
})
