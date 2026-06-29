import { useState, useEffect } from 'react'
import { paymentAPI, propAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Modal, Alert, Spinner, EmptyState, StatusBadge } from '../components/UI'

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

function fmt(n) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) }
function fmtDate(d) { return d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' }

function loadRazorpay() {
  return new Promise(res => {
    if (window.Razorpay) { res(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => res(true)
    s.onerror = () => res(false)
    document.body.appendChild(s)
  })
}

function PaymentModal({ onClose, onSuccess, user, properties }) {
  const [form, setForm] = useState({ propertyId: '', amount: '', mode: 'razorpay', status: 'paid' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRazorpay = async () => {
    if (!form.propertyId || !form.amount) { setError('Fill in property and amount.'); return }
    setError(''); setLoading(true)
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Razorpay SDK failed to load')

      const orderRes = await paymentAPI.createOrder(Number(form.amount))
      const order = orderRes.data

      if (!RAZORPAY_KEY) throw new Error('VITE_RAZORPAY_KEY_ID not configured. Set it in .env.local')

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'RentFlow',
          description: `Payment for property`,
          prefill: { name: user.name, email: user.email },
          theme: { color: '#6c63ff' },
          handler: async (response) => {
            try {
              const verRes = await paymentAPI.verify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                propertyId: form.propertyId,
                amount: Number(form.amount),
                status: 'paid',
              })
              resolve(verRes.data)
            } catch (e) { reject(e) }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        })
        rzp.open()
      }).then(payment => {
        onSuccess(payment)
      })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleManual = async () => {
    if (!form.propertyId || !form.amount) { setError('Fill in property and amount.'); return }
    setError(''); setLoading(true)
    try {
      const res = await paymentAPI.add({ propertyId: form.propertyId, amount: Number(form.amount), status: form.status })
      onSuccess(res.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Add Payment" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        {form.mode === 'razorpay'
          ? <button className="btn btn-primary btn-sm" onClick={handleRazorpay} disabled={loading}>{loading ? <Spinner size={14} /> : '💳 Pay via Razorpay'}</button>
          : <button className="btn btn-primary btn-sm" onClick={handleManual} disabled={loading}>{loading ? <Spinner size={14} /> : 'Add Payment'}</button>
        }
      </>}>

      <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 8, padding: 4, marginBottom: 4 }}>
        {['razorpay', 'manual'].map(m => (
          <button key={m} onClick={() => set('mode', m)} style={{
            flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none',
            background: form.mode === m ? 'var(--surface2)' : 'transparent',
            color: form.mode === m ? 'var(--text)' : 'var(--text2)',
            fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'var(--transition)'
          }}>
            {m === 'razorpay' ? '💳 Razorpay' : '📝 Manual'}
          </button>
        ))}
      </div>

      <div className="form-group"><label className="form-label">Property</label>
        <select className="form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)}>
          <option value="">Select property…</option>
          {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Amount (₹)</label>
        <input className="form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="25000" /></div>
      {form.mode === 'manual' && (
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      )}
      {form.mode === 'razorpay' && !RAZORPAY_KEY && (
        <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--warning)' }}>
          ⚠ Set <code>VITE_RAZORPAY_KEY_ID</code> in <code>.env.local</code> to enable Razorpay Checkout
        </div>
      )}
      <Alert>{error}</Alert>
    </Modal>
  )
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      paymentAPI.list().catch(() => ({ data: [] })),
      propAPI.list().catch(() => ({ data: [] })),
    ]).then(([p, pr]) => {
      setPayments(p.data || [])
      setProperties(pr.data || [])
    }).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, p) => a + (p.amount || 0), 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
        </div>
        {(user?.role === 'tenant' || user?.role === 'owner') && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Payment</button>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="stat-label">Total Paid</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{fmt(totalPaid)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{fmt(totalPending)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{payments.length}</div>
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" subtitle="Add a payment to get started." action={
          user?.role === 'tenant' && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Payment</button>
        } />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Payment ID</th>
              </tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{p.property?.title || '—'}</td>
                    <td>{p.tenant?.name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent2)' }}>{fmt(p.amount)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontSize: 12 }}>{fmtDate(p.createdAt || p.date)}</td>
                    <td style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>{p.payment_id || p._id?.slice(-8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <PaymentModal
          user={user}
          properties={properties}
          onClose={() => setShowAdd(false)}
          onSuccess={p => { setPayments(prev => [p, ...prev]); setShowAdd(false) }}
        />
      )}
    </div>
  )
}
