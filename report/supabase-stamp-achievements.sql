create table if not exists user_stamp_achievements (
  user_id uuid not null references users(id) on delete cascade,
  achievement_key text not null,
  stamp_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

create index if not exists user_stamp_achievements_user_id_idx
on user_stamp_achievements (user_id);