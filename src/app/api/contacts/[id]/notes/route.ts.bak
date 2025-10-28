export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Helper function to get user from headers and validate against database
async function getUserFromHeaders(req: Request, env: any) {
  const userHeader = req.headers.get('x-user');
  if (!userHeader) {
    return null;
  }
  
  try {
    const headerUser = JSON.parse(userHeader);
    
    // Validate user exists in database and get full user info
    const dbUser = await env.DB.prepare(`
      SELECT id, name, last_name, email, role, status
      FROM users 
      WHERE id = ? AND status = 'active'
    `).bind(headerUser.id).first();
    
    if (!dbUser) {
      return null;
    }
    
    return {
      id: dbUser.id,
      name: dbUser.name,
      lastName: dbUser.last_name,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status
    };
  } catch {
    return null;
  }
}

// Helper function to check if user can add notes (editor+)
function canAddNotes(user: any) {
  return user && ['editor', 'admin'].includes(user.role);
}

// Helper function to check if user can edit/delete note
function canEditNote(user: any, note: any) {
  if (!user || !note) return false;
  
  // Admin can edit/delete all notes
  if (user.role === 'admin') return true;
  
  // Users can only edit/delete their own notes (strict ID comparison)
  return parseInt(user.id) === parseInt(note.author_user_id);
}

// POST /api/contacts/[id]/notes - Add new note
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  
  if (isNaN(contactId)) {
    return Response.json({ success: false, error: "Invalid contact ID" }, { status: 400 });
  }

  const user = await getUserFromHeaders(req, env);
  if (!user) {
    return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  if (!canAddNotes(user)) {
    return Response.json({ success: false, error: "Editor or admin role required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { body: noteBody, scope = 'general' } = body;

    if (!noteBody || noteBody.trim().length === 0) {
      return Response.json({ success: false, error: "Note body is required" }, { status: 400 });
    }

    // Validate scope
    if (!['general', 'hemal', 'yetkin', 'private'].includes(scope)) {
      return Response.json({ success: false, error: "Invalid scope" }, { status: 400 });
    }

    // Check if contact exists
    const contactExists = await env.DB.prepare(`
      SELECT id FROM contacts WHERE id = ?1
    `).bind(contactId).first();

    if (!contactExists) {
      return Response.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Insert new note - author_user_id is always the authenticated user's ID
    const result = await env.DB.prepare(`
      INSERT INTO notes (contact_id, scope, body, author_user_id, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `).bind(
      contactId,
      scope,
      noteBody.trim(),
      user.id, // Always use the authenticated user's ID
      Date.now()
    ).run();

    // Get the created note with author info
    const newNote = await env.DB.prepare(`
      SELECT n.*, u.name as author_name 
      FROM notes n 
      JOIN users u ON u.id = n.author_user_id 
      WHERE n.id = ?1
    `).bind(result.meta.last_row_id).first();

    return Response.json({ 
      success: true, 
      data: newNote,
      message: "Note added successfully"
    });

  } catch (error) {
    console.error("Error adding note:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/contacts/[id]/notes/[noteId] - Update note
export async function PUT(req: Request, { params }: { params: { id: string, noteId: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  const noteId = parseInt(params.noteId, 10);
  
  if (isNaN(contactId) || isNaN(noteId)) {
    return Response.json({ success: false, error: "Invalid contact ID or note ID" }, { status: 400 });
  }

  const user = await getUserFromHeaders(req, env);
  if (!user) {
    return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { body: noteBody, scope } = body;

    if (!noteBody || noteBody.trim().length === 0) {
      return Response.json({ success: false, error: "Note body is required" }, { status: 400 });
    }

    // Get existing note
    const existingNote = await env.DB.prepare(`
      SELECT * FROM notes WHERE id = ?1 AND contact_id = ?2
    `).bind(noteId, contactId).first();

    if (!existingNote) {
      return Response.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    // Check permissions
    if (!canEditNote(user, existingNote)) {
      return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
    }

    // Validate scope if provided
    if (scope && !['general', 'hemal', 'yetkin', 'private'].includes(scope)) {
      return Response.json({ success: false, error: "Invalid scope" }, { status: 400 });
    }

    // Update note
    const updates: string[] = [];
    const binds: any[] = [];

    updates.push(`body = ?${binds.length + 1}`);
    binds.push(noteBody.trim());

    if (scope !== undefined) {
      updates.push(`scope = ?${binds.length + 1}`);
      binds.push(scope);
    }

    updates.push(`is_edited = 1`);
    updates.push(`edited_at = ?${binds.length + 1}`);
    binds.push(Date.now());

    updates.push(`id = ?${binds.length + 1}`);
    binds.push(noteId);

    await env.DB.prepare(`
      UPDATE notes SET ${updates.join(', ')}
      WHERE id = ?${binds.length}
    `).bind(...binds).run();

    // Get updated note with author info
    const updatedNote = await env.DB.prepare(`
      SELECT n.*, u.name as author_name 
      FROM notes n 
      JOIN users u ON u.id = n.author_user_id 
      WHERE n.id = ?1
    `).bind(noteId).first();

    return Response.json({ 
      success: true, 
      data: updatedNote,
      message: "Note updated successfully"
    });

  } catch (error) {
    console.error("Error updating note:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]/notes/[noteId] - Delete note
export async function DELETE(req: Request, { params }: { params: { id: string, noteId: string } }) {
  const { env } = getCloudflareContext();
  const contactId = parseInt(params.id, 10);
  const noteId = parseInt(params.noteId, 10);
  
  if (isNaN(contactId) || isNaN(noteId)) {
    return Response.json({ success: false, error: "Invalid contact ID or note ID" }, { status: 400 });
  }

  const user = await getUserFromHeaders(req, env);
  if (!user) {
    return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    // Get existing note
    const existingNote = await env.DB.prepare(`
      SELECT * FROM notes WHERE id = ?1 AND contact_id = ?2
    `).bind(noteId, contactId).first();

    if (!existingNote) {
      return Response.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    // Check permissions
    if (!canEditNote(user, existingNote)) {
      return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
    }

    // Delete note
    await env.DB.prepare(`
      DELETE FROM notes WHERE id = ?1
    `).bind(noteId).run();

    return Response.json({ 
      success: true,
      message: "Note deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
