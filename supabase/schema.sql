-- SaySo Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Families table (parent/guardian info)
create table if not exists public.families (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  kid_name text, -- main child's name for SMS references
  kid_age integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Children table (can have multiple kids per family)
create table if not exists public.children (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families(id) on delete cascade not null,
  name text not null,
  birthday date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Entries/quotes table (child quotes captured via SMS)
create table if not exists public.entries (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families(id) on delete cascade not null,
  quote text not null,
  source text default 'freeform', -- 'prompt' or 'freeform'
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.entries enable row level security;

-- RLS Policies for families
create policy "Users can view their own family"
  on public.families for select
  using (auth.uid() = auth_user_id);

create policy "Users can insert their own family"
  on public.families for insert
  with check (auth.uid() = auth_user_id);

create policy "Users can update their own family"
  on public.families for update
  using (auth.uid() = auth_user_id);

-- RLS Policies for children
create policy "Users can view their own children"
  on public.children for select
  using (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert their own children"
  on public.children for insert
  with check (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

create policy "Users can update their own children"
  on public.children for update
  using (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

create policy "Users can delete their own children"
  on public.children for delete
  using (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

-- RLS Policies for entries
create policy "Users can view their own entries"
  on public.entries for select
  using (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert their own entries"
  on public.entries for insert
  with check (
    family_id in (
      select id from public.families where auth_user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_families_updated_at
  before update on public.families
  for each row execute function public.update_updated_at_column();

create trigger update_children_updated_at
  before update on public.children
  for each row execute function public.update_updated_at_column();

