import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { propAPI, leaseAPI, paymentAPI } from '../api/client'
import { Spinner, StatusBadge } from '../components/UI'

function fmt(n) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [props, setProps] = useState([])
  const [leases, setLeases] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      propAPI.list().catch(() => ({ data: [] })),
      leaseAPI.list().catch(() => ({ data: [] })),
      paymentAPI.list().catch(() => ({ data: [] })),
    ]).then(([p, l, pay]) => {
      setProps(p.data || [])
      setLeases(l.data || [])
      setPayments(pay.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>

  const totalRent = props.reduce((a, p) => a + (p.rent || 0), 0)
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your portfolio today.</p>
        </div>
      </div>

      {/* Stats */}
      {(user?.role === 'owner' || user?.role === 'manager') ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <div className="stat-label">Properties</div>
            <div className="stat-value">{props.length}</div>
            <div className="stat-sub">Total managed</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--accent3)' }}>
            <div className="stat-label">Active Leases</div>
            <div className="stat-value">{leases.length}</div>
            <div className="stat-sub">Across all properties</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div className="stat-label">Rent Roll</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{fmt(totalRent)}</div>
            <div className="stat-sub">Monthly expected</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
            <div className="stat-label">Collected</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{fmt(totalPaid)}</div>
            <div className="stat-sub">Total received</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <div className="stat-label">My Leases</div>
            <div className="stat-value">{leases.length}</div>
            <div className="stat-sub">Agreements</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div className="stat-label">Paid</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{fmt(totalPaid)}</div>
            <div className="stat-sub">Total payments</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-sub">All time</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Properties */}
        {user?.role !== 'tenant' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Recent Properties</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/properties')}>View all →</button>
            </div>
            {props.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>No properties yet.</p>
            ) : props.slice(0, 4).map(p => (
              <div key={p._id} onClick={() => navigate(`/properties/${p._id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>📍 {p.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent2)' }}>{fmt(p.rent)}/mo</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{p.leases?.length || 0} leases</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Payments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Payments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/payments')}>View all →</button>
          </div>
          {payments.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>No payments yet.</p>
          ) : payments.slice(0, 5).map(p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.property?.title || 'Property'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{fmtDate(p.createdAt || p.date)}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(p.amount)}</span>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Leases */}
        <div className="card" style={{ gridColumn: user?.role === 'tenant' ? 'span 1' : '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Leases</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leases')}>View all →</button>
          </div>
          {leases.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>No leases found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Document</th>
                </tr></thead>
                <tbody>
                  {leases.slice(0, 5).map(l => (
                    <tr key={l._id} onClick={() => navigate(`/leases/${l._id}`)}>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{l.property?.title || '—'}</td>
                      <td>{l.tenant?.name || '—'}</td>
                      <td>{fmtDate(l.startDate)}</td>
                      <td>{fmtDate(l.endDate)}</td>
                      <td>{l.document ? <a href={`http://localhost:5000/uploads/${l.document}`} target="_blank" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent3)', fontSize: 12 }}>📄 View</a> : <span style={{ color: 'var(--text3)', fontSize: 12 }}>No file</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
