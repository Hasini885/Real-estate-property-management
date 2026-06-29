import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { leaseAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Modal, Alert, Spinner, EmptyState, FileInput } from '../components/UI'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }

function CreateLeaseModal({ prefillPropertyId, onClose, onCreated }) {
  const [form, setForm] = useState({ tenantId: '', propertyId: prefillPropertyId || '', startDate: '', endDate: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await leaseAPI.create(form)
      onCreated(res.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Create Lease" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Create Lease'}
        </button>
      </>}>
      <div className="form-group"><label className="form-label">Tenant ID *</label>
        <input className="form-input" value={form.tenantId} onChange={e => set('tenantId', e.target.value)} placeholder="MongoDB ObjectId" /></div>
      <div className="form-group"><label className="form-label">Property ID *</label>
        <input className="form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)} placeholder="MongoDB ObjectId" /></div>
      <div className="form-group"><label className="form-label">Start Date</label>
        <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">End Date</label>
        <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
      <Alert>{error}</Alert>
    </Modal>
  )
}

function UploadDocModal({ lease, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!file) { setError('Please select a PDF file.'); return }
    setError(''); setLoading(true)
    try {
      const res = await leaseAPI.uploadDoc(lease._id, file)
      onUploaded(res.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Upload Lease Document" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading || !file}>
          {loading ? <Spinner size={14} /> : 'Upload'}
        </button>
      </>}>
      <p style={{ fontSize: 13, color: 'var(--text3)' }}>Lease: <strong style={{ color: 'var(--text)' }}>{lease.property?.title || lease._id}</strong></p>
      <div className="form-group"><label className="form-label">PDF Document</label>
        <FileInput onChange={setFile} /></div>
      <Alert>{error}</Alert>
    </Modal>
  )
}

export default function LeasesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefillPropertyId = searchParams.get('propertyId')
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(!!prefillPropertyId)
  const [uploadLease, setUploadLease] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    leaseAPI.list().then(r => setLeases(r.data || [])).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Leases</h1>
          <p className="page-subtitle">{leases.length} lease agreement{leases.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'owner' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Lease</button>
        )}
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : leases.length === 0 ? (
        <EmptyState icon="📋" title="No leases found" subtitle="Create a lease agreement to get started." action={
          user?.role === 'owner' && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Lease</button>
        } />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Start</th>
                <th>End</th>
                <th>Document</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {leases.map(l => (
                  <tr key={l._id} onClick={() => navigate(`/leases/${l._id}`)}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{l.property?.title || '—'}</td>
                    <td>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{l.tenant?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{l.tenant?.email || ''}</div>
                    </td>
                    <td>{fmtDate(l.startDate)}</td>
                    <td>{fmtDate(l.endDate)}</td>
                    <td>
                      {l.document
                        ? <a href={`http://localhost:5000/uploads/${l.document}`} target="_blank" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent3)', fontSize: 12 }}>📄 PDF</a>
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>None</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {user?.role === 'owner' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setUploadLease(l)} style={{ fontSize: 12 }}>
                          {l.document ? '↑ Re-upload' : '↑ Upload'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateLeaseModal
          prefillPropertyId={prefillPropertyId}
          onClose={() => setShowCreate(false)}
          onCreated={l => { setLeases(prev => [l, ...prev]); setShowCreate(false) }}
        />
      )}

      {uploadLease && (
        <UploadDocModal
          lease={uploadLease}
          onClose={() => setUploadLease(null)}
          onUploaded={updated => {
            setLeases(prev => prev.map(l => l._id === updated._id ? updated : l))
            setUploadLease(null)
          }}
        />
      )}
    </div>
  )
}
