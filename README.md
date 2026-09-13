# BSFDM — Black Soldier Fly Data Management

Platform manajemen data BSF (Black Soldier Fly): landing page, dashboard admin,
dan modul mobile untuk operator lapangan. Dibangun dengan React + Vite di
frontend (`client/`), dan Express + SQLite (bawaan Node, tanpa native build)
di backend (`server/`) — dua paket npm terpisah dalam satu workspace, masing-
masing dengan dependency-nya sendiri, dijalankan bersama lewat satu perintah.

## Menjalankan secara lokal (frontend + database)

Pastikan Node.js versi 22 ke atas terpasang (dibutuhkan untuk modul `node:sqlite`).

```bash
npm install
npm run dev:full
```

`npm install` di root otomatis meng-install dependency untuk **kedua** paket
(`client/` dan `server/`) sekaligus lewat npm workspaces — tidak perlu masuk
ke masing-masing folder.

Perintah `dev:full` menjalankan **dua proses sekaligus**:
- `web` — Vite dev server (paket `client/`) di `http://localhost:5173`
- `api` — Express API + database SQLite (paket `server/`) di `http://localhost:4000`

Buka `http://localhost:5173` di browser. Saat backend pertama kali dijalankan,
database akan otomatis dibuat dan diisi data contoh (bisa dicek di log `[api]`:
`Empty database — seeding demo data...`). Data disimpan permanen di
`server/data/bsfdm.sqlite3` — setiap perubahan (stok biopond, klien baru,
vendor, dsb.) akan tetap ada meskipun server di-restart atau browser di-refresh.

Untuk menjalankan hanya salah satu proses:

```bash
npm run dev      # hanya frontend (client/)
npm run server   # hanya backend/API (server/)
```

### Reset database ke data contoh awal

Backend hanya melakukan seeding jika tabel `users` kosong, jadi aman untuk
di-restart berkali-kali tanpa menghapus data QA. Untuk mengembalikan database
ke kondisi awal (hapus semua perubahan, isi ulang data contoh):

```bash
rm server/data/bsfdm.sqlite3
npm run server
```

## Akun demo untuk QA

Semua akun di bawah ini benar-benar tersimpan di database (login diverifikasi
lewat API, bukan hardcode di frontend), sehingga bisa dipakai untuk menguji
RBAC di setiap role:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@bsfdm.com | bsfdm123 |
| Operator (mobile) | andi@bsfdm.com | operator123 |
| Role lain (Production Manager, Sales Admin, dst.) | lihat `server/seed.js` / tabel `users` | bsfdm123 |

## Deploy ke production

Aplikasi ini dirancang untuk dijalankan sebagai **satu proses Node** yang
melayani frontend (hasil build) sekaligus API dari origin yang sama — jadi
cukup satu host/port untuk deploy (Render, Railway, Fly.io, VPS biasa, dll).

```bash
npm install
npm run build   # build client/ ke client/dist/
npm run start   # NODE_ENV=production, Express (server/) menyajikan client/dist/ + /api
```

Setelah `npm run start`, buka `http://<host>:4000` — halaman yang sama yang
memanggil API-nya sendiri lewat path relatif `/api`, tidak perlu konfigurasi
CORS lintas domain sama sekali.

### Environment variables

Backend dan frontend punya file `.env` masing-masing (terpisah karena keduanya
sekarang paket npm yang berdiri sendiri):

- `server/.env` — salin dari `server/.env.example`
- `client/.env` — salin dari `client/.env.example`

| Variabel | File | Default |
|---|---|---|
| `PORT` | `server/.env` | `4000` |
| `CORS_ORIGIN` | `server/.env` | mengizinkan semua origin |
| `DB_PATH` | `server/.env` | `server/data/bsfdm.sqlite3` |
| `JWT_SECRET` | `server/.env` | secret acak per-proses (**wajib diisi tetap sebelum go-live**, lihat di bawah) |
| `COOKIE_SAME_SITE` | `server/.env` | `lax` (isi `none` hanya jika frontend & backend beda domain) |
| `VITE_API_BASE` | `client/.env` | `/api` (relatif, otomatis benar untuk mode single-host) |

**Penting — penyimpanan database di hosting dengan filesystem sementara**
(Render, Railway, Fly.io, dsb.): disk lokal container biasanya di-reset setiap
deploy/restart. Pasang *persistent volume/disk* di platform tersebut, lalu
arahkan `DB_PATH` ke path di dalam volume itu (mis. `/data/bsfdm.sqlite3`) agar
data tidak hilang setiap deploy. Untuk VPS biasa (disk permanen), `DB_PATH`
default sudah aman dipakai.

### Kalau frontend & backend di-deploy terpisah (dua host berbeda)

Karena `client/` dan `server/` sudah jadi paket independen, ini juga jadi
lebih mudah — misalnya frontend statis di Vercel/Netlify, backend di
Render/Railway. Dalam kasus ini:
1. Set `VITE_API_BASE` di `client/.env` ke URL penuh backend
   (mis. `https://api.example.com/api`) saat build frontend.
2. Set `CORS_ORIGIN` di `server/.env` ke URL frontend (mis. `https://app.example.com`).

### Keamanan yang sudah diterapkan

- Password pengguna di-hash dengan bcrypt sebelum disimpan (lihat
  `server/routes/auth.js`, `server/seed.js`) — bukan plaintext.
- **Sesi login pakai JWT di cookie `httpOnly`** (lihat `server/middleware/auth.js`),
  bukan sekadar dipercaya dari `localStorage` frontend seperti sebelumnya —
  setiap request ke `/api/*` (kecuali `/api/auth/login` dan `/api/health`)
  diverifikasi ulang di server lewat middleware `requireAuth`. `localStorage`
  sekarang cuma menyimpan salinan tampilan (nama, role) untuk UI instan; kalau
  cookie-nya tidak valid/kedaluwarsa, frontend otomatis dilempar balik ke
  halaman login lewat pengecekan `/api/auth/me` saat aplikasi dimuat.
- **Rate limiting** di endpoint `/api/auth/login` (maks. ~15 percobaan per 15
  menit per IP) untuk memperlambat brute-force password.
- **Endpoint manajemen user & role permission** (`POST/PATCH/DELETE /api/users`,
  `PATCH /api/users/roles/:id/permissions`) dibatasi hanya untuk role
  `Super Admin` di sisi server (bukan cuma disembunyikan di UI).
- CORS bisa dibatasi lewat `CORS_ORIGIN` (default merefleksikan origin
  request, cocok untuk demo/QA) dan sudah mendukung `credentials: true` untuk
  cookie lintas domain.

**Sebelum go-live sungguhan**, wajib set `JWT_SECRET` ke string acak yang
tetap di `server/.env` (generate dengan
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
Tanpa itu, server tetap jalan (memudahkan testing lokal) tapi memakai secret
acak baru setiap kali proses di-restart — artinya semua sesi login akan
logout sendiri setiap restart, dan kalau nanti ada lebih dari satu instance
server, token dari satu instance tidak akan valid di instance lain.

Yang **masih belum** ada dan bisa dipertimbangkan lebih lanjut (di luar
cakupan tiga perbaikan di atas): validasi input yang lebih ketat & konsisten
di setiap route, dan penegakan matriks izin per-modul (view/create/edit/dst.)
di sisi server secara menyeluruh — saat ini baru endpoint user & role yang
dijaga eksplisit; endpoint lain (biopond, klien, vendor, dst.) hanya
mensyaratkan "sudah login", belum mengecek permission spesifik per role.

## Struktur folder

Monorepo npm workspaces dengan dua paket independen — `client/` (frontend)
dan `server/` (backend) — masing-masing punya `package.json` dan
`node_modules` sendiri (di-hoist ke root oleh npm), sehingga dependency React
tidak pernah bercampur dengan dependency Express, dan masing-masing bisa
di-deploy terpisah kalau perlu.

```
├── package.json          # orchestrator: workspaces + skrip gabungan (dev:full, dll.)
├── client/                # ---------- FRONTEND ----------
│   ├── package.json       # dependency React/Vite saja
│   ├── index.html
│   ├── vite.config.js     # termasuk proxy /api → backend saat dev
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── admin/          # halaman & komponen khusus admin dashboard
│       ├── operator/       # halaman & komponen khusus modul mobile operator
│       ├── context/         # AuthContext, BiopondContext, ProductionLogContext
│       │                     # (single source of truth, terhubung ke API)
│       ├── api/client.js    # wrapper fetch ke backend Express
│       ├── data/dummyData.js # data contoh (sumber untuk seeding database)
│       ├── components/ui/   # komponen UI generik yang dipakai admin & operator
│       └── pages/            # Landing & Login (dipakai bersama)
└── server/                # ---------- BACKEND ----------
    ├── package.json        # dependency Express/bcrypt/cors saja
    ├── .env.example
    ├── index.js             # entry point Express, mount semua route di /api
    ├── db.js                 # bootstrap koneksi SQLite + auto-seed
    ├── schema.sql            # struktur seluruh tabel database
    ├── seed.js                # mengisi database dari client/src/data/dummyData.js
    ├── routes/                 # racks, hotels, vendors, employees, users,
    │                            productionLogs, misc (sales, calendar, dst.)
    └── data/bsfdm.sqlite3     # file database (dibuat otomatis, tidak di-commit)
```

Satu-satunya "penyeberangan" yang disengaja antara kedua paket:
`server/seed.js` meng-import `client/src/data/dummyData.js` — bukan kode,
cuma data contoh statis — supaya database seed selalu sinkron 1:1 dengan data
yang sudah dites di frontend, tanpa perlu menulis ulang ratusan baris data.

Styling ditulis sebagai CSS biasa (`dashboard.css` untuk admin, `operator.css`
untuk operator, `<style>` block untuk Landing/Login) — tidak ada Tailwind,
jadi tidak perlu konfigurasi tambahan.

Ikon menggunakan [lucide-react](https://lucide.dev/), grafik menggunakan
[recharts](https://recharts.org/), animasi menggunakan [GSAP](https://gsap.com/).
