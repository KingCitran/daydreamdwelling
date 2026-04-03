import { ITEM_CATALOGUE } from '../data/items'
import { styles } from './styles/appStyles'

export default function ArchSizePicker({ typeKey, onPick, onCancel }) {
  const def = ITEM_CATALOGUE[typeKey]
  return (
    <div style={styles.wallPickerOverlay} onClick={onCancel}>
      <div style={styles.wallPickerPanel} onClick={e => e.stopPropagation()}>
        <p style={styles.wallPickerTitle}>{def.label} Size</p>
        <p style={styles.wallPickerSub}>Then choose which wall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {def.sizes.map((size, i) => (
            <button
              key={i}
              style={{ ...styles.actionBtn, justifyContent: 'space-between', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}
              onClick={() => onPick(i)}
            >
              <span>{def.label === 'Door' ? '🚪' : '🪟'} {size.label}</span>
              <span style={{ color: '#9090cc', fontSize: 11 }}>${size.price}</span>
            </button>
          ))}
        </div>
        <button style={styles.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
