import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getUserUploads, uploadUserCsv } from '../services/api'
import type { UserUploadItem } from '../types'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [uploads, setUploads] = useState<UserUploadItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function refreshUploads() {
    getUserUploads().then(setUploads)
  }

  useEffect(() => {
    refreshUploads()
  }, [])

  async function onUpload() {
    if (!selectedFile) {
      setMessage('Please choose a CSV file first.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const result = await uploadUserCsv(selectedFile)
      setMessage(`Upload processed. ${result.anomaly_count} anomalies found.`)
      setSelectedFile(null)
      refreshUploads()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) {
        setMessage(`Upload failed: ${detail}`)
      } else if (error?.code === 'ECONNABORTED') {
        setMessage('Upload timed out while processing. Try a smaller CSV or wait and retry.')
      } else if (error?.message) {
        setMessage(`Upload failed: ${error.message}`)
      } else {
        setMessage('Upload failed. Please verify CSV format and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg p-4 text-slate-100 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">User Dashboard</p>
          <h1 className="text-2xl font-semibold">Welcome, {user?.username}</h1>
        </div>
        <button onClick={logout} className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">
          Logout
        </button>
      </div>

      <section className="mb-6 rounded-xl border border-app-border bg-app-card p-5">
        <h2 className="text-lg font-medium">Upload CSV</h2>
        <p className="mt-1 text-sm text-slate-400">Upload your activity CSV and detect anomaly days instantly.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-slate-700 bg-app-bg px-3 py-2 text-sm"
          />
          <button
            onClick={onUpload}
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500 disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Upload and Analyze'}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Files Uploaded" value={uploads.length} />
        <Card label="Total Days Processed" value={uploads.reduce((acc, row) => acc + row.total_days, 0)} />
        <Card label="Total Anomalies" value={uploads.reduce((acc, row) => acc + row.anomaly_count, 0)} />
      </div>

      <section className="mt-8 rounded-xl border border-app-border bg-app-card p-5">
        <h2 className="text-lg font-medium">Your Upload History and Alerts</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2">File</th>
                <th className="pb-2">Uploaded</th>
                <th className="pb-2">Days</th>
                <th className="pb-2">Anomalies</th>
                <th className="pb-2">Anomaly Days</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((item) => (
                <tr key={item.upload_id} className="border-t border-slate-700/60">
                  <td className="py-2">{item.file_name}</td>
                  <td className="py-2">{new Date(item.uploaded_at).toLocaleString()}</td>
                  <td className="py-2">{item.total_days}</td>
                  <td className="py-2">{item.anomaly_count}</td>
                  <td className="py-2">{item.anomalies.map((a) => a.day).join(', ') || '-'}</td>
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
