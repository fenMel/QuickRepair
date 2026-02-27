-- Table: stock (Pièces détachées)
create table if not exists stock (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  reference text,
  quantite integer default 0,
  prix_achat numeric(10,2),
  prix_vente numeric(10,2),
  id_boutique integer, 
  created_at timestamptz default now()
);

-- Table: utilise (Pièces utilisées pour une réparation)
create table if not exists utilise (
  id uuid default gen_random_uuid() primary key,
  id_reparation uuid references reparation(id) on delete cascade,
  id_piece uuid references stock(id),
  quantite integer default 1,
  created_at timestamptz default now()
);

-- Table: devis (Devis liés aux réparations)
create table if not exists devis (
  id uuid default gen_random_uuid() primary key,
  id_reparation uuid references reparation(id) on delete cascade,
  montant_total numeric(10,2),
  statut text default 'Brouillon', -- Brouillon, En attente, Accepté, Refusé
  date_creation timestamptz default now(),
  contenu jsonb -- Détails des lignes du devis
);

-- Enable RLS
alter table stock enable row level security;
alter table utilise enable row level security;
alter table devis enable row level security;

-- Policies (Basic access)
create policy "Enable read access for all users" on stock for select using (true);
create policy "Enable write access for all users" on stock for all using (true);

create policy "Enable read access for all users" on utilise for select using (true);
create policy "Enable write access for all users" on utilise for all using (true);

create policy "Enable read access for all users" on devis for select using (true);
create policy "Enable write access for all users" on devis for all using (true);
