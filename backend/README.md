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

2. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dari Supabase.
   Ambil dari **Supabase Dashboard > Connect > ORMs > SQLAlchemy**, atau gunakan
   **Session pooler** bila koneksi direct Supabase tidak dapat dijangkau dari jaringan Anda.
3. Pastikan `DATABASE_SSL_MODE=require` untuk koneksi Supabase.
4. Jalankan API dari folder `backend`:

   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

Endpoint:

- `GET http://localhost:8000/health`
- `GET http://localhost:8000/api/articles`

Contoh `.env` untuk Supabase:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
DATABASE_SSL_MODE=require
FRONTEND_ORIGIN=http://localhost:5173
```

Jika password mengandung karakter khusus seperti `@`, `:`, `/`, atau `#`, lakukan
URL-encoding pada password sebelum memasukkannya ke `DATABASE_URL`. Jangan menaruh
connection string tersebut di frontend atau commit ke Git.

Saat ini tabel artikel dibuat otomatis untuk tahap awal. Sebelum production,
gunakan migration Alembic agar perubahan schema dapat dilacak.
