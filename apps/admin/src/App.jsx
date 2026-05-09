import { useState } from 'react'
import { AuthProvider, useAuth } from '@shared/auth/AuthContext'
import { ThemeProvider, useTheme } from '@shared/ThemeProvider'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ContestManagerPage from './pages/ContestManagerPage'
import ArtistApprovalPage from './pages/ArtistApprovalPage'
import ArchivePage from './pages/ArchivePage'
import NavBar from './ui/NavBar'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider appKey="admin">
        <Shell />
      </ThemeProvider>
    </AuthProvider>
  )
}

function Shell() {
  const { user, loading } = useAuth()
  const theme = useTheme()
  const [page, setPage] = useState('dashboard')

  if (loading) return <Splash />
  if (!user) return <LoginPage />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
      <NavBar page={page} onNavigate={setPage} />
      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto' }}>
        {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        {page === 'contests' && <ContestManagerPage />}
        {page === 'artists' && <ArtistApprovalPage />}
        {page === 'archive' && <ArchivePage />}
      </main>
    </div>
  )
}

function Splash() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7878aa', fontSize: 14 }}>
      Loading...
    </div>
  )
}
