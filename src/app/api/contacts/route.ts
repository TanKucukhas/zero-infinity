export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET /api/contacts
// Supports: page, limit, search, priority, contacted
export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  const priority = (url.searchParams.get('priority') || '').toUpperCase();
  const contacted = (url.searchParams.get('contacted') || '').toLowerCase(); // 'true' | 'false' | ''

  const where: string[] = [];
  const binds: any[] = [];

  if (search) {
    where.push(`(LOWER(first_name) LIKE ?1 OR LOWER(last_name) LIKE ?1 OR LOWER(email_primary) LIKE ?1 OR LOWER(company_name) LIKE ?1)`);
    binds.push(`%${search}%`);
  }
  if (priority && priority !== 'ALL') {
    where.push(`priority = ?${binds.length + 1}`);
    binds.push(priority);
  }
  if (contacted && contacted !== 'all') {
    if (contacted === 'true') {
      where.push(`last_outreach_at IS NOT NULL`);
    } else if (contacted === 'false') {
      where.push(`last_outreach_at IS NULL`);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Count total
  const countRow = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM contacts_flat ${whereSql}`)
    .bind(...binds).first();
  const total = Number(countRow?.cnt || 0);
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const rows = await env.DB.prepare(`
    SELECT * FROM contacts_flat
    ${whereSql}
    ORDER BY COALESCE(last_outreach_at, 0) DESC, created_at DESC
    LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}
  `).bind(...binds, limit, offset).all();

  const data = (rows?.results || []).map((r: any) => {
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.trim();
    const locParts = [r.city_name, r.state_name || r.city_state_code, r.country_name].filter(Boolean);
    const location = locParts.join(', ');
    return {
      id: String(r.id),
      firstName: r.first_name || '',
      lastName: r.last_name || '',
      email: r.email_primary || '',
      secondEmail: r.email_secondary || '',
      company: {
        id: r.company_id,
        name: r.company_name || '',
        website: r.company_website || '',
        linkedinUrl: r.company_linkedin || '',
        industry: r.company_industry || '',
        size: r.company_size || '',
        description: r.company_description || '',
        logoUrl: r.company_logo_url || ''
      },
      linkedin: r.linkedin || '',
      facebook: r.facebook || '',
      instagram: r.instagram || '',
      imdb: r.imdb || '',
      wikipedia: r.wikipedia || '',
      priority: r.priority || 'NONE',
      assignedTo: r.assigned_user_names || '',
      contacted: !!r.last_outreach_at,
      location,
      fullName,
      seenFilm: !!r.seen_film,
      docBranchMember: !!r.doc_branch_member,
      isActive: !!r.is_active,
      createdAt: r.created_at
    };
  });

  // Stats
  const contactedCountRow = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM contacts_flat WHERE last_outreach_at IS NOT NULL`).first();
  const highPriority = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM contacts WHERE priority='HIGH'`).first();
  const mediumPriority = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM contacts WHERE priority='MEDIUM'`).first();
  const lowPriority = await env.DB.prepare(`SELECT COUNT(1) as cnt FROM contacts WHERE priority='LOW'`).first();
  const companies = await env.DB.prepare(`SELECT COUNT(DISTINCT company_id) as cnt FROM contacts WHERE company_id IS NOT NULL`).first();

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
    },
    stats: {
      totalPeople: total,
      totalCompanies: Number(companies?.cnt || 0),
      contacted: Number(contactedCountRow?.cnt || 0),
      notContacted: total - Number(contactedCountRow?.cnt || 0),
      highPriority: Number(highPriority?.cnt || 0),
      mediumPriority: Number(mediumPriority?.cnt || 0),
      lowPriority: Number(lowPriority?.cnt || 0)
    }
  });
}
