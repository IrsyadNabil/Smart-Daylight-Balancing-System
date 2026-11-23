import { Loader2 } from 'lucide-react'

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
  navy: 'bg-navy-50 text-navy-700 ring-navy-100'
}
export const Badge = ({ tone = 'gray', children }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${tones[tone]}`}>{children}</span>
)
export const Card = ({ className = '', children }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>
)
export const Stat = ({ label, value, unit }) => (
  <Card>
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-navy-800">{value}{unit && <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>}</div>
  </Card>
)
export const Spinner = ({ label = 'Memuat data' }) => (
  <div className="flex items-center gap-2 p-6 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{label}</div>
)
export const ErrorBox = ({ children }) => (
  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{children}</div>
)
export const statusTone = (s) => (s === 'ONLINE' ? 'green' : s === 'OFFLINE' ? 'red' : 'gray')
export const DeviceBadge = ({ status }) => (
  <Badge tone={statusTone(status)}><span className={`h-1.5 w-1.5 rounded-full ${status === 'ONLINE' ? 'bg-emerald-500' : status === 'OFFLINE' ? 'bg-red-500' : 'bg-slate-400'}`} />{status === 'ONLINE' ? 'Online' : status === 'OFFLINE' ? 'Offline' : 'Belum ada data'}</Badge>
)
export const fmtTime = (v) => (v ? new Date(v).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }) : '-')
