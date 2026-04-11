import { useShopStyles } from './shop/shopStyles'
import { useTheme } from '@shared/ThemeProvider'
import BrowseTab   from './shop/BrowseTab'
import CartTab     from './shop/CartTab'
import WishlistTab from './shop/WishlistTab'

// Re-export so callers can still do: import ShopDrawer, { ProductModal } from './ui/ShopDrawer'
export { default as ProductModal } from './shop/ProductModal'

export default function ShopDrawer({
  open, activeTab, onTabChange,
  onPlace, onOpenModal,
  catalogue,
  cart, onIncrementCart, onDecrementCart, onRemoveFromCart,
  wishlistedItems, onToggleWishlist,
  gridW, gridD,
  cartHighlight, onCartHighlight,
  onCheckout,
  drawerWidth,
  roomItemKeys,
  ownedKeys,
}) {
  const s = useShopStyles()
  const t = useTheme()
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const crumbMode = null // future: could pass browsing state up if needed

  return (
    <div style={{ ...s.drawer, width: '100%', pointerEvents: 'auto' }}>

      {/* Header */}
      <div style={s.header}>
        <span style={s.headerTitle}>Shop</span>
        {crumbMode && <span style={s.headerCrumb}>{crumbMode}</span>}
      </div>

      {/* Nav tabs */}
      <div style={s.navTabs}>
        <button style={{ ...s.navTab, ...(activeTab === 'shop'     ? s.navTabActive : {}) }} onClick={() => onTabChange('shop')}>Shop</button>
        <button style={{ ...s.navTab, ...(activeTab === 'wishlist' ? s.navTabActive : {}) }} onClick={() => onTabChange('wishlist')}>
          <span style={activeTab === 'wishlist' ? s.wishIconActive : s.wishIcon}>♥</span>
          Wishlist{wishlistedItems.length > 0 && <span style={s.navBadge}>{wishlistedItems.length}</span>}
        </button>
        <button style={{ ...s.navTab, ...(activeTab === 'cart' ? s.navTabActive : {}) }} onClick={() => onTabChange('cart')}>
          Cart {cartCount > 0 && <span style={s.navBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'cart' && (
        <CartTab cart={cart} catalogue={catalogue} onIncrement={onIncrementCart} onDecrement={onDecrementCart} onRemove={onRemoveFromCart}
          cartHighlight={cartHighlight} onCartHighlight={onCartHighlight} onCheckout={onCheckout} />
      )}
      {activeTab === 'wishlist' && (
        <WishlistTab items={wishlistedItems} catalogue={catalogue} onOpenModal={onOpenModal} onToggleWishlist={onToggleWishlist} />
      )}
      {activeTab === 'shop' && (
        <BrowseTab onPlace={onPlace} onOpenModal={onOpenModal} catalogue={catalogue} gridW={gridW} gridD={gridD} roomItemKeys={roomItemKeys} ownedKeys={ownedKeys} />
      )}

      {/* Seller's Hub footer */}
      <div style={{ padding: '8px 14px 14px', borderTop: `1px solid ${t.surfaceBorder}`, flexShrink: 0 }}>
        <div
          role="button" tabIndex={0}
          onClick={() => window.open('https://your-domain.com/sell', '_blank')}
          onKeyDown={e => e.key === 'Enter' && window.open('https://your-domain.com/sell', '_blank')}
          style={{
            padding: '8px 12px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1a4a2a 0%, #2a6a3a 100%)',
            border: '1px solid #3a9a5a', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0,120,60,0.3)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a0ffcc' }}>Seller's Hub</span>
            <span style={{ fontSize: 10, color: '#70cc99' }}>List your products on the marketplace</span>
          </div>
          <span style={{ fontSize: 14, color: '#a0ffcc' }}>→</span>
        </div>
      </div>

    </div>
  )
}
