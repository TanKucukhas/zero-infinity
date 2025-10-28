export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET /api/contacts/[id] - Get single contact details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  
  if (isNaN(contactId)) {
    return Response.json({ success: false, error: "Invalid contact ID" }, { status: 400 });
  }

  try {
    // Get contact details from contacts_flat view
    const contactRow = await env.DB.prepare(`
      SELECT * FROM contacts_flat WHERE id = ?1
    `).bind(contactId).first();

    if (!contactRow) {
      return Response.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Get notes for this contact
    const notesRows = await env.DB.prepare(`
      SELECT n.*, u.name as author_name 
      FROM notes n 
      JOIN users u ON u.id = n.author_user_id 
      WHERE n.contact_id = ?1 
      ORDER BY n.created_at DESC
    `).bind(contactId).all();

    // Get outreach events
    const outreachRows = await env.DB.prepare(`
      SELECT oe.*, u.name as performed_by_name 
      FROM outreach_events oe 
      LEFT JOIN users u ON u.id = oe.performed_by_user_id 
      WHERE oe.contact_id = ?1 
      ORDER BY oe.occurred_at DESC
    `).bind(contactId).all();

    // Get contact history
    const historyRows = await env.DB.prepare(`
      SELECT ch.*, u.name as performed_by_name 
      FROM contact_history ch 
      LEFT JOIN users u ON u.id = ch.performed_by_user_id 
      WHERE ch.contact_id = ?1 
      ORDER BY ch.occurred_at DESC
    `).bind(contactId).all();

    const contact = {
      id: String(contactRow.id),
      firstName: contactRow.first_name || '',
      lastName: contactRow.last_name || '',
      emailPrimary: contactRow.email_primary || '',
      emailSecondary: contactRow.email_secondary || '',
      company: {
        id: contactRow.company_id,
        name: contactRow.company_name || '',
        website: contactRow.company_website || '',
        linkedinUrl: contactRow.company_linkedin || '',
        industry: contactRow.company_industry || '',
        size: contactRow.company_size || '',
        description: contactRow.company_description || '',
        logoUrl: contactRow.company_logo_url || ''
      },
      imdb: contactRow.imdb || '',
      facebook: contactRow.facebook || '',
      instagram: contactRow.instagram || '',
      linkedin: contactRow.linkedin || '',
      wikipedia: contactRow.wikipedia || '',
      biography: contactRow.biography || '',
      priority: contactRow.priority || 'NONE',
      seenFilm: !!contactRow.seen_film,
      docBranchMember: !!contactRow.doc_branch_member,
      location: {
        countryCode: contactRow.location_country,
        stateCode: contactRow.location_state,
        cityId: contactRow.location_city,
        stateText: contactRow.location_state_text,
        cityText: contactRow.location_city_text,
        countryName: contactRow.country_name,
        stateName: contactRow.state_name,
        cityName: contactRow.city_name
      },
      isActive: !!contactRow.is_active,
      inactiveReason: contactRow.inactive_reason,
      inactiveAt: contactRow.inactive_at,
      createdAt: contactRow.created_at,
      assignedUserIds: contactRow.assigned_user_ids ? contactRow.assigned_user_ids.split(',').map(Number) : [],
      assignedUserNames: contactRow.assigned_user_names || '',
      relationshipLabels: contactRow.relationship_labels ? contactRow.relationship_labels.split(',') : [],
      lastOutreachAt: contactRow.last_outreach_at,
      notes: notesRows?.results || [],
      outreachEvents: outreachRows?.results || [],
      history: historyRows?.results || []
    };

    return Response.json({ success: true, data: contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/contacts/[id] - Update contact
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  
  if (isNaN(contactId)) {
    return Response.json({ success: false, error: "Invalid contact ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      emailPrimary,
      emailSecondary,
      company,
      imdb,
      facebook,
      instagram,
      linkedin,
      wikipedia,
      biography,
      priority,
      seenFilm,
      docBranchMember,
      location,
      isActive,
      inactiveReason
    } = body;

    // Validate priority
    if (priority && !['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(priority)) {
      return Response.json({ success: false, error: "Invalid priority value" }, { status: 400 });
    }

    // Build update query
    const updates: string[] = [];
    const binds: any[] = [];

    if (firstName !== undefined) { updates.push(`first_name = ?${binds.length + 1}`); binds.push(firstName); }
    if (lastName !== undefined) { updates.push(`last_name = ?${binds.length + 1}`); binds.push(lastName); }
    if (emailPrimary !== undefined) { updates.push(`email_primary = ?${binds.length + 1}`); binds.push(emailPrimary); }
    if (emailSecondary !== undefined) { updates.push(`email_secondary = ?${binds.length + 1}`); binds.push(emailSecondary); }
    if (company !== undefined) { updates.push(`company_id = ?${binds.length + 1}`); binds.push(company?.id || null); }
    if (imdb !== undefined) { updates.push(`imdb = ?${binds.length + 1}`); binds.push(imdb); }
    if (facebook !== undefined) { updates.push(`facebook = ?${binds.length + 1}`); binds.push(facebook); }
    if (instagram !== undefined) { updates.push(`instagram = ?${binds.length + 1}`); binds.push(instagram); }
    if (linkedin !== undefined) { updates.push(`linkedin = ?${binds.length + 1}`); binds.push(linkedin); }
    if (wikipedia !== undefined) { updates.push(`wikipedia = ?${binds.length + 1}`); binds.push(wikipedia); }
    if (biography !== undefined) { updates.push(`biography = ?${binds.length + 1}`); binds.push(biography); }
    if (priority !== undefined) { updates.push(`priority = ?${binds.length + 1}`); binds.push(priority); }
    if (seenFilm !== undefined) { updates.push(`seen_film = ?${binds.length + 1}`); binds.push(seenFilm ? 1 : 0); }
    if (docBranchMember !== undefined) { updates.push(`doc_branch_member = ?${binds.length + 1}`); binds.push(docBranchMember ? 1 : 0); }
    if (isActive !== undefined) { updates.push(`is_active = ?${binds.length + 1}`); binds.push(isActive ? 1 : 0); }
    if (inactiveReason !== undefined) { updates.push(`inactive_reason = ?${binds.length + 1}`); binds.push(inactiveReason); }

    // Location fields
    if (location) {
      if (location.countryCode !== undefined) { updates.push(`location_country = ?${binds.length + 1}`); binds.push(location.countryCode); }
      if (location.stateCode !== undefined) { updates.push(`location_state = ?${binds.length + 1}`); binds.push(location.stateCode); }
      if (location.cityId !== undefined) { updates.push(`location_city = ?${binds.length + 1}`); binds.push(location.cityId); }
      if (location.stateText !== undefined) { updates.push(`location_state_text = ?${binds.length + 1}`); binds.push(location.stateText); }
      if (location.cityText !== undefined) { updates.push(`location_city_text = ?${binds.length + 1}`); binds.push(location.cityText); }
    }

    if (updates.length === 0) {
      return Response.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    // Add contact ID to binds
    binds.push(contactId);

    // Update contact
    const result = await env.DB.prepare(`
      UPDATE contacts 
      SET ${updates.join(', ')} 
      WHERE id = ?${binds.length}
    `).bind(...binds).run();

    if (result.changes === 0) {
      return Response.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Log the update in contact_history
    await env.DB.prepare(`
      INSERT INTO contact_history (contact_id, action, changes_json, performed_by_user_id, occurred_at)
      VALUES (?, 'updated', ?, NULL, ?)
    `).bind(
      contactId,
      JSON.stringify(body),
      Date.now()
    ).run();

    return Response.json({ success: true, message: "Contact updated successfully" });
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] - Soft delete contact (set inactive)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  
  if (isNaN(contactId)) {
    return Response.json({ success: false, error: "Invalid contact ID" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    // Soft delete by setting inactive
    const result = await env.DB.prepare(`
      UPDATE contacts 
      SET is_active = 0, inactive_reason = ?, inactive_at = ?
      WHERE id = ?
    `).bind(reason || 'Deleted by user', Date.now(), contactId).run();

    if (result.changes === 0) {
      return Response.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Log the deletion in contact_history
    await env.DB.prepare(`
      INSERT INTO contact_history (contact_id, action, reason, performed_by_user_id, occurred_at)
      VALUES (?, 'deactivated', ?, NULL, ?)
    `).bind(
      contactId,
      reason || 'Deleted by user',
      Date.now()
    ).run();

    return Response.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}