import { jsonResponse, readDb, writeDb } from "@/lib/local-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const updates = await request.json();
  const db = await readDb();
  const index = db.galleries.findIndex((gallery) => gallery.id === id);

  if (index === -1) {
    return jsonResponse({ error: "Institución no encontrada" }, 404);
  }

  db.galleries[index] = { ...db.galleries[index], ...updates, id };

  try {
    await writeDb(db);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "No se pudo guardar" }, 503);
  }

  return jsonResponse(db.galleries[index]);
}
