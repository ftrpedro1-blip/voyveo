create extension if not exists "pgcrypto";

create table public.galleries (
  id text primary key,
  slug text unique not null,
  name text not null,
  address text,
  neighborhood text,
  city text not null default 'Buenos Aires',
  lat numeric(9,6),
  lng numeric(9,6),
  website text,
  instagram text,
  image_url text,
  description text,
  hours text,
  weekly_hours jsonb not null default '{}'::jsonb,
  hours_website_text text,
  hours_instagram_text text,
  hours_google_maps_text text,
  hours_source_selected text not null default 'unverified' check (hours_source_selected in ('website', 'instagram', 'google_maps', 'unverified')),
  hours_last_checked_at timestamptz,
  hours_conflict boolean not null default false,
  hours_review_notes text[] not null default '{}',
  institution_type text not null default 'gallery' check (institution_type in ('gallery', 'national_museum')),
  category_label text,
  private_whitelist boolean not null default false,
  featured_rank integer not null default 0,
  is_house_gallery boolean not null default false,
  source_website_url text,
  source_instagram_url text,
  last_checked_at timestamptz,
  confidence_score numeric(3,2) not null default 0,
  source_conflict boolean not null default false,
  published_from text not null default 'website',
  published_summary text,
  fuente_exhibicion text,
  fuente_horario text,
  fuente_imagen text,
  fecha_ultima_revision timestamptz,
  conflicto_detectado boolean not null default false,
  image_source_selected text not null default 'fallback' check (image_source_selected in ('website', 'instagram', 'google_maps', 'fallback', 'unverified')),
  image_last_checked_at timestamptz,
  image_conflict boolean not null default false,
  public_visible boolean not null default false,
  public_visibility_status text not null default 'incompleta',
  public_visibility_notes text[] not null default '{}',
  needs_review boolean not null default true,
  review_notes text[] not null default '{}',
  source_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artists (
  id text primary key,
  name text not null,
  needs_review text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exhibitions (
  id text primary key,
  slug text unique not null,
  title text not null,
  gallery_id text not null references public.galleries(id) on delete cascade,
  start_date date,
  end_date date,
  date_text text,
  description text,
  image_url text,
  status text not null default 'upcoming' check (status in ('current', 'upcoming', 'past')),
  featured_rank integer not null default 0,
  source_website_url text,
  source_instagram_url text,
  last_checked_at timestamptz,
  confidence_score numeric(3,2) not null default 0,
  source_conflict boolean not null default false,
  published_from text not null default 'website',
  published_summary text,
  fuente_exhibicion text,
  fuente_horario text,
  fuente_imagen text,
  fecha_ultima_revision timestamptz,
  conflicto_detectado boolean not null default false,
  image_source_selected text not null default 'fallback' check (image_source_selected in ('website', 'instagram', 'google_maps', 'fallback', 'unverified')),
  image_last_checked_at timestamptz,
  image_conflict boolean not null default false,
  public_visible boolean not null default false,
  public_visibility_status text not null default 'incompleta',
  public_visibility_notes text[] not null default '{}',
  needs_review boolean not null default true,
  review_notes text[] not null default '{}',
  source_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exhibition_artists (
  exhibition_id text not null references public.exhibitions(id) on delete cascade,
  artist_id text not null references public.artists(id) on delete cascade,
  primary key (exhibition_id, artist_id)
);

create index galleries_rank_idx on public.galleries (is_house_gallery desc, featured_rank desc, name);
create index galleries_type_idx on public.galleries (institution_type);
create index galleries_public_visible_idx on public.galleries (public_visible, institution_type);
create index galleries_location_idx on public.galleries (lat, lng);
create index exhibitions_gallery_idx on public.exhibitions (gallery_id);
create index exhibitions_public_visible_idx on public.exhibitions (public_visible, status, start_date, end_date);
create index exhibitions_status_dates_idx on public.exhibitions (status, start_date, end_date);
create index exhibitions_rank_idx on public.exhibitions (featured_rank desc);

alter table public.galleries enable row level security;
alter table public.artists enable row level security;
alter table public.exhibitions enable row level security;
alter table public.exhibition_artists enable row level security;

create policy "Public can read galleries"
  on public.galleries for select
  using (true);

create policy "Public can read artists"
  on public.artists for select
  using (true);

create policy "Public can read exhibitions"
  on public.exhibitions for select
  using (true);

create policy "Public can read exhibition artists"
  on public.exhibition_artists for select
  using (true);

-- Admin writes should be restricted once Supabase Auth is connected.
-- During local Phase 2, writes are handled by scripts/dev-server.mjs against data/voy-veo-db.json.
