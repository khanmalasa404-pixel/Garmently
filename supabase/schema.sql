-- Garmently database schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

-- ─────────────────────────────────────────────
-- garments
-- ─────────────────────────────────────────────
create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (
    category in ('top', 'bottom', 'outerwear', 'dress', 'footwear', 'accessory', 'other')
  ),
  brand text,
  primary_color text,
  material text,
  image_path text,
  care_label_image_path text,
  washing_instructions text,
  detergent_recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists garments_user_id_idx on public.garments (user_id);

alter table public.garments enable row level security;

drop policy if exists "garments_select_own" on public.garments;
create policy "garments_select_own" on public.garments
  for select using (auth.uid() = user_id);

drop policy if exists "garments_insert_own" on public.garments;
create policy "garments_insert_own" on public.garments
  for insert with check (auth.uid() = user_id);

drop policy if exists "garments_update_own" on public.garments;
create policy "garments_update_own" on public.garments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "garments_delete_own" on public.garments;
create policy "garments_delete_own" on public.garments
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.garments to authenticated;

-- ─────────────────────────────────────────────
-- garments: catalog photo + tag/barcode capture
-- ─────────────────────────────────────────────
alter table public.garments add column if not exists catalog_image_path text;
alter table public.garments add column if not exists tag_image_path text;
alter table public.garments add column if not exists tag_barcode_value text;
alter table public.garments add column if not exists tag_barcode_format text;

-- ─────────────────────────────────────────────
-- outfits
-- ─────────────────────────────────────────────
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  occasion text not null,
  style_preference text,
  explanation text not null,
  styling_tips text[] not null default '{}',
  missing_pieces text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists outfits_user_id_idx on public.outfits (user_id);

alter table public.outfits enable row level security;

drop policy if exists "outfits_select_own" on public.outfits;
create policy "outfits_select_own" on public.outfits
  for select using (auth.uid() = user_id);

drop policy if exists "outfits_insert_own" on public.outfits;
create policy "outfits_insert_own" on public.outfits
  for insert with check (auth.uid() = user_id);

drop policy if exists "outfits_delete_own" on public.outfits;
create policy "outfits_delete_own" on public.outfits
  for delete using (auth.uid() = user_id);

grant select, insert, delete on public.outfits to authenticated;

-- ─────────────────────────────────────────────
-- outfit_items
-- ─────────────────────────────────────────────
create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  garment_id uuid not null references public.garments (id) on delete cascade,
  role text not null,
  reason text not null,
  position integer not null default 0
);

create index if not exists outfit_items_outfit_id_idx on public.outfit_items (outfit_id);
create index if not exists outfit_items_garment_id_idx on public.outfit_items (garment_id);

alter table public.outfit_items enable row level security;

drop policy if exists "outfit_items_select_own" on public.outfit_items;
create policy "outfit_items_select_own" on public.outfit_items
  for select using (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );

drop policy if exists "outfit_items_insert_own" on public.outfit_items;
create policy "outfit_items_insert_own" on public.outfit_items
  for insert with check (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );

drop policy if exists "outfit_items_delete_own" on public.outfit_items;
create policy "outfit_items_delete_own" on public.outfit_items
  for delete using (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );

grant select, insert, delete on public.outfit_items to authenticated;

-- ─────────────────────────────────────────────
-- app_status (used by /test-database as a connectivity check)
-- ─────────────────────────────────────────────
create table if not exists public.app_status (
  id integer primary key generated always as identity,
  message text not null
);

alter table public.app_status enable row level security;

drop policy if exists "app_status_select_all" on public.app_status;
create policy "app_status_select_all" on public.app_status
  for select using (true);

insert into public.app_status (message)
select 'Supabase is connected.'
where not exists (select 1 from public.app_status);

grant select on public.app_status to anon, authenticated;

-- ─────────────────────────────────────────────
-- storage: garment-images bucket (private, per-user folders)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('garment-images', 'garment-images', false)
on conflict (id) do nothing;

drop policy if exists "garment_images_select_own" on storage.objects;
create policy "garment_images_select_own" on storage.objects
  for select using (
    bucket_id = 'garment-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "garment_images_insert_own" on storage.objects;
create policy "garment_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'garment-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "garment_images_delete_own" on storage.objects;
create policy "garment_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'garment-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
