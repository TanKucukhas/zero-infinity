import { getDb } from "../src/server/db/client";
import { users, companies, contacts, countries, states, cities } from "../src/server/db/schema";

// Seed local database with mock data
async function seedLocalDatabase() {
  try {
    console.log("🌱 Seeding local database with mock data...");
    
    const db = getDb({}); // Empty env for local development
    
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);
    await db.delete(cities);
    await db.delete(states);
    await db.delete(countries);
    
    // Seed countries
    console.log("🌍 Seeding countries...");
    await db.insert(countries).values([
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
      { code: "GB", name: "United Kingdom" },
      { code: "DE", name: "Germany" },
      { code: "FR", name: "France" }
    ]);
    
    // Seed states
    console.log("🏛️ Seeding states...");
    await db.insert(states).values([
      { code: "CA", name: "California", countryCode: "US" },
      { code: "NY", name: "New York", countryCode: "US" },
      { code: "TX", name: "Texas", countryCode: "US" },
      { code: "ON", name: "Ontario", countryCode: "CA" },
      { code: "BC", name: "British Columbia", countryCode: "CA" }
    ]);
    
    // Seed cities
    console.log("🏙️ Seeding cities...");
    await db.insert(cities).values([
      { city: "San Francisco", cityAscii: "San Francisco", stateCode: "CA", lat: 37.7749, lng: -122.4194, population: 873965 },
      { city: "Los Angeles", cityAscii: "Los Angeles", stateCode: "CA", lat: 34.0522, lng: -118.2437, population: 3971883 },
      { city: "New York", cityAscii: "New York", stateCode: "NY", lat: 40.7128, lng: -74.0060, population: 8336817 },
      { city: "Toronto", cityAscii: "Toronto", stateCode: "ON", lat: 43.6532, lng: -79.3832, population: 2930000 },
      { city: "Vancouver", cityAscii: "Vancouver", stateCode: "BC", lat: 49.2827, lng: -123.1207, population: 675218 }
    ]);
    
    // Seed users
    console.log("👥 Seeding users...");
    const userResult = await db.insert(users).values([
      { name: "Admin", lastName: "User", email: "admin@zeroinfinity.com", role: "admin", createdAt: new Date() },
      { name: "John", lastName: "Doe", email: "john@zeroinfinity.com", role: "editor", createdAt: new Date() },
      { name: "Jane", lastName: "Smith", email: "jane@zeroinfinity.com", role: "viewer", createdAt: new Date() }
    ]).returning();
    
    // Seed companies
    console.log("🏢 Seeding companies...");
    const companyResult = await db.insert(companies).values([
      { 
        name: "TechCorp Inc", 
        website: "https://techcorp.com", 
        industry: "Technology", 
        size: "50-200",
        description: "Leading technology company",
        headquartersCountry: "US",
        headquartersState: "CA",
        headquartersCity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        name: "Innovation Labs", 
        website: "https://innovationlabs.com", 
        industry: "Software", 
        size: "10-50",
        description: "Software development and consulting",
        headquartersCountry: "US",
        headquartersState: "NY",
        headquartersCity: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        name: "Global Solutions", 
        website: "https://globalsolutions.ca", 
        industry: "Consulting", 
        size: "200+",
        description: "International consulting firm",
        headquartersCountry: "CA",
        headquartersState: "ON",
        headquartersCity: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();
    
    // Seed contacts
    console.log("📇 Seeding contacts...");
    await db.insert(contacts).values([
      {
        firstName: "Alice",
        lastName: "Johnson",
        emailPrimary: "alice.johnson@techcorp.com",
        phoneNumber: "+1-555-0101",
        linkedin: "https://linkedin.com/in/alicejohnson",
        companyId: companyResult[0].id,
        priority: "HIGH",
        seenFilm: true,
        docBranchMember: false,
        biography: "Senior software engineer with 8 years of experience",
        locationCountry: "US",
        locationState: "CA",
        locationCity: 1,
        createdByUserId: userResult[0].id,
        assignedTo: userResult[1].id,
        createdAt: new Date()
      },
      {
        firstName: "Bob",
        lastName: "Wilson",
        emailPrimary: "bob.wilson@innovationlabs.com",
        phoneNumber: "+1-555-0102",
        linkedin: "https://linkedin.com/in/bobwilson",
        companyId: companyResult[1].id,
        priority: "MEDIUM",
        seenFilm: false,
        docBranchMember: true,
        biography: "Product manager specializing in agile methodologies",
        locationCountry: "US",
        locationState: "NY",
        locationCity: 3,
        createdByUserId: userResult[0].id,
        assignedTo: userResult[2].id,
        createdAt: new Date()
      },
      {
        firstName: "Carol",
        lastName: "Davis",
        emailPrimary: "carol.davis@globalsolutions.ca",
        phoneNumber: "+1-555-0103",
        linkedin: "https://linkedin.com/in/caroldavis",
        companyId: companyResult[2].id,
        priority: "LOW",
        seenFilm: true,
        docBranchMember: true,
        biography: "Business analyst with expertise in data visualization",
        locationCountry: "CA",
        locationState: "ON",
        locationCity: 4,
        createdByUserId: userResult[1].id,
        assignedTo: userResult[0].id,
        createdAt: new Date()
      },
      {
        firstName: "David",
        lastName: "Brown",
        emailPrimary: "david.brown@freelance.com",
        phoneNumber: "+1-555-0104",
        linkedin: "https://linkedin.com/in/davidbrown",
        priority: "NONE",
        seenFilm: false,
        docBranchMember: false,
        biography: "Freelance consultant and entrepreneur",
        locationCountry: "US",
        locationState: "TX",
        createdByUserId: userResult[2].id,
        createdAt: new Date()
      }
    ]);
    
    console.log("✅ Local database seeded successfully with mock data!");
    console.log("📊 Summary:");
    console.log("   - 5 countries");
    console.log("   - 5 states");
    console.log("   - 5 cities");
    console.log("   - 3 users");
    console.log("   - 3 companies");
    console.log("   - 4 contacts");
    
  } catch (error) {
    console.error("❌ Error seeding local database:", error);
    process.exit(1);
  }
}

seedLocalDatabase();
