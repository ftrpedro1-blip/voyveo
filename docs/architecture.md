# Voy Veo Architecture

## Product Shape

The first product is a mobile-first public discovery app plus a private admin panel. There are no public accounts, favorites, payments, chats, or notifications in Phase 1.

Public IA:

- Home: premium featured exhibition feed with Cassia House first.
- Map: Buenos Aires gallery map with pins and preview cards.
- List: searchable current exhibitions with neighborhood, opening-this-week, and near-me filters.
- Gallery detail: gallery profile, address, hours, links, and current exhibitions.
- Exhibition detail: title, artist, gallery, dates, opening, image, and concise editorial text.

Admin IA:

- Review scraped changes.
- Approve or reject changes.
- Edit gallery/exhibition records manually.
- Trigger scrape jobs.

## Stack Decision

Next.js + Supabase + Vercel is the simplest reliable startup stack for this phase. It avoids separate backend hosting, keeps database and admin auth straightforward, and gives us a direct path to install as a PWA before native apps.

Maps use Leaflet with an OpenStreetMap-compatible tile URL so the beta has no paid map token or automatic map billing. The tile URL is environment-driven and should remain on a free/open provider until the business intentionally approves a paid service.

## Data Model

Core records:

- `galleries`: one row per gallery, with neighborhood, links, hours, lat/lng, and Cassia ranking flags.
- `exhibitions`: one row per show, linked to a gallery, with dates, opening time, image, and status.
- `events`: openings, talks, tours, fairs, and special events linked to galleries/exhibitions when possible.
- `scraped_changes`: pending proposed changes from scrapers, with before/after JSON for admin review.
- `scrape_jobs`: job runs and statuses.
- `admin_profiles`: allows Supabase Auth users to access the private admin.

## Cassia House Priority

Business priority is encoded in data, not hand-sorted UI:

- Cassia House gallery row has `is_house_gallery = true`.
- Cassia exhibitions get `feature_rank = 1000` or higher.
- Public queries order by `is_house_gallery desc`, then `feature_rank desc`, then date freshness.

That makes the priority consistent on Home, List, Map previews, and future API endpoints.

## Scraping Plan

Phase 1 admin uses manual trigger placeholders. The production scraper should be incremental:

1. Gallery websites and public calendars.
2. Instagram profile metadata where legally and technically practical.
3. Manual admin corrections as source of truth.
4. Change review queue before publishing.

No scraped content should auto-publish until the admin approves it.

## Native App Path

Keep the app as a responsive PWA first. Later conversion options:

- Wrap the Next.js app with Capacitor for iOS/Android.
- Extract shared React components into React Native if native UX becomes worth the cost.

The Phase 1 routes, schema, and Supabase API boundaries are designed to keep that migration low-friction.
