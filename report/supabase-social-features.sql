-- Yuubin social features: replies, reactions, and follows.
-- Run this in Supabase SQL Editor if any of these tables/columns are missing.

create table if not exists public.letter_comments (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references public.letter_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.letter_comments
  add column if not exists parent_comment_id uuid references public.letter_comments(id) on delete cascade;

alter table public.letter_comments
  add column if not exists user_id uuid references public.users(id) on delete cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'letter_comments'
      and column_name = 'author_id'
  ) then
    execute 'update public.letter_comments set user_id = coalesce(user_id, author_id) where user_id is null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'letter_comments'
      and column_name = 'commenter_id'
  ) then
    execute 'update public.letter_comments set user_id = coalesce(user_id, commenter_id) where user_id is null';
  end if;
end $$;

create index if not exists letter_comments_letter_id_created_at_idx
  on public.letter_comments(letter_id, created_at);

create index if not exists letter_comments_parent_comment_id_idx
  on public.letter_comments(parent_comment_id);

create table if not exists public.letter_reactions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'smile', 'wow', 'sad')),
  created_at timestamptz not null default now(),
  unique (letter_id, user_id, reaction_type)
);

alter table public.letter_reactions
  add column if not exists reaction_type text;

alter table public.letter_reactions
  drop constraint if exists letter_reactions_reaction_check;

alter table public.letter_reactions
  drop constraint if exists letter_reactions_reaction_type_check;

alter table public.letter_reactions
  add constraint letter_reactions_reaction_type_check
  check (reaction_type in ('heart', 'smile', 'wow', 'sad'));

create index if not exists letter_reactions_letter_id_idx
  on public.letter_reactions(letter_id);

create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists user_follows_follower_id_idx
  on public.user_follows(follower_id);

create index if not exists user_follows_following_id_idx
  on public.user_follows(following_id);
