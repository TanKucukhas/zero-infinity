import { NextResponse } from "next/server";
import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get database connection
    const { env } = await getCloudflareContext();
    
    // Check if D1 binding exists
    if (!('DB' in env)) {
      console.error('Missing D1 binding DB. Env keys:', Object.keys(env));
      return NextResponse.json({ 
        ok: false, 
        error: 'Database binding unavailable',
        envKeys: Object.keys(env)
      }, { status: 500 });
    }
    
    const db = getDb(env);
    
    // Test database connectivity with a simple query
    await db.execute('SELECT 1 as test');
    
    return NextResponse.json({ 
      ok: true,
      message: 'Database connection successful'
    });
    
  } catch (error) {
    console.error("DB health check error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
