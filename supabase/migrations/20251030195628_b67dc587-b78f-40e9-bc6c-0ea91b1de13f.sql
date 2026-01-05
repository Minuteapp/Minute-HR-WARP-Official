-- Company Role Configurations Tabelle
create table if not exists public.company_role_configurations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  available_roles text[] not null default '{employee,manager,hr,admin}',
  role_labels jsonb default '{"employee": "Mitarbeiter", "manager": "Teamleiter", "hr": "HR Admin", "admin": "Administrator"}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(company_id)
);

-- RLS aktivieren
alter table public.company_role_configurations enable row level security;

-- Policy: Admins und SuperAdmins können Rollenkonfigurationen lesen
create policy "Admins can read role configurations"
on public.company_role_configurations
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'superadmin')
  )
);

-- Policy: Admins und SuperAdmins können Rollenkonfigurationen schreiben
create policy "Admins can manage role configurations"
on public.company_role_configurations
for all
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'superadmin')
  )
)
with check (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'superadmin')
  )
);

-- Trigger für updated_at
create or replace function public.update_company_role_configurations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_company_role_configurations_updated_at
  before update on public.company_role_configurations
  for each row
  execute function public.update_company_role_configurations_updated_at();

-- Index für Performance
create index if not exists idx_company_role_configurations_company_id 
on public.company_role_configurations(company_id);