import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { propAPI, leaseAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Modal, Alert, Spinner, EmptyState, Confirm } from '../components/UI'
import { PlacesAutocomplete } from '../components/Maps'

function fmt(n) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : '—' }

function CreatePropertyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', location: '', rent: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await propAPI.create({ ...form, rent: Number(form.rent) })
      onCreated(res.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Property" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Create Property'}
        </button>
      </>}>
      <div className="form-group"><label className="form-label">Title *</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="2BHK Apartment, Koramangala" /></div>
      <div className="form-group"><label className="form-label">Location *</label>
        <PlacesAutocomplete value={form.location} onChange={v => set('location', v)} /></div>
      <div className="form-group"><label className="form-label">Monthly Rent (₹) *</label>
        <input className="form-input" type="number" value={form.rent} onChange={e => set('rent', e.target.value)} placeholder="25000" /></div>
      <Alert>{error}</Alert>
    </Modal>
  )
}

function AssignTenantModal({ property, onClose, onDone }) {
  const [form, setForm] = useState({ tenantId: '', leaseStart: '', leaseEnd: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      await propAPI.assignTenant(property._id, {
        tenantId: form.tenantId,
        leaseStart: form.leaseStart,
        leaseEnd: form.leaseEnd,
      })
      onDone()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Assign Tenant" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Assign'}
        </button>
      </>}>
      <p style={{ fontSize: 13, color: 'var(--text3)' }}>Assigning to: <strong style={{ color: 'var(--text)' }}>{property.title}</strong></p>
      <div className="form-group"><label className="form-label">Tenant ID *</label>
        <input className="form-input" value={form.tenantId} onChange={e => set('tenantId', e.target.value)} placeholder="MongoDB ObjectId of tenant" /></div>
      <div className="form-group"><label className="form-label">Lease Start</label>
        <input className="form-input" type="date" value={form.leaseStart} onChange={e => set('leaseStart', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Lease End</label>
        <input className="form-input" type="date" value={form.leaseEnd} onChange={e => set('leaseEnd', e.target.value)} /></div>
      <Alert>{error}</Alert>
    </Modal>
  )
}

function EditPropertyModal({ property, onClose, onUpdated }) {
  const [form, setForm] = useState({ title: property.title, location: property.location, rent: property.rent })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await propAPI.update(property._id, { ...form, rent: Number(form.rent) })
      onUpdated(res.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Edit Property" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Save Changes'}
        </button>
      </>}>
      <div className="form-group"><label className="form-label">Title</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Location</label>
        <PlacesAutocomplete value={form.location} onChange={v => set('location', v)} /></div>
      <div className="form-group"><label className="form-label">Monthly Rent (₹)</label>
        <input className="form-input" type="number" value={form.rent} onChange={e => set('rent', e.target.value)} /></div>
      <Alert>{error}</Alert>
    </Modal>
  )
}

export default function PropertiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editProp, setEditProp] = useState(null)
  const [assignProp, setAssignProp] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [delLoading, setDelLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    propAPI.list().then(r => setProperties(r.data || [])).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await propAPI.delete(confirmDel)
      setProperties(p => p.filter(x => x._id !== confirmDel))
      setConfirmDel(null)
    } catch (e) { setError(e.message) }
    finally { setDelLoading(false) }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} found</p>
        </div>
        {user?.role === 'owner' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Property</button>
        )}
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : properties.length === 0 ? (
        <EmptyState icon="🏠" title="No properties yet" subtitle="Create your first property to get started." action={
          user?.role === 'owner' && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Add Property</button>
        } />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {properties.map(p => (
            <div key={p._id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/properties/${p._id}`)}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px', fontSize: 24 }}>🏠</div>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  {user?.role === 'owner' && <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAssignProp(p)} title="Assign Tenant">👤</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditProp(p)} title="Edit">✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(p._id)} title="Delete" style={{ color: 'var(--danger)' }}>🗑</button>
                  </>}
                </div>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>📍 {p.location}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent2)' }}>{fmt(p.rent)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>per month</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: 'var(--text2)' }}>{p.leases?.length || 0} lease{p.leases?.length !== 1 ? 's' : ''}</div>
                  {p.owner && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Owner: {p.owner.name}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreatePropertyModal onClose={() => setShowCreate(false)} onCreated={p => { setProperties(prev => [p, ...prev]); setShowCreate(false) }} />}
      {editProp && <EditPropertyModal property={editProp} onClose={() => setEditProp(null)} onUpdated={p => { setProperties(prev => prev.map(x => x._id === p._id ? p : x)); setEditProp(null) }} />}
      {assignProp && <AssignTenantModal property={assignProp} onClose={() => setAssignProp(null)} onDone={() => { setAssignProp(null); load() }} />}
      {confirmDel && <Confirm message="Delete this property? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}
    </div>
  )
}
