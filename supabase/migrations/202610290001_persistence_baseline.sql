-- Roof Doctors combined application persistence baseline
-- Apply manually in the Supabase SQL Editor for project gubvelngdohrfvqeeabu.
-- This migration is additive. It does not alter or delete existing application data.
-- All operational tables intentionally have RLS enabled and no client policies.
-- Access must be performed by trusted server code using a server-side secret only.

create extension if not exists pgcrypto;

create schema if not exists app_private;

create table if not exists app_private.trd_records (
  id text primary key,
  record_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trd_records_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists trd_records_type_idx
  on app_private.trd_records (record_type);
create index if not exists trd_records_updated_idx
  on app_private.trd_records (updated_at desc);

create table if not exists app_private.crd_organizations (
  organization_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_organizations_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists app_private.crd_contacts (
  contact_id text primary key,
  organization_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_contacts_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_contacts_organization_idx
  on app_private.crd_contacts (organization_id);

create table if not exists app_private.crd_properties (
  property_id text primary key,
  organization_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_properties_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_properties_organization_idx
  on app_private.crd_properties (organization_id);

create table if not exists app_private.crd_roofs (
  roof_id text primary key,
  property_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crd_roofs_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_roofs_property_idx
  on app_private.crd_roofs (property_id);

create table if not exists app_private.crd_leads (
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
  on app_private.crd_leads (created_at desc);
create index if not exists crd_leads_status_priority_idx
  on app_private.crd_leads (status, priority);

create table if not exists app_private.crd_calculator_submissions (
  submission_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint crd_calculator_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists app_private.crd_timeline_events (
  event_id text primary key,
  lead_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint crd_timeline_payload_is_object check (jsonb_typeof(payload) = 'object')
);
create index if not exists crd_timeline_lead_created_idx
  on app_private.crd_timeline_events (lead_id, created_at);

alter table app_private.trd_records enable row level security;
alter table app_private.crd_organizations enable row level security;
alter table app_private.crd_contacts enable row level security;
alter table app_private.crd_properties enable row level security;
alter table app_private.crd_roofs enable row level security;
alter table app_private.crd_leads enable row level security;
alter table app_private.crd_calculator_submissions enable row level security;
alter table app_private.crd_timeline_events enable row level security;

revoke all on schema app_private from public, anon, authenticated;
revoke all on all tables in schema app_private from public, anon, authenticated;
grant usage on schema app_private to service_role;
grant select, insert, update, delete on all tables in schema app_private to service_role;

alter default privileges in schema app_private
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema app_private
  grant select, insert, update, delete on tables to service_role;

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
