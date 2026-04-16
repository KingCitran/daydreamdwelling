import { useTheme } from '@shared/ThemeProvider'

export default function WaitingInventoryAlert({ items, onClose, onAddAllToCart, onAddAllToWishlist, onClear }) {
  const t = useTheme()
  if (!items || items.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
      zIndex: 240, width: 460, maxWidth: '92vw',
      background: t.navBg, border: `1.5px solid ${t.accent}50`, borderRadius: 14,
      boxShadow: `0 8px 30px ${t.accent}30, 0 4px 16px rgba(0,0,0,0.3)`,
      fontFamily: "'Outfit', system-ui, sans-serif",
      animation: 'fadeSlideDown 0.4s ease-out',
    }}>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: `1px solid ${t.surfaceBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} waiting
            </div>
            <div style={{ fontSize: 11, color: t.textSoft }}>From rooms you explored</div>
          </div>
        </div>
        <button onClick={onClose} title="Hide — accessible from the ! button" style={{
          background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer',
          fontSize: 14, padding: 4,
        }}>✕</button>
      </div>

      {/* Items list */}
      <div style={{ maxHeight: 200, overflowY: 'auto', padding: '8px 12px' }}>
        {items.slice(0, 6).map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', fontSize: 12, color: t.text,
          }}>
            <span style={{ fontSize: 14 }}>◈</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                {it.label || it.typeKey}
              </div>
              <div style={{ fontSize: 10, color: t.textSoft }}>
                from {it.fromRoomTitle ?? 'a community room'}
              </div>
            </div>
            <span style={{ fontSize: 10, color: t.accent, fontWeight: 600 }}>
              {it.action === 'cart' ? 'cart' : 'place'}
            </span>
          </div>
        ))}
        {items.length > 6 && (
          <div style={{ padding: '6px 8px', fontSize: 11, color: t.textSoft, textAlign: 'center' }}>
            +{items.length - 6} more
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px',
        borderTop: `1px solid ${t.surfaceBorder}`,
      }}>
        <button onClick={onAddAllToCart} style={{
          flex: 1, padding: '9px 12px', borderRadius: 8,
          background: t.accent, color: t.accentText, border: 'none',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>🛒 Add all to cart</button>
        <button onClick={onAddAllToWishlist} style={{
          flex: 1, padding: '9px 12px', borderRadius: 8,
          background: 'transparent', color: t.accent, border: `1px solid ${t.accent}40`,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>♡ Wishlist all</button>
        <button onClick={onClear} title="Clear waiting inventory" style={{
          padding: '9px 10px', borderRadius: 8,
          background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`,
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>Clear</button>
      </div>
    </div>
  )
}
