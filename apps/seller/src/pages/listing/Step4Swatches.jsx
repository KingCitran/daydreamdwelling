import { useTheme } from '@shared/ThemeProvider'
import { Card, Field } from './Step1Identity'

const BLANK   = { name: '', hex: '#888888', family: '' }
const FAMILIES = ['Neutral','White','Gray','Black','Beige','Brown','Red','Pink','Orange','Yellow','Green','Blue','Purple','Teal','Gold','Silver','Multi']

export default function Step4Swatches({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  function setField(i, field, val) {
    update({ swatches: form.swatches.map((sw, idx) => idx === i ? { ...sw, [field]: val } : sw) })
  }

  function addRow()    { update({ swatches: [...form.swatches, { ...BLANK }] }) }
  function removeRow(i) {
    if (form.swatches.length === 1) return
    update({ swatches: form.swatches.filter((_, idx) => idx !== i) })
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Colors &amp; Swatches</h3>
      <p style={s.hint}>Add each color variant available for this product.</p>

      {form.swatches.map((sw, i) => (
        <div key={i} style={s.row}>
          <div style={{ ...s.swatch, background: sw.hex }} />

          <Field t={t} label="Color name">
            <input style={s.input} value={sw.name}
              onChange={e => setField(i, 'name', e.target.value)}
              placeholder="e.g. Midnight Blue" />
          </Field>

          <Field t={t} label="Hex">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={sw.hex}
                onChange={e => setField(i, 'hex', e.target.value)}
                style={{ width: 38, height: 38, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
              <input style={{ ...s.input, flex: 1 }} value={sw.hex}
                onChange={e => setField(i, 'hex', e.target.value)}
                placeholder="#888888" />
            </div>
          </Field>

          <Field t={t} label="Color family">
            <select style={s.input} value={sw.family} onChange={e => setField(i, 'family', e.target.value)}>
              <option value="">Select…</option>
              {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>

          {form.swatches.length > 1 && (
            <button style={s.removeBtn} onClick={() => removeRow(i)}>✕</button>
          )}
        </div>
      ))}

      <button style={s.addBtn} onClick={addRow}>+ Add color</button>

      <p style={s.note}>Color family is used for shop filtering (e.g. "Blues", "Neutrals").</p>
    </Card>
  )
}

function styles(t) {
  return {
    title:     { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:      { fontSize: 13, color: t.textSoft, margin: 0 },
    note:      { fontSize: 11, color: t.textSoft, margin: 0 },
    row:       { display: 'flex', gap: 10, alignItems: 'flex-end', padding: '12px 14px', background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10 },
    swatch:    { width: 38, height: 38, borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 2 },
    input:     { padding: '8px 10px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    removeBtn: { padding: '7px 10px', background: 'transparent', border: '1px solid rgba(220,140,140,0.4)', borderRadius: 7, color: '#c06060', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-end', flexShrink: 0 },
    addBtn:    { alignSelf: 'flex-start', padding: '8px 16px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, cursor: 'pointer' },
  }
}
