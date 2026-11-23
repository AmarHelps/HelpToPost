# Amar Helps

One Next.js project serves both:

- **amarhelps.com**: landing page, waitlist, Privacy Policy (`/privacy`), Terms (`/terms`) and data deletion instructions (`/data-deletion`).
- **app.amarhelps.com**: the phone-first PWA ("Amar Helps Post"). The code lives under `src/app/app/`; `src/proxy.ts` maps the `app.` subdomain onto it.

Locally the app is at `http://localhost:3000/app`.

## Develop

```bash
npm install
npm run dev
```

## Deploy (Vercel)

1. Import this repo in Vercel (framework: Next.js, no settings changes).
2. Add domains `amarhelps.com`, `www.amarhelps.com` (redirects to the root) and `app.amarhelps.com`, and create the DNS records Vercel shows in Cloudflare (set them to "DNS only", grey cloud).
3. Environment variables (Production):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://app.amarhelps.com` |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → Secret keys → `sb_secret_…` (a legacy service_role key also works). Server only, never share it. |

Preview deploys can leave `NEXT_PUBLIC_APP_URL` unset; the app then lives at `/app`.

## Database

Run `supabase/migrations/0001_waitlist.sql` once in the Supabase SQL editor. The waitlist table has row-level security on and no policies, so only the server can read or write it.

## Legal pages

Names, contact email and the governing-law state are in `src/lib/site.ts`.

## Icons

`node scripts/make-icons.mjs` regenerates the PWA icons.
