import { useState } from 'react'
import { AuthProvider } from '@shared/auth/AuthContext'
import SiteHeader  from './ui/SiteHeader'
import HomePage    from './pages/HomePage'
import BrowsePage  from './pages/BrowsePage'
import ProductPage from './pages/ProductPage'
import CartPage    from './pages/CartPage'
import useCart     from './hooks/useCart'

export default function App() {
  return (
    <AuthProvider>
      <OutdoorApp />
    </AuthProvider>
  )
}

function OutdoorApp() {
  const [page,      setPage]      = useState('home')
  const [pageProps, setPageProps] = useState({})
  const cart = useCart()

  function navigate(p, props = {}) {
    setPage(p)
    setPageProps(props)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader cartCount={cart.cartCount} onNavigate={navigate} currentPage={page} />
      <main style={{ flex: 1 }}>
        {page === 'home'    && <HomePage    onNavigate={navigate} />}
        {page === 'browse'  && <BrowsePage  onNavigate={navigate} category={pageProps.category} />}
        {page === 'product' && <ProductPage onNavigate={navigate} productId={pageProps.productId} cart={cart} />}
        {page === 'cart'    && <CartPage    onNavigate={navigate} cart={cart} />}
      </main>
      <footer style={s.footer}>
        <p>© 2025 DaydreamDwelling · <span style={{ color: '#7a9a6a' }}>Outdoor & Garden</span></p>
      </footer>
    </div>
  )
}

const s = {
  footer: { padding: '24px 40px', background: '#2a3a1a', color: '#aabba0', fontSize: 12, textAlign: 'center', marginTop: 'auto' },
}
