-- Roof Doctors combined application persistence baseline
-- Apply manually in the Supabase SQL Editor for project gubvelngdohrfvqeeabu.
-- This migration is additive. It does not alter or delete existing application data.
-- All operational tables intentionally have RLS enabled and no client policies.
-- Tables use the default public API schema, but only trusted server code with the
-- service role secret should access them. Never expose that secret to browser code.

create extension if not exists pgcrypto;

create table if not exists public.trd_records (
  id text primary key,
  record_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trd_records_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists trd_records_type_idx
  on public.trd_records (record_type);
create index if not exists trd_records_updated_idx
  on public.trd_records (updated_at desc);

create table if not exists public.crd_organizations (
  organization_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_organizations_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.crd_contacts (
  contact_id text primary key,
  organization_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_contacts_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_contacts_organization_idx
  on public.crd_contacts (organization_id);

create table if not exists public.crd_properties (
  property_id text primary key,
  organization_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_properties_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_properties_organization_idx
  on public.crd_properties (organization_id);

create table if not exists public.crd_roofs (
  roof_id text primary key,
  property_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_roofs_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_roofs_property_idx
  on public.crd_roofs (property_id);

create table if not exists public.crd_leads (
  lead_id text primary key,
  organization_id text,
  contact_id text,
  property_id text,
  status text not null default 'New',
  priority text not null default 'Normal',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_leads_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_leads_created_idx
  on public.crd_leads (created_at desc);
create index if not exists crd_leads_status_priority_idx
  on public.crd_leads (status, priority);

create table if not exists public.crd_calculator_submissions (
  submission_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint crd_calculator_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.crd_timeline_events (
  event_id text primary key,
  lead_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint crd_timeline_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_timeline_lead_created_idx
  on public.crd_timeline_events (lead_id, created_at);

alter table public.trd_records enable row level security;
alter table public.crd_organizations enable row level security;
alter table public.crd_contacts enable row level security;
alter table public.crd_properties enable row level security;
alter table public.crd_roofs enable row level security;
alter table public.crd_leads enable row level security;
alter table public.crd_calculator_submissions enable row level security;
alter table public.crd_timeline_events enable row level security;

revoke all on all tables in schema app_private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema app_private to service_role;


-- Uploaded customer and inspection photos must be stored in object storage,
-- not in JSON rows or the ephemeral Cloud Run filesystem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'roof-doctors-private',
  'roof-doctors-private',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies are created here. Upload and download are server-only
-- until a deliberate authenticated user access model is implemented.
