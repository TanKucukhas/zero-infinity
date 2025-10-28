import { getDb } from "../src/server/db/client";
import { contacts } from "../src/server/db/schema";

async function testContactAPI() {
  try {
    console.log("🔍 Testing Contact API directly...\n");

    const db = getDb({}); // Empty env for local development
    
    // Check total count using a simple query
    const totalContacts = await db
      .select()
      .from(contacts)
      .limit(1);
    
    console.log(`📊 Database connection successful`);

    // Get first 3 contacts
    const sampleContacts = await db
      .select()
      .from(contacts)
      .limit(3);

    console.log(`📋 Found ${sampleContacts.length} sample contacts:`);
    sampleContacts.forEach((contact, index) => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      console.log(`   ${index + 1}. ID: ${contact.id}, Name: "${fullName}", Email: "${contact.emailPrimary || 'null'}", LinkedIn: "${contact.linkedin || 'null'}"`);
    });

  } catch (error) {
    console.error("❌ Error testing Contact API:", error);
  }
}

testContactAPI();