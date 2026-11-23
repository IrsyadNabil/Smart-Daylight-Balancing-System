# Kontrak API Smart Daylight Balancing System

Semua komunikasi frontend hanya ke Node-RED (lewat Nginx). Frontend tidak pernah menghubungi ESP32 atau MQTT.

## Aturan umum
- Base URL REST: `VITE_API_BASE_URL` (default `/api`). WebSocket: `VITE_WS_URL` (default `/ws`).
- Semua endpoint kecuali `/auth/login` memakai header `Authorization: Bearer <jwt>`. WebSocket memakai `?token=<jwt>`.
- Waktu memakai ISO 8601 UTC. `room_id` bernilai `room_01` atau `room_02`.
- Error: `{ "error": { "code": "VALIDATION", "message": "..." } }` dengan status 400, 401, 409, atau 503.
- Data tingkat perangkat (`device`): status ESP32, ultrasonik, servo, buzzer. Data per ruangan (`rooms`): lux, LED, brightness, mode, target.
- ESP32 dianggap OFFLINE jika tidak mengirim data lebih dari 30 detik.

## REST
| Method | Path | Body / Query | Respons |
|---|---|---|---|
| POST | /auth/login | `{username, password}` | `{token, expires_at}` |
| GET | /state | - | Snapshot (lihat bawah) |
| POST | /rooms/:id/light | `{enabled: bool}` | `{ok: true}`. `false` = mode OFF, `true` = kembali ke AUTO |
| POST | /rooms/:id/mode | `{mode: "AUTO"\|"MANUAL"\|"OFF"}` | `{ok: true}` |
| POST | /rooms/:id/brightness | `{brightness: int 0-100}` | `{ok: true}`. 409 jika mode bukan MANUAL |
| POST | /rooms/:id/target | `{target_lux: int 0-2000}` | `{ok: true}` |
| GET | /history/readings | `room, from, to` (tanggal `YYYY-MM-DD`) | `{items: [{ts, room_id, lux, brightness}]}` |
| GET | /history/activity | `room, from, to` | `{items: [{ts, room_id, type, value, note}]}` |

`type` pada activity: `MODE_CHANGE`, `COMMAND`, `ACCESS`, `DEVICE_STATUS`.
Perintah dikirim 503 jika ESP32 OFFLINE. Perubahan state dikonfirmasi lewat WebSocket, bukan lewat respons REST.

## Snapshot (`GET /state` dan pesan WebSocket `snapshot`)
```json
{
  "server_time": "2026-11-23T08:00:00Z",
  "device": { "device_status": "ONLINE", "last_seen": "2026-11-23T07:59:58Z", "distance_cm": 82.4,
              "object_detected": false, "threshold_cm": 50, "servo_status": "CLOSED", "buzzer_status": "OFF" },
  "rooms": { "room_01": { "latest_lux": 412, "target_lux": 500, "led_enabled": true, "brightness": 38, "mode": "AUTO" },
             "room_02": { "latest_lux": 530, "target_lux": 500, "led_enabled": false, "brightness": 0, "mode": "OFF" } }
}
```

## WebSocket
Format pesan: `{ "type": "...", "ts": "...", "data": {...} }`
- `snapshot`: dikirim sekali saat tersambung, isi sama dengan `/state`.
- `room.update`: `{room_id, latest_lux?, brightness?, led_enabled?, mode?, target_lux?}`
- `device.update`: `{distance_cm?, object_detected?, servo_status?, buzzer_status?, last_seen?}`
- `device.status`: `{device_status, last_seen}`
- `notification`: `{level: "error"|"info", message}`, contoh saat perangkat offline.

## MQTT (Node-RED <-> ESP32)
- ESP32 publish: `daylight/room_01/telemetry`, `daylight/room_02/telemetry` (`{lux}`), `daylight/device/telemetry` (`{distance_cm, servo, buzzer}`), `daylight/device/status` (LWT `online`/`offline`).
- Node-RED publish: `daylight/{room_id}/cmd` (`{mode, brightness}`). Keputusan mode AUTO dihitung di Node-RED.
