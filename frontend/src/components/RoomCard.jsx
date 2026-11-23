import { Link } from 'react-router-dom'
import { Badge, Card, DeviceBadge } from './ui'
import { roomLabel } from '../config'

export default function RoomCard({ id, room, deviceStatus }) {
  const rows = [
    ['Intensitas cahaya', `${room.latest_lux} lux`],
    ['Target', `${room.target_lux} lux`],
    ['Brightness LED', `${room.brightness}%`],
    ['Mode', room.mode]
  ]
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy-800">{roomLabel(id)}</h2>
        <DeviceBadge status={deviceStatus} />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        <div className="flex justify-between"><dt className="text-slate-500">LED</dt><dd><Badge tone={room.led_enabled ? 'green' : 'gray'}>{room.led_enabled ? 'ON' : 'OFF'}</Badge></dd></div>
      </dl>
      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-navy-600" style={{ width: room.brightness + '%' }} /></div>
      <Link to={`/rooms/${id}`} className="mt-4 block rounded-lg border border-navy-600 py-2 text-center text-sm font-medium text-navy-700 hover:bg-navy-50">Detail</Link>
    </Card>
  )
}
