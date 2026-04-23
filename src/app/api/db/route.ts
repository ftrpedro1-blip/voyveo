import { jsonResponse, readDb } from "@/lib/local-db";

export async function GET() {
  return jsonResponse(await readDb());
}
