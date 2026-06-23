-- Run after deploying the Supabase-only authentication cleanup.
-- Yuubin no longer reads or writes this legacy password table.

drop table if exists public.passwords;
