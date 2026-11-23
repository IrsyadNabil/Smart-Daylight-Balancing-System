import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useSystem } from '../context/SystemContext'
import { Card, Stat } from '../components/ui'
import RoomCard from '../components/RoomCard'
import { ROOMS, roomLabel } from '../config'

export default function Dashboard() {
  const { data, trend } = useSystem()
  const online = data.device.device_status === 'ONLINE' ? ROOMS.length : 0
  const avg = Math.round(ROOMS.reduce((s, id) => s + data.rooms[id].latest_lux, 0) / ROOMS.length)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total ruangan" value={ROOMS.length} />
        <Stat label="Ruangan online" value={online} />
        <Stat label="Ruangan offline" value={ROOMS.length - online} />
        <Stat label="Rata-rata cahaya" value={avg} unit="lux" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ROOMS.map((id) => <RoomCard key={id} id={id} room={data.rooms[id]} deviceStatus={data.device.device_status} />)}
      </div>
      <Card>
        <h2 className="mb-2 font-semibold text-navy-800">Perbandingan intensitas cahaya (lux)</h2>
        {trend.length < 2 ? <p className="py-10 text-center text-sm text-slate-500">Menunggu data real-time...</p> : (
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="t" tick={{ fontSize: 11 }} minTickGap={40} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip /><Legend formatter={roomLabel} />
                <Line dataKey="room_01" name="room_01" stroke="#243b66" dot={false} isAnimationActive={false} />
                <Line dataKey="room_02" name="room_02" stroke="#10b981" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  )
}
