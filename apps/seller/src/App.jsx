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
import ModelReviewPage     from './pages/ModelReviewPage'
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
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        #root { height: 100%; }
        @media (min-width: 769px) {
          html, body { overflow: auto; }
          .ddd-seller-shell { min-height: 100vh; }
        }
        @media (max-width: 768px) {
          .ddd-seller-shell {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .ddd-seller-main {
            flex: 1 1 0 !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 16px 12px 16px !important;
            min-height: 0 !important;
          }
        }
      `}</style>
      <div className="ddd-seller-shell" style={{ display: 'flex', background: theme.bg }}>
        <NavBar page={page} onNavigate={navigate} />
        <main className="ddd-seller-main" style={{ flex: 1, padding: '36px 32px', overflowY: 'auto' }}>
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
          {page === 'model-review'    && <ModelReviewPage />}
        </main>
      </div>
    </>
  )
}

function Splash() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7878aa', fontSize: 14 }}>
      Loading…
    </div>
  )
}
