import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Power } from 'lucide-react'
import { useSystem } from '../context/SystemContext'
import * as api from '../services/api'
import { Badge, Card, DeviceBadge, ErrorBox } from '../components/ui'
import { ROOMS, roomLabel } from '../config'

export default function RoomDetail() {
  const { id } = useParams()
  const { data } = useSystem()
  const r = data.rooms[id]
  const offline = data.device.device_status !== 'ONLINE'
  const [target, setTarget] = useState('')
  const [bright, setBright] = useState(0)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (r) { setTarget(String(r.target_lux)); setBright(r.brightness); setMsg(null) } }, [id]) // eslint-disable-line

  if (!ROOMS.includes(id)) return <Navigate to="/" replace />

  const act = async (fn, ok = 'Perintah terkirim') => {
    setBusy(true); setMsg(null)
    try { await fn(); setMsg({ ok: true, text: ok }) } catch (e) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }
  const save = () => {
    const t = Number(target)
    if (!Number.isInteger(t) || t < 0 || t > 2000) return setMsg({ ok: false, text: 'Target lux harus bilangan bulat 0-2000' })
    act(async () => {
      await api.setTarget(id, t)
      if (r.mode === 'MANUAL') await api.setBrightness(id, Number(bright))
    }, 'Konfigurasi disimpan')
  }
  const off = busy || offline
  const btn = 'rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50'
  const info = [['Intensitas cahaya', `${r.latest_lux} lux`], ['Target', `${r.target_lux} lux`], ['Brightness LED', `${r.brightness}%`], ['Mode', r.mode]]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-navy-800">{roomLabel(id)}</h2>
        <DeviceBadge status={data.device.device_status} />
        <Badge tone={r.led_enabled ? 'green' : 'gray'}>Lampu {r.led_enabled ? 'ON' : 'OFF'}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {info.map(([k, v]) => <Card key={k}><div className="text-sm text-slate-500">{k}</div><div className="mt-1 text-xl font-semibold text-navy-800">{v}</div></Card>)}
      </div>
      <Card className="space-y-5">
        {offline && <ErrorBox>ESP32 offline atau belum ada data. Kontrol dinonaktifkan.</ErrorBox>}
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={off} onClick={() => act(() => api.setLight(id, !r.led_enabled))} className={`${btn} flex items-center gap-2 ${r.led_enabled ? 'bg-navy-800 text-white' : 'border border-slate-300'}`}>
            <Power className="h-4 w-4" />Lampu {r.led_enabled ? 'ON' : 'OFF'}
          </button>
          <div className="flex overflow-hidden rounded-lg border border-slate-300" role="group" aria-label="Mode">
            {['AUTO', 'MANUAL'].map((m) => (
              <button key={m} disabled={off} onClick={() => act(() => api.setMode(id, m))} className={`px-4 py-2 text-sm font-medium disabled:opacity-50 ${r.mode === m ? 'bg-navy-800 text-white' : 'bg-white'}`}>{m === 'AUTO' ? 'Otomatis' : 'Manual'}</button>
            ))}
          </div>
        </div>
        {r.mode === 'AUTO' && (
          <label className="block text-sm">Target intensitas cahaya (lux)
            <input type="number" min="0" max="2000" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 block w-40 rounded-lg border border-slate-300 px-3 py-2" />
            <span className="mt-1 block text-xs text-slate-500">Penyesuaian dihitung oleh Node-RED.</span>
          </label>
        )}
        {r.mode === 'MANUAL' && (
          <label className="block text-sm">Brightness: {bright}%
            <input type="range" min="0" max="100" value={bright} onChange={(e) => setBright(e.target.value)} className="mt-2 block w-full max-w-md accent-navy-700" />
          </label>
        )}
        <div className="flex items-center gap-3">
          <button disabled={off || r.mode === 'OFF'} onClick={save} className={`${btn} bg-navy-800 text-white hover:bg-navy-700`}>{busy ? 'Menyimpan...' : 'Simpan konfigurasi'}</button>
          {msg && <span role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg.text}</span>}
        </div>
      </Card>
    </div>
  )
}
