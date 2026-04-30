import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { ITEM_CATALOGUE } from '../data/items'

// Place tab — your stuff. Three view modes selected via top button row,
// each shows count and renders only that view's results in the body:
//   1. Placed     — items currently in the room
//   2. Inventory  — items you own but haven't placed
//   3. Wishlist   — items you've saved

export default function PlaceTabPanel({
  ownedKeys,
  roomItemKeys,
  wishlistedItems,
  catalogue = {},
  items = [],
  onPlace,
  onOpenModal,
  onSelectItem,
}) {
  const t = useTheme()
  const [section, setSection] = useState('placed') // 'placed' | 'inventory' | 'wishlist'

  const ownedArr = Array.from(ownedKeys ?? [])
  const wishArr  = Array.from(wishlistedItems ?? [])
  const roomSet  = roomItemKeys instanceof Set ? roomItemKeys : new Set(roomItemKeys ?? [])

  const inventory = ownedArr
    .filter(key => !roomSet.has(key))
    .map(key => ({ key, def: catalogue[key] ?? ITEM_CATALOGUE[key] }))
    .filter(it => it.def)

  const placedGroups = (() => {
    const groups = new Map()
    items.forEach(it => {
      const def = catalogue[it.typeKey] ?? ITEM_CATALOGUE[it.typeKey]
      if (!def) return
      const existing = groups.get(it.typeKey)
      if (existing) {
        existing.count += 1
        existing.lastId = it.id
      } else {
        groups.set(it.typeKey, { key: it.typeKey, def, count: 1, lastId: it.id })
      }
    })
    return Array.from(groups.values())
  })()

  const counts = {
    placed: items.length,
    inventory: inventory.length,
    wishlist: wishArr.length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Section selector — three count-buttons, switch the body below */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'rgba(0,0,0,0.18)' }}>
        <Tab active={section === 'placed'}    count={counts.placed}    onClick={() => setSection('placed')}   >Placed</Tab>
        <Tab active={section === 'inventory'} count={counts.inventory} onClick={() => setSection('inventory')}>Inventory</Tab>
        <Tab active={section === 'wishlist'}  count={counts.wishlist}  onClick={() => setSection('wishlist')} >Wishlist</Tab>
      </div>

      {section === 'placed' && (
        placedGroups.length === 0
          ? <Empty text="Items you place in this room will show here. Click a tile to select it." />
          : <div style={grid()}>
              {placedGroups.map(({ key, def, count, lastId }) => (
                <button
                  key={key}
                  onClick={() => onSelectItem?.(lastId)}
                  title={`Select ${def.label}${count > 1 ? ` (${count})` : ''}`}
                  style={{ ...tile(t), position: 'relative' }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{def.emoji ?? '◰'}</span>
                  <span style={tileLabel}>{def.label}</span>
                  {count > 1 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 8,
                      background: `${t.accent}40`, color: '#f0eaff',
                    }}>×{count}</span>
                  )}
                </button>
              ))}
            </div>
      )}

      {section === 'inventory' && (
        inventory.length === 0
          ? <Empty text="Nothing waiting. Items you own but haven't placed in this room will show here." />
          : <div style={grid()}>
              {inventory.map(({ key, def }) => (
                <button
                  key={key}
                  onClick={() => onPlace?.(key, 0, 0)}
                  title={`Place ${def.label}`}
                  style={tile(t)}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{def.emoji ?? '◰'}</span>
                  <span style={tileLabel}>{def.label}</span>
                </button>
              ))}
            </div>
      )}

      {section === 'wishlist' && (
        wishArr.length === 0
          ? <Empty text="Heart items in the shop to save them here." />
          : <div style={grid()}>
              {wishArr.map(key => {
                const def = catalogue[key] ?? ITEM_CATALOGUE[key]
                if (!def) return null
                return (
                  <button
                    key={key}
                    onClick={() => onOpenModal?.(key)}
                    title={def.label}
                    style={tile(t)}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{def.emoji ?? '♥'}</span>
                    <span style={tileLabel}>{def.label}</span>
                  </button>
                )
              })}
            </div>
      )}
    </div>
  )
}

function Tab({ active, count, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '7px 8px', borderRadius: 8,
      border: 'none', cursor: 'pointer',
      background: active ? '#f0a8d8' : 'transparent',
      color: active ? '#1a0f30' : '#c8b8ee',
      fontSize: 11, fontWeight: 700,
      fontFamily: "'Outfit', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    }}>
      {children}
      <span style={{
        fontSize: 9, fontWeight: 800,
        padding: '1px 6px', borderRadius: 8,
        background: active ? 'rgba(26,15,48,0.25)' : 'rgba(255,255,255,0.08)',
      }}>{count}</span>
    </button>
  )
}

function Empty({ text }) {
  return (
    <div style={{
      padding: '14px 12px',
      borderRadius: 10,
      border: '1px dashed rgba(255,255,255,0.12)',
      fontSize: 11, color: '#a090c8', lineHeight: 1.5,
      textAlign: 'center',
    }}>{text}</div>
  )
}

const grid = () => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 6,
})

const tile = t => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  padding: '10px 6px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  cursor: 'pointer',
  fontFamily: "'Outfit', system-ui, sans-serif",
})

const tileLabel = {
  fontSize: 11, fontWeight: 600, color: '#f0eaff',
  textAlign: 'center', lineHeight: 1.2,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
}
