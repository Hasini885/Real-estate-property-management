import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { propAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Spinner, Alert, InfoRow } from '../components/UI'
import { PropertyMap } from '../components/Maps'

function fmt(n) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    propAPI.get(id).then(r => setProperty(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
  if (error) return <Alert>{error}</Alert>
  if (!property) return null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/properties')} style={{ marginBottom: 8 }}>← Back</button>
          <h1 className="page-title">{property.title}</h1>
          <p className="page-subtitle">📍 {property.location}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--accent2)' }}>{fmt(property.rent)}</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>per month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Property Info */}
        <div className="card">
          <h3 className="section-title">Property Details</h3>
          <InfoRow label="Title" value={property.title} />
          <InfoRow label="Location" value={property.location} />
          <InfoRow label="Monthly Rent" value={fmt(property.rent)} />
          <InfoRow label="Owner" value={property.owner?.name || '—'} />
          <InfoRow label="Owner Email" value={property.owner?.email || '—'} />
          <InfoRow label="Property ID" value={property._id} mono />
        </div>

        {/* Map */}
        <div className="card">
          <h3 className="section-title">Location</h3>
          <PropertyMap location={property.location} />
        </div>
      </div>

      {/* Leases */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Leases ({property.leases?.length || 0})</h3>
          {user?.role === 'owner' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/leases?propertyId=${property._id}`)}>
              + Add Lease
            </button>
          )}
        </div>

        {!property.leases?.length ? (
          <p style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No leases attached to this property.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Tenant</th>
                <th>Email</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Document</th>
                <th></th>
              </tr></thead>
              <tbody>
                {property.leases.map(l => (
                  <tr key={l._id} onClick={() => navigate(`/leases/${l._id}`)}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{l.tenant?.name || '—'}</td>
                    <td>{l.tenant?.email || '—'}</td>
                    <td>{fmtDate(l.startDate)}</td>
                    <td>{fmtDate(l.endDate)}</td>
                    <td>
                      {l.document
                        ? <a href={`http://localhost:5000/uploads/${l.document}`} target="_blank" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent3)', fontSize: 12 }}>📄 View PDF</a>
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>None</span>}
                    </td>
                    <td style={{ color: 'var(--accent2)', fontSize: 13 }}>Details →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
