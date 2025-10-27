export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// POST /api/contacts/bulk - Create multiple contacts
export async function POST(req: Request) {
  const { env } = getCloudflareContext();

  try {
    const body = await req.json();
    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return Response.json({ success: false, error: "contacts array is required" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      try {
        const {
          firstName,
          lastName,
          emailPrimary,
          emailSecondary,
          company,
          website,
          companyLinkedin,
          imdb,
          facebook,
          instagram,
          linkedin,
          wikipedia,
          biography,
          priority = 'NONE',
          seenFilm = false,
          docBranchMember = false,
          location,
          assignedUserIds = []
        } = contact;

        // Validate priority
        if (!['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(priority)) {
          throw new Error(`Invalid priority: ${priority}`);
        }

        // Insert contact
        const contactResult = await env.DB.prepare(`
          INSERT INTO contacts (
            first_name, last_name, email_primary, email_secondary,
            company, website, company_linkedin,
            imdb, facebook, instagram, linkedin, wikipedia,
            biography, priority, seen_film, doc_branch_member,
            location_country, location_state, location_city,
            location_state_text, location_city_text,
            is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          firstName || null,
          lastName || null,
          emailPrimary || null,
          emailSecondary || null,
          company || null,
          website || null,
          companyLinkedin || null,
          imdb || null,
          facebook || null,
          instagram || null,
          linkedin || null,
          wikipedia || null,
          biography || null,
          priority,
          seenFilm ? 1 : 0,
          docBranchMember ? 1 : 0,
          location?.countryCode || null,
          location?.stateCode || null,
          location?.cityId || null,
          location?.stateText || null,
          location?.cityText || null,
          1, // is_active
          Date.now()
        ).run();

        const contactId = contactResult.meta.last_row_id;

        // Insert assignments if provided
        if (Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
          for (const userId of assignedUserIds) {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO contact_assignments (contact_id, user_id)
              VALUES (?, ?)
            `).bind(contactId, userId).run();
          }
        }

        // Log creation in contact_history
        await env.DB.prepare(`
          INSERT INTO contact_history (contact_id, action, performed_by_user_id, occurred_at)
          VALUES (?, 'created', NULL, ?)
        `).bind(contactId, Date.now()).run();

        results.push({ index: i, contactId, success: true });
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    return Response.json({
      success: true,
      results,
      errors,
      summary: {
        total: contacts.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Error in bulk create:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/contacts/bulk - Bulk update contacts
export async function PUT(req: Request) {
  const { env } = getCloudflareContext();

  try {
    const body = await req.json();
    const { contactIds, updates } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return Response.json({ success: false, error: "contactIds array is required" }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return Response.json({ success: false, error: "updates object is required" }, { status: 400 });
    }

    const {
      priority,
      seenFilm,
      docBranchMember,
      isActive,
      inactiveReason,
      assignedUserIds
    } = updates;

    // Validate priority if provided
    if (priority && !['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(priority)) {
      return Response.json({ success: false, error: "Invalid priority value" }, { status: 400 });
    }

    // Build update query
    const updateFields: string[] = [];
    const binds: any[] = [];

    if (priority !== undefined) { updateFields.push(`priority = ?${binds.length + 1}`); binds.push(priority); }
    if (seenFilm !== undefined) { updateFields.push(`seen_film = ?${binds.length + 1}`); binds.push(seenFilm ? 1 : 0); }
    if (docBranchMember !== undefined) { updateFields.push(`doc_branch_member = ?${binds.length + 1}`); binds.push(docBranchMember ? 1 : 0); }
    if (isActive !== undefined) { 
      updateFields.push(`is_active = ?${binds.length + 1}`); 
      binds.push(isActive ? 1 : 0);
      if (!isActive) {
        updateFields.push(`inactive_at = ?${binds.length + 2}`);
        binds.push(Date.now());
      }
    }
    if (inactiveReason !== undefined) { updateFields.push(`inactive_reason = ?${binds.length + 1}`); binds.push(inactiveReason); }

    if (updateFields.length === 0) {
      return Response.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < contactIds.length; i++) {
      const contactId = contactIds[i];
      try {
        // Update contact
        const result = await env.DB.prepare(`
          UPDATE contacts 
          SET ${updateFields.join(', ')} 
          WHERE id = ?${binds.length + 1}
        `).bind(...binds, contactId).run();

        if (result.changes === 0) {
          errors.push({ contactId, error: "Contact not found" });
          continue;
        }

        // Update assignments if provided
        if (Array.isArray(assignedUserIds)) {
          // Remove existing assignments
          await env.DB.prepare(`
            DELETE FROM contact_assignments WHERE contact_id = ?
          `).bind(contactId).run();

          // Add new assignments
          for (const userId of assignedUserIds) {
            await env.DB.prepare(`
              INSERT INTO contact_assignments (contact_id, user_id)
              VALUES (?, ?)
            `).bind(contactId, userId).run();
          }
        }

        // Log update in contact_history
        await env.DB.prepare(`
          INSERT INTO contact_history (contact_id, action, changes_json, performed_by_user_id, occurred_at)
          VALUES (?, 'updated', ?, NULL, ?)
        `).bind(
          contactId,
          JSON.stringify(updates),
          Date.now()
        ).run();

        results.push({ contactId, success: true });
      } catch (error) {
        errors.push({ contactId, error: error.message });
      }
    }

    return Response.json({
      success: true,
      results,
      errors,
      summary: {
        total: contactIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contacts/bulk - Bulk soft delete contacts
export async function DELETE(req: Request) {
  const { env } = getCloudflareContext();

  try {
    const body = await req.json();
    const { contactIds, reason } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return Response.json({ success: false, error: "contactIds array is required" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < contactIds.length; i++) {
      const contactId = contactIds[i];
      try {
        // Soft delete contact
        const result = await env.DB.prepare(`
          UPDATE contacts 
          SET is_active = 0, inactive_reason = ?, inactive_at = ?
          WHERE id = ?
        `).bind(reason || 'Bulk deleted', Date.now(), contactId).run();

        if (result.changes === 0) {
          errors.push({ contactId, error: "Contact not found" });
          continue;
        }

        // Log deletion in contact_history
        await env.DB.prepare(`
          INSERT INTO contact_history (contact_id, action, reason, performed_by_user_id, occurred_at)
          VALUES (?, 'deactivated', ?, NULL, ?)
        `).bind(
          contactId,
          reason || 'Bulk deleted',
          Date.now()
        ).run();

        results.push({ contactId, success: true });
      } catch (error) {
        errors.push({ contactId, error: error.message });
      }
    }

    return Response.json({
      success: true,
      results,
      errors,
      summary: {
        total: contactIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}