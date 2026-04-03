// ── Small number stepper (text box + ▲/▼) ───────────────────────────
import { styles } from './styles/appStyles'

export default function Stepper({ value, min, max, step, onChange, unit = "'" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <button style={styles.paneStep} onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}>▼</button>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v))) }}
        style={{ width: 40, textAlign: 'center', background: '#2a2a3e', border: '1px solid #4a4a6a', color: '#e0d8ff', borderRadius: 4, padding: '3px 2px', fontSize: 12 }}
      />
      <span style={{ color: '#9090b8', fontSize: 11 }}>{unit}</span>
      <button style={styles.paneStep} onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))}>▲</button>
    </div>
  )
}
