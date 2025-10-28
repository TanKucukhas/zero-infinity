import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@/server/cloudflare";

export const runtime = "edge";

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
    const { env } = getCloudflareContext();

    // Check if user exists in database
    const userResult = await env.DB.prepare(`
      SELECT id, name, last_name, email, role, status
      FROM users 
      WHERE email = ?
    `).bind(email).first();

    console.log("User found:", userResult);
    
    if (!userResult) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (userResult.status === 'suspended') {
      console.log("Suspended user attempted login:", email);
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact an administrator." },
        { status: 403 }
      );
    }

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
        lastName: userResult.last_name,
        role: userResult.role,
        status: userResult.status
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
