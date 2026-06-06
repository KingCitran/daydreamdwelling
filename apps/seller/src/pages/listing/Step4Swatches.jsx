import { useTheme } from '@shared/ThemeProvider'
import { Card, Field } from './Step1Identity'

const PRESETS = [
  { name: 'White',     hex: '#FFFFFF', family: 'White' },
  { name: 'Ivory',     hex: '#FFFFF0', family: 'White' },
  { name: 'Cream',     hex: '#FFFDD0', family: 'Beige' },
  { name: 'Beige',     hex: '#F5F5DC', family: 'Beige' },
  { name: 'Tan',       hex: '#D2B48C', family: 'Brown' },
  { name: 'Brown',     hex: '#8B4513', family: 'Brown' },
  { name: 'Espresso',  hex: '#3C1414', family: 'Brown' },
  { name: 'Black',     hex: '#1A1A1A', family: 'Black' },
  { name: 'Charcoal',  hex: '#36454F', family: 'Gray' },
  { name: 'Gray',      hex: '#808080', family: 'Gray' },
  { name: 'Light Gray',hex: '#C0C0C0', family: 'Gray' },
  { name: 'Navy',      hex: '#1B2A4A', family: 'Blue' },
  { name: 'Blue',      hex: '#4169E1', family: 'Blue' },
  { name: 'Teal',      hex: '#008080', family: 'Teal' },
  { name: 'Green',     hex: '#2E8B57', family: 'Green' },
  { name: 'Sage',      hex: '#9CAF88', family: 'Green' },
  { name: 'Olive',     hex: '#556B2F', family: 'Green' },
  { name: 'Red',       hex: '#C0392B', family: 'Red' },
  { name: 'Burgundy',  hex: '#722F37', family: 'Red' },
  { name: 'Pink',      hex: '#F4A7BB', family: 'Pink' },
  { name: 'Blush',     hex: '#F2C6C2', family: 'Pink' },
  { name: 'Coral',     hex: '#FF7F50', family: 'Orange' },
  { name: 'Orange',    hex: '#E67E22', family: 'Orange' },
  { name: 'Yellow',    hex: '#F4D03F', family: 'Yellow' },
  { name: 'Mustard',   hex: '#C49102', family: 'Yellow' },
  { name: 'Purple',    hex: '#6B3FA0', family: 'Purple' },
  { name: 'Lavender',  hex: '#B39DDB', family: 'Purple' },
  { name: 'Gold',      hex: '#C5A02E', family: 'Gold' },
  { name: 'Silver',    hex: '#C0C0C0', family: 'Silver' },
  { name: 'Walnut',    hex: '#5C4033', family: 'Brown' },
  { name: 'Oak',       hex: '#C4A35A', family: 'Brown' },
  { name: 'Maple',     hex: '#D4A76A', family: 'Beige' },
]

const FAMILIES = ['Neutral','White','Gray','Black','Beige','Brown','Red','Pink','Orange','Yellow','Green','Blue','Purple','Teal','Gold','Silver','Multi']

const BLANK_COLOR = { location: '', hex: '#888888', name: '' }
const BLANK_OPTION = { label: '', colors: [{ ...BLANK_COLOR }], family: '' }

// Pie chart SVG for multi-color preview
function PiePreview({ colors, size = 36 }) {
  const valid = colors.filter(c => c.hex)
  if (valid.length === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#ddd' }} />
  if (valid.length === 1) return <div style={{ width: size, height: size, borderRadius: '50%', background: valid[0].hex, border: '1px solid rgba(0,0,0,0.12)' }} />

  const r = size / 2
  const sliceAngle = 360 / valid.length
  const paths = valid.map((c, i) => {
    const startAngle = i * sliceAngle - 90
    const endAngle = (i + 1) * sliceAngle - 90
    const x1 = r + r * Math.cos((startAngle * Math.PI) / 180)
    const y1 = r + r * Math.sin((startAngle * Math.PI) / 180)
    const x2 = r + r * Math.cos((endAngle * Math.PI) / 180)
    const y2 = r + r * Math.sin((endAngle * Math.PI) / 180)
    const large = sliceAngle > 180 ? 1 : 0
    return <path key={i} d={`M${r},${r} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={c.hex} />
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }}>
      {paths}
    </svg>
  )
}

export default function Step4Swatches({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  // Migrate old flat swatch format to new multi-color format
  const options = (form.swatches || []).map(sw =>
    sw.colors ? sw : { label: sw.name || '', colors: [{ location: '', hex: sw.hex || '#888888', name: sw.name || '' }], family: sw.family || '' }
  )

  function setOptions(next) {
    update({ swatches: next })
  }

  function setOptionField(i, field, val) {
    setOptions(options.map((opt, idx) => idx === i ? { ...opt, [field]: val } : opt))
  }

  function setColor(optIdx, colIdx, field, val) {
    const next = options.map((opt, oi) => {
      if (oi !== optIdx) return opt
      return { ...opt, colors: opt.colors.map((c, ci) => ci === colIdx ? { ...c, [field]: val } : c) }
    })
    setOptions(next)
  }

  function addColorToOption(optIdx) {
    setOptions(options.map((opt, i) => i === optIdx ? { ...opt, colors: [...opt.colors, { ...BLANK_COLOR }] } : opt))
  }

  function removeColor(optIdx, colIdx) {
    if (options[optIdx].colors.length <= 1) return
    setOptions(options.map((opt, i) => i === optIdx ? { ...opt, colors: opt.colors.filter((_, ci) => ci !== colIdx) } : opt))
  }

  function applyPreset(optIdx, colIdx, preset) {
    const next = options.map((opt, oi) => {
      if (oi !== optIdx) return opt
      const colors = opt.colors.map((c, ci) => ci === colIdx ? { ...c, hex: preset.hex, name: preset.name } : c)
      // Auto-set family to the first color's preset family, or Multi if 2+ colors
      const family = colors.length > 1 ? 'Multi' : preset.family
      return { ...opt, colors, family }
    })
    setOptions(next)
  }

  function addOption() {
    setOptions([...options, { ...BLANK_OPTION, colors: [{ ...BLANK_COLOR }] }])
  }

  function removeOption(i) {
    if (options.length <= 1) return
    setOptions(options.filter((_, idx) => idx !== i))
  }

  // Auto-determine family when colors change
  function autoFamily(opt) {
    if (opt.colors.length > 1) return 'Multi'
    const match = PRESETS.find(p => p.hex.toLowerCase() === (opt.colors[0]?.hex || '').toLowerCase())
    return match?.family || opt.family || ''
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Color Options</h3>
      <p style={s.hint}>
        Add each color option you offer. If your product has multiple colors (like a white seat with black legs), add each color within the option.
      </p>

      {options.map((opt, optIdx) => (
        <div key={optIdx} style={s.optionCard}>
          <div style={s.optionHeader}>
            <PiePreview colors={opt.colors} size={32} />
            <Field t={t} label="Option name (optional)">
              <input
                style={s.input}
                value={opt.label || ''}
                onChange={e => setOptionField(optIdx, 'label', e.target.value)}
                placeholder={`Option ${optIdx + 1}`}
              />
            </Field>
            <Field t={t} label="Color family">
              <select style={s.input} value={opt.family || autoFamily(opt)} onChange={e => setOptionField(optIdx, 'family', e.target.value)}>
                <option value="">Auto</option>
                {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            {options.length > 1 && (
              <button style={s.removeBtn} onClick={() => removeOption(optIdx)} title="Remove option">✕</button>
            )}
          </div>

          {/* Colors within this option */}
          {opt.colors.map((c, colIdx) => (
            <div key={colIdx} style={s.colorRow}>
              <div style={{ ...s.colorDot, background: c.hex }} />

              <Field t={t} label="Color location">
                <input style={s.input} value={c.location || ''}
                  onChange={e => setColor(optIdx, colIdx, 'location', e.target.value)}
                  placeholder="e.g. Seat, Base, Legs, Frame" />
              </Field>

              <Field t={t} label="Color">
                <div style={s.presetGrid}>
                  {PRESETS.slice(0, 16).map(p => (
                    <button
                      key={p.name}
                      title={p.name}
                      onClick={() => applyPreset(optIdx, colIdx, p)}
                      style={{
                        ...s.presetDot,
                        background: p.hex,
                        outline: c.hex?.toLowerCase() === p.hex.toLowerCase() ? `2px solid ${t.accent}` : 'none',
                        outlineOffset: 1,
                      }}
                    />
                  ))}
                  <button
                    style={s.presetMore}
                    onClick={e => {
                      const el = e.currentTarget.nextElementSibling
                      if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none'
                    }}
                  >
                    ...
                  </button>
                  <div style={{ ...s.presetGrid, display: 'none', gridColumn: '1 / -1' }}>
                    {PRESETS.slice(16).map(p => (
                      <button
                        key={p.name}
                        title={p.name}
                        onClick={() => applyPreset(optIdx, colIdx, p)}
                        style={{
                          ...s.presetDot,
                          background: p.hex,
                          outline: c.hex?.toLowerCase() === p.hex.toLowerCase() ? `2px solid ${t.accent}` : 'none',
                          outlineOffset: 1,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Field>

              <Field t={t} label="Custom hex">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="color" value={c.hex}
                    onChange={e => setColor(optIdx, colIdx, 'hex', e.target.value)}
                    style={s.hexPicker} />
                  <input style={{ ...s.input, flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
                    value={c.hex}
                    onChange={e => setColor(optIdx, colIdx, 'hex', e.target.value)}
                    placeholder="#888888" />
                </div>
              </Field>

              {opt.colors.length > 1 && (
                <button style={s.removeColorBtn} onClick={() => removeColor(optIdx, colIdx)} title="Remove color">✕</button>
              )}
            </div>
          ))}

          <button style={s.addColorBtn} onClick={() => addColorToOption(optIdx)}>
            + Add another color to this option
          </button>
        </div>
      ))}

      <button style={s.addOptionBtn} onClick={addOption}>+ Add color option</button>

      <p style={s.note}>
        Customers will see these as selectable options with a color preview showing all colors in the option.
      </p>
    </Card>
  )
}

function styles(t) {
  return {
    title:        { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:         { fontSize: 13, color: t.textSoft, margin: 0, lineHeight: 1.5 },
    note:         { fontSize: 11, color: t.textSoft, margin: 0 },
    input:        { padding: '8px 10px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    optionCard:   { padding: '14px', background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 },
    optionHeader: { display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' },
    colorRow:     { display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', padding: '10px 12px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10 },
    colorDot:     { width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 6 },
    presetGrid:   { display: 'flex', flexWrap: 'wrap', gap: 4 },
    presetDot:    { width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer', padding: 0, flexShrink: 0 },
    presetMore:   { width: 22, height: 22, borderRadius: '50%', border: `1px dashed ${t.surfaceBorder}`, cursor: 'pointer', padding: 0, background: 'transparent', color: t.textSoft, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    hexPicker:    { width: 32, height: 32, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 },
    removeBtn:    { padding: '7px 10px', background: 'transparent', border: '1px solid rgba(220,140,140,0.4)', borderRadius: 7, color: '#c06060', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-end', flexShrink: 0 },
    removeColorBtn: { padding: '5px 8px', background: 'transparent', border: 'none', color: '#c06060', fontSize: 14, cursor: 'pointer', alignSelf: 'flex-end', flexShrink: 0 },
    addColorBtn:  { alignSelf: 'flex-start', padding: '6px 14px', background: 'transparent', border: `1px dashed ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 11, cursor: 'pointer' },
    addOptionBtn: { alignSelf: 'flex-start', padding: '8px 16px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, cursor: 'pointer' },
  }
}
