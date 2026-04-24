import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const publicRoot = fileURLToPath(new URL("../public", import.meta.url));
const globalStylesPath = fileURLToPath(new URL("../src/app/globals.css", import.meta.url));
const dbPath = fileURLToPath(new URL("../data/voy-veo-db.json", import.meta.url));
const defaultPort = Number(process.env.PORT ?? 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const indexHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VoyVeo</title>
    <meta name="description" content="Guía visual de arte contemporáneo en Buenos Aires." />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preconnect" href="https://api.fontshare.com" />
    <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="ambient"></div>
    <div class="device">
      <header class="appHeader">
        <button class="brandPill" data-route="home" aria-label="Ir al inicio">
          <span class="brandMark" aria-hidden="true"><img class="brandGlyph" src="/brand/logo-mark.svg" alt="" /></span>
          <strong>VoyVeo</strong>
        </button>
        <button class="locationPill" type="button" aria-label="Ciudad actual: Buenos Aires">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>
          <span>Buenos Aires</span>
        </button>
        <button class="sectionPill" id="topAction" type="button" aria-label="Sección actual">
          <span id="screenTitle">Destacadas</span>
        </button>
      </header>
      <main id="app" tabindex="-1"></main>
      <nav class="tabBar" aria-label="Navegación principal">
        <button data-route="home"></button>
        <button data-route="map"></button>
        <button data-route="list"></button>
      </nav>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="/client/app.js" type="module"></script>
  </body>
</html>`;

async function readDb() {
  return JSON.parse(await readFile(dbPath, "utf8"));
}

async function writeDb(db) {
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

async function parseBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function handleApi(request, response, url) {
  const db = await readDb();

  if (request.method === "GET" && url.pathname === "/api/db") {
    sendJson(response, 200, db);
    return true;
  }

  const galleryMatch = url.pathname.match(/^\/api\/galleries\/([^/]+)$/);
  const exhibitionMatch = url.pathname.match(/^\/api\/exhibitions\/([^/]+)$/);

  if (request.method === "PUT" && galleryMatch) {
    const updates = await parseBody(request);
    const index = db.galleries.findIndex((gallery) => gallery.id === galleryMatch[1]);

    if (index === -1) {
      sendJson(response, 404, { error: "Gallery not found" });
      return true;
    }

    db.galleries[index] = { ...db.galleries[index], ...updates, id: db.galleries[index].id };
    await writeDb(db);
    sendJson(response, 200, db.galleries[index]);
    return true;
  }

  if (request.method === "PUT" && exhibitionMatch) {
    const updates = await parseBody(request);
    const artistRecords = updates.artist_records || [];
    delete updates.artist_records;
    const index = db.exhibitions.findIndex((exhibition) => exhibition.id === exhibitionMatch[1]);

    if (index === -1) {
      sendJson(response, 404, { error: "Exhibition not found" });
      return true;
    }

    for (const artist of artistRecords) {
      if (artist.id && !db.artists.some((record) => record.id === artist.id)) {
        db.artists.push(artist);
      }
    }

    db.exhibitions[index] = { ...db.exhibitions[index], ...updates, id: db.exhibitions[index].id };
    await writeDb(db);
    sendJson(response, 200, db.exhibitions[index]);
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/exhibitions") {
    const payload = await parseBody(request);
    const artistRecords = payload.artist_records || [];
    delete payload.artist_records;
    const id = payload.id || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const record = {
      id,
      slug: payload.slug || id,
      title: payload.title || "",
      gallery_id: payload.gallery_id || "",
      start_date: payload.start_date || "",
      end_date: payload.end_date || "",
      date_text: payload.date_text || "",
      artist_ids: payload.artist_ids || [],
      description: payload.description || "",
      image_url: payload.image_url || "",
      status: payload.status || "upcoming",
      featured_rank: Number(payload.featured_rank || 0),
      needs_review: Boolean(payload.needs_review),
      review_notes: payload.review_notes || [],
      source_urls: payload.source_urls || []
    };

    for (const artist of artistRecords) {
      if (artist.id && !db.artists.some((record) => record.id === artist.id)) {
        db.artists.push(artist);
      }
    }

    db.exhibitions.push(record);
    await writeDb(db);
    sendJson(response, 201, record);
    return true;
  }

  return false;
}

export function createPreviewServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

      if (url.pathname.startsWith("/api/") && (await handleApi(request, response, url))) {
        return;
      }

      if (url.pathname === "/" || url.pathname === "/index.html") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(indexHtml);
        return;
      }

      if (url.pathname === "/styles.css") {
        response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
        response.end(await readFile(globalStylesPath));
        return;
      }

      const pathname = url.pathname;
      const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
      const filePath = join(publicRoot, safePath);
      const body = await readFile(filePath);

      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createPreviewServer();

  server.listen(defaultPort, () => {
    console.log(`VoyVeo preview running at http://localhost:${defaultPort}`);
  });
}
