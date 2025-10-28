import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getDb } from "../src/server/db/client";
import { users, companies, contacts, countries, states, cities } from "../src/server/db/schema";
import Database from "better-sqlite3";

// Push production backup to local SQLite database
async function pushProdBackupToLocal() {
  try {
    const args = process.argv.slice(2);
    const backupFile = args[0] || "backups/backup_remote_2025-10-28_03-02-40-626Z.sql";
    
    console.log(`🔄 Pushing production backup to local database: ${backupFile}`);
    
    // Check if backup file exists
    if (!existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      process.exit(1);
    }
    
    // Ensure .data directory exists
    const dataDir = join(process.cwd(), ".data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    // Create local SQLite database
    const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
    
    // First, create the SQLite file by running migrations
    console.log("📋 Creating SQLite database with schema...");
    const { execSync } = await import("child_process");
    execSync("npm run db:migrate:apply:local", { stdio: "inherit" });
    
    // Use raw SQLite connection for executing backup statements
    const sqliteDb = new Database(sqlitePath);
    
    console.log("🧹 Clearing existing local data...");
    
    // Clear existing data using raw SQL
    sqliteDb.exec(`
      DELETE FROM contacts;
      DELETE FROM companies;
      DELETE FROM users;
      DELETE FROM cities;
      DELETE FROM states;
      DELETE FROM countries;
    `);
    
    console.log("📄 Reading production backup...");
    
    // Read backup file
    const backupContent = readFileSync(backupFile, "utf8");
    
    // Split by semicolon and execute each statement
    const statements = backupContent.split(";").filter(stmt => stmt.trim());
    
    console.log(`📊 Found ${statements.length} SQL statements`);
    
    let executedCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          sqliteDb.exec(statement.trim());
          executedCount++;
          
          if (executedCount % 100 === 0) {
            console.log(`✅ Executed ${executedCount} statements...`);
          }
        } catch (error) {
          errorCount++;
          console.warn(`⚠️  Error executing statement: ${error.message}`);
          // Continue with next statement
        }
      }
    }
    
    console.log(`✅ Successfully executed ${executedCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors (skipped)`);
    }
    
    // Verify the data was imported correctly
    console.log("\n🔍 Verifying imported data...");
    const companyCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM companies").get() as { count: number };
    const contactCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM contacts").get() as { count: number };
    const userCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    
    console.log(`📊 Imported data:`);
    console.log(`   Companies: ${companyCount.count}`);
    console.log(`   Contacts: ${contactCount.count}`);
    console.log(`   Users: ${userCount.count}`);
    
    // Check first few company names
    const sampleCompanies = sqliteDb.prepare("SELECT id, name FROM companies ORDER BY id LIMIT 5").all() as Array<{ id: number; name: string }>;
    console.log(`\n📋 Sample company names:`);
    sampleCompanies.forEach(company => {
      console.log(`   ${company.id}: "${company.name}"`);
    });
    
    // Check first few contact names
    const sampleContacts = sqliteDb.prepare("SELECT id, first_name, last_name, email_primary FROM contacts ORDER BY id LIMIT 5").all() as Array<{ id: number; first_name: string; last_name: string; email_primary: string }>;
    console.log(`\n📋 Sample contact names:`);
    sampleContacts.forEach(contact => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
      console.log(`   ${contact.id}: "${fullName}" (${contact.email_primary || 'no email'})`);
    });
    
    sqliteDb.close();
    
    console.log("🎉 Production backup successfully pushed to local database!");
    
  } catch (error) {
    console.error("❌ Error pushing production backup to local:", error);
    process.exit(1);
  }
}

pushProdBackupToLocal();
