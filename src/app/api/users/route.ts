import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { sql } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/users
export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    
    const usersData = await db
      .select()
      .from(users)
      .orderBy(sql`${users.name} ASC`);
    
    return Response.json({
      success: true,
      data: usersData
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}