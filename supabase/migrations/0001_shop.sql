-- Arganista shop — database schema
-- Run once in Supabase → SQL Editor (then run seed.sql to import the current catalog).

create extension if not exists pgcrypto;

-- ───────────────────────── Team ─────────────────────────
do $$ begin
  create type staff_role as enum ('owner', 'editor');
exception when duplicate_object then null; end $$;

create table if not exists public.staff (
  user_id    uuid primary key references auth.users on delete cascade,
  email      text not null,
  full_name  text,
  role       staff_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid() and role = 'owner');
$$;

-- The very first signed-in user can claim ownership while the team is empty.
create or replace function public.claim_ownership() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from staff) then return false; end if;
  insert into staff (user_id, email, role)
  select id, coalesce(email, ''), 'owner'::staff_role from auth.users where id = auth.uid();
  return true;
end $$;

-- Owner adds an existing Supabase user (created in Authentication → Users) to the team.
create or replace function public.add_staff(p_email text, p_role staff_role, p_name text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not is_owner() then raise exception 'not allowed'; end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'user_not_found'; end if;
  insert into staff (user_id, email, full_name, role) values (v_id, lower(trim(p_email)), p_name, p_role)
  on conflict (user_id) do update set role = excluded.role, full_name = coalesce(excluded.full_name, staff.full_name);
  return v_id;
end $$;

-- Any team member can change their own display name (role stays owner-managed).
create or replace function public.set_my_name(p_name text) returns void
language sql security definer set search_path = public as $$
  update staff set full_name = nullif(trim(p_name), '') where user_id = auth.uid();
$$;

-- ───────────────────────── Catalog ─────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category        text not null,
  ingredients     text[] not null default '{}',
  badges          text[] not null default '{}',
  name            jsonb not null,               -- {"fr": "...", "en": "...", "ar": "..."}
  tagline         jsonb not null default '{}',
  description     jsonb not null default '{}',
  how_to          jsonb not null default '{}',
  key_ingredients jsonb not null default '{}',
  tint            text not null default '#ece3d4',
  active          boolean not null default true,
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products on delete cascade,
  code        text not null,                    -- e.g. "30ml"
  label       text,                             -- e.g. "30 ml" (empty = single size)
  price       numeric(10,2) not null check (price >= 0),
  compare_at  numeric(10,2) check (compare_at is null or compare_at >= 0),
  in_stock    boolean not null default true,
  image_url   text,                             -- photo shown when this size is selected
  position    int not null default 0,
  unique (product_id, code)
);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products on delete cascade,
  url         text not null,
  position    int not null default 0
);

create index if not exists product_variants_product_idx on public.product_variants (product_id, position);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function touch_updated_at();

-- ───────────────────────── Settings ─────────────────────────
create table if not exists public.settings (
  id                 int primary key default 1 check (id = 1),
  whatsapp           text not null default '212600000000',
  email              text not null default 'contact@arganista.ma',
  address            text not null default 'Village Aghbalou, Setti Fadma, Ourika — Marrakech 42450',
  instagram          text not null default 'https://www.instagram.com/arganistacosmetics/',
  facebook           text not null default '',
  shipping_fee       numeric(10,2) not null default 35,
  free_shipping_from numeric(10,2) not null default 300,
  updated_at         timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ───────────────────────── Orders ─────────────────────────
do $$ begin
  create type order_status as enum ('new', 'confirmed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique,
  status        order_status not null default 'new',
  customer_name text not null,
  phone         text not null,
  city          text not null,
  address       text not null,
  note          text,
  lang          text not null default 'fr',
  items         jsonb not null,   -- [{slug, variant, name, label, price, qty, total}]
  subtotal      numeric(10,2) not null,
  shipping      numeric(10,2) not null,
  total         numeric(10,2) not null,
  staff_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function touch_updated_at();

-- Customers place orders only through this function: prices, stock and
-- shipping are always recomputed from the database, never trusted from the browser.
create or replace function public.place_order(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_sub numeric := 0;
  v_ship numeric;
  v_line jsonb;
  v_qty int;
  r record;
  s settings;
  v_number text;
  v_lang text := coalesce(nullif(payload->>'lang', ''), 'fr');
  v_name text := trim(coalesce(payload->>'name', ''));
  v_phone text := regexp_replace(coalesce(payload->>'phone', ''), '[\s.\-]', '', 'g');
  v_city text := trim(coalesce(payload->>'city', ''));
  v_address text := trim(coalesce(payload->>'address', ''));
begin
  if length(v_name) < 2 or length(v_name) > 120 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^(\+212|00212|0)[5-7][0-9]{8}$' then raise exception 'invalid_phone'; end if;
  if length(v_city) < 2 or length(v_address) < 4 then raise exception 'invalid_address'; end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0
     or jsonb_array_length(payload->'items') > 30 then raise exception 'invalid_items'; end if;
  if v_lang not in ('fr', 'en', 'ar') then v_lang := 'fr'; end if;

  for v_line in select * from jsonb_array_elements(payload->'items') loop
    v_qty := least(greatest(coalesce((v_line->>'qty')::int, 1), 1), 99);
    select p.slug, p.name, v.code, v.label, v.price into r
      from products p join product_variants v on v.product_id = p.id
     where p.slug = v_line->>'slug' and v.code = v_line->>'variant' and p.active and v.in_stock;
    if not found then raise exception 'unavailable:%', v_line->>'slug'; end if;
    v_items := v_items || jsonb_build_object(
      'slug', r.slug, 'variant', r.code, 'name', coalesce(r.name->>v_lang, r.name->>'fr'),
      'label', r.label, 'price', r.price, 'qty', v_qty, 'total', r.price * v_qty);
    v_sub := v_sub + r.price * v_qty;
  end loop;

  select * into s from settings where id = 1;
  v_ship := case when v_sub >= s.free_shipping_from then 0 else s.shipping_fee end;
  v_number := 'ARG-' || nextval('order_number_seq');

  insert into orders (number, customer_name, phone, city, address, note, lang, items, subtotal, shipping, total)
  values (v_number, v_name, v_phone, v_city, v_address, nullif(trim(coalesce(payload->>'note', '')), ''),
          v_lang, v_items, v_sub, v_ship, v_sub + v_ship);

  return jsonb_build_object('number', v_number, 'items', v_items, 'subtotal', v_sub, 'shipping', v_ship, 'total', v_sub + v_ship);
end $$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.claim_ownership() to authenticated;
grant execute on function public.add_staff(text, staff_role, text) to authenticated;
grant execute on function public.set_my_name(text) to authenticated;
revoke execute on function public.place_order(jsonb) from public;

-- ───────────────────────── Row level security ─────────────────────────
alter table public.staff enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff for select using (is_staff());
drop policy if exists staff_owner_write on public.staff;
create policy staff_owner_write on public.staff for all using (is_owner()) with check (is_owner());

drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (active or is_staff());
drop policy if exists products_write on public.products;
create policy products_write on public.products for all using (is_staff()) with check (is_staff());

drop policy if exists variants_read on public.product_variants;
create policy variants_read on public.product_variants for select
  using (exists (select 1 from products p where p.id = product_id and (p.active or is_staff())));
drop policy if exists variants_write on public.product_variants;
create policy variants_write on public.product_variants for all using (is_staff()) with check (is_staff());

drop policy if exists images_read on public.product_images;
create policy images_read on public.product_images for select
  using (exists (select 1 from products p where p.id = product_id and (p.active or is_staff())));
drop policy if exists images_write on public.product_images;
create policy images_write on public.product_images for all using (is_staff()) with check (is_staff());

drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (true);
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for update using (is_owner()) with check (is_owner());

drop policy if exists orders_staff on public.orders;
create policy orders_staff on public.orders for select using (is_staff());
drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update on public.orders for update using (is_staff()) with check (is_staff());
drop policy if exists orders_owner_delete on public.orders;
create policy orders_owner_delete on public.orders for delete using (is_owner());

-- ───────────────────────── Photo storage ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists product_images_staff_insert on storage.objects;
create policy product_images_staff_insert on storage.objects for insert with check (bucket_id = 'product-images' and public.is_staff());
drop policy if exists product_images_staff_update on storage.objects;
create policy product_images_staff_update on storage.objects for update using (bucket_id = 'product-images' and public.is_staff());
drop policy if exists product_images_staff_delete on storage.objects;
create policy product_images_staff_delete on storage.objects for delete using (bucket_id = 'product-images' and public.is_staff());
