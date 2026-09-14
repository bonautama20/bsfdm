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
`Empty control database — seeding roles/permissions, Community directory,
and the demo organization...`). Aplikasi ini **multi-tenant**: setiap
perusahaan (organisasi) punya database operasionalnya sendiri, terpisah dari
perusahaan lain — lihat bagian [Multi-tenant, registrasi, dan
paket](#multi-tenant-registrasi-dan-paket-freepaid) di bawah untuk detail
arsitekturnya. Data disimpan permanen di `server/data/control.sqlite3` (akun,
organisasi) dan `server/data/tenants/<org-id>.sqlite3` (satu file per
organisasi) — setiap perubahan akan tetap ada meskipun server di-restart atau
browser di-refresh.

Untuk menjalankan hanya salah satu proses:

```bash
npm run dev      # hanya frontend (client/)
npm run server   # hanya backend/API (server/)
```

### Reset database ke data contoh awal

Backend hanya melakukan seeding jika tabel `roles` di control database kosong,
jadi aman untuk di-restart berkali-kali tanpa menghapus data QA. Untuk
mengembalikan database ke kondisi awal (hapus semua perubahan, isi ulang data
contoh):

```bash
rm server/data/control.sqlite3 server/data/control.sqlite3-shm server/data/control.sqlite3-wal
rm -rf server/data/tenants
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

Akun-akun di atas semuanya berada di satu organisasi demo (`ORG-DEMO`,
plan `paid`) yang dibuat otomatis saat database masih kosong. Perusahaan lain
yang mendaftar lewat `/register` mendapat organisasi (dan database) mereka
sendiri, terpisah total dari data demo ini.

## Multi-tenant, registrasi, dan paket (free/paid)

Aplikasi ini adalah produk SaaS multi-tenant: banyak perusahaan berbeda bisa
mendaftar sendiri, masing-masing dengan data yang terisolasi penuh satu sama
lain (lihat komentar di `server/tenantDb.js` untuk alasan arsitekturnya —
satu file SQLite per organisasi, bukan kolom `org_id` di database bersama).

- **Registrasi mandiri** — siapa pun bisa membuat akun sendiri lewat halaman
  `/register` (link "Sign Up Free" di landing page & halaman login).
  Pendaftar otomatis menjadi Super Admin dari organisasi barunya, langsung
  login, dan organisasinya dimulai kosong (tanpa data contoh) di paket
  **free**.
- **Paket free vs paid** — paket free hanya bisa memakai modul **Production**
  (biopond/panen); modul lain (Client, Vendor, Employee, Community, Report,
  Notification, Setting/manajemen user) memerlukan paket **paid** — ditegakkan
  di server (`server/middleware/plan.js`, balas `402` kalau diblokir), bukan
  cuma disembunyikan di UI. Sidebar admin menampilkan ikon gembok untuk modul
  yang terkunci.
- **Belum ada payment gateway — pembayaran manual (QRIS statis/transfer
  bank/e-wallet)** — organisasi paket free bisa membuka halaman
  `/dashboard/upgrade` (tombol "Upgrade" muncul di sidebar khusus untuk
  mereka), yang menampilkan detail pembayaran dari
  `client/src/data/paymentConfig.js` (**wajib diisi dengan data asli Anda**
  sebelum go-live — nomor rekening, e-wallet, gambar QRIS, dsb., semuanya
  masih placeholder). Setelah pelanggan klik "Saya Sudah Bayar", permintaan
  tersimpan sebagai `pending` di database dan langsung terlihat saat
  menjalankan:
  ```bash
  cd server
  npm run set-org-plan                    # daftar organisasi + permintaan upgrade yang pending
  npm run set-org-plan -- <org-id> paid    # upgrade satu organisasi (otomatis menyelesaikan permintaannya)
  ```
  Perubahan langsung berlaku di request berikutnya, tidak perlu pelanggan
  login ulang. Payment gateway sungguhan (Midtrans/Xendit) bisa menyusul
  nanti tanpa mengubah struktur ini — kolom `plan` di database sudah generik.
- **Migrasi data lama ke multi-tenant** — kalau ada database single-tenant
  lama (sebelum fitur multi-tenant ini ada) yang perlu dipindahkan menjadi
  organisasi pertama, pakai `server/migrate-to-multitenant.js` (baca komentar
  di file itu — selalu backup dan uji coba di salinan lokal dulu sebelum
  dijalankan ke data produksi yang sesungguhnya).

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
| `CORS_ORIGIN` | `server/.env` | tidak perlu diisi untuk deploy single-host (lihat catatan di bawah); **wajib** diisi kalau frontend & backend di-deploy terpisah — server *refuse to start* di production tanpa ini pada kasus itu |
| `DB_PATH` | `server/.env` | `server/data/control.sqlite3` (database bersama: akun, organisasi) — **wajib diarahkan ke volume persisten** di Render/Railway/Fly.io/Heroku (server *refuse to start* kalau terdeteksi platform itu tanpa `DB_PATH`) |
| `TENANT_DB_DIR` | `server/.env` | folder `tenants/` di sebelah `DB_PATH` (satu file `.sqlite3` per organisasi) — harus di volume persisten yang sama dengan `DB_PATH` |
| `PLATFORM_OWNER_ORG_ID` | `server/.env` | organisasi demo lokal secara default — **wajib diisi dengan id organisasi Anda sendiri** di deploy sungguhan (jalankan `node set-org-plan.js` tanpa argumen untuk melihat id-nya), kalau tidak Anda akan terkunci dari mengedit template role/permission bersama dan meninjau permintaan upgrade organisasi lain |
| `BACKUP_DIR` | `server/.env` | folder `backups/` di sebelah database — pastikan juga di volume persisten |
| `BACKUP_RETENTION_COUNT` | `server/.env` | `14` (jumlah backup harian yang disimpan) |
| `JWT_SECRET` | `server/.env` | **wajib diisi tetap sebelum go-live** — server *refuse to start* di production tanpa ini |
| `COOKIE_SAME_SITE` | `server/.env` | `lax` (isi `none` hanya jika frontend & backend beda domain) |
| `APP_URL` | `server/.env` | URL frontend, dipakai untuk link di email reset password. Default `http://localhost:5173` (dev) atau origin request itu sendiri (deploy single-host) — **wajib diisi** kalau frontend & backend beda domain |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | `server/.env` | kosong — tanpa ini, link reset password cuma tercatat di log server, tidak benar-benar terkirim |
| `VITE_API_BASE` | `client/.env` | `/api` (relatif, otomatis benar untuk mode single-host) |

**Penting — penyimpanan database di hosting dengan filesystem sementara**
(Render, Railway, Fly.io, dsb.): disk lokal container biasanya di-reset setiap
deploy/restart. Pasang *persistent volume/disk* di platform tersebut, lalu
arahkan `DB_PATH` (dan `BACKUP_DIR`) ke path di dalam volume itu (mis.
`/data/bsfdm.sqlite3`) agar data tidak hilang setiap deploy. Untuk VPS biasa
(disk permanen), `DB_PATH` default sudah aman dipakai.

### Contoh langkah deploy ke Render

1. Push repo ini ke GitHub/GitLab (Render deploy dari situ).
2. Di Render: **New → Web Service**, hubungkan repo ini.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment: Node
3. **New → Disk**, attach ke service ini, mount path mis. `/data` (mulai dari 1GB sudah lebih dari cukup).
4. Di tab Environment service tersebut, tambahkan:
   - `JWT_SECRET` — generate dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `DB_PATH=/data/bsfdm.sqlite3`
   - `BACKUP_DIR=/data/backups`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (lihat panduan Gmail/Google Workspace di bawah)
   - `NODE_ENV=production` (biasanya sudah otomatis di Render)
5. Deploy. Render kasih domain `*.onrender.com` otomatis dengan HTTPS — bisa dipakai langsung, atau hubungkan domain sendiri lewat tab Settings → Custom Domain.
6. Setelah deploy pertama sukses, cek log service: harus ada baris `[db] Empty control database — seeding roles/permissions, Community directory, and the demo organization...` (database baru, otomatis terisi role/permission template + organisasi & akun demo di atas). Untuk pelanggan sungguhan, daftar lewat `/register` di aplikasi — itu membuat organisasi baru yang terpisah dari data demo. Segera ganti password akun demo (`admin@bsfdm.com`) kalau organisasi demo ini tidak akan dipakai, atau abaikan saja (datanya tidak bocor ke organisasi lain).
7. Railway dan Fly.io langkahnya serupa (attach volume, set env vars yang sama) — beda di detail UI saja.

### Mengirim email sungguhan lewat Gmail / Google Workspace

Google **menolak** SMTP dengan password akun biasa — wajib pakai *App Password* (butuh 2-Step Verification aktif di akun tersebut):

1. Aktifkan 2-Step Verification di akun Google yang mau dipakai kirim email (myaccount.google.com/security).
2. Buka myaccount.google.com/apppasswords, buat App Password baru (nama bebas, mis. "BSFDM SMTP").
3. Isi di `server/.env` (atau env var hosting):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=nama@perusahaan-anda.com
   SMTP_PASS=<App Password 16 karakter, bukan password akun>
   SMTP_FROM=BSFDM <nama@perusahaan-anda.com>
   ```
4. Restart server, lalu tes: buka `/forgot-password` di aplikasi, masukkan email salah satu user — kalau email masuk, konfigurasi sudah benar.

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
- **Matriks izin per-modul (view/create/edit/delete/export/approve) ditegakkan
  di server** (`requirePermission`/`requireOperatorOrPermission` di
  `server/middleware/auth.js`) di setiap route mutasi (biopond, klien,
  vendor, karyawan, dst.) — bukan cuma UI yang menyembunyikan tombol.
- **Isolasi data antar organisasi bersifat struktural**: setiap organisasi
  punya file database sendiri (`server/tenantDb.js`), jadi satu query yang
  lupa memfilter tidak bisa membocorkan data organisasi lain — beda dengan
  pendekatan kolom `org_id` di database bersama.
- **Paket free/paid ditegakkan di server** (`server/middleware/plan.js`,
  balas `402` untuk modul yang terkunci), tidak bisa dilewati hanya dengan
  memanggil API langsung.
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

Yang **masih belum** ada dan bisa dipertimbangkan lebih lanjut: payment
gateway (upgrade paket masih manual lewat `set-org-plan.js`, lihat bagian
[Multi-tenant, registrasi, dan paket](#multi-tenant-registrasi-dan-paket-freepaid)),
verifikasi email saat registrasi, dan matriks role/permission per-organisasi
(saat ini role & permission adalah template global yang sama untuk semua
organisasi, bukan bisa dikustomisasi per perusahaan).

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
    ├── db.js                 # bootstrap koneksi control database + auto-seed
    ├── tenantDb.js            # bootstrap koneksi per-organisasi (tenant) database
    ├── schema-control.sql    # struktur tabel control db (auth, organizations, communities)
    ├── schema-tenant.sql     # struktur tabel tenant db (semua data operasional per organisasi)
    ├── seed.js                # mengisi database dari client/src/data/dummyData.js
    ├── routes/                 # racks, hotels, vendors, employees, users,
    │                            productionLogs, misc (sales, calendar, dst.)
    └── data/
        ├── control.sqlite3    # database bersama (auth, organizations) — dibuat otomatis, tidak di-commit
        └── tenants/<org-id>.sqlite3  # satu file per organisasi — dibuat otomatis, tidak di-commit
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
