-- Jalankan sekali di Supabase Dashboard > SQL Editor.
-- Tabel agregat klik 30 hari untuk Hot Product (dibaca homepage, ditulis cron harian).
create table if not exists klik_agregat (
  name text primary key,
  total bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table klik_agregat enable row level security;

drop policy if exists "klik_agregat_read" on klik_agregat;
create policy "klik_agregat_read"
  on klik_agregat for select
  using (true);
