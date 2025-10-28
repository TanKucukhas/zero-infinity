import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { companies, countries, states, cities } from "@/server/db/schema";
import { eq, like, sql, desc } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/companies
// Supports: search (for autocomplete), page, limit
export async function GET(req: Request) {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return Response.json({
        success: true,
        data: [
          {
            id: 1,
            name: "Example Corp",
            website: "https://example.com",
            linkedinUrl: "https://linkedin.com/company/example-corp",
            industry: "Technology",
            size: "50-200",
            description: "A technology company",
            logoUrl: null,
            headquarters: {
              countryCode: "US",
              stateCode: "CA",
              cityId: 1,
              countryName: "United States",
              stateName: "California",
              cityName: "San Francisco"
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const url = new URL(req.url);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    // Build where conditions
    const whereConditions = [];
    if (search && search.length >= 2) {
      whereConditions.push(like(companies.name, `%${search}%`));
    }

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(companies)
      .where(whereConditions.length > 0 ? sql`${whereConditions.join(' AND ')}` : undefined);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    // Get companies with location data
    const rows = await db
      .select({
        id: companies.id,
        name: companies.name,
        website: companies.website,
        linkedinUrl: companies.linkedinUrl,
        industry: companies.industry,
        size: companies.size,
        description: companies.description,
        logoUrl: companies.logoUrl,
        headquartersCountry: companies.headquartersCountry,
        headquartersState: companies.headquartersState,
        headquartersCity: companies.headquartersCity,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        headquartersCountryName: countries.name,
        headquartersStateName: states.name,
        headquartersCityName: cities.city,
      })
      .from(companies)
      .leftJoin(countries, eq(countries.code, companies.headquartersCountry))
      .leftJoin(states, eq(states.code, companies.headquartersState))
      .leftJoin(cities, eq(cities.id, companies.headquartersCity))
      .where(whereConditions.length > 0 ? sql`${whereConditions.join(' AND ')}` : undefined)
      .orderBy(companies.name)
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      website: r.website || '',
      linkedinUrl: r.linkedinUrl || '',
      industry: r.industry || '',
      size: r.size || '',
      description: r.description || '',
      logoUrl: r.logoUrl || '',
      headquarters: {
        countryCode: r.headquartersCountry,
        stateCode: r.headquartersState,
        cityId: r.headquartersCity,
        countryName: r.headquartersCountryName,
        stateName: r.headquartersStateName,
        cityName: r.headquartersCityName
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    return Response.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching companies:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/companies - Create new company
export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();
    const {
      name,
      website,
      linkedinUrl,
      industry,
      size,
      description,
      logoUrl,
      headquarters
    } = body;

    if (!name || !name.trim()) {
      return Response.json({ success: false, error: "Company name is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existingCompany = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.name, name.trim()))
      .limit(1);

    if (existingCompany.length > 0) {
      return Response.json({ success: false, error: "Company with this name already exists" }, { status: 409 });
    }

    // Insert new company
    const newCompany = await db
      .insert(companies)
      .values({
        name: name.trim(),
        website: website || null,
        linkedinUrl: linkedinUrl || null,
        industry: industry || null,
        size: size || null,
        description: description || null,
        logoUrl: logoUrl || null,
        headquartersCountry: headquarters?.countryCode || null,
        headquartersState: headquarters?.stateCode || null,
        headquartersCity: headquarters?.cityId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return Response.json({ 
      success: true, 
      data: newCompany[0], 
      message: "Company created successfully" 
    });

  } catch (error) {
    console.error("Error creating company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}