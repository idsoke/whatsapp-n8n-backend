# KasBot — WhatsApp-Powered Cash Management System

Backend NestJS untuk otomasi pencatatan kas melalui WhatsApp dengan bantuan n8n.

Bendahara cukup kirim pesan WhatsApp seperti:

```text
masuk 50000 iuran kelas
keluar 25000 beli konsumsi
```

n8n membaca pesan, mengubahnya menjadi data terstruktur, mengirimkannya ke KasBot, lalu KasBot membalas dengan saldo terbaru.

## Fitur

- Parsing command transaksi dari WhatsApp:
  - `masuk 50000 iuran kelas`
  - `keluar 25000 beli konsumsi`
  - `saldo`
  - `laporan bulan ini`
  - `pengeluaran bulan ini`
- Webhook endpoint untuk n8n:
  - `POST /transactions/wa`
- Web bendahara — input transaksi manual tanpa WhatsApp:
  - `GET /bendahara`
  - `GET /bendahara/summary`
  - `GET /bendahara/transactions`
  - `POST /bendahara/transactions`
- Admin sistem — konfigurasi aplikasi:
  - `GET /admin`
  - `GET /admin/settings`
  - `PUT /admin/settings`
  - `GET /admin/system-status`
- Validasi input ketat — menolak command tidak dikenal dan nominal tidak valid
- Notifikasi balik ke WhatsApp via n8n setelah transaksi berhasil

## Tech Stack

| Teknologi | Peran |
|-----------|-------|
| NestJS | Framework backend (module, controller, service, pipe) |
| TypeScript | Bahasa utama — type-safe dan mudah dirawat |
| Prisma | ORM untuk PostgreSQL |
| PostgreSQL | Database transaksi dan organisasi |
| n8n | Automation workflow — menerima webhook WhatsApp dan memanggil API |
| class-validator | Validasi request payload |

## Cara Menjalankan

### Prasyarat

- Node.js 20+
- PostgreSQL berjalan di port 5432
- n8n (opsional, untuk integrasi WhatsApp)

### Langkah

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin file environment:

   ```bash
   cp .env.example .env
   ```

3. Sesuaikan `DATABASE_URL` di `.env`, lalu jalankan migrasi:

   ```bash
   npx prisma migrate dev
   ```

4. Jalankan server:

   ```bash
   npm run start:dev
   ```

Server berjalan di `http://localhost:3000`.

## Halaman Web

| URL | Halaman |
|-----|---------|
| `http://localhost:3000/bendahara` | Web bendahara — input transaksi manual |
| `http://localhost:3000/admin` | Admin sistem — konfigurasi aplikasi |

## Contoh Request WhatsApp

```text
POST /transactions/wa
Content-Type: application/json
x-n8n-api-key: <N8N_WEBHOOK_SECRET>
```

```json
{
  "phoneNumber": "628123456789",
  "message": "masuk 50000 iuran kelas"
}
```

Header `x-n8n-api-key` wajib dikirim dan harus sama dengan nilai `N8N_WEBHOOK_SECRET` di `.env`. Request tanpa header ini atau dengan nilai yang salah akan ditolak dengan `401 Unauthorized`.

Response:

```json
{
  "success": true,
  "message": "Transaction created",
  "currentBalance": 50000
}
```

## Contoh Request Bendahara Web

```json
POST /bendahara/transactions
{
  "phoneNumber": "628123456789",
  "type": "masuk",
  "amount": 50000,
  "description": "iuran kelas"
}
```

## Admin API

```text
GET    /admin/settings       — ambil pengaturan sistem
PUT    /admin/settings       — update pengaturan sistem
GET    /admin/system-status  — status service dan environment
```

Contoh body `PUT /admin/settings`:

```json
{
  "appName": "KasBot",
  "whatsappProvider": "whatsapp-cloud-api",
  "whatsappWebhookEnabled": true,
  "backendBaseUrl": "http://localhost:3000",
  "adminContact": "admin@example.com",
  "timezone": "Asia/Jakarta",
  "reportClosingDay": 31
}
```

## Dokumentasi Tambahan

- `architecture.md` — arsitektur webhook dan sequence diagram
- `n8n-workflow-design.md` — desain workflow n8n node per node
- `n8n-whatsapp-workflow.json` — skeleton workflow siap import ke n8n
