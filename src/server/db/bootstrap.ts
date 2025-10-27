import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";

export async function createAdminUser() {
  const db = getDb(process.env);
  
  try {
    // Create admin user
    await db.insert(users).values({
      name: "Admin User",
      lastName: "",
      email: "admin@zeroinfinity.com",
      role: "admin",
      createdAt: Date.now()
    } as any);

    console.log("Admin user created successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error };
  }
}
