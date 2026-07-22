## 📌 Sistem Informasi Pemesanan Menu pada Rumah Makan Siantar Minang Jaya Terintegrasi Chatbot

---

## FITUR SISTEM (LENGKAP)

### 🔐 Akses

- Login & Registrasi (email / nomor HP)
- Login dengan Google (opsional)
- Guest Mode via QR Code (tanpa login) ✅

### 🍽️ Menu & Pemesanan

- Lihat daftar menu (kategori dinamis)
- Detail menu (foto, harga, deskripsi, rating)
- Pencarian & filter (harga, kategori, best seller)
- Rekomendasi menu (AI / popularitas)
- Tambah ke keranjang (cart)
- Edit jumlah pesanan
- Catatan khusus (contoh: tidak pedas)
- Multi-order (pesan lebih dari 1 kali dalam 1 meja)

### 🪑 QR Code Meja (FITUR BARU 🔥)

- Scan QR Code meja
- Auto-detect:
- Nomor meja
- Status meja (aktif/tidak)
- Langsung masuk ke menu (tanpa login)
- Session berbasis meja (bukan user)
- Bisa:
- Pesan langsung
- Tambah order (repeat order)

### 📦 Tracking & Riwayat

- Tracking status pesanan (real-time)
- Riwayat transaksi
- Re-order (pesan ulang cepat)

### 🔔 Notifikasi

- Status pesanan
- Promo
- Pesanan siap diambil

### 🤖 Chatbot (Customer Side)

- Order via chat
- Tanya menu
- Rekomendasi makanan
- Tracking pesanan
- FAQ otomatis

### 👤 Fitur Customer (Pelanggan)

- Registrasi & Login
- Lihat daftar menu (kategori: makanan, minuman, paket)
- Detail menu (harga, deskripsi, foto)
- Pencarian & filter menu
- Keranjang (cart)
- Pemesanan (dine-in / take away / delivery)
- Pilih metode pembayaran (cash, transfer, e-wallet)
- Tracking status pesanan
- Riwayat transaksi
- Chat dengan bot (chatbot order & tanya menu)
- Notifikasi pesanan

### 🧑‍🍳 Fitur Admin

- Dashboard statistik
- Kelola menu (CRUD)
- Upload foto menu
- Kelola kategori
- Kelola meja (QR generator)
- Kelola user
- Kelola driver
- Kelola promo/voucher
- Monitoring order real-time
- Monitoring chatbot
- Override chatbot (ambil alih chat)

### 💳 Fitur Kasir

- Verifikasi pembayaran
- Input pembayaran cash
- Generate struk
- Lihat transaksi harian
- Refund (opsional)

### 👨‍🍳 Fitur Kitchen (Dapur)

- Lihat order masuk (real-time)
- Filter berdasarkan status
- Update status:
- cooking
- ready
- Prioritas order (VIP / cepat)

### 🚚 Fitur Driver (Opsional jika delivery)

- Lihat order delivery
- Navigasi ke alamat
- Update status:
  - diambil
  - diantar
  - selesai

### 🤖 D. Fitur Chatbot

- Menampilkan daftar menu otomatis
- Rekomendasi menu (best seller)
- Membantu pemesanan via chat
- FAQ (jam buka, lokasi, dll)
- Tracking pesanan via chat
- Integrasi WhatsApp / Web Chat

---

## ⚙️ 2. ROLE (PERAN) DALAM SISTEM

| Role/Peran/Level | Deskripsi/Penjelasan       |
| ---------------- | -------------------------- |
| Customer         | Melakukan pemesanan        |
| Admin            | Mengelola sistem           |
| Kasir            | Memverifikasi pembayaran   |
| Kitchen          | Memproses pesanan          |
| Driver           | Mengantar pesanan          |
| Chatbot          | Asisten otomatis           |
| Guest            | User tanpa login (QR meja) |

---

## 🔄 3. ALUR / PROSES KERJA SISTEM

### 🪑 A. Alur Scan QR Meja (Tanpa Login)

1. Customer scan QR Code meja
2. Sistem membaca:
   - table_id
3. Sistem membuat:
   - session guest (tanpa login)
4. Customer langsung masuk ke menu
5. Customer pesan makanan
6. Order tersimpan dengan:
   - table_id
   - guest_session_id

### 🔐 B. Alur Non-QR (Harus Login)

1. Customer buka aplikasi
2. Login / registrasi
3. Pilih menu
4. Checkout
5. Order dibuat

### 🛒 Dari Pemesanan hingga Transaksi

1. Customer Masuk

- Login / langsung via chatbot

2. Pilih Menu
   - Manual (UI aplikasi)
   - Atau via chatbot:
   - “Saya mau nasi rendang”
   - Bot respon: tampilkan menu + harga
3. Tambah ke Keranjang
   - Sistem simpan ke tabel cart
4. Checkout
   - Pilih:
   - Dine-in / Delivery
   - Metode pembayaran
5. Buat Pesanan
   - Data masuk ke tabel orders
   - Status: pending
6. Verifikasi Admin/Kasir
   - Status: confirmed
7. Proses Dapur (Kitchen)
   - Status: cooking
8. Pengantaran / Selesai
   - Status:
   - delivering → driver
   - completed
9. Pembayaran
   - Cash / transfer
   - Status: paid

---

## 🤖 4. PERAN & POSISI CHATBOT

### 📍 Chatbot bekerja di sisi:

- Frontend (User Interface) → chat (web / WhatsApp)
- Backend (AI / Logic) → proses intent user

### 🧠 Fungsi Chatbot:

- NLP (Natural Language Processing)
- Menangkap intent:
- Pesan makanan
- Tanya menu
- Cek status

---

## 🔁 5. FLOW CHATBOT DALAM SISTEM

1. User kirim pesan
2. Chatbot parsing teks
3. Mapping ke intent:

- order
- info

4. Ambil data dari database
5. Kirim respon ke user
6. Jika order → masuk ke sistem utama

---

## 🗄️ 6. DESAIN DATABASE (TABEL + PK/FK)

### 🧾 1. users

| Field    | Tipe    | Keterangan            |
| -------- | ------- | --------------------- |
| id (PK)  | bigint  | ID user               |
| name     | varchar | Nama                  |
| email    | varchar | Email                 |
| password | varchar | Password              |
| role     | enum    | admin/customer/driver |

### 🍽️ 2. categories

| Field   | Tipe    | Keterangan    |
| ------- | ------- | ------------- |
| id (PK) | bigint  | ID kategori   |
| name    | varchar | Nama kategori |

### 🍛 3. menus

| Field            | Tipe    | Keterangan           |
| ---------------- | ------- | -------------------- |
| id (PK)          | bigint  | ID menu              |
| category_id (FK) | bigint  | Relasi ke categories |
| name             | varchar | Nama menu            |
| price            | decimal | Harga                |
| description      | text    | Deskripsi            |
| image            | varchar | Foto                 |

### 🛒 4. carts

| Field        | Tipe   | Keterangan      |
| ------------ | ------ | --------------- |
| id (PK)      | bigint | ID cart         |
| user_id (FK) | bigint | Relasi ke users |

### 🧺 5. cart_items

| Field        | Tipe   | Keterangan      |
| ------------ | ------ | --------------- |
| id (PK)      | bigint | ID              |
| cart_id (FK) | bigint | Relasi ke carts |
| menu_id (FK) | bigint | Relasi ke menus |
| qty          | int    | Jumlah          |

### 📦 6. orders

| Field         | Tipe   | Keterangan     |
| ------------- | ------ | -------------- |
| table_id (FK) | bigint | Meja           |
| guest_id (FK) | bigint | Guest          |
| order_source  | enum   | app/chatbot/qr |

### 📋 7. order_items

| Field         | Tipe    | Keterangan       |
| ------------- | ------- | ---------------- |
| id (PK)       | bigint  | ID               |
| order_id (FK) | bigint  | Relasi ke orders |
| menu_id (FK)  | bigint  | Menu             |
| qty           | int     | Jumlah           |
| price         | decimal | Harga            |

### 💳 8. payments

| Field         | Tipe     | Keterangan       |
| ------------- | -------- | ---------------- |
| id (PK)       | bigint   | ID               |
| order_id (FK) | bigint   | Relasi ke orders |
| method        | enum     | cash, transfer   |
| status        | enum     | unpaid, paid     |
| paid_at       | datetime | Waktu bayar      |

### 🚚 9. deliveries (opsional)

| Field          | Tipe   | Keterangan       |
| -------------- | ------ | ---------------- |
| id (PK)        | bigint | ID               |
| order_id (FK)  | bigint | Order            |
| driver_id (FK) | bigint | User driver      |
| status         | enum   | delivering, done |

### 🤖 10. chatbot_logs

| Field        | Tipe     | Keterangan  |
| ------------ | -------- | ----------- |
| id (PK)      | bigint   | ID          |
| user_id (FK) | bigint   | User        |
| message      | text     | Pesan user  |
| response     | text     | Balasan bot |
| created_at   | datetime | Timestamp   |

### 🪑 11. tables

| Field   | Tipe    | Keterangan     |
| ------- | ------- | -------------- |
| id (PK) | bigint  | ID meja        |
| name    | varchar | Nama meja      |
| qr_code | text    | URL QR         |
| status  | enum    | aktif/nonaktif |

### 👤 12. guest_sessions

| Field         | Tipe     | Keterangan |
| ------------- | -------- | ---------- |
| id (PK)       | bigint   | ID         |
| table_id (FK) | bigint   | Meja       |
| created_at    | datetime | Waktu      |

### 💬 13. chatbot_sessions

| Field        | Tipe     | Keterangan |
| ------------ | -------- | ---------- |
| id (PK)      | bigint   | ID         |
| user_id (FK) | bigint   | User       |
| session_id   | varchar  | Session    |
| created_at   | datetime | Waktu      |

### 🎟️ vouchers

| Field      | Tipe     | Keterangan |
| ---------- | -------- | ---------- |
| id (PK)    | bigint   | ID         |
| code       | varchar  | Kode       |
| discount   | decimal  | Diskon     |
| expired_at | datetime | Exp        |
