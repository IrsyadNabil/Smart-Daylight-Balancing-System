import { DoorOpen, DoorClosed, Volume2, VolumeX } from 'lucide-react'
import { useSystem } from '../context/SystemContext'
import { Badge, Card, fmtTime } from '../components/ui'

export default function Sensors() {
  const { data } = useSystem()
  const d = data.device
  const pct = Math.min(100, (d.distance_cm / (d.threshold_cm * 3)) * 100)
  const open = d.servo_status === 'OPEN'
  const on = d.buzzer_status === 'ON'
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Sensor ultrasonik, servo, dan buzzer terhubung ke satu ESP32 yang sama. Data terakhir: {fmtTime(d.last_seen)}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-navy-800">Sensor ultrasonik HC-SR04</h2>
          <div className="mt-2 text-3xl font-semibold">{d.distance_cm} <span className="text-base font-normal text-slate-500">cm</span></div>
          <div className="mt-2"><Badge tone={d.object_detected ? 'red' : 'green'}>{d.object_detected ? 'Objek terdeteksi' : 'Tidak ada objek'}</Badge></div>
          <div className="relative mt-4 h-2 rounded bg-slate-100">
            <div className={`h-full rounded ${d.object_detected ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: pct + '%' }} />
            <div className="absolute -top-1 h-4 w-0.5 bg-navy-800" style={{ left: (d.threshold_cm / (d.threshold_cm * 3)) * 100 + '%' }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Garis navy: threshold {d.threshold_cm} cm</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-navy-800">Servo (pintu)</h2>
          <div className="mt-3 flex items-center gap-3 text-2xl font-semibold">{open ? <DoorOpen /> : <DoorClosed />}{open ? 'OPEN' : 'CLOSED'}</div>
        </Card>
        <Card>
          <h2 className="font-semibold text-navy-800">Buzzer</h2>
          <div className="mt-3 flex items-center gap-3 text-2xl font-semibold">{on ? <Volume2 /> : <VolumeX />}{d.buzzer_status}</div>
        </Card>
      </div>
    </div>
  )
}
