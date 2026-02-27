-- Migration to add missing columns

-- Add notes to clients
alter table clients add column if not exists notes text;

-- Add priority and category to repairs
alter table repairs add column if not exists priority text default 'Normale';
alter table repairs add column if not exists category text;
