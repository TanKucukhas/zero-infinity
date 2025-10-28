import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { isMockMode } from "@/server/db/config";
import { readMockJson } from "@/server/db/mock";
import { contacts, companies, users, contactAssignments } from "@/server/db/schema";
import { eq, like, desc, and } from "drizzle-orm";

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
    const totalContacts = await db.select().from(contacts).limit(1);
    console.log(`🔍 Database connection successful`);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const priority = (url.searchParams.get('priority') || '').toUpperCase();

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(like(contacts.firstName, `%${search}%`));
    }
    
    if (priority && priority !== 'ALL') {
      whereConditions.push(eq(contacts.priority, priority as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'));
    }

    // Get contacts with company data and assignments
    let rows;
    try {
      // First try simple query without joins
      console.log("🔍 Trying simple query first...");
      const simpleRows = await db
        .select()
        .from(contacts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
      
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
        .select()
        .from(contacts)
        .leftJoin(companies, eq(companies.id, contacts.companyId))
        .leftJoin(contactAssignments, eq(contactAssignments.contactId, contacts.id))
        .leftJoin(users, eq(users.id, contactAssignments.userId))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
    } catch (e) {
      console.warn('Falling back: selecting without phone_number column');
      try {
        rows = await db
          .select()
          .from(contacts)
          .leftJoin(companies, eq(companies.id, contacts.companyId))
          .leftJoin(contactAssignments, eq(contactAssignments.contactId, contacts.id))
          .leftJoin(users, eq(users.id, contactAssignments.userId))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(contacts.createdAt))
          .limit(limit)
          .offset((page - 1) * limit);
      } catch (e2) {
        console.warn('Falling back: selecting without joins');
        rows = await db
          .select()
          .from(contacts)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(contacts.createdAt))
          .limit(limit)
          .offset((page - 1) * limit);
      }
    }

    console.log(`🔍 Final query returned ${rows.length} rows`);

    // Transform the data
    const data = rows.map((r) => ({
      id: r.contacts.id,
      firstName: r.contacts.firstName,
      lastName: r.contacts.lastName,
      emailPrimary: r.contacts.emailPrimary,
      emailSecondary: r.contacts.emailSecondary,
      phoneNumber: r.contacts.phoneNumber,
      linkedin: r.contacts.linkedin,
      imdb: r.contacts.imdb,
      facebook: r.contacts.facebook,
      instagram: r.contacts.instagram,
      wikipedia: r.contacts.wikipedia,
      priority: r.contacts.priority,
      isActive: r.contacts.isActive,
      seenFilm: r.contacts.seenFilm,
      docBranchMember: r.contacts.docBranchMember,
      createdAt: r.contacts.createdAt,
      companyId: r.contacts.companyId,
      companyName: r.companies?.name,
      companyWebsite: r.companies?.website,
      companyIndustry: r.companies?.industry,
      assignedTo: r.contactAssignments?.userId,
      assignedToName: r.users?.name,
      assignedToLastName: r.users?.lastName,
    }));

    // Get total count for pagination
    const totalCount = await db
      .select()
      .from(contacts)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalCount.length;
    const totalPages = Math.ceil(total / limit) || 1;

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

  } catch (error) {
    console.error("Error fetching contacts:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}