import { useTheme } from '@shared/ThemeProvider'
import { Card, Field, Row } from './Step1Identity'

const PROCESSING_OPTIONS = [
  { label: '1 day',     value: 1  },
  { label: '2–3 days',  value: 3  },
  { label: '3–5 days',  value: 5  },
  { label: '1–2 weeks', value: 10 },
  { label: '2–4 weeks', value: 21 },
]
const REGIONS = [
  { id: 'domestic',      label: 'Domestic (USA)' },
  { id: 'canada',        label: 'Canada' },
  { id: 'international', label: 'International' },
]

export default function Step6Shipping({ form, update }) {
  const t = useTheme()
  const s = styles(t)
  const isLighting = form.category === 'lighting'

  function toggleRegion(id) {
    const next = form.shippingRegions.includes(id)
      ? form.shippingRegions.filter(r => r !== id)
      : [...form.shippingRegions, id]
    update({ shippingRegions: next })
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Shipping</h3>

      <Field t={t} label="Shipping type">
        <div style={{ display: 'flex', gap: 10 }}>
          {['flat', 'calculated'].map(type => (
            <label key={type} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              border: `1px solid ${form.shippingType === type ? t.accent : t.surfaceBorder}`,
              borderRadius: 10, cursor: 'pointer',
              background: form.shippingType === type ? `${t.accent}18` : t.surface,
            }}>
              <input type="radio" name="shippingType" value={type}
                checked={form.shippingType === type}
                onChange={() => update({ shippingType: type })}
                style={{ accentColor: t.accent }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.shippingType === type ? t.accent : t.text }}>
                  {type === 'flat' ? 'Flat rate' : 'Calculated'}
                </span>
                <p style={{ fontSize: 11, color: t.textSoft, margin: 0 }}>
                  {type === 'flat' ? 'Single price for all orders' : 'ShipStation integration — coming soon'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Field>

      {form.shippingType === 'flat' && (
        <Field t={t} label="Flat rate ($)">
          <input style={s.input} type="number" min="0" step="0.01"
            value={form.flatRate} onChange={e => update({ flatRate: e.target.value })}
            placeholder="e.g. 15.00  (0 for free shipping)" />
        </Field>
      )}

      {form.shippingType === 'calculated' && (
        <div style={{ padding: '12px 14px', background: `${t.accent}08`, border: `1px solid ${t.accent}30`, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>
            Calculated shipping via ShipStation will be available in a future update.
            For now, consider using flat rate.
          </p>
        </div>
      )}

      <Field t={t} label="Processing time">
        <select style={s.input} value={form.processingDays}
          onChange={e => update({ processingDays: Number(e.target.value) })}>
          {PROCESSING_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Field>

      <Field t={t} label="Shipping regions">
        <div style={{ display: 'flex', gap: 14 }}>
          {REGIONS.map(r => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: t.text }}>
              <input type="checkbox" checked={form.shippingRegions.includes(r.id)}
                onChange={() => toggleRegion(r.id)}
                style={{ accentColor: t.accent }} />
              {r.label}
            </label>
          ))}
        </div>
      </Field>

      {isLighting && (
        <Row>
          <Field t={t} label="Wattage (W)">
            <input style={s.input} type="number" min="0"
              value={form.wattage} onChange={e => update({ wattage: e.target.value })}
              placeholder="e.g. 60" />
          </Field>
          <Field t={t} label="Color temperature (K)">
            <input style={s.input} type="number" min="1000" max="10000"
              value={form.kelvin} onChange={e => update({ kelvin: e.target.value })}
              placeholder="e.g. 3000 (warm white)" />
          </Field>
        </Row>
      )}

      {!isLighting && (
        <p style={s.note}>
          Wattage and Kelvin fields appear automatically for Lighting category items.
        </p>
      )}
    </Card>
  )
}

function styles(t) {
  return {
    title: { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    note:  { fontSize: 11, color: t.textSoft, margin: 0 },
    input: { padding: '9px 11px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  }
}
