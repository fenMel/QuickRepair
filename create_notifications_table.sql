-- Table: notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  user_id uuid references auth.users(id) on delete set null
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies (Public access for demo purposes, adjust for production)
create policy "Enable read access for all users" on notifications for select using (true);
create policy "Enable insert access for all users" on notifications for insert with check (true);
create policy "Enable update access for all users" on notifications for update using (true);
