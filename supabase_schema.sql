-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients Table
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Repairs Table
create table if not exists repairs (
  id uuid default uuid_generate_v4() primary key,
  reference text not null,
  client_id uuid references clients(id) on delete set null,
  device_name text not null,
  category text,
  priority text default 'Normale',
  problem_description text,
  status text not null default 'En cours', -- 'En cours', 'En attente', 'Terminée', 'Devis à valider', 'Diagnostiquée'
  shop_name text,
  technician_name text,
  cost numeric(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Optional - Basic public access for this template)
alter table clients enable row level security;
alter table repairs enable row level security;

create policy "Enable read access for all users" on clients for select using (true);
create policy "Enable insert access for all users" on clients for insert with check (true);
create policy "Enable update access for all users" on clients for update using (true);
create policy "Enable delete access for all users" on clients for delete using (true);

create policy "Enable read access for all users" on repairs for select using (true);
create policy "Enable insert access for all users" on repairs for insert with check (true);
create policy "Enable update access for all users" on repairs for update using (true);
create policy "Enable delete access for all users" on repairs for delete using (true);
