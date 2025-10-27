export const runtime = "edge";
import { z } from "zod";

const CsvBatch = z.object({ batch: z.array(z.record(z.any())) });

export async function POST(req: Request, env: any) {
  const raw = await req.text();
  if (raw.length > 5 * 1024 * 1024) {
    return Response.json({ error: "payload too large" }, { status: 413 });
  }
  let json: any;
  try { json = JSON.parse(raw); } catch { return Response.json({ error: "invalid json" }, { status: 400 }); }
  const parsed = CsvBatch.safeParse(json);
  if (!parsed.success) return Response.json({ error: "invalid body" }, { status: 400 });
  const { batch } = parsed.data;
  if (batch.length > 5000) return Response.json({ error: "too many rows" }, { status: 413 });

  const stmt = env.DB.prepare(
    "INSERT OR IGNORE INTO people (id, first_name, last_name, full_name_norm, primary_email, location_text) VALUES (?1,?2,?3,?4,?5,?6)"
  );

  for (const r of batch as any[]) {
    const id = crypto.randomUUID();
    const fn = (r["First Name"] || "").trim();
    const ln = (r["Last Name"] || "").trim();
    const full = `${fn} ${ln}`.trim().toLowerCase();
    await stmt.bind(id, fn, ln, full, r["E-mail"] || null, r["Location"] || null).run();

    const second = (r["Second E-mail"] || "").trim();
    if (second) {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO contact_methods (id, person_id, type, value) VALUES (?1,?2,'email',?3)"
      ).bind(crypto.randomUUID(), id, second).run();
    }
  }

  return Response.json({ ok: true });
}


