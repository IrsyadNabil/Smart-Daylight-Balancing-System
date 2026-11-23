// DEMO MODE: simulator lokal. Hanya aktif jika VITE_DEMO_MODE=true. Semua data di sini simulasi.
const iso = (d = new Date()) => d.toISOString()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

const rooms = {
  room_01: { latest_lux: 380, target_lux: 500, led_enabled: true, brightness: 30, mode: 'AUTO' },
  room_02: { latest_lux: 420, target_lux: 500, led_enabled: true, brightness: 20, mode: 'AUTO' }
}
const device = { device_status: 'ONLINE', last_seen: iso(), distance_cm: 150, object_detected: false, threshold_cm: 50, servo_status: 'CLOSED', buzzer_status: 'OFF' }
const ambient = { room_01: 220, room_02: 300 }
const subs = new Set()
const log = []
const readings = []
let hold = 0

const emit = (type, data) => subs.forEach((f) => f({ type, ts: iso(), data }))
const note = (room_id, type, value, text) => log.unshift({ ts: iso(), room_id, type, value, note: text })

function sample(id, at = new Date()) {
  const r = rooms[id]
  ambient[id] = clamp(ambient[id] + (Math.random() - 0.5) * 30, 80, 600)
  if (r.mode === 'AUTO') r.brightness = clamp(Math.round(r.brightness + (r.target_lux - r.latest_lux) * 0.05), 0, 100)
  r.led_enabled = r.mode !== 'OFF'
  if (!r.led_enabled) r.brightness = 0
  r.latest_lux = Math.round(ambient[id] + r.brightness * 4)
  readings.push({ ts: iso(at), room_id: id, lux: r.latest_lux, brightness: r.brightness })
  return r
}

for (let i = 120; i > 0; i--) Object.keys(rooms).forEach((id) => sample(id, new Date(Date.now() - i * 30000)))
note('room_01', 'MODE_CHANGE', 'AUTO', 'Data simulasi')

setInterval(() => {
  Object.keys(rooms).forEach((id) => emit('room.update', { room_id: id, ...sample(id) }))
  if (hold > 0) hold--
  else if (Math.random() < 0.08) { hold = 3; device.object_detected = true; device.distance_cm = Math.round(20 + Math.random() * 25); note('room_01', 'ACCESS', 'OPEN', 'Objek terdeteksi, pintu dibuka (simulasi)') }
  else { device.object_detected = false; device.distance_cm = Math.round(80 + Math.random() * 120) }
  if (hold === 0) device.object_detected = false
  device.servo_status = device.object_detected ? 'OPEN' : 'CLOSED'
  device.buzzer_status = device.object_detected ? 'ON' : 'OFF'
  device.last_seen = iso()
  emit('device.update', { ...device })
}, 2000)

export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }
export const login = async (u, p) => {
  await sleep(300)
  if (u !== 'admin' || p !== 'admin123') throw new Error('Username atau password salah')
  sessionStorage.setItem('sdbs_token', 'demo')
}
export const getState = async () => ({ server_time: iso(), device: { ...device }, rooms: JSON.parse(JSON.stringify(rooms)) })

async function command(id, change, type, value) {
  await sleep(250)
  Object.assign(rooms[id], change)
  note(id, type, value, 'Perintah dari dashboard (simulasi)')
  emit('room.update', { room_id: id, ...rooms[id] })
  return { ok: true }
}
export const setLight = (id, enabled) => command(id, { mode: enabled ? 'AUTO' : 'OFF', led_enabled: enabled }, 'COMMAND', enabled ? 'LIGHT_ON' : 'LIGHT_OFF')
export const setMode = (id, mode) => command(id, { mode }, 'MODE_CHANGE', mode)
export const setBrightness = (id, brightness) => {
  if (rooms[id].mode !== 'MANUAL') return Promise.reject(new Error('Brightness hanya bisa diatur pada mode MANUAL'))
  return command(id, { brightness }, 'COMMAND', 'BRIGHTNESS ' + brightness)
}
export const setTarget = (id, target_lux) => command(id, { target_lux }, 'COMMAND', 'TARGET ' + target_lux)

const inRange = (x, q) => (!q.room || x.room_id === q.room) && (!q.from || x.ts >= q.from) && (!q.to || x.ts <= q.to + 'T23:59:59Z')
export const getReadings = async (q = {}) => ({ items: readings.filter((x) => inRange(x, q)) })
export const getActivity = async (q = {}) => ({ items: log.filter((x) => inRange(x, q)).slice(0, 200) })
