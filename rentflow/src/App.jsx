import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetail from './pages/PropertyDetail'
import LeasesPage from './pages/LeasesPage'
import LeaseDetail from './pages/LeaseDetail'
import PaymentsPage from './pages/PaymentsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="leases" element={<LeasesPage />} />
            <Route path="leases/:id" element={<LeaseDetail />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
