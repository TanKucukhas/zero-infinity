export const runtime = "edge";
import { z } from "zod";

const PersonUpdate = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional()
});

export async function GET(_req: Request, env: any, ctx: any) {
  const id = (ctx?.params?.id) as string;
  const row = await env.DB.prepare("SELECT * FROM people WHERE id=?1").bind(id).first();
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(row);
}

export async function PUT(req: Request, env: any, ctx: any) {
  const id = (ctx?.params?.id) as string;
  const parsed = PersonUpdate.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid body" }, { status: 400 });
  const { firstName, lastName = "" } = parsed.data;
  const full = `${firstName} ${lastName}`.trim().toLowerCase();
  await env.DB.prepare("UPDATE people SET first_name=?1,last_name=?2,full_name_norm=?3 WHERE id=?4")
    .bind(firstName, lastName, full, id).run();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, env: any, ctx: any) {
  const id = (ctx?.params?.id) as string;
  await env.DB.prepare("DELETE FROM people WHERE id=?1").bind(id).run();
  return Response.json({ ok: true });
}


