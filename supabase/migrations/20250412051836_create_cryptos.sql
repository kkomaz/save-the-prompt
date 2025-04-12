-- Create cryptos table
create table public.cryptos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable Row-Level Security
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

-- (Optional) Policy: Allow all users to select
create policy "Anyone can read cryptos"
on public.cryptos
for select
using (true);
