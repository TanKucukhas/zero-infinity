import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { companies, countries, states, cities } from "@/server/db/schema";
import { eq, like, desc } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/companies
// Supports: search (for autocomplete), page, limit
export async function GET(req: Request) {
  try {
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

    // Get companies with location data
    const rows = await db
      .select()
      .from(companies)
      .leftJoin(countries, eq(countries.code, companies.headquartersCountry))
      .leftJoin(states, eq(states.code, companies.headquartersState))
      .leftJoin(cities, eq(cities.id, companies.headquartersCity))
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
      .orderBy(companies.name)
      .limit(limit)
      .offset((page - 1) * limit);

    const data = rows.map((r) => ({
      id: r.companies.id,
      name: r.companies.name,
      website: r.companies.website || '',
      linkedinUrl: r.companies.linkedinUrl || '',
      industry: r.companies.industry || '',
      size: r.companies.size || '',
      description: r.companies.description || '',
      logoUrl: r.companies.logoUrl || '',
      headquarters: {
        countryCode: r.companies.headquartersCountry,
        stateCode: r.companies.headquartersState,
        cityId: r.companies.headquartersCity,
        countryName: r.countries?.name,
        stateName: r.states?.name,
        cityName: r.cities?.city
      },
      createdAt: r.companies.createdAt,
      updatedAt: r.companies.updatedAt
    }));

    return Response.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit) || 1,
        hasNext: page < Math.ceil(data.length / limit),
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
      .select()
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