import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log("Login attempt:", { email, password });

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get database connection
    console.log("Getting Cloudflare context...");
    try {
      const context = await getCloudflareContext();
      console.log("Context received, env keys:", Object.keys(context.env || {}));
      const { env } = context;
      
      // Check if D1 binding exists
      if (!('DB' in env)) {
        console.error('Missing D1 binding DB. Env keys:', Object.keys(env));
        return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
      }
      
      console.log("D1 binding found, getting database...");
      const db = getDb(env);
      console.log("Database connection established");
    } catch (contextError) {
      console.error("Context error:", contextError);
      return NextResponse.json({ 
        error: 'Context error', 
        details: contextError instanceof Error ? contextError.message : 'Unknown context error'
      }, { status: 500 });
    }

    // Check if user exists in database
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      lastName: users.lastName,
      email: users.email,
      role: users.role
    }).from(users).where(eq(users.email, email)).limit(1).then(rows => rows[0]);

    console.log("User found:", userResult);
    
    if (!userResult) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // User is active (no status field in current schema)

    // Accept any password for demo purposes
    const isValidPassword = true;

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return success with user data
    console.log("Login successful for user:", userResult);
    return NextResponse.json({
      success: true,
      user: {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        lastName: userResult.lastName,
        role: userResult.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    console.error("Error message:", error instanceof Error ? error.message : 'No message');
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
