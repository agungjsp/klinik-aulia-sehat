# 📋 Checksheet Frontend - Aplikasi Sistem Antrean Klinik Aulia Sehat

> **Catatan Penting:**
> - ✅ Checklist item yang sudah selesai dengan mengganti `[ ]` menjadi `[x]`
> - 📅 Tanggal mulai: 21 Desember 2025
> - 🔗 API Base URL: `https://sistem-antrean.zeabur.app/`
> - 📚 Referensi: [ClickUp Space](https://app.clickup.com/31586709)

---

## 🛠️ Tech Stack

| Library | Kegunaan |
|---------|----------|
| React + TypeScript | Framework & Type Safety |
| Vite | Build Tool |
| TanStack Router | Routing & Navigation |
| TanStack Query | Server State Management |
| TanStack Table | Data Table |
| React Hook Form | Form Management |
| Zod | Schema Validation |
| Zustand | Client State Management |
| Axios | HTTP Client |
| date-fns | Date/Time Formatting |
| shadcn/ui | UI Components |

---

## 📊 Progress Overview

| Modul | Progress | Status |
|-------|----------|--------|
| [M0 - Setup & Foundation](#m0---setup--foundation) | 15/15 | ✅ Complete |
| [M1 - Jadwal Dokter & Kuota](#m1---jadwal-dokter--kuota) | 0/12 | 🔴 Not Started |
| [M2 - Antrean & Kedatangan](#m2---antrean--kedatangan) | 0/20 | 🔴 Not Started |
| [M3 - Pengingat (Reminder)](#m3---pengingat-reminder) | 0/14 | 🔴 Not Started |
| [M4 - Follow-up No-Show](#m4---follow-up-no-show) | 0/12 | 🔴 Not Started |
| [M5 - Display Antrean Klinik (TV)](#m5---display-antrean-klinik-tv) | 0/10 | 🔴 Not Started |
| [M6 - Reporting & Analytics](#m6---reporting--analytics) | 0/14 | 🔴 Not Started |
| [M7 - Master Data](#m7---master-data) | 0/36 | 🔴 Not Started |
| [M8 - Pengguna & Sistem](#m8---pengguna--sistem) | 13/18 | 🟡 In Progress |

---

## M0 - Setup & Foundation

### 0.1 Project Setup
- [x] Install dependencies (TanStack Router, Query, Table, React Hook Form, Zod, Zustand, Axios, date-fns)
- [x] Setup folder structure (`/routes`, `/components`, `/hooks`, `/lib`, `/stores`, `/types`, `/services`)
- [x] Setup path aliases di `tsconfig.json`

### 0.2 Axios & API Setup
- [x] Setup Axios instance dengan base URL
- [x] Setup request interceptor (attach Bearer token)
- [x] Setup response interceptor (handle 401 Unauthenticated)
- [x] Buat API response types (`ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`)

### 0.3 TanStack Router Setup
- [x] Setup root route dengan layout
- [x] Setup auth guard (protected routes)
- [x] Setup public routes (login)
- [x] Setup 404 Not Found page

### 0.4 Zustand Auth Store
- [x] Buat auth store (user, token, isAuthenticated)
- [x] Persist token ke localStorage
- [x] Actions: login, logout, setUser

### 0.5 UI Foundation
- [x] Setup shadcn/ui theme (colors, fonts)
- [x] Buat layout component (Sidebar, Header, Content)
- [x] Buat reusable components (DataTable, Modal, ConfirmDialog, LoadingSpinner)

---

## M1 - Jadwal Dokter & Kuota

> **API Endpoint:** `/api/schedule`
> **Priority:** High

### 1.1 Halaman Kelola Jadwal Dokter

#### UI Components
- [ ] Buat page `/jadwal-dokter`
- [ ] Buat calendar view untuk jadwal (monthly/weekly)
- [ ] Buat list view jadwal per dokter
- [ ] Buat filter (dokter, tanggal, bulan, tahun)

#### Form Jadwal
- [ ] Buat form tambah jadwal (React Hook Form + Zod)
  - Fields: `doctor_id`, `date`, `start_time`, `end_time`
- [ ] Buat form edit jadwal
- [ ] Validasi conflict jadwal (tampilkan error dari API)

#### API Integration
- [ ] `GET /api/schedule` - Query dengan TanStack Query
- [ ] `GET /api/schedule/{id}` - Detail jadwal
- [ ] `POST /api/schedule` - Tambah jadwal (mutation)
- [ ] `PUT /api/schedule/{id}` - Update jadwal (mutation)
- [ ] `DELETE /api/schedule/{id}` - Hapus jadwal (mutation)

#### UX
- [ ] Invalidate query setelah create/update/delete
- [ ] Toast notification success/error

---

## M2 - Antrean & Kedatangan

> **API Endpoint:** TBD (belum ada di dokumentasi)
> **Priority:** High

### 2.1 Halaman Pendaftaran & Antrean (Admin)

#### UI Components
- [ ] Buat page `/antrean`
- [ ] Buat DataTable antrean harian (TanStack Table)
- [ ] Kolom: No. Antrean, Nama Pasien, Dokter, Poli, Jam Daftar, Status, Aksi
- [ ] Filter: Tanggal, Dokter, Poli, Status
- [ ] Search by nama pasien

#### Status Badge dengan Warna
- [ ] 🔴 Merah: Terdaftar (belum datang)
- [ ] 🔵 Biru: Sudah datang (siap dipanggil)
- [ ] 🟡 Kuning: Sedang dilayani
- [ ] 🟢 Hijau: Selesai
- [ ] ⚫ Abu-abu: Tidak hadir (no-show)

#### Form Pendaftaran
- [ ] Buat form daftar antrean baru
- [ ] Autocomplete/search pasien existing
- [ ] Pilih dokter & poli
- [ ] Set jam kedatangan

#### Actions
- [ ] Button update status antrean
- [ ] Button panggil pasien (trigger ke display TV)
- [ ] Button tandai selesai
- [ ] Button tandai no-show

### 2.2 Dashboard Antrean untuk Dokter

#### UI Components
- [ ] Buat page `/dokter/antrean`
- [ ] Tampilkan antrean untuk dokter yang login
- [ ] List pasien yang siap dipanggil (status: Biru)
- [ ] Pasien yang sedang dilayani (status: Kuning)

#### Actions
- [ ] Button panggil pasien berikutnya
- [ ] Button mulai konsultasi
- [ ] Button selesai konsultasi

### 2.3 Halaman Cek Antrean Pasien (Public)

- [ ] Buat page `/cek-antrean/:kode` (public, tanpa auth)
- [ ] Tampilkan posisi antrean saat ini
- [ ] Estimasi waktu tunggu
- [ ] Auto-refresh dengan interval / WebSocket

---

## M3 - Pengingat (Reminder)

> **API Endpoint:** TBD
> **Priority:** High

### 3.1 Komponen QR Code Opt-in

#### UI Components
- [ ] Buat komponen generate QR Code
- [ ] QR berisi link: `wa.me/xxxx?text=DAFTAR%20[KODE]`
- [ ] Button print QR Code
- [ ] Modal tampilkan QR untuk scan

#### Integration
- [ ] Generate kode unik per pasien/antrean
- [ ] Simpan status opt-in ke database (via API)

### 3.2 Halaman Pengaturan Reminder

#### UI Components
- [ ] Buat page `/pengaturan/reminder`
- [ ] Form atur waktu kirim (H-1, H-0, X jam sebelum)
- [ ] CRUD template pesan dengan variabel dinamis
- [ ] Preview template dengan data dummy

#### Form Template
- [ ] Buat form template pesan
- [ ] Support variabel: `{nama_pasien}`, `{tanggal}`, `{jam}`, `{dokter}`, `{poli}`
- [ ] Validasi template

#### API Integration
- [ ] `GET /api/reminder-rules` - List aturan reminder
- [ ] `POST /api/reminder-rules` - Tambah aturan
- [ ] `PUT /api/reminder-rules/{id}` - Update aturan
- [ ] `DELETE /api/reminder-rules/{id}` - Hapus aturan

---

## M4 - Follow-up No-Show

> **API Endpoint:** TBD
> **Priority:** High

### 4.1 Halaman Manajemen Follow-up No-Show

#### UI Components
- [ ] Buat page `/follow-up`
- [ ] DataTable pasien no-show
- [ ] Kolom: Nama, Tanggal Jadwal, Dokter, Status Opt-in, Status Follow-up, Aksi
- [ ] Filter: Tanggal, Status follow-up

#### Status Follow-up
- [ ] Belum di-follow up
- [ ] Sudah dihubungi (auto WA)
- [ ] Sudah dihubungi (manual)
- [ ] Jadwal ulang
- [ ] Batal permanen

#### Actions
- [ ] Button follow-up manual (buka WA)
- [ ] Form catat hasil follow-up
- [ ] Button jadwal ulang (redirect ke form antrean)

#### API Integration
- [ ] `GET /api/no-show` - List pasien no-show
- [ ] `PUT /api/no-show/{id}/follow-up` - Update status follow-up

---

## M5 - Display Antrean Klinik (TV)

> **Priority:** Normal

### 5.1 Halaman Display TV Antrean

#### UI Components
- [ ] Buat page `/display` (public, fullscreen)
- [ ] Layout untuk layar TV (font besar, kontras tinggi)
- [ ] Tampilkan nomor antrean yang sedang dipanggil
- [ ] Tampilkan daftar antrean berikutnya
- [ ] Tampilkan jam & tanggal

#### Real-time Update
- [ ] Integrasi WebSocket untuk update real-time
- [ ] Auto-reconnect jika koneksi terputus

### 5.2 Audio Announcement System

- [ ] Integrasi Web Speech API atau audio file
- [ ] Play announcement saat panggil pasien
- [ ] Format: "Nomor antrean [X], silakan menuju [Poli]"
- [ ] Volume control

---

## M6 - Reporting & Analytics

> **API Endpoint:** TBD
> **Priority:** Normal

### 6.1 Dashboard Reporting & Analytics

#### UI Components
- [ ] Buat page `/laporan`
- [ ] Filter: Date range, Poli, Dokter
- [ ] Tab: Operasional, Produktivitas Dokter, No-Show

#### Chart & Visualisasi
- [ ] Chart jumlah pasien per hari (line/bar chart)
- [ ] Chart distribusi BPJS vs Umum (pie chart)
- [ ] Chart jam puncak kunjungan (bar chart)
- [ ] Chart produktivitas per dokter (bar chart)

#### Tabel Laporan
- [ ] Tabel ringkasan operasional harian
- [ ] Tabel produktivitas dokter
- [ ] Tabel no-show dengan breakdown

### 6.2 Export Laporan

- [ ] Export ke Excel (xlsx)
- [ ] Export ke PDF
- [ ] Pilih periode & filter sebelum export

---

## M7 - Master Data

> **API Endpoint:** `/api/users`, `/api/roles`, `/api/poly`
> **Priority:** High

### 7.1 CRUD Data Poli

#### UI Components
- [ ] Buat page `/master/poli`
- [ ] DataTable dengan kolom: ID, Nama, Created At, Aksi
- [ ] Search by nama
- [ ] Tab: Active | Trashed

#### Form
- [ ] Modal form tambah poli
- [ ] Modal form edit poli
- [ ] Confirm dialog hapus

#### API Integration
- [ ] `GET /api/poly` - List poli
- [ ] `GET /api/poly?search=` - Search poli
- [ ] `POST /api/poly` - Tambah poli
- [ ] `PUT /api/poly/{id}` - Update poli
- [ ] `DELETE /api/poly/{id}` - Hapus poli (soft delete)
- [ ] `GET /api/poly/trashed` - List poli terhapus
- [ ] `POST /api/poly/{id}/restore` - Restore poli

### 7.2 CRUD Data Roles

#### UI Components
- [ ] Buat page `/master/roles`
- [ ] DataTable dengan kolom: ID, Nama, Created At, Aksi
- [ ] Search by nama
- [ ] Tab: Active | Trashed

#### Form
- [ ] Modal form tambah role
- [ ] Modal form edit role
- [ ] Confirm dialog hapus

#### API Integration
- [ ] `GET /api/roles` - List roles
- [ ] `GET /api/roles?search=` - Search roles
- [ ] `POST /api/roles` - Tambah role
- [ ] `PUT /api/roles/{id}` - Update role
- [ ] `DELETE /api/roles/{id}` - Hapus role (soft delete)
- [ ] `GET /api/roles/trashed` - List roles terhapus
- [ ] `POST /api/roles/{id}/restore` - Restore role

### 7.3 CRUD Data Users (Dokter, Admin, CS)

#### UI Components
- [ ] Buat page `/master/users`
- [ ] DataTable dengan kolom: ID, Nama, Username, Email, Role, Poli, Aksi
- [ ] Search by nama/username/email
- [ ] Pagination (server-side)
- [ ] Tab: Active | Trashed

#### Form
- [ ] Modal form tambah user
  - Fields: name, username, email, password, password_confirmation, roles[], poly_id
- [ ] Modal form edit user (password optional)
- [ ] Confirm dialog hapus

#### API Integration
- [ ] `GET /api/users` - List users (paginated)
- [ ] `GET /api/users?search=&page=&per_page=` - Search & pagination
- [ ] `GET /api/users/{id}` - Detail user
- [ ] `POST /api/users` - Tambah user
- [ ] `PUT /api/users/{id}` - Update user
- [ ] `DELETE /api/users/{id}` - Hapus user (soft delete)
- [ ] `GET /api/users/trashed` - List users terhapus
- [ ] `POST /api/users/{id}/restore` - Restore user

### 7.4 CRUD Data Pasien

> **API Endpoint:** TBD

- [ ] Buat page `/master/pasien`
- [ ] DataTable pasien
- [ ] Form tambah/edit pasien
- [ ] Fields: nama, tanggal_lahir, jenis_kelamin, no_rekam_medis, no_bpjs, no_wa, kategori, status_optin

### 7.5 CRUD Template Pesan WhatsApp

> **API Endpoint:** TBD

- [ ] Buat page `/master/template-pesan`
- [ ] DataTable template
- [ ] Form tambah/edit template dengan variabel dinamis
- [ ] Preview template

---

## M8 - Pengguna & Sistem

> **API Endpoint:** `/api/auth/login`, `/api/auth/logout`
> **Priority:** High

### 8.1 Autentikasi (Login/Logout)

#### Halaman Login
- [x] Buat page `/login` (public)
- [x] Form login (username, password)
- [x] Validasi dengan Zod
- [x] Handle error (username/password salah)
- [x] Redirect ke dashboard setelah login

#### API Integration
- [x] `POST /api/auth/login` - Login
- [x] Simpan token ke Zustand + localStorage
- [x] Simpan user data ke Zustand

#### Logout
- [x] Button logout di header/sidebar
- [x] `POST /api/auth/logout` - Logout
- [x] Clear token & user dari store
- [x] Redirect ke login

### 8.2 Manajemen User & Role

> Sudah tercakup di M7.2 dan M7.3

- [ ] Integrasi dengan halaman master users
- [ ] Integrasi dengan halaman master roles

### 8.3 Pengaturan Klinik & Sistem

> **API Endpoint:** TBD

- [ ] Buat page `/pengaturan/klinik`
- [ ] Form pengaturan: Nama klinik, Alamat, No. Telp, Logo
- [ ] Pengaturan jam operasional
- [ ] Pengaturan batas waktu no-show (menit)

### 8.4 Konfigurasi WhatsApp/WAHA

> **API Endpoint:** TBD

- [ ] Buat page `/pengaturan/whatsapp`
- [ ] Form konfigurasi WAHA endpoint
- [ ] Status koneksi WhatsApp
- [ ] Test kirim pesan

---

## 📝 Catatan Tambahan

### Behaviour yang Harus Diikuti

1. **Setiap task yang selesai WAJIB di-checklist** dengan mengubah `[ ]` menjadi `[x]`
2. **Update Progress Overview** setiap kali menyelesaikan task
3. **Commit message** harus menyebutkan task yang dikerjakan, contoh:
   - `feat(M0): setup axios instance with interceptors`
   - `feat(M8): implement login page with form validation`
4. **Jangan skip task** - kerjakan secara berurutan sesuai prioritas
5. **Jika ada blocker** (misal: API belum ready), catat di bagian Notes dan lanjut ke task lain

### API yang Belum Ready

| Modul | Endpoint | Status |
|-------|----------|--------|
| M2 | Antrean | ⏳ Waiting |
| M3 | Reminder Rules | ⏳ Waiting |
| M4 | No-Show | ⏳ Waiting |
| M5 | Display Queue | ⏳ Waiting |
| M6 | Reports | ⏳ Waiting |
| M7.4 | Pasien | ⏳ Waiting |
| M7.5 | Template Pesan | ⏳ Waiting |
| M8.3 | Pengaturan Klinik | ⏳ Waiting |
| M8.4 | WhatsApp Config | ⏳ Waiting |

### Notes

1. **Gunakan `ref_search_documentation` MCP** untuk mendapatkan konteks dokumentasi yang lengkap sebelum implementasi, agar tidak terjadi kesalahan sintaks.
2. **Gunakan `get_code_context_exa` / `web_search_exa`** untuk web search, fetching dokumentasi terbaru, atau mencari solusi dari library/SDK.
3. **Gunakan shadcn MCP** (`search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`) untuk dokumentasi & contoh komponen shadcn/ui terbaru.
4. **Setiap PR harus menyertakan "How to Test"** untuk manual verification oleh reviewer.

_Tambahkan catatan penting lainnya di sini..._

---

**Last Updated:** 21 Desember 2025
