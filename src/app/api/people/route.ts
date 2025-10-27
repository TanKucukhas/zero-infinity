export const runtime = "edge";
import { z } from "zod";

const PersonCreate = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  primaryEmail: z.string().email().optional()
});

export async function GET(req: Request, env: any) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const size = Math.min(100, Number(url.searchParams.get("pageSize") || 50));
  const q = (url.searchParams.get("query") || "").toLowerCase();
  const off = (page - 1) * size;

  const like = `%${q}%`;
  const rows = await env.DB.prepare(
    "SELECT * FROM people WHERE full_name_norm LIKE ?1 OR primary_email LIKE ?1 ORDER BY last_refreshed_at DESC LIMIT ?2 OFFSET ?3"
  ).bind(like, size, off).all();

  return Response.json({ data: rows.results || [], page, pageSize: size });
}

export async function POST(req: Request, env: any) {
  const parsed = PersonCreate.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid body" }, { status: 400 });
  const { firstName, lastName = "", primaryEmail = null } = parsed.data;
  const id = crypto.randomUUID();
  const full = `${firstName} ${lastName}`.trim().toLowerCase();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO people (id, first_name, last_name, full_name_norm, primary_email) VALUES (?1,?2,?3,?4,?5)"
  ).bind(id, firstName, lastName, full, primaryEmail).run();
  return Response.json({ ok: true, id });
}


