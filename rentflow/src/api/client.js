import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('rf_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
}

// Properties
export const propAPI = {
  list: () => api.get('/api/properties'),
  get: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  delete: (id) => api.delete(`/api/properties/${id}`),
  assignTenant: (id, data) => api.put(`/api/properties/assign/${id}`, data),
}

// Leases
export const leaseAPI = {
  list: () => api.get('/api/leases'),
  get: (id) => api.get(`/api/leases/${id}`),
  create: (data) => api.post('/api/leases', data),
  uploadDoc: (leaseId, file) => {
    const fd = new FormData()
    fd.append('leaseId', leaseId)
    fd.append('file', file)
    return api.post('/api/leases/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// Payments
export const paymentAPI = {
  list: () => api.get('/api/payments'),
  createOrder: (amount) => api.post('/api/payments/create-order', { amount }),
  verify: (data) => api.post('/api/payments/verify', data),
  add: (data) => api.post('/api/payments', data),
}

export const fileURL = (filename) => `${BASE_URL}/uploads/${filename}`

export default api
