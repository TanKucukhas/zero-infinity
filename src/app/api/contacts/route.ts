import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { contacts, companies, users } from "@/server/db/schema";
import { eq, like, sql, desc, and } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

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
            firstName: "Alice",
            lastName: "Johnson",
            emailPrimary: "alice.johnson@techcorp.com",
            emailSecondary: "",
            phoneNumber: "+1-555-0101",
            linkedin: "https://linkedin.com/in/alicejohnson",
            priority: "HIGH",
            seenFilm: true,
            docBranchMember: false,
            biography: "Senior software engineer with 8 years of experience",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date(),
            company: {
              id: 1,
              name: "TechCorp Inc",
              website: "https://techcorp.com",
              industry: "Technology",
              size: "50-200",
              description: "Leading technology company",
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
            assignedTo: {
              id: 2,
              name: "John Doe"
            },
            location: "San Francisco, CA"
          },
          {
            id: "2",
            firstName: "Bob",
            lastName: "Wilson",
            emailPrimary: "bob.wilson@innovationlabs.com",
            emailSecondary: "",
            phoneNumber: "+1-555-0102",
            linkedin: "https://linkedin.com/in/bobwilson",
            priority: "MEDIUM",
            seenFilm: false,
            docBranchMember: true,
            biography: "Product manager specializing in agile methodologies",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date(),
            company: {
              id: 2,
              name: "Innovation Labs",
              website: "https://innovationlabs.com",
              industry: "Software",
              size: "10-50",
              description: "Software development and consulting",
              logoUrl: null,
              headquarters: {
                countryCode: "US",
                stateCode: "NY",
                cityId: 3,
                countryName: "United States",
                stateName: "New York",
                cityName: "New York"
              },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            assignedTo: {
              id: 3,
              name: "Jane Smith"
            },
            location: "New York, NY"
          },
          {
            id: "3",
            firstName: "Carol",
            lastName: "Davis",
            emailPrimary: "carol.davis@globalsolutions.ca",
            emailSecondary: "",
            phoneNumber: "+1-555-0103",
            linkedin: "https://linkedin.com/in/caroldavis",
            priority: "LOW",
            seenFilm: true,
            docBranchMember: true,
            biography: "Business analyst with expertise in data visualization",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date(),
            company: {
              id: 3,
              name: "Global Solutions",
              website: "https://globalsolutions.ca",
              industry: "Consulting",
              size: "200+",
              description: "International consulting firm",
              logoUrl: null,
              headquarters: {
                countryCode: "CA",
                stateCode: "ON",
                cityId: 4,
                countryName: "Canada",
                stateName: "Ontario",
                cityName: "Toronto"
              },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            assignedTo: {
              id: 1,
              name: "Admin User"
            },
            location: "Toronto, ON"
          },
          {
            id: "4",
            firstName: "David",
            lastName: "Brown",
            emailPrimary: "david.brown@freelance.com",
            emailSecondary: "",
            phoneNumber: "+1-555-0104",
            linkedin: "https://linkedin.com/in/davidbrown",
            priority: "NONE",
            seenFilm: false,
            docBranchMember: false,
            biography: "Freelance consultant and entrepreneur",
            isActive: true,
            inactiveReason: null,
            inactiveAt: null,
            createdAt: new Date(),
            company: null,
            assignedTo: null,
            location: "Texas, US"
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    const { env } = await getCloudflareContext();
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
        assignedTo: contacts.assignedTo,
        assignedToName: users.name,
        assignedToLastName: users.lastName,
      })
      .from(contacts)
      .leftJoin(companies, eq(companies.id, contacts.companyId))
      .leftJoin(users, eq(users.id, contacts.assignedTo))
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
      assignedTo: r.assignedTo ? {
        id: r.assignedTo,
        name: `${r.assignedToName} ${r.assignedToLastName}`.trim()
      } : null
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
    // For development, return mock response
    if (process.env.NODE_ENV === 'development') {
      const body = await req.json();
      const { firstName, lastName, emailPrimary } = body;
      
      if (!firstName || !lastName || !emailPrimary) {
        return Response.json({ 
          success: false, 
          error: "First name, last name, and primary email are required" 
        }, { status: 400 });
      }
      
      return Response.json({ 
        success: true, 
        data: {
          id: Math.floor(Math.random() * 1000) + 100,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          emailPrimary: emailPrimary.trim(),
          emailSecondary: body.emailSecondary?.trim() || null,
          phoneNumber: body.phonePrimary?.trim() || null,
          linkedin: body.linkedinUrl?.trim() || null,
          priority: body.priority || 'NONE',
          isActive: body.status !== 'INACTIVE',
          companyId: body.companyId || null,
          createdAt: new Date()
        }, 
        message: "Contact created successfully (mock response)" 
      });
    }
    
    const { env } = await getCloudflareContext();
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