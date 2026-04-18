-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  phone text unique not null,
  name text,
  age int,
  gender text,
  location text,
  genotype text,
  role text default 'patient' check (role in ('patient', 'worker')),
  emergency_contact text,
  created_at timestamptz default now()
);

-- Health logs table
create table if not exists health_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  water numeric,
  sleep numeric,
  stress numeric,
  pain numeric,
  temperature numeric,
  symptoms text[],
  created_at timestamptz default now()
);

-- Alerts table
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  risk_level text check (risk_level in ('LOW', 'MEDIUM', 'HIGH')),
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table health_logs enable row level security;
alter table alerts enable row level security;

-- RLS Policies (drop first to avoid duplicate errors)
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Users can update own profile" on users;
drop policy if exists "Users can view own logs" on health_logs;
drop policy if exists "Users can insert own logs" on health_logs;
drop policy if exists "Users can view own alerts" on alerts;
drop policy if exists "Users can update own alerts" on alerts;
drop policy if exists "Service role full access users" on users;
drop policy if exists "Service role full access logs" on health_logs;
drop policy if exists "Service role full access alerts" on alerts;

create policy "Users can view own profile"
  on users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update using (auth.uid() = id);

create policy "Users can view own logs"
  on health_logs for select using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on health_logs for insert with check (auth.uid() = user_id);

create policy "Users can view own alerts"
  on alerts for select using (auth.uid() = user_id);

create policy "Users can update own alerts"
  on alerts for update using (auth.uid() = user_id);

-- Allow service role (backend) to bypass RLS
create policy "Service role full access users"
  on users for all using (true) with check (true);

create policy "Service role full access logs"
  on health_logs for all using (true) with check (true);

create policy "Service role full access alerts"
  on alerts for all using (true) with check (true);
