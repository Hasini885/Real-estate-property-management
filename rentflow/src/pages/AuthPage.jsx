import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, Spinner } from '../components/UI'

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' })

  if (user) return <Navigate to="/dashboard" replace />

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      }
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)', borderRadius: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 16
          }}>⌂</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>RentFlow</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 6 }}>Property management, simplified.</p>
        </div>

        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none',
                background: tab === t ? 'var(--surface2)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text3)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', transition: 'var(--transition)', textTransform: 'capitalize'
              }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="tenant">Tenant</option>
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            )}
            <Alert type="error">{error}</Alert>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}>
              {loading ? <Spinner size={18} /> : (tab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: 13 }}>
            {tab === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
