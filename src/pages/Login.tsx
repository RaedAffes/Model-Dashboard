import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        await signup(username, password)
      } else {
        await login(username, password)
      }
      navigate('/', { replace: true })
    } catch {
      setError(mode === 'signup' ? 'Could not create account. Username may already exist.' : 'Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-app-border bg-app-card p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Secure Access</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">{mode === 'signin' ? 'Dashboard Login' : 'Create Account'}</h1>
        <p className="mt-1 text-sm text-app-muted">
          {mode === 'signin' ? 'Sign in as admin or user' : 'Sign up for a user account'}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'signin' ? 'bg-cyan-700 text-white' : 'text-slate-300'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'signup' ? 'bg-cyan-700 text-white' : 'text-slate-300'}`}
          >
            Sign up
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Password"
            required
          />
          {mode === 'signup' ? (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Confirm Password"
              required
            />
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-500 disabled:opacity-60"
        >
          {loading ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
