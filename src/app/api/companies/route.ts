export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET /api/companies
// Supports: search (for autocomplete), page, limit
export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  const where: string[] = [];
  const binds: any[] = [];

  if (search && search.length >= 2) {
    where.push(`LOWER(c.name) LIKE ?1`);
    binds.push(`%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Count total
  const countRow = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM companies c ${whereSql}`)
    .bind(...binds).first();
  const total = Number(countRow?.cnt || 0);
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const rows = await env.DB.prepare(`
    SELECT 
      c.*,
      co.name AS headquarters_country_name,
      st.name AS headquarters_state_name,
      ci.city AS headquarters_city_name
    FROM companies c
    LEFT JOIN countries co ON co.code = c.headquarters_country
    LEFT JOIN states st ON st.code = c.headquarters_state
    LEFT JOIN cities ci ON ci.id = c.headquarters_city
    ${whereSql}
    ORDER BY c.name ASC
    LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}
  `).bind(...binds, limit, offset).all();

  const data = (rows?.results || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    website: r.website || '',
    linkedinUrl: r.linkedin_url || '',
    industry: r.industry || '',
    size: r.size || '',
    description: r.description || '',
    logoUrl: r.logo_url || '',
    headquarters: {
      countryCode: r.headquarters_country,
      stateCode: r.headquarters_state,
      cityId: r.headquarters_city,
      countryName: r.headquarters_country_name,
      stateName: r.headquarters_state_name,
      cityName: r.headquarters_city_name
    },
    createdAt: r.created_at,
    updatedAt: r.updated_at
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
}

// POST /api/companies - Create new company
export async function POST(req: Request) {
  const { env } = getCloudflareContext();

  try {
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

    // Validate required fields
    if (!name || name.trim() === '') {
      return Response.json({ success: false, error: "Company name is required" }, { status: 400 });
    }

    // Check if company already exists (case-insensitive)
    const existingCompany = await env.DB.prepare(`
      SELECT id FROM companies WHERE LOWER(name) = LOWER(?)
    `).bind(name.trim()).first();

    if (existingCompany) {
      return Response.json({ success: false, error: "Company with this name already exists" }, { status: 409 });
    }

    const now = Date.now();

    // Insert new company
    const result = await env.DB.prepare(`
      INSERT INTO companies (
        name, website, linkedin_url, industry, size, description, logo_url,
        headquarters_country, headquarters_state, headquarters_city,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name.trim(),
      website || null,
      linkedinUrl || null,
      industry || null,
      size || null,
      description || null,
      logoUrl || null,
      headquarters?.countryCode || null,
      headquarters?.stateCode || null,
      headquarters?.cityId || null,
      now,
      now
    ).run();

    const companyId = result.meta.last_row_id;

    // Get the created company with location details
    const companyRow = await env.DB.prepare(`
      SELECT 
        c.*,
        co.name AS headquarters_country_name,
        st.name AS headquarters_state_name,
        ci.city AS headquarters_city_name
      FROM companies c
      LEFT JOIN countries co ON co.code = c.headquarters_country
      LEFT JOIN states st ON st.code = c.headquarters_state
      LEFT JOIN cities ci ON ci.id = c.headquarters_city
      WHERE c.id = ?
    `).bind(companyId).first();

    const company = {
      id: companyRow.id,
      name: companyRow.name,
      website: companyRow.website || '',
      linkedinUrl: companyRow.linkedin_url || '',
      industry: companyRow.industry || '',
      size: companyRow.size || '',
      description: companyRow.description || '',
      logoUrl: companyRow.logo_url || '',
      headquarters: {
        countryCode: companyRow.headquarters_country,
        stateCode: companyRow.headquarters_state,
        cityId: companyRow.headquarters_city,
        countryName: companyRow.headquarters_country_name,
        stateName: companyRow.headquarters_state_name,
        cityName: companyRow.headquarters_city_name
      },
      createdAt: companyRow.created_at,
      updatedAt: companyRow.updated_at
    };

    return Response.json({
      success: true,
      data: company,
      message: "Company created successfully"
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
