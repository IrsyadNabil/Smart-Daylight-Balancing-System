# Smart Daylight Balancing System

Dashboard web untuk memantau dan mengontrol pencahayaan dua ruangan berbasis IoT (ESP32, BH1750, LED PWM, HC-SR04, servo, buzzer) melalui Node-RED dan MQTT.

## Status

| Bagian | Status |
|---|---|
| Frontend (React + Vite + Tailwind) | Selesai, dapat dijalankan dengan DEMO MODE |
| Kontrak API dan payload WebSocket | Selesai (`docs/API_CONTRACT.md`) |
| Node-RED flows, skema PostgreSQL | Belum dibuat |
| Docker Compose, Nginx, panduan VPS | Belum dibuat |

Selama backend belum ada, gunakan DEMO MODE. Data di mode ini sepenuhnya simulasi dan selalu diberi banner kuning "DEMO MODE".

## Fitur

- Login dengan token (disimpan di `sessionStorage`) dan proteksi halaman.
- Dashboard: status server, status ESP32, waktu pembaruan terakhir, ringkasan ruangan, kartu Room 01 dan Room 02, grafik perbandingan lux real-time.
- Detail ruangan: lampu ON/OFF, mode Otomatis/Manual, slider brightness (manual), target lux (otomatis), tombol simpan dengan validasi input.
- Sensor dan akses: jarak HC-SR04 terhadap threshold, status servo (OPEN/CLOSED), status buzzer.
- Riwayat: grafik lux dan brightness, tabel aktivitas, filter ruangan dan tanggal.
- Loading state, error handling, dan tampilan responsif (desktop, tablet, smartphone).

## Arsitektur

```
Browser -> Nginx -> Node-RED (REST + WebSocket) -> PostgreSQL
ESP32 <-> MQTT Mosquitto <-> Node-RED
```

Browser tidak pernah berkomunikasi langsung dengan ESP32 maupun MQTT. Perhitungan kontrol mode otomatis dilakukan di Node-RED. Frontend hanya mengirim perintah dan konfigurasi.

Ada satu ESP32 untuk kedua ruangan. Status perangkat, sensor ultrasonik, servo, dan buzzer bersifat tingkat perangkat, sedangkan lux, LED, brightness, mode, dan target bersifat per ruangan.

## Struktur proyek

```
.
├─ docs/API_CONTRACT.md      # Endpoint REST, pesan WebSocket, topik MQTT
└─ frontend/
   ├─ .env.example
   └─ src/
      ├─ config.js           # Membaca environment variables
      ├─ services/           # api.js, ws.js, demo.js
      ├─ context/            # SystemContext (auth, state, WebSocket)
      ├─ components/         # Layout, RoomCard, ui
      └─ pages/              # Login, Dashboard, RoomDetail, Sensors, History
```

## Menjalankan secara lokal

Prasyarat: Node.js 18 atau lebih baru.

```bash
cd frontend
cp .env.example .env
```

Ubah `.env` menjadi `VITE_DEMO_MODE=true`, lalu:

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` dan login dengan `admin` / `admin123` (hanya berlaku di DEMO MODE). Setelah mengubah `.env`, hentikan dan jalankan ulang `npm run dev`.

### Environment variables

| Variabel | Default | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL REST API (Node-RED) |
| `VITE_WS_URL` | `/ws` | URL WebSocket Node-RED |
| `VITE_DEMO_MODE` | `false` | `true` memakai data simulasi tanpa backend |

Nilai `VITE_*` ditanam saat build, jadi jangan menaruh rahasia di sini. Kredensial MQTT tidak pernah berada di frontend.

### Build produksi

```bash
npm run build     # hasil di frontend/dist
```

## Menghubungkan ke Node-RED

Dengan `VITE_DEMO_MODE=false`, frontend memanggil `{VITE_API_BASE_URL}/auth/login` dan endpoint lain yang tercantum di `docs/API_CONTRACT.md`. Saat memakai `npm run dev` tanpa Nginx, `/api` tidak ada, sehingga login menghasilkan error 404. Ada dua cara:

- Isi `VITE_API_BASE_URL` dan `VITE_WS_URL` dengan alamat Node-RED langsung, dan aktifkan CORS di Node-RED, atau
- Gunakan Nginx yang meneruskan `/api` dan `/ws` ke Node-RED (disiapkan di tahap deployment).

## Keamanan (target desain)

- Password disimpan sebagai hash bcrypt di PostgreSQL, diverifikasi oleh Node-RED.
- Token JWT dengan masa berlaku terbatas; endpoint lain menolak permintaan tanpa token (401).
- Validasi input di frontend dan di Node-RED.
- HTTPS melalui Nginx. PostgreSQL dan Node-RED Editor tidak dibuka ke internet.

## Rencana berikutnya

1. `db/init.sql` dan `nodered/flows.json` (login, REST API, WebSocket, logika AUTO, deteksi offline 30 detik).
2. `docker-compose.yml` (Mosquitto, Node-RED, PostgreSQL, Nginx, frontend), `nginx/default.conf`, dan `.env.example` tingkat root.
3. Panduan deployment VPS Ubuntu: SSH, instalasi Docker, domain dan SSL, log, restart, dan update.

## Kontrak API

Lihat [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).