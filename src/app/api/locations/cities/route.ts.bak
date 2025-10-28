export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const state = (url.searchParams.get('state') || '').toUpperCase();
  if (!state) {
    return new Response(JSON.stringify({ success: false, error: 'state parameter is required' }), { status: 400 });
  }
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const where = ['state_code=?1'];
  const binds: any[] = [state];
  if (q) {
    where.push('city_ascii LIKE ?2');
    binds.push(`%${q}%`);
  }
  const rows = await env.DB.prepare(`SELECT id, city, city_ascii FROM cities WHERE ${where.join(' AND ')} ORDER BY city_ascii ASC`).bind(...binds).all();
  return Response.json({ success: true, data: rows?.results || [] });
}
