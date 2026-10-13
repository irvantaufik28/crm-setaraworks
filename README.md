# SetaraWorks CRM

Internal sales CRM untuk mencatat lead, mengatur follow-up, memindahkan pipeline, menyimpan aktivitas, dan melacak proposal. Aplikasi hanya memiliki area admin dan memakai Supabase untuk Auth serta PostgreSQL.

## Setup

1. Jalankan migration `supabase/migrations/20261013000000_initial_crm.sql` melalui Supabase CLI atau SQL Editor.
2. Buat user admin melalui Supabase Authentication. Trigger migration akan membuat profil `public.users` dengan role `admin`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan publishable key Supabase.
4. Jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Root akan mengarah ke dashboard atau login sesuai sesi.

## Pemeriksaan

```bash
npm run typecheck
npm run lint
npm run build
```

Service-role key tidak digunakan oleh aplikasi. Akses data dibatasi lewat Row Level Security untuk user terautentikasi dengan role `admin`.
# crm-setaraworks
