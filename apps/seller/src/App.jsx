import { useState } from 'react'
import { AuthProvider, useAuth } from '@shared/auth/AuthContext'
import { ThemeProvider, useTheme } from '@shared/ThemeProvider'
import LoginPage           from './pages/LoginPage'
import DashboardPage       from './pages/DashboardPage'
import ProductsPage        from './pages/ProductsPage'
import AddProductPage      from './pages/AddProductPage'
import OrdersPage          from './pages/OrdersPage'
import ShippingHistoryPage from './pages/ShippingHistoryPage'
import MessagesPage        from './pages/MessagesPage'
import EarningsPage        from './pages/EarningsPage'
import SettingsPage        from './pages/SettingsPage'
import NotificationsPage   from './pages/NotificationsPage'
import ReviewsPage         from './pages/ReviewsPage'
import ToolsPage           from './pages/ToolsPage'
import SellerShopPage      from './pages/SellerShopPage'
import DiscountCodesPage   from './pages/DiscountCodesPage'
import PromotedPage        from './pages/PromotedPage'
import NavBar              from './ui/NavBar'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider appKey="seller">
        <Shell />
      </ThemeProvider>
    </AuthProvider>
  )
}

function Shell() {
  const { user, loading } = useAuth()
  const theme = useTheme()
  const [page, setPage]             = useState('dashboard')
  const [editProductId, setEditProductId] = useState(null)

  if (loading) return <Splash />
  if (!user)   return <LoginPage />

  function navigate(p, opts = {}) {
    setEditProductId(opts.editProductId ?? null)
    setPage(p)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
      <NavBar page={page} onNavigate={navigate} />
      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto' }}>
        {page === 'dashboard'       && <DashboardPage onNavigate={navigate} />}
        {page === 'products'        && <ProductsPage  onNavigate={navigate} />}
        {page === 'add-product'     && <AddProductPage productId={editProductId} onDone={() => navigate('products')} />}
        {page === 'orders'          && <OrdersPage onNavigate={navigate} />}
        {page === 'shipping'        && <ShippingHistoryPage />}
        {page === 'messages'        && <MessagesPage />}
        {page === 'earnings'        && <EarningsPage />}
        {page === 'settings'        && <SettingsPage />}
        {page === 'notifications'   && <NotificationsPage />}
        {page === 'reviews'         && <ReviewsPage />}
        {page === 'tools'           && <ToolsPage onNavigate={navigate} />}
        {page === 'shop'            && <SellerShopPage />}
        {page === 'discounts'       && <DiscountCodesPage />}
        {page === 'promoted'        && <PromotedPage />}
      </main>
    </div>
  )
}

function Splash() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7878aa', fontSize: 14 }}>
      Loading…
    </div>
  )
}
