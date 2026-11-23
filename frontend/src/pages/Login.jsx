import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSystem } from '../context/SystemContext'
import { DEMO } from '../config'
import { ErrorBox } from '../components/ui'

export default function Login() {
  const { token, login } = useSystem()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (token) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!u.trim() || !p) return setErr('Username dan password wajib diisi')
    setBusy(true); setErr('')
    try { await login(u.trim(), p) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2'
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-navy-800">Smart Daylight Balancing System</h1>
        {DEMO && <p className="rounded bg-amber-100 p-2 text-sm text-amber-900">DEMO MODE. Login: admin / admin123</p>}
        {err && <ErrorBox>{err}</ErrorBox>}
        <label className="block text-sm">Username<input className={field} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></label>
        <label className="block text-sm">Password<input className={field} type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></label>
        <button disabled={busy} className="w-full rounded-lg bg-navy-800 py-2 font-medium text-white hover:bg-navy-700 disabled:opacity-60">{busy ? 'Memproses...' : 'Login'}</button>
      </form>
    </div>
  )
}
