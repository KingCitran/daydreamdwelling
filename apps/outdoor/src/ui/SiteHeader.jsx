export default function SiteHeader({ cartCount, onNavigate, currentPage }) {
  return (
    <header style={s.header}>
      <div style={s.inner}>
        <button style={s.logo} onClick={() => onNavigate('home')}>
          <span style={s.logoLeaf}>🌿</span>
          <span style={s.logoText}>DaydreamDwelling</span>
          <span style={s.logoSub}>Outdoor & Garden</span>
        </button>

        <nav style={s.nav}>
          <button style={{ ...s.navLink, ...(currentPage === 'home'   ? s.navActive : {}) }} onClick={() => onNavigate('home')}>Home</button>
          <button style={{ ...s.navLink, ...(currentPage === 'browse' ? s.navActive : {}) }} onClick={() => onNavigate('browse')}>Shop All</button>
          {[
            { label: 'Furniture',  cat: 'furniture' },
            { label: 'Planters',   cat: 'planters'  },
            { label: 'Lighting',   cat: 'lighting'  },
            { label: 'Decor',      cat: 'decor'     },
          ].map(({ label, cat }) => (
            <button key={cat} style={s.navLink} onClick={() => onNavigate('browse', { category: cat })}>{label}</button>
          ))}
        </nav>

        <button style={s.cartBtn} onClick={() => onNavigate('cart')}>
          🛒 Cart {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}

const s = {
  header:    { background: '#fff', borderBottom: '1px solid #e0dbd0', position: 'sticky', top: 0, zIndex: 100 },
  inner:     { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 24 },
  logo:      { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 },
  logoLeaf:  { fontSize: 22 },
  logoText:  { fontSize: 17, fontWeight: 700, color: '#2a3a1a' },
  logoSub:   { fontSize: 10, color: '#7a9a6a', fontWeight: 500, background: '#eef4ea', padding: '2px 7px', borderRadius: 10 },
  nav:       { display: 'flex', gap: 4, flex: 1 },
  navLink:   { background: 'none', border: 'none', color: '#5a6a4a', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' },
  navActive: { background: '#eef4ea', color: '#2a5a1a', fontWeight: 600 },
  cartBtn:   { display: 'flex', alignItems: 'center', gap: 6, background: '#2a5a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, flexShrink: 0, position: 'relative' },
  cartBadge: { background: '#ff6b3a', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 },
}
