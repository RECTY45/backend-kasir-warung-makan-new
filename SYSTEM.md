# RM Siantar Minang - System Documentation

Dokumentasi ini berisi panduan untuk menjalankan aplikasi backend, daftar akun default hasil seeding, dan panduan produksi.

---

## 🔐 Daftar Akun Sistem (Lengkap)

Semua akun di bawah ini menggunakan password default: `password123`

### 0. Akun Superadmin (Special Access)
Digunakan untuk konfigurasi bot tingkat tinggi dan audit sistem.

| Nama | Email | Role | Password |
| :--- | :--- | :--- | :--- |
| Muhammad Bintang | `muhbintang650@gmail.com` | SUPERADMIN | `password123` |
| Superadmin 2 | `superadmin2@rmsiantar.com` | SUPERADMIN | `password123` |
| Superadmin 3 | `superadmin3@rmsiantar.com` | SUPERADMIN | `password123` |

### 1. Akun Staff & Operasional
Digunakan untuk menguji berbagai modul manajemen aplikasi.

| Nama | Email | Role | Password |
| :--- | :--- | :--- | :--- |
| Admin Staff 1 | `admin1@rmsiantar.com` | ADMIN | `password123` |
| Admin Staff 2 | `admin2@rmsiantar.com` | ADMIN | `password123` |
| Admin Staff 3 | `admin3@rmsiantar.com` | ADMIN | `password123` |
| Kasir Staff 1 | `kasir1@rmsiantar.com` | KASIR | `password123` |
| Kasir Staff 2 | `kasir2@rmsiantar.com` | KASIR | `password123` |
| Kasir Staff 3 | `kasir3@rmsiantar.com` | KASIR | `password123` |
| Kitchen Staff 1 | `kitchen1@rmsiantar.com` | KITCHEN | `password123` |
| Kitchen Staff 2 | `kitchen2@rmsiantar.com` | KITCHEN | `password123` |
| Kitchen Staff 3 | `kitchen3@rmsiantar.com` | KITCHEN | `password123` |
| Driver Staff 1 | `driver1@rmsiantar.com` | DRIVER | `password123` |
| Driver Staff 2 | `driver2@rmsiantar.com` | DRIVER | `password123` |
| Driver Staff 3 | `driver3@rmsiantar.com` | DRIVER | `password123` |

### 2. Akun Customer Aktif (Sample Data)
Akun-akun ini memiliki riwayat pesanan (orders), ulasan, dan saldo aktif untuk simulasi.

| No | Email | Role | Password |
| :--- | :--- | :--- | :--- |
| 1 | `customer1@example.com` | CUSTOMER | `password123` |
| 2 | `customer2@example.com` | CUSTOMER | `password123` |
| 3 | `customer3@example.com` | CUSTOMER | `password123` |
| 4 | `customer4@example.com` | CUSTOMER | `password123` |
| 5 | `customer5@example.com` | CUSTOMER | `password123` |
| 6 | `customer6@example.com` | CUSTOMER | `password123` |
| 7 | `customer7@example.com` | CUSTOMER | `password123` |
| 8 | `customer8@example.com` | CUSTOMER | `password123` |
| 9 | `customer9@example.com` | CUSTOMER | `password123` |
| 10 | `customer10@example.com` | CUSTOMER | `password123` |
| 11 | `customer11@example.com` | CUSTOMER | `password123` |
| 12 | `customer12@example.com` | CUSTOMER | `password123` |
| 13 | `customer13@example.com` | CUSTOMER | `password123` |
| 14 | `customer14@example.com` | CUSTOMER | `password123` |
| 15 | `customer15@example.com` | CUSTOMER | `password123` |
| 16 | `customer16@example.com` | CUSTOMER | `password123` |
| 17 | `customer17@example.com` | CUSTOMER | `password123` |
| 18 | `customer18@example.com` | CUSTOMER | `password123` |
| 19 | `customer19@example.com` | CUSTOMER | `password123` |
| 20 | `customer20@example.com` | CUSTOMER | `password123` |
| 21 | `customer21@example.com` | CUSTOMER | `password123` |
| 22 | `customer22@example.com` | CUSTOMER | `password123` |
| 23 | `customer23@example.com` | CUSTOMER | `password123` |
| 24 | `customer24@example.com` | CUSTOMER | `password123` |
| 25 | `customer25@example.com` | CUSTOMER | `password123` |
| 26 | `customer26@example.com` | CUSTOMER | `password123` |
| 27 | `customer27@example.com` | CUSTOMER | `password123` |
| 28 | `customer28@example.com` | CUSTOMER | `password123` |
| 29 | `customer29@example.com` | CUSTOMER | `password123` |
| 30 | `customer30@example.com` | CUSTOMER | `password123` |

---

## 🛠️ Cara Menjalankan (Development)

Pastikan Anda memiliki **Node.js** dan **MariaDB/MySQL** yang sudah berjalan.

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Database
Copy file `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/db_name"
JWT_SECRET="your_secret_key"
PORT=3001
```

### 3. Setup Prisma
Generate client dan jalankan pembaruan skema (push) serta seeding:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Manajemen & Reset Database (Clear Data)
Jika Anda ingin **mengosongkan seluruh data aplikasi** (Clear Data) dan meresetnya ke titik awal menggunakan seeder terbaru, jalankan spesifik perintah berikut:

**Untuk mendelete ulang dan reset (Disarankan untuk testing awal):**
```bash
npx prisma migrate reset
```
*(Perintah di atas akan mendrop seluruh tabel, menjalankan migrasi skema ulang, dan mengeksekusi `npx prisma db seed` secara otomatis)*

**Jika memakai pendekatan db push:**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### 4. Jalankan Aplikasi
```bash
npm run start:dev
```

---

## 🚀 Panduan Produksi (Deployment)

Untuk menjalankan aplikasi di server produksi, ikuti langkah-langkah berikut:

### 1. Build Aplikasi
NestJS perlu dikompilasi menjadi JavaScript murni:
```bash
npm run build
```

### 2. Persiapan Folder Uploads
Pastikan folder `uploads` ada di root project dengan izin akses tulis:
```bash
mkdir -p uploads/menus uploads/promos
chmod -R 755 uploads
```

### 3. Jalankan dengan Process Manager (PM2)
Disarankan menggunakan PM2 agar aplikasi otomatis restart jika terjadi crash:
```bash
# Instal PM2 secara global jika belum ada
npm install -g pm2

# Jalankan aplikasi
pm2 start dist/src/main.js --name "rm-siantar-backend"
```
Atau menggunakan script bawaan:
```bash
npm run start:prod
```

### 4. Update Database di Produksi
Jika ada perubahan schema:
```bash
npx prisma db push
```

---

## 📁 Struktur Penyimpanan Gambar
Backend menyimpan gambar secara lokal di folder berikut:
*   `uploads/menus/`: Foto menu makanan dan minuman.
*   `uploads/promos/`: Gambar banner promo.

Akses publik tersedia melalui endpoint: `http://[YOUR_DOMAIN]:3001/uploads/...`
