export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET /api/companies/[id] - Get single company details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const companyId = parseInt(params.id, 10);
  
  if (isNaN(companyId)) {
    return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
  }

  try {
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

    if (!companyRow) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

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

    return Response.json({ success: true, data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const companyId = parseInt(params.id, 10);
  
  if (isNaN(companyId)) {
    return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
  }

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

    // Check if company exists
    const existingCompany = await env.DB.prepare(`
      SELECT id FROM companies WHERE id = ?
    `).bind(companyId).first();

    if (!existingCompany) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== '') {
      const duplicateCompany = await env.DB.prepare(`
        SELECT id FROM companies WHERE LOWER(name) = LOWER(?) AND id != ?
      `).bind(name.trim(), companyId).first();

      if (duplicateCompany) {
        return Response.json({ success: false, error: "Company with this name already exists" }, { status: 409 });
      }
    }

    // Build update query
    const updates: string[] = [];
    const binds: any[] = [];

    if (name !== undefined) { updates.push(`name = ?${binds.length + 1}`); binds.push(name.trim()); }
    if (website !== undefined) { updates.push(`website = ?${binds.length + 1}`); binds.push(website); }
    if (linkedinUrl !== undefined) { updates.push(`linkedin_url = ?${binds.length + 1}`); binds.push(linkedinUrl); }
    if (industry !== undefined) { updates.push(`industry = ?${binds.length + 1}`); binds.push(industry); }
    if (size !== undefined) { updates.push(`size = ?${binds.length + 1}`); binds.push(size); }
    if (description !== undefined) { updates.push(`description = ?${binds.length + 1}`); binds.push(description); }
    if (logoUrl !== undefined) { updates.push(`logo_url = ?${binds.length + 1}`); binds.push(logoUrl); }

    // Headquarters fields
    if (headquarters) {
      if (headquarters.countryCode !== undefined) { updates.push(`headquarters_country = ?${binds.length + 1}`); binds.push(headquarters.countryCode); }
      if (headquarters.stateCode !== undefined) { updates.push(`headquarters_state = ?${binds.length + 1}`); binds.push(headquarters.stateCode); }
      if (headquarters.cityId !== undefined) { updates.push(`headquarters_city = ?${binds.length + 1}`); binds.push(headquarters.cityId); }
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = ?${binds.length + 1}`);
    binds.push(Date.now());

    if (updates.length === 0) {
      return Response.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    // Add company ID to binds
    binds.push(companyId);

    // Update company
    const result = await env.DB.prepare(`
      UPDATE companies 
      SET ${updates.join(', ')} 
      WHERE id = ?${binds.length}
    `).bind(...binds).run();

    if (result.changes === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    // Get updated company
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

    return Response.json({ success: true, data: company, message: "Company updated successfully" });
  } catch (error) {
    console.error("Error updating company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/companies/[id] - Delete company (only if no contacts reference it)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const companyId = parseInt(params.id, 10);
  
  if (isNaN(companyId)) {
    return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
  }

  try {
    // Check if any contacts reference this company
    const contactCount = await env.DB.prepare(`
      SELECT COUNT(1) as cnt FROM contacts WHERE company_id = ?
    `).bind(companyId).first();

    if (Number(contactCount?.cnt || 0) > 0) {
      return Response.json({ 
        success: false, 
        error: "Cannot delete company: it is referenced by contacts" 
      }, { status: 409 });
    }

    // Delete company
    const result = await env.DB.prepare(`
      DELETE FROM companies WHERE id = ?
    `).bind(companyId).run();

    if (result.changes === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
