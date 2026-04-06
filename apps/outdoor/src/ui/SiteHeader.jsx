import { useTheme } from '@shared/ThemeProvider'

export default function SiteHeader({ cartCount, onNavigate, currentPage }) {
  const theme = useTheme()

  return (
    <header style={{ background: theme.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${theme.navBorder}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', gap: 24 }}>

        <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }} onClick={() => onNavigate('home')}>
          <span style={{ fontSize: 18, color: theme.accent }}>✦</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>DaydreamDwelling</div>
            <div style={{ fontSize: 9, color: theme.textSoft, fontWeight: 500, letterSpacing: '0.5px' }}>Outdoor & Garden</div>
          </div>
        </button>

        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[
            { label: 'Home',      page: 'home'   },
            { label: 'Shop All',  page: 'browse' },
            { label: 'Furniture', page: 'browse', cat: 'furniture' },
            { label: 'Planters',  page: 'browse', cat: 'planters'  },
            { label: 'Lighting',  page: 'browse', cat: 'lighting'  },
            { label: 'Decor',     page: 'browse', cat: 'decor'     },
          ].map(({ label, page, cat }) => {
            const isActive = currentPage === page && !cat
            return (
              <button
                key={label}
                style={{ background: isActive ? `${theme.accent}18` : 'none', border: 'none', color: isActive ? theme.accent : theme.textSoft, fontSize: 13, fontWeight: isActive ? 600 : 500, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                onClick={() => onNavigate(page, cat ? { category: cat } : {})}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <button
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.accent, color: theme.accentText, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, flexShrink: 0, cursor: 'pointer', position: 'relative' }}
          onClick={() => onNavigate('cart')}
        >
          <span>Cart</span>
          {cartCount > 0 && (
            <span style={{ background: '#ff6b3a', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
