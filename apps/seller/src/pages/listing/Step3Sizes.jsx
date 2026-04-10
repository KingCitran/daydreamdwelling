import { useTheme } from '@shared/ThemeProvider'
import { Card, Field, Row } from './Step1Identity'

const BLANK = { label: '', wFt: '', wIn: '0', dFt: '', dIn: '0', hFt: '', hIn: '0', price: '' }

export default function Step3Sizes({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  function setField(i, field, val) {
    const next = form.sizes.map((sz, idx) => idx === i ? { ...sz, [field]: val } : sz)
    update({ sizes: next })
  }

  function addRow() { update({ sizes: [...form.sizes, { ...BLANK }] }) }

  function removeRow(i) {
    if (form.sizes.length === 1) return
    update({ sizes: form.sizes.filter((_, idx) => idx !== i) })
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Sizes &amp; Pricing</h3>
      <p style={s.hint}>Add one row per size variant. Enter real-world dimensions so the room builder can scale items correctly.</p>

      {form.sizes.map((sz, i) => (
        <div key={i} style={s.row}>
          <Field t={t} label="Size label">
            <input style={s.input} value={sz.label}
              onChange={e => setField(i, 'label', e.target.value)}
              placeholder="e.g. 3-Seater / Queen / Large" />
          </Field>

          <Field t={t} label="W (ft · in)">
            <div style={{ display: 'flex', gap: 4 }}>
              <input style={{ ...s.input, width: 52 }} type="number" min="0" value={sz.wFt}
                onChange={e => setField(i, 'wFt', e.target.value)} placeholder="ft" />
              <input style={{ ...s.input, width: 44 }} type="number" min="0" max="11" value={sz.wIn}
                onChange={e => setField(i, 'wIn', e.target.value)} placeholder="in" />
            </div>
          </Field>

          <Field t={t} label="D (ft · in)">
            <div style={{ display: 'flex', gap: 4 }}>
              <input style={{ ...s.input, width: 52 }} type="number" min="0" value={sz.dFt}
                onChange={e => setField(i, 'dFt', e.target.value)} placeholder="ft" />
              <input style={{ ...s.input, width: 44 }} type="number" min="0" max="11" value={sz.dIn}
                onChange={e => setField(i, 'dIn', e.target.value)} placeholder="in" />
            </div>
          </Field>

          <Field t={t} label="H (ft · in)">
            <div style={{ display: 'flex', gap: 4 }}>
              <input style={{ ...s.input, width: 52 }} type="number" min="0" value={sz.hFt}
                onChange={e => setField(i, 'hFt', e.target.value)} placeholder="ft" />
              <input style={{ ...s.input, width: 44 }} type="number" min="0" max="11" value={sz.hIn}
                onChange={e => setField(i, 'hIn', e.target.value)} placeholder="in" />
            </div>
          </Field>

          <Field t={t} label="Price ($)">
            <input style={{ ...s.input, width: 80 }} type="number" min="0" value={sz.price}
              onChange={e => setField(i, 'price', e.target.value)} placeholder="0" />
          </Field>

          {form.sizes.length > 1 && (
            <button style={s.removeBtn} onClick={() => removeRow(i)}>✕</button>
          )}
        </div>
      ))}

      <button style={s.addBtn} onClick={addRow}>+ Add size variant</button>

      <p style={s.note}>
        Leave dimensions blank if you don't know them — the room builder will use catalogue defaults.
      </p>
    </Card>
  )
}

function styles(t) {
  return {
    title:     { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:      { fontSize: 13, color: t.textSoft, margin: 0 },
    note:      { fontSize: 11, color: t.textSoft, margin: 0 },
    row:       { display: 'flex', gap: 10, alignItems: 'flex-end', padding: '12px 14px', background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10 },
    input:     { padding: '8px 10px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    removeBtn: { padding: '7px 10px', background: 'transparent', border: '1px solid rgba(220,140,140,0.4)', borderRadius: 7, color: '#c06060', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-end', flexShrink: 0 },
    addBtn:    { alignSelf: 'flex-start', padding: '8px 16px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, cursor: 'pointer' },
  }
}
