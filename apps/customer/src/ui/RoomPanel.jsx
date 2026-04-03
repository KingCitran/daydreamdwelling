import { ITEM_CATALOGUE } from '../data/items'
import { styles } from './styles/appStyles'

export default function RoomPanel({ items, onSelectItem, onToggleWishlist }) {
  return (
    <div style={styles.roomPanel}>
      <div style={styles.roomPanelHeader}>
        <span style={styles.roomPanelTitle}>In Room</span>
        <span style={styles.roomPanelCount}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={styles.roomPanelList}>
        {items.length === 0
          ? <p style={styles.roomPanelEmpty}>No items placed yet.</p>
          : items.map(it => {
              const def = ITEM_CATALOGUE[it.typeKey]
              return (
                <div key={it.id} style={styles.roomPanelItem} onClick={() => onSelectItem(it.id)}>
                  <div style={{ ...styles.roomPanelThumb, background: def.gradient }} />
                  <div style={styles.roomPanelInfo}>
                    <p style={styles.roomPanelName}>{def.label}</p>
                    <p style={styles.roomPanelMeta}>
                      {def.sizes[it.sizeIndex].label} · {def.swatches[it.swatchIndex].name}
                    </p>
                  </div>
                  {it.locked     && <span style={styles.roomPanelIcon}>🔒</span>}
                  {it.wishlisted && (
                    <button style={styles.roomPanelUnwish}
                      onClick={e => { e.stopPropagation(); onToggleWishlist(it.id) }}
                      title="Remove from wishlist"
                    >♥</button>
                  )}
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
