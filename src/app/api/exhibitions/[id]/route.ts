import { jsonResponse, readDb, writeDb } from "@/lib/local-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const updates = await request.json();
  const artistRecords = updates.artist_records ?? [];
  delete updates.artist_records;

  const db = await readDb();
  const index = db.exhibitions.findIndex((exhibition) => exhibition.id === id);

  if (index === -1) {
    return jsonResponse({ error: "Exhibición no encontrada" }, 404);
  }

  for (const artist of artistRecords) {
    if (artist.id && !db.artists.some((record) => record.id === artist.id)) {
      db.artists.push(artist);
    }
  }

  db.exhibitions[index] = { ...db.exhibitions[index], ...updates, id };

  try {
    await writeDb(db);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "No se pudo guardar" }, 503);
  }

  return jsonResponse(db.exhibitions[index]);
}
