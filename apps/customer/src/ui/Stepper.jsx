// ── Small number stepper (text box + ▲/▼) ───────────────────────────
import { useBuilderStyles } from './styles/appStyles'

export default function Stepper({ value, min, max, step, onChange, unit = "'" }) {
  const s = useBuilderStyles()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <button style={s.paneStep} onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}>▼</button>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v))) }}
        style={s.stepperInput}
      />
      <span style={s.stepperUnit}>{unit}</span>
      <button style={s.paneStep} onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))}>▲</button>
    </div>
  )
}
