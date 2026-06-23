-- Run this once in Supabase SQL Editor to make city autocomplete faster.
-- It supports ILIKE autocomplete searches used by /api/cities.

create extension if not exists pg_trgm;

create index if not exists cities_city_trgm_idx
on public.cities using gin (city gin_trgm_ops);

create index if not exists cities_city_ascii_trgm_idx
on public.cities using gin (city_ascii gin_trgm_ops);

create index if not exists cities_population_desc_idx
on public.cities (population desc nulls last);
