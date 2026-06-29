import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('rf_user')
    const token = localStorage.getItem('rf_token')
    if (raw && token) setUser(JSON.parse(raw))
    setLoading(false)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('rf_token', res.data.token)
    // We need user info — re-use register flow or store from register
    // Backend only returns token on login; check if user stored
    const stored = localStorage.getItem('rf_user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u.email === email) { setUser(u); return u }
    }
    // Fallback: decode token payload (JWT)
    const payload = JSON.parse(atob(res.data.token.split('.')[1]))
    const u = { id: payload.id, name: payload.name || email, email, role: payload.role }
    localStorage.setItem('rf_user', JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('rf_token', res.data.token)
    localStorage.setItem('rf_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('rf_token')
    localStorage.removeItem('rf_user')
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
