import { ITEM_CATALOGUE } from '../data/items'
import { useBuilderStyles } from './styles/appStyles'

export default function ArchSizePicker({ typeKey, onPick, onCancel }) {
  const s   = useBuilderStyles()
  const def = ITEM_CATALOGUE[typeKey]
  return (
    <div style={s.wallPickerOverlay} onClick={onCancel}>
      <div style={s.wallPickerPanel} onClick={e => e.stopPropagation()}>
        <p style={s.wallPickerTitle}>{def.label} Size</p>
        <p style={s.wallPickerSub}>Then choose which wall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {def.sizes.map((size, i) => (
            <button
              key={i}
              style={{ ...s.actionBtn, justifyContent: 'space-between', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}
              onClick={() => onPick(i)}
            >
              <span>{def.label === 'Door' ? '🚪' : '🪟'} {size.label}</span>
              <span style={{ color: '#9090cc', fontSize: 11 }}>${size.price}</span>
            </button>
          ))}
        </div>
        <button style={s.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
