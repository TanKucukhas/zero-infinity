export const runtime = "edge";
import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { companies, countries, states, cities, contacts } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/companies/[id] - Get single company details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { env } = getCloudflareContext();
    const db = getDb(env);
    const companyId = parseInt(params.id, 10);
    
    if (isNaN(companyId)) {
      return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
    }

    const companyRow = await db
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
      .where(eq(companies.id, companyId))
      .limit(1);

    if (companyRow.length === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    const company = {
      id: companyRow[0].id,
      name: companyRow[0].name,
      website: companyRow[0].website || '',
      linkedinUrl: companyRow[0].linkedinUrl || '',
      industry: companyRow[0].industry || '',
      size: companyRow[0].size || '',
      description: companyRow[0].description || '',
      logoUrl: companyRow[0].logoUrl || '',
      headquarters: {
        countryCode: companyRow[0].headquartersCountry,
        stateCode: companyRow[0].headquartersState,
        cityId: companyRow[0].headquartersCity,
        countryName: companyRow[0].headquartersCountryName,
        stateName: companyRow[0].headquartersStateName,
        cityName: companyRow[0].headquartersCityName
      },
      createdAt: companyRow[0].createdAt,
      updatedAt: companyRow[0].updatedAt
    };

    return Response.json({ success: true, data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { env } = getCloudflareContext();
    const db = getDb(env);
    const companyId = parseInt(params.id, 10);
    
    if (isNaN(companyId)) {
      return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
    }

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
    const existingCompany = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (existingCompany.length === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== '') {
      const duplicateCompany = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.name, name.trim()))
        .limit(1);

      if (duplicateCompany.length > 0 && duplicateCompany[0].id !== companyId) {
        return Response.json({ 
          success: false, 
          error: "Company with this name already exists" 
        }, { status: 409 });
      }
    }

    // Update company
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (website !== undefined) updateData.website = website;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    if (headquarters) {
      if (headquarters.countryCode !== undefined) updateData.headquartersCountry = headquarters.countryCode;
      if (headquarters.stateCode !== undefined) updateData.headquartersState = headquarters.stateCode;
      if (headquarters.cityId !== undefined) updateData.headquartersCity = headquarters.cityId;
    }

    const result = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, companyId))
      .returning();

    if (result.length === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    // Get updated company with location data
    const companyRow = await db
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
      .where(eq(companies.id, companyId))
      .limit(1);

    const company = {
      id: companyRow[0].id,
      name: companyRow[0].name,
      website: companyRow[0].website || '',
      linkedinUrl: companyRow[0].linkedinUrl || '',
      industry: companyRow[0].industry || '',
      size: companyRow[0].size || '',
      description: companyRow[0].description || '',
      logoUrl: companyRow[0].logoUrl || '',
      headquarters: {
        countryCode: companyRow[0].headquartersCountry,
        stateCode: companyRow[0].headquartersState,
        cityId: companyRow[0].headquartersCity,
        countryName: companyRow[0].headquartersCountryName,
        stateName: companyRow[0].headquartersStateName,
        cityName: companyRow[0].headquartersCityName
      },
      createdAt: companyRow[0].createdAt,
      updatedAt: companyRow[0].updatedAt
    };

    return Response.json({ 
      success: true, 
      data: company, 
      message: "Company updated successfully" 
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/companies/[id] - Delete company (only if no contacts reference it)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { env } = getCloudflareContext();
    const db = getDb(env);
    const companyId = parseInt(params.id, 10);
    
    if (isNaN(companyId)) {
      return Response.json({ success: false, error: "Invalid company ID" }, { status: 400 });
    }

    // Check if any contacts reference this company
    const contactCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.companyId, companyId));

    if (contactCount[0]?.count > 0) {
      return Response.json({ 
        success: false, 
        error: "Cannot delete company: it is referenced by contacts" 
      }, { status: 409 });
    }

    // Delete company
    const result = await db
      .delete(companies)
      .where(eq(companies.id, companyId))
      .returning();

    if (result.length === 0) {
      return Response.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      message: "Company deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}