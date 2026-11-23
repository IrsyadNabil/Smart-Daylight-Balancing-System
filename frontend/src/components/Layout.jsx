import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, Radar, History, LogOut, X } from 'lucide-react'
import { useSystem } from '../context/SystemContext'
import { DEMO } from '../config'
import { Badge, DeviceBadge, Spinner, ErrorBox } from './ui'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/rooms/room_01', label: 'Room 01', icon: Lightbulb },
  { to: '/rooms/room_02', label: 'Room 02', icon: Lightbulb },
  { to: '/sensors', label: 'Sensor & Akses', icon: Radar },
  { to: '/history', label: 'Riwayat', icon: History }
]

export default function Layout() {
  const { token, data, error, link, updated, toasts, dismiss, logout } = useSystem()
  if (!token) return <Navigate to="/login" replace />
  const linkBadge = link === 'open' ? <Badge tone="green">Server terhubung</Badge> : link === 'connecting' ? <Badge>Menyambung</Badge> : <Badge tone="red">Server terputus</Badge>

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-navy-900 text-white md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0">
        <div className="px-4 py-3 text-sm font-semibold md:py-5">Smart Daylight Balancing</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/15' : 'text-slate-300 hover:bg-white/10'}`}>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
          <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 md:mt-auto"><LogOut className="h-4 w-4" />Keluar</button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {DEMO && <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">DEMO MODE: data simulasi, bukan dari ESP32</div>}
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-4 py-3">
          <h1 className="mr-auto text-lg font-semibold text-navy-800">Smart Daylight Balancing System</h1>
          {linkBadge}
          <span className="flex items-center gap-1.5 text-sm text-slate-500">ESP32 <DeviceBadge status={data?.device?.device_status} /></span>
          <span className="text-sm text-slate-500">Pembaruan: {updated ? updated.toLocaleTimeString('id-ID') : '-'}</span>
        </header>
        <main className="mx-auto max-w-6xl p-4">
          {error && <ErrorBox>{error}</ErrorBox>}
          {!data && !error ? <Spinner /> : data && <Outlet />}
        </main>
      </div>
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`flex max-w-xs items-start gap-2 rounded-lg border p-3 text-sm shadow ${t.level === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-white'}`}>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Tutup"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
