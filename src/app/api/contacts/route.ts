import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { isMockMode } from "@/server/db/config";
import { readMockJson } from "@/server/db/mock";
import { contacts, companies, users, contactAssignments } from "@/server/db/schema";
import { eq, like, sql, desc, and } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/contacts
// Supports: page, limit, search, priority
export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    // Mock modu ise dosyadan oku ve server-side paginate et
    if (isMockMode(env)) {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const search = (url.searchParams.get('search') || '').trim().toLowerCase();
      const priority = (url.searchParams.get('priority') || '').toUpperCase();

      const all = await readMockJson<any[]>("contacts", req.url);
      const filtered = all.filter((c) => {
        const matchesSearch = !search ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
          (c.emailPrimary || '').toLowerCase().includes(search);
        const matchesPriority = !priority || priority === 'ALL' || c.priority === priority;
        return matchesSearch && matchesPriority;
      });
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;
      const data = filtered.slice(offset, offset + limit);

      return Response.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });
    }

    console.log("Cloudflare context obtained");
    const db = getDb(env);
    console.log("Database connection obtained");
    
    // Debug: Check if we have any contacts at all
    const totalContacts = await db.select({ count: sql<number>`count(*)` }).from(contacts);
    console.log(`🔍 Total contacts in database: ${totalContacts[0]?.count || 0}`);
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

    // Get contacts with company data and assignments
    let rows;
    try {
      // First try simple query without joins
      console.log("🔍 Trying simple query first...");
      const simpleRows = await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          emailPrimary: contacts.emailPrimary,
          emailSecondary: contacts.emailSecondary,
          phoneNumber: contacts.phoneNumber,
          linkedin: contacts.linkedin,
          imdb: contacts.imdb,
          facebook: contacts.facebook,
          instagram: contacts.instagram,
          wikipedia: contacts.wikipedia,
          priority: contacts.priority,
          isActive: contacts.isActive,
          seenFilm: contacts.seenFilm,
          docBranchMember: contacts.docBranchMember,
          createdAt: contacts.createdAt,
        })
        .from(contacts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset(offset);
      
      console.log(`🔍 Simple query returned ${simpleRows.length} rows`);
      if (simpleRows.length > 0) {
        console.log("🔍 First simple row:", {
          id: simpleRows[0].id,
          firstName: simpleRows[0].firstName,
          lastName: simpleRows[0].lastName,
          emailPrimary: simpleRows[0].emailPrimary
        });
      }
      
      // Now try with joins
      rows = await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          emailPrimary: contacts.emailPrimary,
          emailSecondary: contacts.emailSecondary,
          phoneNumber: contacts.phoneNumber,
          linkedin: contacts.linkedin,
          imdb: contacts.imdb,
          facebook: contacts.facebook,
          instagram: contacts.instagram,
          wikipedia: contacts.wikipedia,
          priority: contacts.priority,
          isActive: contacts.isActive,
          seenFilm: contacts.seenFilm,
          docBranchMember: contacts.docBranchMember,
          createdAt: contacts.createdAt,
          companyId: contacts.companyId,
          companyName: companies.name,
          companyWebsite: companies.website,
          companyIndustry: companies.industry,
          assignedTo: contactAssignments.userId,
          assignedToName: users.name,
          assignedToLastName: users.lastName,
        })
        .from(contacts)
        .leftJoin(companies, eq(companies.id, contacts.companyId))
        .leftJoin(contactAssignments, eq(contactAssignments.contactId, contacts.id))
        .leftJoin(users, eq(users.id, contactAssignments.userId))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (e) {
      console.warn('Falling back: selecting without phone_number column');
      try {
        rows = await db
          .select({
            id: contacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            emailPrimary: contacts.emailPrimary,
            emailSecondary: contacts.emailSecondary,
            phoneNumber: sql<string>`NULL`,
            linkedin: contacts.linkedin,
            imdb: contacts.imdb,
            facebook: contacts.facebook,
            instagram: contacts.instagram,
            wikipedia: contacts.wikipedia,
            priority: contacts.priority,
            isActive: contacts.isActive,
            seenFilm: contacts.seenFilm,
            docBranchMember: contacts.docBranchMember,
            createdAt: contacts.createdAt,
            companyId: contacts.companyId,
            companyName: companies.name,
            companyWebsite: companies.website,
            companyIndustry: companies.industry,
            assignedTo: contactAssignments.userId,
            assignedToName: users.name,
            assignedToLastName: users.lastName,
          })
          .from(contacts)
          .leftJoin(companies, eq(companies.id, contacts.companyId))
          .leftJoin(contactAssignments, eq(contactAssignments.contactId, contacts.id))
          .leftJoin(users, eq(users.id, contactAssignments.userId))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(contacts.createdAt))
          .limit(limit)
          .offset(offset);
      } catch (e2) {
        console.warn('Second fallback: selecting without assignments join');
        rows = await db
          .select({
            id: contacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            emailPrimary: contacts.emailPrimary,
            emailSecondary: contacts.emailSecondary,
            phoneNumber: sql<string>`NULL`,
            linkedin: contacts.linkedin,
            imdb: contacts.imdb,
            facebook: contacts.facebook,
            instagram: contacts.instagram,
            wikipedia: contacts.wikipedia,
            priority: contacts.priority,
            isActive: contacts.isActive,
            seenFilm: contacts.seenFilm,
            docBranchMember: contacts.docBranchMember,
            createdAt: contacts.createdAt,
            companyId: contacts.companyId,
            companyName: companies.name,
            companyWebsite: companies.website,
            companyIndustry: companies.industry,
            assignedTo: sql<number>`NULL`,
            assignedToName: sql<string>`NULL`,
            assignedToLastName: sql<string>`NULL`,
          })
          .from(contacts)
          .leftJoin(companies, eq(companies.id, contacts.companyId))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(contacts.createdAt))
          .limit(limit)
          .offset(offset);
      }
    }

    // Debug: Log first few rows
    console.log("🔍 Debug: First few rows from database:");
    rows.slice(0, 3).forEach((r, index) => {
      console.log(`   Row ${index + 1}:`, {
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        emailPrimary: r.emailPrimary,
        linkedin: r.linkedin,
        companyName: r.companyName
      });
    });

    const data = rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      name: `${r.firstName || ''} ${r.lastName || ''}`.trim(), // Add name field
      emailPrimary: r.emailPrimary,
      emailSecondary: r.emailSecondary,
      phonePrimary: r.phoneNumber,
      phoneSecondary: null,
      linkedinUrl: r.linkedin,
      twitterUrl: null,
      imdbUrl: r.imdb,
      facebookUrl: r.facebook,
      instagramUrl: r.instagram,
      wikipediaUrl: r.wikipedia,
      priority: r.priority,
      status: r.isActive ? 'ACTIVE' : 'INACTIVE',
      isActive: r.isActive, // Separate field for inactive status
      flags: {
        seenFilm: r.seenFilm,
        docBranchMember: r.docBranchMember
      },
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
    const { env } = await getCloudflareContext();
    // Mock modunda persist etmeden sahte başarı dön
    if (isMockMode(env)) {
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
        message: "Contact created successfully (mock mode - not persisted)" 
      });
    }

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

    // Insert new contact (fallback if some columns are missing locally)
    let newContact;
    try {
      newContact = await db
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
    } catch (e) {
      // Retry without phoneNumber if column is missing in local sqlite
      newContact = await db
        .insert(contacts)
        .values({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          emailPrimary: emailPrimary.trim(),
          emailSecondary: emailSecondary?.trim() || null,
          linkedin: linkedinUrl?.trim() || null,
          priority: priority || 'NONE',
          isActive: status !== 'INACTIVE',
          companyId: companyId || null,
          createdAt: new Date()
        })
        .returning();
    }

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