import { useState } from 'react'
import { AuthProvider, useAuth } from '@shared/auth/AuthContext'
import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import ProductsPage   from './pages/ProductsPage'
import AddProductPage from './pages/AddProductPage'
import OrdersPage     from './pages/OrdersPage'
import EarningsPage   from './pages/EarningsPage'
import NavBar         from './ui/NavBar'

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}

function Shell() {
  const { user, loading } = useAuth()
  const [page, setPage]   = useState('dashboard')
  const [editProductId, setEditProductId] = useState(null)

  if (loading) return <Splash />
  if (!user)   return <LoginPage />

  function navigate(p, opts = {}) {
    setEditProductId(opts.editProductId ?? null)
    setPage(p)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <NavBar page={page} onNavigate={navigate} />
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
        {page === 'dashboard'   && <DashboardPage onNavigate={navigate} />}
        {page === 'products'    && <ProductsPage  onNavigate={navigate} />}
        {page === 'add-product' && <AddProductPage productId={editProductId} onDone={() => navigate('products')} />}
        {page === 'orders'      && <OrdersPage />}
        {page === 'earnings'    && <EarningsPage />}
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
