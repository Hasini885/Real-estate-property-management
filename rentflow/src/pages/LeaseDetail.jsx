import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leaseAPI, fileURL } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Spinner, Alert, InfoRow, FileInput, Modal } from '../components/UI'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }

export default function LeaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  useEffect(() => {
    leaseAPI.get(id).then(r => setLease(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  const handleUpload = async () => {
    if (!uploadFile) { setUploadErr('Select a file first'); return }
    setUploading(true); setUploadErr('')
    try {
      const res = await leaseAPI.uploadDoc(lease._id, uploadFile)
      setLease(res.data)
      setShowUpload(false)
    } catch (e) { setUploadErr(e.message) }
    finally { setUploading(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
  if (error) return <Alert>{error}</Alert>
  if (!lease) return null

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leases')} style={{ marginBottom: 16 }}>← Back to Leases</button>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Lease Agreement</h1>
          <p className="page-subtitle">{lease.property?.title} — {lease.tenant?.name}</p>
        </div>
        {user?.role === 'owner' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
            {lease.document ? '↑ Re-upload Doc' : '↑ Upload Doc'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 className="section-title">Lease Info</h3>
          <InfoRow label="Lease ID" value={lease._id} mono />
          <InfoRow label="Start Date" value={fmtDate(lease.startDate)} />
          <InfoRow label="End Date" value={fmtDate(lease.endDate)} />
          <InfoRow label="Status" value={
            new Date(lease.endDate) > new Date() ? '🟢 Active' : '🔴 Expired'
          } />
        </div>

        <div className="card">
          <h3 className="section-title">Tenant Info</h3>
          <InfoRow label="Name" value={lease.tenant?.name} />
          <InfoRow label="Email" value={lease.tenant?.email} />
          <InfoRow label="Role" value={lease.tenant?.role} />
          <InfoRow label="Tenant ID" value={lease.tenant?._id} mono />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 className="section-title">Property Info</h3>
          <InfoRow label="Title" value={lease.property?.title} />
          <InfoRow label="Location" value={lease.property?.location} />
          <InfoRow label="Rent" value={lease.property?.rent ? `₹${lease.property.rent.toLocaleString('en-IN')}/mo` : '—'} />
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/properties/${lease.property?._id}`)}>
              View Property →
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Lease Document</h3>
          {lease.document ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>📄</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{lease.document}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>PDF Document</div>
                </div>
              </div>
              <a href={fileURL(lease.document)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                Open PDF ↗
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📄</div>
              <p style={{ fontSize: 14 }}>No document uploaded yet.</p>
              {user?.role === 'owner' && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)} style={{ marginTop: 12 }}>
                  Upload Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <Modal title="Upload Lease Document" onClose={() => setShowUpload(false)}
          footer={<>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowUpload(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploading || !uploadFile}>
              {uploading ? <Spinner size={14} /> : 'Upload'}
            </button>
          </>}>
          <div className="form-group"><label className="form-label">PDF File</label>
            <FileInput onChange={setUploadFile} /></div>
          <Alert>{uploadErr}</Alert>
        </Modal>
      )}
    </div>
  )
}
