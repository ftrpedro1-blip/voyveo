# VoyVeo

Mobile-first web app for discovering current exhibitions, gallery and museum info, opening hours, and the Buenos Aires art map.

Cassia House is treated as the house gallery and stays first in gallery-first public surfaces through `is_house_gallery` plus `featured_rank`.

Private galleries are constrained by a fixed curated whitelist in `data/voy-veo-db.json` under `meta.private_gallery_whitelist`. A private gallery can only become public when it is on that list, or is Cassia House, and has `public_visible: true`.

## Stack

- **Next.js App Router + React** for the deployable app shell and API routes.
- **Static client module in `public/client/`** for the current polished mobile UX.
- **Local JSON data source** in `data/voy-veo-db.json` for beta/admin editing.
- **Supabase free tier** remains the optional production target for durable admin writes; the public beta can run from JSON without monthly cost.
- **Leaflet + OpenStreetMap-compatible tiles** for the free map layer. No Mapbox or Google Maps paid API keys are required.
- **Vercel Hobby** for production hosting.

## Run Locally

When Node/npm are installed normally:

```bash
npm install
npm run build
npm run start
```

Development:

```bash
npm run dev
```

This Codex workspace currently exposes only a bundled `node.exe`, not `npm`. For that environment only, use:

```powershell
& "C:\Users\ftrpe\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\scripts\dev-server.mjs
```

Then open `http://localhost:4173`.

## QA

```bash
npm run qa
```

The QA runner checks `320`, `360`, `390`, `430`, and desktop widths, including navigation, images, map pins, external map attribution, Cassia ordering, and admin rendering.

## Data Rules

VoyVeo stores source traceability per record:

- `fuente_exhibicion`
- `fuente_horario`
- `fuente_imagen`
- `fecha_ultima_revision`
- `conflicto_detectado`
- `confidence_score`

Rules:

1. Exhibitions, dates, and artists: official website wins conflicts; Instagram complements; uncertain data becomes `Por confirmar`.
2. Hours and address: official website first, Instagram as support, Google Maps public pages only as manual reference, OpenStreetMap/Nominatim for coordinates, uncertain hours become `Horario sujeto a confirmación`.
3. Images: official website, then Instagram, then public/press sources, then VoyVeo fallback.

## Production Deploy Checklist

Target domain: `voyveo.cassiahouseart.com`.

1. Connect the repo to Vercel Hobby.
2. Add environment variables from `.env.example`.
3. Add `voyveo.cassiahouseart.com` in Vercel.
4. Add this DNS record in the Cassia House DNS provider:
   `CNAME voyveo -> cname.vercel-dns-0.com`.
5. Wait for Vercel SSL to become active.
6. Smoke-test `/`, `/#list`, `/#map`, `/#gallery/cassia-house`, and `/#admin`.
7. Optional for persistent production admin edits: create a Supabase Free project, run `supabase/schema.sql`, import `data/voy-veo-db.json`, then wire the API routes to Supabase.

More detail: `docs/free-production-deploy.md`.

Cloudflare quick tunnels are local sharing tools only and are ignored from the product repo.

## Structure

```text
src/app/                 Next.js app shell and API routes
src/app/globals.css      VoyVeo visual system
src/lib/                 Local DB helpers
public/client/           Current mobile client app module
data/voy-veo-db.json     Beta database with source/audit fields
supabase/schema.sql      Production database schema
scripts/dev-server.mjs   Dependency-free local server for this Codex workspace
scripts/capture-preview.mjs  Mobile/desktop QA runner
artifacts/qa/            Generated QA screenshots
```
