export const runtime = "edge";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Helper function to check admin access
async function checkAdminAccess(req: Request) {
  const userHeader = req.headers.get('x-user');
  if (!userHeader) {
    return { error: "Authentication required", status: 401 };
  }

  const user = JSON.parse(userHeader);
  if (user.role !== 'admin') {
    return { error: "Admin access required", status: 403 };
  }

  return { user, error: null, status: 200 };
}

// GET /api/users
// Returns all users from users table - admin only
// Supports search parameter for autocomplete functionality
export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess(req);
    if (accessCheck.error) {
      return Response.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    // Build query with optional search
    let query = `
      SELECT 
        id,
        name,
        last_name,
        email,
        role,
        status,
        created_at
      FROM users
    `;
    
    const binds: any[] = [];
    
    if (search) {
      query += ` WHERE (
        LOWER(name) LIKE ? OR 
        LOWER(last_name) LIKE ? OR 
        LOWER(email) LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      binds.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    // Add limit for search results to improve performance
    if (search) {
      query += ` LIMIT 50`;
    }

    const rows = await env.DB.prepare(query).bind(...binds).all();

    const users = (rows?.results || []).map((r: any) => ({
      id: r.id,
      name: r.name || '',
      lastName: r.last_name || '',
      email: r.email || '',
      role: r.role || 'viewer',
      status: r.status || 'active',
      createdAt: r.created_at
    }));

    return Response.json({
      success: true,
      data: users,
      total: users.length
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users
// Create a new user - admin only
export async function POST(req: Request) {
  const { env } = getCloudflareContext();
  
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess(req);
    if (accessCheck.error) {
      return Response.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await req.json();
    const { name, lastName, email, role = 'viewer' } = body;

    // Validate required fields
    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();

    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const result = await env.DB.prepare(`
      INSERT INTO users (name, last_name, email, role, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, lastName || '', email, role, 'active', Date.now()).run();

    return Response.json({
      success: true,
      message: "User created successfully",
      userId: result.meta.last_row_id
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
// Delete a user - admin only
export async function DELETE(req: Request) {
  const { env } = getCloudflareContext();
  
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess(req);
    if (accessCheck.error) {
      return Response.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await env.DB.prepare(`
      SELECT id, email FROM users WHERE id = ?
    `).bind(userId).first();

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (accessCheck.user.id === parseInt(userId)) {
      return Response.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(userId).run();

    return Response.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
// Update user (suspend/activate) - admin only
export async function PUT(req: Request) {
  const { env } = getCloudflareContext();
  
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess(req);
    if (accessCheck.error) {
      return Response.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    const body = await req.json();
    const { action, role, name, lastName, email, status } = body;

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await env.DB.prepare(`
      SELECT id, email, role FROM users WHERE id = ?
    `).bind(userId).first();

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from modifying themselves
    if (accessCheck.user.id === parseInt(userId)) {
      return Response.json(
        { error: "Cannot modify your own account" },
        { status: 400 }
      );
    }

    let updateQuery = '';
    let bindValues: any[] = [];

    if (action === 'suspend') {
      updateQuery = 'UPDATE users SET status = ? WHERE id = ?';
      bindValues = ['suspended', userId];
    } else if (action === 'activate') {
      updateQuery = 'UPDATE users SET status = ? WHERE id = ?';
      bindValues = ['active', userId];
    } else if (action === 'update') {
      // Update user with new data
      if (!name || !email) {
        return Response.json(
          { error: "Name and email are required for update" },
          { status: 400 }
        );
      }
      
      // Check if email already exists for another user
      const existingUser = await env.DB.prepare(`
        SELECT id FROM users WHERE email = ? AND id != ?
      `).bind(email, userId).first();

      if (existingUser) {
        return Response.json(
          { error: "Email already exists for another user" },
          { status: 409 }
        );
      }
      
      updateQuery = 'UPDATE users SET name = ?, last_name = ?, email = ?, role = ?, status = ? WHERE id = ?';
      bindValues = [name, lastName || '', email, role || 'viewer', status || 'active', userId];
    } else if (role) {
      updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
      bindValues = [role, userId];
    } else {
      return Response.json(
        { error: "Invalid action or role" },
        { status: 400 }
      );
    }

    await env.DB.prepare(updateQuery).bind(...bindValues).run();

    return Response.json({
      success: true,
      message: `User ${action || 'updated'} successfully`
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
