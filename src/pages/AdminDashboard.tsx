import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createAdminUser, getAdminOverview, getAdminUsers, getAdminUsersMonitor } from '../services/api'
import type { AdminOverview, AdminUserMonitor, UserInfo } from '../types'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<UserInfo[]>([])
  const [monitors, setMonitors] = useState<AdminUserMonitor[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  async function refresh() {
    setRefreshing(true)
    setRefreshError('')
    try {
      const [overviewData, usersData, monitorData] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminUsersMonitor(),
      ])
      setOverview(overviewData)
      setUsers(usersData)
      setMonitors(monitorData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      setRefreshError(detail ? `Refresh failed: ${detail}` : 'Refresh failed. Re-login may be required.')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refresh()

    const intervalId = setInterval(() => {
      refresh()
    }, 10000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  async function onCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    try {
      await createAdminUser({ username, password, role })
      setUsername('')
      setPassword('')
      setRole('user')
      setMessage('User created successfully.')
      refresh()
    } catch {
      setMessage('Could not create user. Username may already exist.')
    }
  }

  return (
    <div className="min-h-screen bg-app-bg p-4 text-slate-100 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Admin Console</p>
          <h1 className="text-2xl font-semibold">Welcome, {user?.username}</h1>
          <p className="mt-1 text-xs text-slate-400">Last update: {lastUpdated || 'loading...'}</p>
          {refreshError ? <p className="mt-1 text-xs text-rose-300">{refreshError}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="rounded-lg border border-cyan-700 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-900/30 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={logout} className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card label="Total Users" value={overview?.total_users ?? 0} />
        <Card label="Admin Users" value={overview?.admin_users ?? 0} />
        <Card label="Normal Users" value={overview?.normal_users ?? 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-app-border bg-app-card p-5">
          <h2 className="text-lg font-medium">Create User</h2>
          <form onSubmit={onCreateUser} className="mt-4 space-y-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2"
              placeholder="Username"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2"
              placeholder="Password"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className="w-full rounded-lg border border-slate-700 bg-app-bg px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500">Create</button>
            {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
          </form>
        </section>

        <section className="rounded-xl border border-app-border bg-app-card p-5">
          <h2 className="text-lg font-medium">Users</h2>
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2">Username</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-t border-slate-700/60">
                    <td className="py-2">{row.username}</td>
                    <td className="py-2">{row.role}</td>
                    <td className="py-2">{row.is_active ? 'active' : 'inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-app-border bg-app-card p-5">
        <h2 className="text-lg font-medium">User Monitoring and Alerts</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2">User</th>
                <th className="pb-2">CSV Loaded</th>
                <th className="pb-2">Anomalies</th>
                <th className="pb-2">Days</th>
                <th className="pb-2">Alert</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {monitors.map((row) => (
                <tr key={row.user_id} className="border-t border-slate-700/60">
                  <td className="py-2">{row.username}</td>
                  <td className="py-2">{row.csv_loaded}</td>
                  <td className="py-2">{row.anomaly_count}</td>
                  <td className="py-2">{row.anomaly_days.slice(0, 4).join(', ') || '-'}</td>
                  <td className="py-2">
                    {row.has_alert ? (
                      <span className="rounded-full bg-rose-600/20 px-2 py-1 text-rose-300">Alert</span>
                    ) : (
                      <span className="rounded-full bg-emerald-600/20 px-2 py-1 text-emerald-300">Normal</span>
                    )}
                  </td>
                  <td className="py-2">
                    <a
                      href={row.contact_link}
                      className="rounded-md border border-cyan-700 px-2 py-1 text-cyan-300 hover:bg-cyan-900/30"
                    >
                      Contact
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
