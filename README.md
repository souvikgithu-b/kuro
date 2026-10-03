# KURO Cinema Archive

KURO is a responsive catalog and watch-flow site for films that the site owner is authorized to host or distribute. Visitors browse without accounts. Administrators manage the catalog through Supabase Auth. The visual identity and name suggestions live in `src/config/brand.ts`.

Suggested names: **KURO** (selected), CINEVO, NOIRIX, KAGE, and VISTA9.

## Requirements

- Node.js 20.19+ or 22.12+
- A Supabase project for hosted authentication, database, and storage

## Install and run

```sh
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, copy the example with `Copy-Item .env.example .env.local`. The site runs in local demo mode until valid Supabase settings are supplied. Demo records and admin sessions are stored in the current browser only; they are not shared with other visitors and are not production authentication.

Useful commands:

```sh
npm run build
npm run preview
npm run lint
```

## Configure Supabase

1. Create a Supabase project and copy its Project URL and public anon/publishable key from **Project Settings → API**.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. These are public client values; never put a service-role key in a `VITE_` variable or frontend code.
3. In the Supabase SQL Editor, run `supabase/migrations/202610020001_initial_schema.sql`. This creates the catalog, link settings, analytics, profile trigger, RLS policies, and the three storage buckets.
4. Create the first user in **Authentication → Users → Add user**. Public sign-up is not implemented. The database trigger creates a non-admin profile for the new user.
5. Promote that user in the SQL Editor, replacing the email with the exact account email:

   ```sql
   update public.profiles
   set role = 'admin', updated_at = now()
   where email = 'admin@example.com';
   ```

6. In **Authentication → URL Configuration**, set the production site URL and add the local development URL to the redirect allow list if needed. Keep public sign-ups disabled.
7. Restart the Vite server after changing environment values, then sign in at `/admin/login` with the created account.

The migration enables RLS. Visitors can select published movie metadata, request the active watch-flow configuration through narrow RPCs, and submit constrained anonymous analytics events. The monetization settings table itself, drafts, and administrative changes require an admin profile. Link and video destinations are read through the watch-flow RPC rather than catalog/detail queries. Admin authorization is checked in both the UI and database policies.

## Storage

The migration creates `movie-posters`, `movie-backdrops`, and `movie-videos`. Image uploads are limited to 10 MiB; video uploads are limited to 2 GiB and accepted video MIME types are MP4, WebM, and QuickTime. Bucket-level limits can also be constrained by your Supabase plan. Admin-only policies protect uploads, updates, and deletion. Public reads are enabled for playback and catalog imagery, so only upload material you are authorized to distribute.

The current app uses Supabase Storage URLs for assets and direct browser playback for uploaded videos. Large video libraries can later move behind a dedicated video-storage adapter without changing the movie form contract.

## Add the first movie

Sign into `/admin/login`, open **Add Movie**, provide metadata and poster/backdrop URLs or uploads, select uploaded or external video, configure optional per-movie link steps, then save as a draft or publish. Only published movies appear in the public catalog. An optional custom final URL overrides the selected video source.

Demo catalog entries are fictional examples and use public sample media. Replace them with authorized content before launch. Demo mode is intended for local exploration only.

## Monetization provider

Open `/admin/settings/monetization` to configure a provider label, enabled state, and step URLs. The database stores provider names and URLs as configuration; there is no Monetag-specific runtime integration. Enter SmartLink/Direct Link URLs only when permitted by that provider, and follow its terms. No ads are faked or guaranteed. You can replace the provider by changing these settings without a code deployment.

## Analytics and privacy

The app records page views, watch clicks, step clicks, and final-destination launches. It uses an anonymous session identifier stored in session storage and does not collect names, email addresses, or passwords for analytics. The dashboard displays recorded events only; a new installation starts at zero. Anonymous event insertion is permitted by RLS and should be rate-limited at an edge/API layer if the site becomes a high-traffic target.

## Deploy to Vercel

1. Push the project to GitHub and import the repository into Vercel.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings for each environment.
3. Deploy with the default Vite build command (`npm run build`) and output directory (`dist`). `vercel.json` rewrites app routes to `index.html` for React Router.
4. Set the production URL in Supabase Auth URL Configuration and allow it for redirects.
5. Run the build locally before deploying. Never configure a service-role key in Vercel client environment variables.

## Replacing the provider later

Set the provider name, enabled toggle, and URLs from the monetization settings page. Movie-specific step URLs can override the global defaults. The flow consumes standard destination URLs, so changing advertising or affiliate providers does not require provider-specific application code or a deployment.

## Notes before production

- Verify that every movie, poster, and video is authorized for distribution.
- Configure Supabase project-level upload size limits and backups to fit your plan.
- Create and promote administrators deliberately; authenticated users without `profiles.role = 'admin'` cannot use the admin console.
- Review analytics retention and abuse controls for your expected traffic.
- `npm run build` runs TypeScript checks and creates the production Vite bundle.
