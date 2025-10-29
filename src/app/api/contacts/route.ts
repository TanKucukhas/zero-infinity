import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db/client";
import { isMockMode } from "@/server/db/config";
import { readMockJson } from "@/server/db/mock";
import { contacts, companies, users, contactAssignments } from "@/server/db/schema";
import { eq, like, desc, and } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

// GET /api/contacts
// Supports: page, limit, search, priority
export async function GET(req: Request) {
  try {
    console.log("🔍 Starting contacts API request");
    let env;
    try {
      const context = await getCloudflareContext();
      env = context.env;
      console.log("🔍 Cloudflare context obtained:", !!env);
    } catch (error) {
      console.log("🔍 Cloudflare context failed, using local env:", error.message);
      env = null; // Local development
    }
    console.log("🔍 Environment variables:", {
      DB_SOURCE: process.env.DB_SOURCE,
      DEV_SQLITE_PATH: process.env.DEV_SQLITE_PATH
    });
    
    // Mock modu ise dosyadan oku ve server-side paginate et
    if (isMockMode(env)) {
      console.log("🔍 Using mock mode");
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const search = (url.searchParams.get('search') || '').trim().toLowerCase();
      const priority = (url.searchParams.get('priority') || '').toUpperCase();

      // Read mock data directly from file to preserve all fields
      const mockDataPath = join(process.cwd(), 'public', 'mock', 'contacts.json');
      const mockDataRaw = readFileSync(mockDataPath, 'utf-8');
      const all = JSON.parse(mockDataRaw);
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

    console.log("🔍 Using database mode");
    const db = getDb(env);
    console.log("🔍 Database connection obtained");
    
    // Debug: Check if we have any contacts at all
    try {
      const totalContacts = await db.select().from(contacts).limit(1);
      console.log(`🔍 Database connection successful, found ${totalContacts.length} contacts`);
    } catch (dbError) {
      console.error("🔍 Database connection failed:", dbError);
      throw dbError;
    }
    
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
      // Build WHERE clause for raw SQL
      const whereClause = [];
      if (search) {
        whereClause.push(`c.first_name LIKE '%${search}%'`);
      }
      if (priority && priority !== 'ALL') {
        whereClause.push(`c.priority = '${priority}'`);
      }
      const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

      // Try with raw SQL first to debug - Get first assignment per contact
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
        LEFT JOIN (
          SELECT contact_id, user_id,
                 ROW_NUMBER() OVER (PARTITION BY contact_id ORDER BY id) as rn
          FROM contact_assignments
        ) ca ON c.id = ca.contact_id AND ca.rn = 1
        LEFT JOIN users u ON ca.user_id = u.id
        ${whereSQL}
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
      
      console.log(`🔍 Raw SQL query:`, rawQuery);
      
      // Use local SQLite directly (not Cloudflare D1)
      const Database = require('better-sqlite3');
      const sqlite = new Database(join(process.cwd(), '.data', 'dev.sqlite'));
      const rawResult = sqlite.prepare(rawQuery).all();
      sqlite.close();
      
      console.log(`🔍 Raw SQL result:`, JSON.stringify(rawResult, null, 2));
      
      // Handle both Cloudflare D1 format (rawResult.results) and local SQLite format (rawResult)
      const results = Array.isArray(rawResult) ? rawResult : (rawResult.results || []);
      console.log(`🔍 Results length: ${results.length}`);
      console.log(`🔍 First result:`, results[0]);
      
      // Convert raw result to Drizzle format (no grouping needed since we get only first assignment)
      rows = results.map((row: any) => ({
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
        assignments: row.assigned_to ? [{
          userId: row.assigned_to,
          userName: row.assigned_to_name,
          userLastName: row.assigned_to_last_name,
        }] : [],
      }));
      
    } catch (e) {
      console.error('Raw SQL failed:', e);
      throw e; // Don't fallback to Drizzle as it causes duplicate issues
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
        // Add all assignments for multi-assignment support
        allAssignments: r.assignments || [],
      };
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