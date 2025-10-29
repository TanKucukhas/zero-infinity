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
      // Try with raw SQL first to debug
      const rawQuery = `
        SELECT 
          c.*,
          comp.name as company_name,
          comp.website as company_website,
          comp.industry as company_industry,
          ca.user_id as assigned_to,
          u.name as assigned_to_name,
          u.last_name as assigned_to_last_name
        FROM contacts c
        LEFT JOIN companies comp ON c.company_id = comp.id
        LEFT JOIN contact_assignments ca ON c.id = ca.contact_id
        LEFT JOIN users u ON ca.user_id = u.id
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
      
      console.log(`🔍 Raw SQL query:`, rawQuery);
      const rawResult = await (env.DB as any).prepare(rawQuery).all();
      console.log(`🔍 Raw SQL result:`, JSON.stringify(rawResult, null, 2));
      
      // Convert raw result to Drizzle format
      rows = rawResult.results.map((row: any) => ({
        contacts: {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          emailPrimary: row.email_primary,
          emailSecondary: row.email_secondary,
          phoneNumber: row.phone_number,
          linkedin: row.linkedin,
          imdb: row.imdb,
          facebook: row.facebook,
          instagram: row.instagram,
          wikipedia: row.wikipedia,
          priority: row.priority,
          isActive: row.is_active,
          seenFilm: row.seen_film,
          docBranchMember: row.doc_branch_member,
          createdAt: row.created_at,
          companyId: row.company_id,
        },
        companies: row.company_name ? {
          name: row.company_name,
          website: row.company_website,
          industry: row.company_industry,
        } : null,
        contactAssignments: row.assigned_to ? {
          userId: row.assigned_to,
        } : null,
        users: row.assigned_to_name ? {
          name: row.assigned_to_name,
          lastName: row.assigned_to_last_name,
        } : null,
      }));
      
    } catch (e) {
      console.warn('Raw SQL failed, falling back to Drizzle:', e);
      // Fallback to Drizzle
      rows = await db
        .select()
        .from(contacts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
    }

    console.log(`🔍 Final query returned ${rows.length} rows`);
    if (rows.length > 0) {
      console.log(`🔍 First row data:`, JSON.stringify(rows[0], null, 2));
      console.log(`🔍 contactAssignments:`, rows[0].contactAssignments);
      console.log(`🔍 users:`, rows[0].users);
    }

    // Transform the data
    const data = rows.map((r) => {
      const transformed = {
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
        assignedTo: r.contactAssignments?.userId || null,
        assignedToName: r.users?.name,
        assignedToLastName: r.users?.lastName,
      };
      console.log(`🔍 Transformed data:`, JSON.stringify(transformed, null, 2));
      return transformed;
    });

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