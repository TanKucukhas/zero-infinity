import { NextRequest, NextResponse } from "next/server";

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

    // For demo purposes, simple hardcoded authentication
    const validUsers = [
      {
        id: "admin-1",
        email: "admin@zeroinfinity.com",
        name: "Admin User",
        role: "admin"
      },
      {
        id: "user-1", 
        email: "user@zeroinfinity.com",
        name: "Regular User",
        role: "viewer"
      },
      {
        id: "user-2",
        email: "tankucukhas@gmail.com",
        name: "Tan Kucukhas",
        role: "admin"
      }
    ];

    const user = validUsers.find(u => u.email === email);
    
    console.log("User found:", user);
    
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
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
    console.log("Login successful for user:", user);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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
