-- 009_fact_packets.sql
-- Fact Packet store — single source of truth for every Jackie deliverable.
-- Each packet is immutable once release_status='ready'; corrections force a
-- new version by inserting a fresh row with version+1 and the same address.

create table if not exists fact_packets (
  packet_id        text primary key,
  version          int  not null check (version >= 1),
  address          text not null,
  borough          text,
  zip              text,

  year_built       int  check (year_built between 1800 and extract(year from now())::int + 1),
  units            int  check (units > 0),
  stories          int  check (stories > 0),
  building_class   text,

  fields           jsonb not null default '{}'::jsonb,

  release_status   text not null check (release_status in ('draft','review','ready','archived')),
  created_by       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists fact_packets_address_idx
  on fact_packets (lower(address));

create index if not exists fact_packets_release_status_idx
  on fact_packets (release_status);

create index if not exists fact_packets_address_version_idx
  on fact_packets (lower(address), version desc);

-- Enforce "ready packets are immutable" — any UPDATE to a ready row is rejected
-- unless the caller is bumping it to 'archived'.
create or replace function enforce_ready_packet_immutability()
returns trigger language plpgsql as $$
begin
  if OLD.release_status = 'ready'
     and NEW.release_status not in ('archived')
     and (NEW.fields is distinct from OLD.fields
          or NEW.address is distinct from OLD.address
          or NEW.year_built is distinct from OLD.year_built
          or NEW.units is distinct from OLD.units) then
    raise exception 'fact_packets %.v% is ready and immutable; insert a new version instead', OLD.packet_id, OLD.version;
  end if;
  NEW.updated_at := now();
  return NEW;
end $$;

drop trigger if exists fact_packets_immutable on fact_packets;
create trigger fact_packets_immutable
  before update on fact_packets
  for each row execute function enforce_ready_packet_immutability();

-- Audit table: every release is logged for compliance.
create table if not exists fact_packet_audit (
  audit_id        bigserial primary key,
  packet_id       text not null,
  version         int  not null,
  released_by     text,
  released_at     timestamptz not null default now(),
  validator_blockers jsonb not null default '[]'::jsonb,
  validator_warnings jsonb not null default '[]'::jsonb
);

create index if not exists fact_packet_audit_packet_idx
  on fact_packet_audit (packet_id);

-- RLS — only service_role can write; authenticated users can read.
alter table fact_packets enable row level security;
alter table fact_packet_audit enable row level security;

drop policy if exists "fact_packets_read" on fact_packets;
create policy "fact_packets_read"
  on fact_packets for select
  to authenticated
  using (true);

drop policy if exists "fact_packets_service_write" on fact_packets;
create policy "fact_packets_service_write"
  on fact_packets for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "fact_packet_audit_read" on fact_packet_audit;
create policy "fact_packet_audit_read"
  on fact_packet_audit for select
  to authenticated
  using (true);

drop policy if exists "fact_packet_audit_service_write" on fact_packet_audit;
create policy "fact_packet_audit_service_write"
  on fact_packet_audit for all
  to service_role
  using (true)
  with check (true);

comment on table fact_packets is
  'Versioned, immutable source-of-truth for all Jackie deliverables. See src/lib/fact-packet.ts and supabase/functions/build-fact-packet.';
