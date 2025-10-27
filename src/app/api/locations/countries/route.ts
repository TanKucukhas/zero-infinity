export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(_req: Request) {
  const { env } = getCloudflareContext();
  const rows = await env.DB.prepare(`SELECT code, name FROM countries ORDER BY name ASC`).all();
  return Response.json({ success: true, data: rows?.results || [] });
}
