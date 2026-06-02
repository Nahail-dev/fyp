alter table letters
add column if not exists stamp_id text default 'yuubin-common';

update letters
set stamp_id = 'yuubin-common'
where stamp_id is null;
