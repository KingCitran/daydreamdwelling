import { memo } from 'react'
import { ShoppingBag, Heart, ShoppingCart, Store } from 'lucide-react'

// Top-right cluster — shopping access. Mirrors the side-tab + bottom-cluster
// pill style. When the shop right-rail is open the cluster collapses to
// icons-only so it doesn't dominate the canvas; when closed, full labels.
//
// Memoized with custom equality so it skips re-render when AppInner re-renders
// for unrelated state (e.g. item moves) — only data props matter, function
// refs change every render.

function TopRightClusterImpl({
  onShop, onWishlist, onCart, onMarketplace,
  cartCount = 0,
  shopOpen = false,
}) {
  const compact = shopOpen
  return (
    <>
      <style>{`
        .ddd-top-right-tab,
        .ddd-top-right-tab * {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
      `}</style>
      <aside style={{
        position: 'absolute', top: 76, right: 24, zIndex: 90,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <ClusterTab onClick={onShop}        Icon={ShoppingBag}  label="Shop"        accent="#f0a8d8" active={shopOpen} compact={compact} />
        <ClusterTab onClick={onWishlist}    Icon={Heart}        label="Wishlist"    accent="#ff9ab8" compact={compact} />
        <ClusterTab onClick={onCart}        Icon={ShoppingCart} label="Cart"        accent="#ffc87a" badge={cartCount} compact={compact} />
        <ClusterTab onClick={onMarketplace} Icon={Store}        label="Marketplace" accent="#88d8b0" compact={compact} />
      </aside>
    </>
  )
}

function ClusterTab({ onClick, Icon, label, accent, active, badge, compact }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="ddd-top-right-tab"
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: compact ? 0 : 10,
        padding: compact ? '10px' : '10px 16px 10px 12px',
        minHeight: 52,
        borderRadius: 14,
        border: `1px solid ${active ? accent : `${accent}33`}`,
        background: active ? `${accent}28` : 'rgba(15,12,30,0.45)',
        color: '#f0eaff',
        cursor: 'pointer',
        fontSize: 14, fontWeight: 700,
        fontFamily: "'Outfit', system-ui, sans-serif",
        letterSpacing: '0.3px',
        backdropFilter: 'blur(10px)',
        transition: 'gap 0.2s ease, padding 0.2s ease',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: accent, color: '#1a0f30',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Icon && <Icon size={16} strokeWidth={2.2} />}
      </span>
      {!compact && <span>{label}</span>}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          width: 18, height: 18, borderRadius: '50%',
          background: accent, color: '#1a0f30',
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(15,12,30,0.85)',
        }}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  )
}

const TopRightCluster = memo(TopRightClusterImpl, (a, b) =>
  a.shopOpen === b.shopOpen && a.cartCount === b.cartCount
)
export default TopRightCluster
