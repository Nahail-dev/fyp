alter table users
add column if not exists profile_visibility text not null default 'public';

update users
set profile_visibility = case
  when profile_public is false then 'private'
  else 'public'
end
where profile_visibility is null
   or profile_visibility not in ('public', 'private');

alter table users
drop constraint if exists users_profile_visibility_check;

alter table users
add constraint users_profile_visibility_check
check (profile_visibility in ('public', 'private'));
