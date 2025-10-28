import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { sql } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/users
export async function GET(req: Request) {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return Response.json({
        success: true,
        data: [
          {
            id: 1,
            name: "Admin User",
            lastName: "Admin",
            email: "admin@example.com",
            role: "admin",
            status: "active",
            createdAt: new Date()
          },
          {
            id: 2,
            name: "Editor User",
            lastName: "Editor",
            email: "editor@example.com",
            role: "editor",
            status: "active",
            createdAt: new Date()
          },
          {
            id: 3,
            name: "Viewer User",
            lastName: "Viewer",
            email: "viewer@example.com",
            role: "viewer",
            status: "active",
            createdAt: new Date()
          },
          {
            id: 4,
            name: "External User",
            lastName: "External",
            email: "external@example.com",
            role: "external",
            status: "active",
            createdAt: new Date()
          }
        ]
      });
    }
    
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