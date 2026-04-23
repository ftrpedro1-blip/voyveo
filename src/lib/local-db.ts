import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type VoyVeoDatabase = {
  artists: Array<{ id: string; name: string; needs_review?: string[] }>;
  exhibitions: Array<Record<string, unknown> & { id: string }>;
  galleries: Array<Record<string, unknown> & { id: string }>;
  meta: Record<string, unknown>;
};

const dbPath = join(process.cwd(), "data", "voy-veo-db.json");

export async function readDb(): Promise<VoyVeoDatabase> {
  return JSON.parse(await readFile(dbPath, "utf8")) as VoyVeoDatabase;
}

export async function writeDb(db: VoyVeoDatabase) {
  if (process.env.VERCEL === "1" && process.env.ALLOW_FILE_DB_WRITES !== "true") {
    throw new Error("File database writes are disabled on Vercel. Configure Supabase free tier for persistent admin edits.");
  }
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

export function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
