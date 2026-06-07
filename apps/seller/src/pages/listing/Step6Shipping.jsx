import { useTheme } from '@shared/ThemeProvider'
import { Card, Field, Row } from './Step1Identity'

const PROCESSING_OPTIONS = [
  { label: '1 day',     value: 1  },
  { label: '2–3 days',  value: 3  },
  { label: '3–5 days',  value: 5  },
  { label: '1–2 weeks', value: 10 },
  { label: '2–4 weeks', value: 21 },
]

export default function Step6Shipping({ form, update }) {
  const t = useTheme()
  const s = styles(t)
  const isLighting = form.category === 'lighting'

  return (
    <Card t={t}>
      <h3 style={s.title}>Shipping &amp; Details</h3>

      <div style={s.infoBox}>
        <p style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: '0 0 8px' }}>
          How shipping works on DaydreamDwelling
        </p>
        <p style={{ fontSize: 13, color: t.text, margin: '0 0 8px', lineHeight: 1.6 }}>
          DaydreamDwelling believes in transparent pricing. Shipping costs are real — they pay for materials, labor, fuel, and insurance. We never hide shipping in inflated product prices.
        </p>
        <p style={{ fontSize: 13, color: t.text, margin: '0 0 8px', lineHeight: 1.6 }}>
          Shipping is calculated automatically at checkout based on the buyer's address and your product's weight and dimensions (from the Sizes step). Buyers see the exact shipping cost before they pay — no surprises.
        </p>
        <p style={{ fontSize: 13, color: t.text, margin: 0, lineHeight: 1.6 }}>
          We shop locally and globally — your products are available to customers across the country, with international shipping expanding soon. All you need to do is set your ship-from address in Settings and pack the order. We handle the rest.
        </p>
      </div>

      <Field t={t} label="Package weight (lbs)">
        <input style={s.input} type="number" min="0" step="0.1"
          value={form.weightLbs ?? ''} onChange={e => update({ weightLbs: e.target.value })}
          onFocus={e => e.target.select()}
          placeholder="e.g. 12.5" />
        <p style={s.note}>Weight of the product packaged and ready to ship. Used to calculate shipping cost at checkout.</p>
      </Field>

      <Field t={t} label="Processing time">
        <select style={s.input} value={form.processingDays}
          onChange={e => update({ processingDays: Number(e.target.value) })}>
          {PROCESSING_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
    title:   { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    note:    { fontSize: 11, color: t.textSoft, margin: 0 },
    input:   { padding: '9px 11px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    infoBox: { padding: '12px 14px', background: `${t.accent}08`, border: `1px solid ${t.accent}30`, borderRadius: 10 },
  }
}
