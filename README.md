# fyp

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_tdn86EsxnVHRkHZCNg3OXe4WwRZK)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Delivery emails

Yuubin can email recipients when delayed letters arrive.

1. Create a Resend API key and verify a sending domain.
2. Add `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, and
   `NEXT_PUBLIC_SITE_URL` from `.env.example` to local development and Vercel.
3. Run `report/supabase-delivery-email-cron.sql` in the Supabase SQL Editor
   after replacing `YOUR_CRON_SECRET`.

The Supabase Cron job calls the protected delivery endpoint every minute.
Emails use a per-letter idempotency key, and users can disable arrival emails
from Settings.

## Database migrations

Run the relevant SQL files in `report/` through the Supabase SQL Editor. The
current application uses Supabase Auth only; the legacy `passwords` table and
custom authentication routes are no longer part of Yuubin.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Nahail-dev/fyp" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
