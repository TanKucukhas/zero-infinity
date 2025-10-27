export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const country = (url.searchParams.get('country') || 'US').toUpperCase();
  const rows = await env.DB.prepare(`SELECT code, name FROM states WHERE country_code=?1 ORDER BY name ASC`).bind(country).all();
  return Response.json({ success: true, data: rows?.results || [] });
}
