import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RoleBadge } from './UI'

const navItems = {
  owner: [
    { to: '/dashboard', icon: '⊡', label: 'Dashboard' },
    { to: '/properties', icon: '🏠', label: 'Properties' },
    { to: '/leases', icon: '📋', label: 'Leases' },
    { to: '/payments', icon: '💳', label: 'Payments' },
  ],
  manager: [
    { to: '/dashboard', icon: '⊡', label: 'Dashboard' },
    { to: '/properties', icon: '🏠', label: 'Properties' },
    { to: '/leases', icon: '📋', label: 'Leases' },
    { to: '/payments', icon: '💳', label: 'Payments' },
  ],
  tenant: [
    { to: '/dashboard', icon: '⊡', label: 'Dashboard' },
    { to: '/leases', icon: '📋', label: 'My Leases' },
    { to: '/payments', icon: '💳', label: 'Payments' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = navItems[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '0', position: 'fixed',
      left: 0, top: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18
          }}>⌂</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            RentFlow
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', padding: '0 8px 10px', textTransform: 'uppercase' }}>Menu</div>
        {items.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, marginBottom: 2,
            color: isActive ? 'var(--text)' : 'var(--text2)',
            background: isActive ? 'var(--surface)' : 'transparent',
            fontWeight: isActive ? 500 : 400, fontSize: 14,
            textDecoration: 'none', transition: 'var(--transition)',
            borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          })}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{user?.email}</div>
          <RoleBadge role={user?.role} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
