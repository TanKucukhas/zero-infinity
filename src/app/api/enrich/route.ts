export const runtime = "edge";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const EnrichBody = z.object({ personId: z.string().min(1) });

export async function POST(req: Request) {
  const { env } = getCloudflareContext();
  const parsed = EnrichBody.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "personId required" }, { status: 400 });
  const { personId } = parsed.data;

  const p = await env.DB.prepare("SELECT first_name,last_name,primary_email,last_refreshed_at FROM people WHERE id=?1")
    .bind(personId).first();
  if (!p) return Response.json({ error: "not found" }, { status: 404 });

  if (p.last_refreshed_at && Date.now() - p.last_refreshed_at < 5 * 60_000) {
    return Response.json({ skip: "recently refreshed" });
  }

  const res = await fetch("https://api.apollo.io/v1/people/match", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": env.APOLLO_API_KEY },
    body: JSON.stringify({ first_name: p.first_name, last_name: p.last_name, email: p.primary_email })
  });
  if (res.status === 429 || res.status >= 500) {
    return Response.json({ error: "upstream busy" }, { status: 503 });
  }
  const payload = await res.json();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const hash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

  await env.DB.prepare(
    "INSERT OR IGNORE INTO raw_ingest (id,person_id,source,payload_json,hash,fetched_at) VALUES (?1,?2,'apollo',?3,?4,?5)"
  ).bind(crypto.randomUUID(), personId, JSON.stringify(payload), hash, Date.now()).run();

  const ap = payload?.person ?? {};
  const full = `${ap.first_name || p.first_name || ""} ${ap.last_name || p.last_name || ""}`.trim().toLowerCase();
  await env.DB.prepare("UPDATE people SET full_name_norm=?1, primary_email=COALESCE(?2,primary_email), last_refreshed_at=?3 WHERE id=?4")
    .bind(full, ap.email || null, Date.now(), personId).run();

  if (ap.linkedin_url) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO social_profiles (id,person_id,network,url,source,last_seen_at) VALUES (?1,?2,'linkedin',?3,'apollo',?4)"
    ).bind(crypto.randomUUID(), personId, ap.linkedin_url, Date.now()).run();
  }

  return Response.json({ ok: true });
}

