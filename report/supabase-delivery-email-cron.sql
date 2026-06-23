-- Yuubin delivery email scheduler.
-- Before running:
-- 1. Set CRON_SECRET to the same strong value in Vercel.
-- 2. Replace YOUR_CRON_SECRET below with that value.
-- 3. Replace the URL if the production domain changes.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

select vault.create_secret(
  'YOUR_CRON_SECRET',
  'yuubin_delivery_cron_secret',
  'Authorization secret for the Yuubin delivery email job'
)
where not exists (
  select 1
  from vault.decrypted_secrets
  where name = 'yuubin_delivery_cron_secret'
);

select cron.schedule(
  'yuubin-deliver-letters',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://fyp-yuubin.vercel.app/api/cron/deliver-letters',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'yuubin_delivery_cron_secret'
        limit 1
      )
    ),
    body := jsonb_build_object('scheduled_at', now()),
    timeout_milliseconds := 15000
  );
  $$
);
