-- Drop the existing table if it exists
drop table if exists public.cryptos cascade;

-- Recreate cryptos table without user_id
create table public.cryptos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.cryptos enable row level security;

-- Policy: Only admins can insert
create policy "Admins can insert cryptos"
on public.cryptos
for insert
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

-- (Optional) Policy: Allow everyone to read
create policy "Anyone can read cryptos"
on public.cryptos
for select
using (true);

-- Seed predefined cryptos
insert into public.cryptos (id, name, created_at) values
  (gen_random_uuid(), 'Ethereum', now()),
  (gen_random_uuid(), 'Optimism', now()),
  (gen_random_uuid(), 'Binance Smart Chain (BSC)', now()),
  (gen_random_uuid(), 'Gnosis', now()),
  (gen_random_uuid(), 'Polygon', now()),
  (gen_random_uuid(), 'Sonic', now()),
  (gen_random_uuid(), 'zkSync', now()),
  (gen_random_uuid(), 'Metis', now()),
  (gen_random_uuid(), 'Kava EVM', now()),
  (gen_random_uuid(), 'Base', now()),
  (gen_random_uuid(), 'IOTA EVM', now()),
  (gen_random_uuid(), 'Avalanche', now()),
  (gen_random_uuid(), 'Arbitrum', now()),
  (gen_random_uuid(), 'Scroll', now()),
  (gen_random_uuid(), 'Solana', now());
