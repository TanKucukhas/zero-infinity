import { NextResponse } from "next/server";
import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { getCurrentDbSource } from "@/server/db/config";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const source = getCurrentDbSource(env);

    if (source === 'mock') {
      return NextResponse.json({ ok: true, source, message: 'Mock mode' });
    }

    if (source === 'sqlite') {
      // If we can construct the sqlite client without error, consider it healthy
      try {
        getDb(env);
        return NextResponse.json({ ok: true, source, message: 'SQLite available' });
      } catch (e) {
        return NextResponse.json({ ok: false, source, error: 'SQLite unavailable' }, { status: 500 });
      }
    }

    // prod with D1
    if (!('DB' in env)) {
      return NextResponse.json({ ok: false, source, error: 'D1 binding missing' }, { status: 500 });
    }
    await (env.DB as any).prepare('SELECT 1 as test').first();
    return NextResponse.json({ ok: true, source, message: 'D1 reachable' });
    
  } catch (error) {
    console.error("DB health check error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
