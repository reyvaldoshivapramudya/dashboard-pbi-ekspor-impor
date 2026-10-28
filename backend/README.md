# Backend API

Backend ini menjadi penghubung antara dashboard Vue, PostgreSQL, dan worker Python
untuk proses scraping.

## Menjalankan lokal

1. Buat virtual environment dan pasang dependency:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. Buat database lokal, misalnya `dashboard_pbi`.
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan `DATABASE_URL` dengan PostgreSQL lokal.
   Nilai default menggunakan host `localhost`, port `5432`, user `postgres`, dan database
   `dashboard_pbi`.
4. Gunakan `DATABASE_SSL_MODE=disable` untuk PostgreSQL lokal. Jika PostgreSQL lokal Anda
   dikonfigurasi menggunakan SSL, ubah nilainya menjadi `require`.
5. Jalankan API dari folder `backend`:

   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

Endpoint:

- `GET http://localhost:8000/health`
- `GET http://localhost:8000/api/articles`

Contoh `.env` untuk PostgreSQL lokal:

```env
DATABASE_URL=<postgresql-connection-string>
DATABASE_SSL_MODE=disable
FRONTEND_ORIGIN=http://localhost:5173
```

Jika password mengandung karakter khusus seperti `@`, `:`, `/`, atau `#`, lakukan
URL-encoding pada password sebelum memasukkannya ke `DATABASE_URL`. Jangan menaruh
connection string tersebut di frontend atau commit ke Git.

Saat ini tabel artikel dibuat otomatis untuk tahap awal. Sebelum production,
gunakan migration Alembic agar perubahan schema dapat dilacak.
