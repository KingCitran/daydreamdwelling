import { useState } from 'react'
import { AuthProvider } from '@shared/auth/AuthContext'
import { ThemeProvider, useTheme } from '@shared/ThemeProvider'
import SiteHeader  from './ui/SiteHeader'
import HomePage    from './pages/HomePage'
import BrowsePage  from './pages/BrowsePage'
import ProductPage from './pages/ProductPage'
import CartPage    from './pages/CartPage'
import useCart     from './hooks/useCart'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider appKey="outdoor">
        <OutdoorApp />
      </ThemeProvider>
    </AuthProvider>
  )
}

function OutdoorApp() {
  const theme = useTheme()
  const [page,      setPage]      = useState('home')
  const [pageProps, setPageProps] = useState({})
  const cart = useCart()

  function navigate(p, props = {}) {
    setPage(p)
    setPageProps(props)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.text }}>
      <SiteHeader cartCount={cart.cartCount} onNavigate={navigate} currentPage={page} />
      <main style={{ flex: 1 }}>
        {page === 'home'    && <HomePage    onNavigate={navigate} />}
        {page === 'browse'  && <BrowsePage  onNavigate={navigate} category={pageProps.category} />}
        {page === 'product' && <ProductPage onNavigate={navigate} productId={pageProps.productId} cart={cart} />}
        {page === 'cart'    && <CartPage    onNavigate={navigate} cart={cart} />}
      </main>
      <footer style={{ padding: '24px 40px', background: theme.surface, borderTop: `1px solid ${theme.surfaceBorder}`, color: theme.textSoft, fontSize: 12, textAlign: 'center', marginTop: 'auto' }}>
        <p>© {new Date().getFullYear()} DaydreamDwelling · <span style={{ color: theme.accent }}>Outdoor & Garden</span></p>
      </footer>
    </div>
  )
}
