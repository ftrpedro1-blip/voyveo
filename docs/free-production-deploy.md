# VoyVeo Free Production Deploy

VoyVeo must stay free in this beta phase. Do not add Mapbox, Google Maps Platform API keys, paid image CDNs, paid scraping services, or any provider that can create automatic charges.

## Free Services Used

- Hosting: Vercel Hobby.
- Map UI: Leaflet.
- Map tiles: OpenStreetMap-compatible tile URL from `NEXT_PUBLIC_MAP_TILE_URL`.
- Geocoding/manual coordinate checks: Nominatim and OpenStreetMap.
- Gallery/museum truth sources: official websites, official Instagram, public Google Maps pages by manual review only, GCBA/Cultura Nación pages, ArteBA/Gallery/MAPA/Meridiano/press where useful.
- Optional future persistence: Supabase Free.

## Production Environment

Set these variables in Vercel:

```text
NEXT_PUBLIC_SITE_URL=https://voyveo.cassiahouseart.com
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap
ALLOW_FILE_DB_WRITES=false
```

Leave Supabase variables empty unless/ until a free Supabase project is connected for persistent admin edits.

## Custom Domain

Target domain: `voyveo.cassiahouseart.com`

Add the domain in Vercel Project Settings -> Domains. Then add this DNS record wherever `cassiahouseart.com` DNS is hosted:

```text
Type: CNAME
Name/Host: voyveo
Value/Target: cname.vercel-dns-0.com
Proxy: DNS only, if using Cloudflare
TTL: Auto or 300 seconds
```

After adding the record, Vercel provisions SSL automatically. If the Vercel domain screen shows a project-specific CNAME value after `domains inspect`, use that exact value instead.

Do not add Google Maps API keys or Mapbox tokens.

## Verification

Before sharing:

```bash
npm install
npm run build
npm run start
```

Check:

- `/`
- `/#map`
- `/#list`
- `/#gallery/cassia-house`
- `/#admin`

The admin can read production data from JSON. Persistent production edits require Supabase Free because Vercel does not provide durable filesystem writes.
