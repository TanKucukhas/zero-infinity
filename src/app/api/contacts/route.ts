export const runtime = "edge";
import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { contacts, companies, users } from "@/server/db/schema";
import { eq, like, sql, desc, and } from "drizzle-orm";

// GET /api/contacts
// Supports: page, limit, search, priority
export async function GET(req: Request) {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return Response.json({
        success: true,
        data: [
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            secondEmail: "",
            company: {
              id: 1,
              name: "Example Corp",
              website: "https://example.com",
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
            },
            linkedin: "https://linkedin.com/in/johndoe",
            facebook: "",
            instagram: "",
            imdb: "",
            wikipedia: "",
            priority: "MEDIUM",
            assignedTo: "",
            contacted: false,
            location: "San Francisco, CA",
            fullName: "John Doe",
            seenFilm: false,
            docBranchMember: false,
            biography: "Software engineer with 5 years of experience",
            phoneNumber: "+1234567890",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date()
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            secondEmail: "",
            company: {
              id: 2,
              name: "Tech Solutions Inc",
              website: "https://techsolutions.com",
              industry: "Software",
              size: "10-50",
              description: "Software development company",
              logoUrl: null,
              headquarters: {
                countryCode: "US",
                stateCode: "NY",
                cityId: 2,
                countryName: "United States",
                stateName: "New York",
                cityName: "New York"
              },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            linkedin: "https://linkedin.com/in/janesmith",
            facebook: "",
            instagram: "",
            imdb: "",
            wikipedia: "",
            priority: "HIGH",
            assignedTo: "",
            contacted: true,
            location: "New York, NY",
            fullName: "Jane Smith",
            seenFilm: true,
            docBranchMember: true,
            biography: "Product manager with expertise in agile methodologies",
            phoneNumber: "+1987654321",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date()
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    const { env } = getCloudflareContext();
    console.log("Cloudflare context obtained");
    const db = getDb(env);
    console.log("Database connection obtained");
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const priority = (url.searchParams.get('priority') || '').toUpperCase();

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        sql`(LOWER(${contacts.firstName}) LIKE ${`%${search}%`} OR 
             LOWER(${contacts.lastName}) LIKE ${`%${search}%`} OR 
             LOWER(${contacts.emailPrimary}) LIKE ${`%${search}%`})`
      );
    }
    
    if (priority && priority !== 'ALL') {
      whereConditions.push(eq(contacts.priority, priority as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'));
    }

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    // Get contacts with company data
    const rows = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        emailPrimary: contacts.emailPrimary,
        emailSecondary: contacts.emailSecondary,
        phoneNumber: contacts.phoneNumber,
        linkedin: contacts.linkedin,
        priority: contacts.priority,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        companyId: contacts.companyId,
        companyName: companies.name,
        companyWebsite: companies.website,
        companyIndustry: companies.industry,
      })
      .from(contacts)
      .leftJoin(companies, eq(companies.id, contacts.companyId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      emailPrimary: r.emailPrimary,
      emailSecondary: r.emailSecondary,
      phonePrimary: r.phoneNumber,
      phoneSecondary: null,
      linkedinUrl: r.linkedin,
      twitterUrl: null,
      priority: r.priority,
      status: r.isActive ? 'ACTIVE' : 'INACTIVE',
      notes: null,
      lastOutreachAt: null,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
      company: r.companyId ? {
        id: r.companyId,
        name: r.companyName,
        website: r.companyWebsite,
        industry: r.companyIndustry
      } : null,
      assignedTo: null
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
    console.error("Error fetching contacts:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/contacts - Create new contact
export async function POST(req: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();
    const {
      firstName,
      lastName,
      emailPrimary,
      emailSecondary,
      phonePrimary,
      phoneSecondary,
      linkedinUrl,
      twitterUrl,
      priority,
      status,
      notes,
      companyId,
      assignedTo
    } = body;

    if (!firstName || !lastName || !emailPrimary) {
      return Response.json({ 
        success: false, 
        error: "First name, last name, and primary email are required" 
      }, { status: 400 });
    }

    // Check for duplicate email
    const existingContact = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.emailPrimary, emailPrimary))
      .limit(1);

    if (existingContact.length > 0) {
      return Response.json({ 
        success: false, 
        error: "Contact with this email already exists" 
      }, { status: 409 });
    }

    // Insert new contact
    const newContact = await db
      .insert(contacts)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailPrimary: emailPrimary.trim(),
        emailSecondary: emailSecondary?.trim() || null,
        phoneNumber: phonePrimary?.trim() || null,
        linkedin: linkedinUrl?.trim() || null,
        priority: priority || 'NONE',
        isActive: status !== 'INACTIVE',
        companyId: companyId || null,
        createdAt: new Date()
      })
      .returning();

    return Response.json({ 
      success: true, 
      data: newContact[0], 
      message: "Contact created successfully" 
    });

  } catch (error) {
    console.error("Error creating contact:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}