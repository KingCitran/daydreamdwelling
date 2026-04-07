import { useState } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import { useBuilderStyles } from './styles/appStyles'
import Stepper from './Stepper'

export default function WindowSizePicker({ onPick, onCancel }) {
  const s = useBuilderStyles()
  const [customMode, setCustomMode] = useState(false)
  const [customW, setCustomW] = useState(3)
  const [customH, setCustomH] = useState(4)
  const sizes = ITEM_CATALOGUE.window.sizes

  if (customMode) {
    return (
      <div style={s.wallPickerOverlay} onClick={onCancel}>
        <div style={s.wallPickerPanel} onClick={e => e.stopPropagation()}>
          <p style={s.wallPickerTitle}>Custom Window</p>
          <p style={s.wallPickerSub}>Then choose which wall</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#9090b8', fontSize: 12, minWidth: 46 }}>Width</span>
              <Stepper min={1} max={8} step={0.5} value={customW} onChange={setCustomW} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#9090b8', fontSize: 12, minWidth: 46 }}>Height</span>
              <Stepper min={1} max={6} step={0.5} value={customH} onChange={setCustomH} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: Math.round(customW * 14), height: Math.round(customH * 14),
                background: '#c8a870', border: '2px solid #8a6840', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '70%', height: '80%', background: '#a8d8f8', opacity: 0.7, borderRadius: 1 }} />
              </div>
            </div>
          </div>
          <button
            style={{ ...s.actionBtn, width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px 14px', boxSizing: 'border-box' }}
            onClick={() => onPick(-1, customW, customH)}
          >
            🪟 Place {customW}' × {customH}' →
          </button>
          <button style={s.wallPickerCancel} onClick={() => setCustomMode(false)}>← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.wallPickerOverlay} onClick={onCancel}>
      <div style={s.wallPickerPanel} onClick={e => e.stopPropagation()}>
        <p style={s.wallPickerTitle}>Window Size</p>
        <p style={s.wallPickerSub}>Then choose which wall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {sizes.map((size, i) => (
            <button
              key={i}
              style={{ ...s.actionBtn, justifyContent: 'space-between', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}
              onClick={() => onPick(i)}
            >
              <span>🪟 {size.label}</span>
              <span style={{ color: '#9090cc', fontSize: 11 }}>${size.price}</span>
            </button>
          ))}
          <button
            style={{ ...s.actionBtn, justifyContent: 'center', padding: '10px 14px', width: '100%', boxSizing: 'border-box', borderStyle: 'dashed', color: '#9090cc' }}
            onClick={() => setCustomMode(true)}
          >
            ✏️ Custom size…
          </button>
        </div>
        <button style={s.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
