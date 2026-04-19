import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getAuthToken, getMe, login as loginApi, setAuthToken, signup as signupApi } from '../services/api'
import type { UserInfo } from '../types'

type AuthContextValue = {
  user: UserInfo | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string): Promise<void> {
    const token = await loginApi({ username, password })
    setAuthToken(token.access_token)
    const profile = await getMe()
    setUser(profile)
  }

  async function signup(username: string, password: string): Promise<void> {
    const token = await signupApi({ username, password })
    setAuthToken(token.access_token)
    const profile = await getMe()
    setUser(profile)
  }

  function logout(): void {
    setAuthToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
