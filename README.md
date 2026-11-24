# Amar Helps

One Next.js project serves both:

- **amarhelps.com**: the Amar Helps LLC company home (`/`), with room for more apps and services.
- **amarhelps.com/helptopost**: the HelpToPost landing page and waitlist.
- **Legal pages, company level**: Privacy Policy (`/privacy`), Terms (`/terms`) and data deletion instructions (`/data-deletion`). These are the URLs to give Google and Meta. `/helptopost/privacy`, `/helptopost/terms` and `/helptopost/data-deletion` redirect to them, and old `amarhelps.com/#waitlist`-style links forward to `/helptopost`.
- **app.amarhelps.com**: the phone-first PWA ("HelpToPost"). The code lives under `src/app/app/`; `src/proxy.ts` maps the `app.` subdomain onto it.

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

| `APP_SECRET` | Any long random string (at least 32 characters). Signs sign-in cookies and encrypts stored YouTube and Instagram tokens. Changing it signs everyone out and requires reconnecting accounts. |
| `GOOGLE_CLIENT_ID` | Google Cloud → APIs & Services → Credentials → OAuth client (Web application) → Client ID |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client → Client secret |
| `META_APP_ID` | Meta developer app → App settings → Basic → App ID |
| `META_APP_SECRET` | Same page → App secret |
| `META_CONFIG_ID` | Use cases → Manage messaging & content on Instagram → Customize → API setup with Unified login → the configuration's ID |

Preview deploys can leave `NEXT_PUBLIC_APP_URL` unset; the app then lives at `/app`.

### OAuth addresses to register

- Google OAuth client, Authorized redirect URI: `https://app.amarhelps.com/api/google/callback`
- Meta, API setup with Unified login → Redirect URL: `https://app.amarhelps.com/api/instagram/callback`
- Meta, Facebook Login for Business → Settings: Deauthorize callback URL `https://app.amarhelps.com/api/instagram/deauthorize`, Data deletion request URL `https://app.amarhelps.com/api/instagram/data-deletion`

Sign-in with Google and connecting work only on addresses registered above, so test them on app.amarhelps.com.

## Database

Run each file in `supabase/migrations/` once, in order, in the Supabase SQL editor. Every table has row-level security on and no policies, so only the server can read or write them. `0002_posting.sql` adds accounts, connected platforms, posts and the private `media` storage bucket.

## Posting

- Sign-in: email and password, or Google (basic profile only).
- YouTube: scopes `youtube.upload` and `youtube.readonly`. Video goes browser → Supabase Storage → YouTube (resumable upload, streamed). Vertical video up to 3 minutes becomes a Short automatically. Until the Google project passes YouTube's API audit, YouTube keeps API uploads private.
- Instagram: Instagram API with Unified Login (Meta's login for new apps; no Facebook Page needed). The configuration grants `instagram_basic` and `instagram_content_publish` and returns a Business Integration System User token for the person's business portfolio. Calls go to graph.facebook.com. Single photo, Reel, or carousel of up to 10. Instagram fetches media from a short-lived signed storage link.
- Photos are cropped to the chosen shape and converted to JPEG in the browser. Media is deleted from storage once every platform has finished.
- Supabase's Free plan caps uploads at 50 MB per file. Longer videos need the Pro plan or another storage provider.

## Legal pages

Names, contact email and the governing-law state are in `src/lib/site.ts`.

## Icons

`node scripts/make-icons.mjs` regenerates the PWA icons.
