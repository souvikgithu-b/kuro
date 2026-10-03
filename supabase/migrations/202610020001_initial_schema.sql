create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  description text not null default '',
  poster_url text not null default '',
  backdrop_url text not null default '',
  release_year integer not null check (release_year between 1888 and 3000),
  genre text not null default '',
  duration text not null default '',
  language text not null default '',
  content_type text not null default 'movie',
  source_type text not null check (source_type in ('uploaded', 'external')),
  video_url text,
  external_video_url text,
  is_published boolean not null default false,
  featured boolean not null default false,
  director text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (source_type = 'uploaded' and external_video_url is null)
    or (source_type = 'external' and video_url is null)
  )
);

create index if not exists movies_published_created_at_idx
  on public.movies (is_published, created_at desc);
create index if not exists movies_genre_idx on public.movies (genre);
create index if not exists movies_year_idx on public.movies (release_year);

create table if not exists public.movie_links (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null unique references public.movies (id) on delete cascade,
  step_1_url text,
  step_2_url text,
  step_3_url text,
  final_url text,
  final_destination_type text not null default 'video_source'
    check (final_destination_type in ('video_source', 'custom_url')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (final_destination_type <> 'custom_url' or final_url is not null)
);

create table if not exists public.monetization_settings (
  id text primary key,
  provider_name text not null default 'Custom',
  enabled boolean not null default false,
  step_1_url text,
  step_2_url text,
  step_3_url text,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.monetization_settings (id, provider_name, enabled)
values ('global-monetization-001', 'Monetag', false)
on conflict (id) do nothing;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references public.movies (id) on delete set null,
  event_type text not null check (event_type in (
    'page_view', 'watch_click', 'step_1_click', 'step_2_click',
    'step_3_click', 'final_destination_click'
  )),
  session_id text not null check (length(session_id) between 1 and 128),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_movie_type_idx
  on public.analytics_events (movie_id, event_type, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.movie_links enable row level security;
alter table public.monetization_settings enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
create policy "profiles_read_self_or_admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "movies_read_published" on public.movies;
create policy "movies_read_published" on public.movies
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

drop policy if exists "movies_admin_insert" on public.movies;
create policy "movies_admin_insert" on public.movies
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "movies_admin_update" on public.movies;
create policy "movies_admin_update" on public.movies
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "movies_admin_delete" on public.movies;
create policy "movies_admin_delete" on public.movies
  for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "movie_links_read_published" on public.movie_links;
drop policy if exists "movie_links_admin_read" on public.movie_links;
create policy "movie_links_admin_read" on public.movie_links
  for select to anon, authenticated
  using ((select public.is_admin()));

drop policy if exists "movie_links_admin_insert" on public.movie_links;
create policy "movie_links_admin_insert" on public.movie_links
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "movie_links_admin_update" on public.movie_links;
create policy "movie_links_admin_update" on public.movie_links
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "movie_links_admin_delete" on public.movie_links;
create policy "movie_links_admin_delete" on public.movie_links
  for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "monetization_read_enabled" on public.monetization_settings;
drop policy if exists "monetization_admin_read" on public.monetization_settings;
create policy "monetization_admin_read" on public.monetization_settings
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "monetization_admin_insert" on public.monetization_settings;
create policy "monetization_admin_insert" on public.monetization_settings
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "monetization_admin_update" on public.monetization_settings;
create policy "monetization_admin_update" on public.monetization_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "analytics_insert_valid_events" on public.analytics_events;
create policy "analytics_insert_valid_events" on public.analytics_events
  for insert to anon, authenticated
  with check (
    length(session_id) between 1 and 128
    and (movie_id is null or exists (
      select 1 from public.movies where movies.id = analytics_events.movie_id and movies.is_published
    ))
  );

drop policy if exists "analytics_admin_read" on public.analytics_events;
create policy "analytics_admin_read" on public.analytics_events
  for select to authenticated
  using ((select public.is_admin()));

create or replace function public.get_movie_watch_flow(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'source_type', movies.source_type,
    'video_url', movies.video_url,
    'external_video_url', movies.external_video_url,
    'movie_links', case when movie_links.movie_id is null then null else jsonb_build_object(
      'id', movie_links.id,
      'movie_id', movie_links.movie_id,
      'step_1_url', movie_links.step_1_url,
      'step_2_url', movie_links.step_2_url,
      'step_3_url', movie_links.step_3_url,
      'final_url', movie_links.final_url,
      'final_destination_type', movie_links.final_destination_type,
      'created_at', movie_links.created_at,
      'updated_at', movie_links.updated_at
    ) end
  )
  from public.movies
  left join public.movie_links on movie_links.movie_id = movies.id
  where movies.slug = p_slug and movies.is_published
  limit 1;
$$;

revoke all on function public.get_movie_watch_flow(text) from public;
grant execute on function public.get_movie_watch_flow(text) to anon, authenticated;

create or replace function public.get_public_monetization_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', id,
    'provider_name', provider_name,
    'enabled', enabled,
    'step_1_url', case when enabled then step_1_url else null end,
    'step_2_url', case when enabled then step_2_url else null end,
    'step_3_url', case when enabled then step_3_url else null end,
    'updated_at', updated_at
  )
  from public.monetization_settings
  order by updated_at desc
  limit 1;
$$;

revoke all on function public.get_public_monetization_settings() from public;
grant execute on function public.get_public_monetization_settings() to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.movies, public.movie_links, public.monetization_settings to anon, authenticated;
grant insert, update, delete on public.movies, public.movie_links to authenticated;
grant insert, update on public.monetization_settings to authenticated;
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('movie-posters', 'movie-posters', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('movie-backdrops', 'movie-backdrops', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('movie-videos', 'movie-videos', true, 2147483648, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

 drop policy if exists "admin_upload_movie_assets" on storage.objects;
create policy "admin_upload_movie_assets" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('movie-posters', 'movie-backdrops', 'movie-videos')
    and (select public.is_admin())
  );

drop policy if exists "admin_update_movie_assets" on storage.objects;
create policy "admin_update_movie_assets" on storage.objects
  for update to authenticated
  using (bucket_id in ('movie-posters', 'movie-backdrops', 'movie-videos') and (select public.is_admin()))
  with check (bucket_id in ('movie-posters', 'movie-backdrops', 'movie-videos') and (select public.is_admin()));

drop policy if exists "admin_delete_movie_assets" on storage.objects;
create policy "admin_delete_movie_assets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('movie-posters', 'movie-backdrops', 'movie-videos') and (select public.is_admin()));
