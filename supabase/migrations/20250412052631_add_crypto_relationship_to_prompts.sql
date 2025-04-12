-- Add crypto_id column to prompts table
alter table public.prompts
add column crypto_id uuid references public.cryptos(id) on delete set null;
