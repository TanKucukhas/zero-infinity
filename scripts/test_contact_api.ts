import { getDb } from "../src/server/db/client";
import { contacts } from "../src/server/db/schema";
import { sql } from "drizzle-orm";

async function testContactAPI() {
  try {
    console.log("🔍 Testing Contact API directly...\n");

    const db = getDb({}); // Empty env for local development
    
    // Check total count
    const totalContacts = await db.select({ count: sql<number>`count(*)` }).from(contacts);
    console.log(`📊 Total contacts in database: ${totalContacts[0]?.count || 0}`);

    if (totalContacts[0]?.count > 0) {
      // Get first 3 contacts
      const sampleContacts = await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          emailPrimary: contacts.emailPrimary,
          linkedin: contacts.linkedin,
          priority: contacts.priority,
          isActive: contacts.isActive,
        })
        .from(contacts)
        .limit(3);

      console.log("📋 Sample contacts:");
      sampleContacts.forEach((contact, index) => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        console.log(`   ${index + 1}. ID: ${contact.id}, Name: "${fullName}", Email: "${contact.emailPrimary || 'null'}", LinkedIn: "${contact.linkedin || 'null'}"`);
      });
    } else {
      console.log("❌ No contacts found in database!");
    }

  } catch (error) {
    console.error("❌ Error testing Contact API:", error);
  }
}

testContactAPI();
