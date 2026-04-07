import { ITEM_CATALOGUE } from '../data/items'
import { useBuilderStyles } from './styles/appStyles'

export default function RoomPanel({ items, onSelectItem, onToggleWishlist }) {
  const s = useBuilderStyles()
  return (
    <div style={s.roomPanel}>
      <div style={s.roomPanelHeader}>
        <span style={s.roomPanelTitle}>In Room</span>
        <span style={s.roomPanelCount}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={s.roomPanelList}>
        {items.length === 0
          ? <p style={s.roomPanelEmpty}>No items placed yet.</p>
          : items.map(it => {
              const def = ITEM_CATALOGUE[it.typeKey]
              return (
                <div key={it.id} style={s.roomPanelItem} onClick={() => onSelectItem(it.id)}>
                  <div style={{ ...s.roomPanelThumb, background: def.gradient }} />
                  <div style={s.roomPanelInfo}>
                    <p style={s.roomPanelName}>{def.label}</p>
                    <p style={s.roomPanelMeta}>
                      {def.sizes[it.sizeIndex].label} · {def.swatches[it.swatchIndex].name}
                    </p>
                  </div>
                  {it.locked     && <span style={s.roomPanelIcon}>🔒</span>}
                  {it.wishlisted && (
                    <button style={s.roomPanelUnwish}
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
