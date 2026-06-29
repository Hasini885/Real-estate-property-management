import { useState } from 'react'

// Modal
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '20px', padding: '4px 8px' }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// Alert
export function Alert({ type = 'error', children }) {
  if (!children) return null
  return <div className={`alert alert-${type}`}><span>{type === 'error' ? '⚠' : '✓'}</span><span>{children}</span></div>
}

// Spinner
export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}

// Empty state
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p style={{ marginBottom: 20 }}>{subtitle}</p>}
      {action}
    </div>
  )
}

// Role badge
export function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{role}</span>
}

// Status badge
export function StatusBadge({ status }) {
  const map = {
    paid: 'success', pending: 'warning', failed: 'danger',
    active: 'success', expired: 'warning'
  }
  const cls = map[status?.toLowerCase()] || 'warning'
  return <span className={`badge badge-${cls}`}>{status}</span>
}

// Confirm dialog
export function Confirm({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel} footer={
      <>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Confirm'}
        </button>
      </>
    }>
      <p style={{ color: 'var(--text2)' }}>{message}</p>
    </Modal>
  )
}

// File upload input
export function FileInput({ onChange, accept = '.pdf', label = 'Upload PDF' }) {
  const [name, setName] = useState('')
  return (
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <span style={{ background: 'var(--accent)', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>Choose file</span>
        <span style={{ color: name ? 'var(--text)' : 'var(--text3)', fontSize: 13 }}>{name || 'No file chosen'}</span>
      </div>
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => {
        const f = e.target.files[0]
        if (f) { setName(f.name); onChange(f) }
      }} />
    </label>
  )
}

// Section header with action
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h3 className="section-title" style={{ margin: 0 }}>{title}</h3>
      {action}
    </div>
  )
}

// Info row
export function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text3)', minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)', textAlign: 'right', fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
    </div>
  )
}
