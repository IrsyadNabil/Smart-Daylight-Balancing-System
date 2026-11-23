import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import * as api from '../services/api'
import { Card, Spinner, ErrorBox, fmtTime } from '../components/ui'
import { ROOMS, roomLabel } from '../config'

const pivot = (items, key) => {
  const m = new Map()
  items.forEach((x) => m.set(x.ts, { ...(m.get(x.ts) || { ts: x.ts }), [x.room_id]: x[key] }))
  return [...m.values()].sort((a, b) => a.ts.localeCompare(b.ts))
}
const Chart = ({ title, data, rooms }) => (
  <Card>
    <h2 className="mb-2 font-semibold text-navy-800">{title}</h2>
    <div className="h-56">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} tick={{ fontSize: 11 }} minTickGap={40} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={fmtTime} /><Legend formatter={roomLabel} />
          {rooms.map((id, i) => <Line key={id} dataKey={id} stroke={i ? '#10b981' : '#243b66'} dot={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
)

export default function History() {
  const [f, setF] = useState({ room: '', from: '', to: '' })
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let dead = false
    setRes(null); setErr('')
    Promise.all([api.getReadings(f), api.getActivity(f)])
      .then(([a, b]) => !dead && setRes({ readings: a.items, activity: b.items }))
      .catch((e) => !dead && setErr(e.message))
    return () => { dead = true }
  }, [f])
  const rooms = f.room ? [f.room] : ROOMS
  const input = 'rounded-lg border border-slate-300 px-3 py-2 text-sm'
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select className={input} value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} aria-label="Ruangan">
          <option value="">Semua ruangan</option>{ROOMS.map((id) => <option key={id} value={id}>{roomLabel(id)}</option>)}
        </select>
        <input type="date" className={input} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} aria-label="Dari tanggal" />
        <input type="date" className={input} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} aria-label="Sampai tanggal" />
      </div>
      {err && <ErrorBox>{err}</ErrorBox>}
      {!res && !err && <Spinner />}
      {res && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Chart title="Intensitas cahaya (lux)" data={pivot(res.readings, 'lux')} rooms={rooms} />
            <Chart title="Brightness LED (%)" data={pivot(res.readings, 'brightness')} rooms={rooms} />
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr>{['Waktu', 'Ruangan', 'Jenis aktivitas', 'Nilai / status', 'Keterangan'].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {res.activity.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">Belum ada aktivitas pada filter ini.</td></tr>}
                {res.activity.map((a, i) => (
                  <tr key={i} className="border-t border-slate-100"><td className="px-4 py-2">{fmtTime(a.ts)}</td><td className="px-4 py-2">{roomLabel(a.room_id)}</td><td className="px-4 py-2">{a.type}</td><td className="px-4 py-2">{a.value}</td><td className="px-4 py-2 text-slate-500">{a.note}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
