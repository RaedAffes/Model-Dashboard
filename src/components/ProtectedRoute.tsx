import { type ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function ProtectedRoute({
  children,
  role,
}: {
  children: ReactElement
  role?: 'admin' | 'user'
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen p-8 text-slate-200">Checking session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
