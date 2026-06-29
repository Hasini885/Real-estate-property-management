import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import { Spinner } from './UI'

export default function Layout() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spinner size={40} /></div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, padding: '32px 36px', minHeight: '100vh', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
