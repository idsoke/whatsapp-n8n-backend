# WhatsApp Automation Backend

Backend NestJS ini dibuat untuk otomasi pencatatan transaksi melalui WhatsApp dengan bantuan n8n.

User bisa mengirim pesan WhatsApp seperti:

```text
masuk 50000 iuran kelas
keluar 25000 beli konsumsi
```

n8n akan membaca pesan tersebut, mengubahnya menjadi data terstruktur, mengirimkannya ke backend, lalu backend mengembalikan saldo terbaru.

## Ringkasan Fitur

- Parsing command transaksi dari WhatsApp:
  - `masuk 50000 iuran kelas`
  - `keluar 25000 beli konsumsi`
- Endpoint backend:
  - `POST /transactions/wa`
- Modul admin untuk pengaturan sistem:
  - `GET /admin`
  - `GET /admin/settings`
  - `PUT /admin/settings`
  - `GET /admin/system-status`
- Modul web bendahara:
  - `GET /bendahara`
  - `GET /bendahara/summary`
  - `GET /bendahara/transactions`
  - `POST /bendahara/transactions`
- Frontend admin sistem:
  - pengaturan nama aplikasi
  - pengaturan provider WhatsApp
  - aktivasi/nonaktivasi webhook WhatsApp
  - pengaturan backend base URL
  - pengaturan kontak admin
  - pengaturan timezone
  - pengaturan tanggal tutup buku
  - status sistem dan environment
- Frontend bendahara:
  - halaman khusus input transaksi tanpa WhatsApp
  - pilihan pemasukan atau pengeluaran
  - input nominal dan keterangan
  - ringkasan saldo, pemasukan bulan ini, dan pengeluaran bulan ini
  - tabel transaksi terbaru
  - pencatatan report dan laporan bulanan
- Pemrosesan transaksi:
  - `masuk` mencatat pemasukan dan menambah saldo
  - `keluar` mencatat pengeluaran dan mengurangi saldo
- Format response API:

  ```json
  {
    "success": true,
    "message": "Transaction created",
    "currentBalance": 1250000
  }
  ```

- Validasi input:
  - menolak command yang tidak didukung
  - menolak nominal transaksi yang kosong atau tidak valid
  - menerima pesan WhatsApp mentah atau payload yang sudah diparse oleh n8n
- Support command saldo:
  - `saldo`
- Support command laporan bulanan:
  - `laporan bulan ini`
  - `pengeluaran bulan ini`
- Arsitektur workflow n8n:
  - menerima webhook WhatsApp
  - parse isi pesan
  - kirim HTTP request ke NestJS API
  - kirim response webhook
  - optional reply balik ke WhatsApp
- Dokumentasi pendukung:
  - arsitektur webhook
  - sequence diagram Mermaid
  - desain workflow n8n
  - skeleton workflow n8n yang bisa diimport

## Teknologi yang Digunakan

- Node.js: runtime untuk menjalankan backend JavaScript/TypeScript.
- NestJS: framework backend untuk membuat module, controller, service, validation pipe, dan endpoint API.
- TypeScript: bahasa utama agar implementasi backend lebih type-safe dan mudah dirawat.
- n8n: automation workflow tool untuk menerima webhook WhatsApp, parsing pesan, dan memanggil API NestJS.
- WhatsApp provider webhook: jalur integrasi pesan masuk dari WhatsApp. Bisa memakai WhatsApp Cloud API, Twilio, Wablas, Fonnte, atau provider lain.
- class-validator: validasi field request seperti `message`, `command`, dan `amount`.
- class-transformer: transformasi data request, misalnya mengubah `amount` menjadi number.
- Mermaid: membuat sequence diagram di `architecture.md`.
- JSON workflow: `n8n-whatsapp-workflow.json` sebagai skeleton workflow yang bisa diimport ke n8n.

## Cara Menjalankan

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Start the backend:

   ```powershell
   npm run start:dev
   ```

3. n8n can call:

   ```text
   POST http://localhost:3000/transactions/wa
   ```

4. Admin system page can be opened at:

   ```text
   http://localhost:3000/admin
   ```

5. Bendahara web page can be opened at:

   ```text
   http://localhost:3000/bendahara
   ```

## Example request

```json
{
  "message": "masuk 50000 iuran kelas"
}
```

## Example response

```json
{
  "success": true,
  "message": "Transaction created",
  "currentBalance": 50000
}
```

## Workflow docs

- `architecture.md`: webhook architecture and sequence diagrams
- `n8n-workflow-design.md`: n8n node-by-node design and parse script
- `n8n-whatsapp-workflow.json`: importable n8n workflow skeleton

## Admin API

Admin digunakan untuk pengaturan sistem, bukan untuk transaksi keuangan.

Open admin system frontend:

```text
GET /admin
```

Get system settings:

```text
GET /admin/settings
```

Update system settings:

```text
PUT /admin/settings
```

Request body:

```json
{
  "appName": "Kas Kelas WhatsApp Automation",
  "whatsappProvider": "whatsapp-cloud-api",
  "whatsappWebhookEnabled": true,
  "backendBaseUrl": "http://localhost:3000",
  "adminContact": "admin@example.com",
  "timezone": "Asia/Jakarta",
  "reportClosingDay": 31
}
```

Get system status:

```text
GET /admin/system-status
```

## Bendahara Web API

Bendahara digunakan untuk transaksi, pencatatan, saldo, dan report.

Open bendahara frontend:

```text
GET /bendahara
```

Create transaction without WhatsApp:

```text
POST /bendahara/transactions
```

Request body:

```json
{
  "type": "masuk",
  "amount": 50000,
  "description": "iuran kelas"
}
```

Get bendahara summary:

```text
GET /bendahara/summary
```

Get transaction list:

```text
GET /bendahara/transactions
```
