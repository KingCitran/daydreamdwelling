import { useTheme } from '@shared/ThemeProvider'

const CATEGORIES = ['seating','tables','storage','beds','lighting','surfaces','textiles','decor','electronics','outdoor','other']
const HANDMADE_OPTS = [
  { value: 'handmade',     label: 'Handmade',     desc: 'Made by hand, one at a time' },
  { value: 'manufactured', label: 'Manufactured',  desc: 'Produced in a factory or at scale' },
  { value: 'exclusive',    label: 'Exclusive',     desc: 'Limited run or designer collaboration' },
]

export default function Step1Identity({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  function toggleMaterial(e) {
    if (e.key !== 'Enter') return
    const val = e.target.value.trim()
    if (!val) return
    if (!form.materials.includes(val)) update({ materials: [...form.materials, val] })
    e.target.value = ''
  }

  function removeMaterial(m) {
    update({ materials: form.materials.filter(x => x !== m) })
  }

  return (
    <Card t={t}>
      <h3 style={s.sectionTitle}>Product Identity</h3>

      <Row>
        <Field t={t} label="Product name *">
          <input style={s.input} value={form.label}
            onChange={e => update({ label: e.target.value })}
            placeholder="e.g. Luxe Velvet Sofa" />
        </Field>
        <Field t={t} label="Brand">
          <input style={s.input} value={form.brand}
            onChange={e => update({ brand: e.target.value })}
            placeholder="e.g. Studio Nord" />
        </Field>
      </Row>

      <Row>
        <Field t={t} label="Category">
          <select style={s.input} value={form.category} onChange={e => update({ category: e.target.value })}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </Field>
        <Field t={t} label="Make / Model (optional)">
          <input style={s.input} value={form.makeModel}
            onChange={e => update({ makeModel: e.target.value })}
            placeholder="e.g. Ikea KLIPPAN 2024" />
        </Field>
      </Row>

      <Field t={t} label="Type declaration">
        <div style={{ display: 'flex', gap: 10 }}>
          {HANDMADE_OPTS.map(opt => (
            <label key={opt.value} style={{
              flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px',
              border: `1px solid ${form.handmadeType === opt.value ? t.accent : t.surfaceBorder}`,
              borderRadius: 10, cursor: 'pointer',
              background: form.handmadeType === opt.value ? `${t.accent}18` : t.surface,
            }}>
              <input type="radio" name="handmadeType" value={opt.value}
                checked={form.handmadeType === opt.value}
                onChange={() => update({ handmadeType: opt.value })}
                style={{ display: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: form.handmadeType === opt.value ? t.accent : t.text }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 11, color: t.textSoft }}>{opt.desc}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field t={t} label={`Short description (${form.shortDesc.length}/150)`}>
        <textarea style={{ ...s.input, height: 60, resize: 'vertical' }}
          value={form.shortDesc} maxLength={150}
          onChange={e => update({ shortDesc: e.target.value })}
          placeholder="One sentence that sells this product…" />
      </Field>

      <Field t={t} label="Full description">
        <textarea style={{ ...s.input, height: 100, resize: 'vertical' }}
          value={form.fullDesc}
          onChange={e => update({ fullDesc: e.target.value })}
          placeholder="Materials, style, dimensions, what makes it special…" />
      </Field>

      <Field t={t} label="Materials (press Enter to add)">
        <input style={s.input} placeholder="e.g. Solid oak"
          onKeyDown={toggleMaterial} />
        {form.materials.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {form.materials.map(m => (
              <span key={m} style={s.chip}>
                {m}
                <button style={s.chipX} onClick={() => removeMaterial(m)}>×</button>
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field t={t} label="Guarantee / warranty">
        <input style={s.input} value={form.guarantee}
          onChange={e => update({ guarantee: e.target.value })}
          placeholder="e.g. 10-year frame · 2-year fabric" />
      </Field>
    </Card>
  )
}

export function Card({ t, children }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  )
}
export function Field({ label, children, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
      {children}
    </div>
  )
}
export function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>{children}</div>
}

function styles(t) {
  return {
    sectionTitle: { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    input: { padding: '9px 11px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    chip: { display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${t.accent}18`, border: `1px solid ${t.accent}44`, borderRadius: 20, fontSize: 12, color: t.accent },
    chipX: { background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 },
  }
}
