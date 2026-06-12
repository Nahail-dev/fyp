-- Yuubin realtime setup.
-- Run this in Supabase SQL Editor so the browser can receive live table changes.

alter table public.letters replica identity full;
alter table public.notifications replica identity full;
alter table public.user_stamps replica identity full;
alter table public.letter_comments replica identity full;
alter table public.letter_reactions replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.letters;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.notifications;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.user_stamps;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.letter_comments;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.letter_reactions;
  exception
    when duplicate_object then null;
  end;
end $$;
