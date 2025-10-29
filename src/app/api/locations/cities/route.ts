import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { cities } from "@/server/db/schema";
import { sql, eq, like, and } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/locations/cities?country=US&state=GA&q=search
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('country') || 'US';
    const stateCode = url.searchParams.get('state');
    const searchQuery = url.searchParams.get('q') || '';
    
    if (!stateCode) {
      return Response.json({ 
        success: false, 
        error: 'state parameter is required' 
      }, { status: 400 });
    }
    
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    
    // Build query conditions
    const conditions = [eq(cities.stateCode, stateCode)];
    
    // Add search condition if query is provided and has at least 2 characters
    if (searchQuery && searchQuery.length >= 2) {
      conditions.push(like(cities.cityAscii, `%${searchQuery.toLowerCase()}%`));
    }
    
    const citiesData = await db
      .select({
        id: cities.id,
        city: cities.city,
        city_ascii: cities.cityAscii
      })
      .from(cities)
      .where(and(...conditions))
      .orderBy(sql`${cities.cityAscii} ASC`)
      .limit(50); // Limit results for performance
    
    return Response.json({
      success: true,
      data: citiesData
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}


