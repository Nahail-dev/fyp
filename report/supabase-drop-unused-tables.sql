-- Yuubin legacy table cleanup.
-- Run only after confirming the current app uses:
-- user_stamp_inventory instead of user_stamps,
-- static lib/stamps.ts definitions instead of the stamps table,
-- Supabase Auth instead of passwords,
-- letters delivery columns instead of delivery_tracking.

drop table if exists public.delivery_tracking cascade;
drop table if exists public.passwords cascade;
drop table if exists public.stamps cascade;
drop table if exists public.user_stamps cascade;