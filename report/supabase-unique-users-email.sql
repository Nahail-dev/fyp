-- Prevent duplicate Yuubin profiles for the same email address.
-- This is case-insensitive, so Test@Email.com and test@email.com are treated as the same email.
create unique index if not exists users_email_lower_unique_idx
on public.users (lower(email))
where email is not null;