-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable vector extension for RAG
create extension if not exists vector;

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text default 'intern' check (role in ('founder', 'intern')),
  created_at timestamptz default now()
);

-- Documents for RAG
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  module text,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Session logs (observability)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  module text not null,
  input text,
  output text,
  latency_ms integer,
  cost_usd numeric(10,6) default 0,
  model text,
  status text default 'success',
  created_at timestamptz default now()
);

-- Module logs
create table if not exists public.module_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  step text,
  data jsonb,
  created_at timestamptz default now()
);

-- Vendor emails state
create table if not exists public.vendor_emails (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  vendor_name text,
  po_number text,
  intent text,
  summary text,
  status text default 'pending',
  raw_email text,
  draft_reply text,
  anomaly_flags jsonb default '[]',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.sessions enable row level security;
alter table public.vendor_emails enable row level security;

-- RLS policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can read own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can read own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users can read own vendor emails" on public.vendor_emails for select using (auth.uid() = user_id);
create policy "Users can insert own vendor emails" on public.vendor_emails for insert with check (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
