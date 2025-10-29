#!/usr/bin/env tsx

/**
 * Production Database Full Reset Script
 * 
 * Bu script production database'i tamamen temizler ve local database'den
 * birebir kopyasını deploy eder.
 * 
 * Kullanım:
 * npm run db:reset:prod --yes
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

async function resetProductionDatabase() {
  try {
    const args = process.argv.slice(2);
    const forceReset = args.includes("--yes");
    
    console.log("🔄 Starting production database full reset...");
    
    // Safety checks
    const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (branch !== "master" && branch !== "main") {
      console.error("❌ Production reset can only be run from master/main branch");
      process.exit(1);
    }
    
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (status.trim()) {
      console.error("❌ Working tree must be clean before production reset");
      console.error("Uncommitted changes:", status);
      process.exit(1);
    }
    
    if (!forceReset) {
      console.log("⚠️  This will COMPLETELY WIPE production database and replace with local data.");
      console.log("⚠️  Add --yes flag to confirm this destructive operation.");
      process.exit(1);
    }
    
    console.log("✅ Safety checks passed");
    
    // Step 1: Check local database exists
    const localDbPath = join(process.cwd(), ".data", "dev.sqlite");
    if (!existsSync(localDbPath)) {
      console.error("❌ Local database not found at:", localDbPath);
      console.error("Please run 'npm run db:migrate:apply:local' first");
      process.exit(1);
    }
    
    console.log("✅ Local database found");
    
    // Step 2: Create backup of current production
    console.log("📦 Step 1: Creating production backup...");
    try {
      execSync("npm run db:backup:prod", { stdio: "inherit" });
    } catch (e) {
      console.warn("⚠️  Could not create production backup (database might be empty)");
    }
    
    // Step 3: Export local database to SQL
    console.log("📤 Step 2: Exporting local database...");
    const exportFile = join(process.cwd(), "temp_local_export.sql");
    
    try {
      execSync(`sqlite3 "${localDbPath}" ".dump" > "${exportFile}"`, { stdio: "inherit" });
      console.log("✅ Local database exported to:", exportFile);
    } catch (e) {
      console.error("❌ Failed to export local database:", e);
      process.exit(1);
    }
    
    // Step 4: Clean and prepare SQL file for D1
    console.log("🧹 Step 3: Cleaning SQL for D1 compatibility...");
    const sqlContent = readFileSync(exportFile, "utf8");
    
    // Remove SQLite-specific commands that D1 doesn't support
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => {
        // Remove SQLite-specific commands
        if (line.includes('PRAGMA') || 
            line.includes('BEGIN TRANSACTION') || 
            line.includes('COMMIT') ||
            line.includes('ROLLBACK') ||
            line.includes('sqlite_sequence') ||
            line.includes('CREATE UNIQUE INDEX') ||
            line.includes('CREATE INDEX')) {
          return false;
        }
        return line.trim().length > 0;
      })
      .join('\n');
    
    const cleanedFile = join(process.cwd(), "temp_local_export_cleaned.sql");
    writeFileSync(cleanedFile, cleanedSql);
    console.log("✅ SQL cleaned for D1 compatibility");
    
    // Step 5: Drop all tables in production (if any exist)
    console.log("🗑️  Step 4: Dropping existing production tables...");
    const dropCommands = [
      "DROP TABLE IF EXISTS contact_assignments;",
      "DROP TABLE IF EXISTS contact_relationships;",
      "DROP TABLE IF EXISTS contact_history;",
      "DROP TABLE IF EXISTS notes;",
      "DROP TABLE IF EXISTS outreach_events;",
      "DROP TABLE IF EXISTS contacts;",
      "DROP TABLE IF EXISTS companies;",
      "DROP TABLE IF EXISTS cities;",
      "DROP TABLE IF EXISTS states;",
      "DROP TABLE IF EXISTS countries;",
      "DROP TABLE IF EXISTS users;",
      "DROP TABLE IF EXISTS accounts;",
      "DROP TABLE IF EXISTS sessions;",
      "DROP TABLE IF EXISTS verification_tokens;"
    ];
    
    for (const cmd of dropCommands) {
      try {
        execSync(`wrangler d1 execute zero-infinity-db --command "${cmd}" --remote`, { stdio: "pipe" });
      } catch (e) {
        // Ignore errors - tables might not exist
      }
    }
    console.log("✅ Production tables dropped");
    
    // Step 6: Import cleaned SQL to production
    console.log("📥 Step 5: Importing local data to production...");
    try {
      execSync(`wrangler d1 execute zero-infinity-db --file="${cleanedFile}" --remote`, { stdio: "inherit" });
      console.log("✅ Local data imported to production");
    } catch (e) {
      console.error("❌ Failed to import data to production:", e);
      process.exit(1);
    }
    
    // Step 7: Verify import
    console.log("🔍 Step 6: Verifying import...");
    try {
      const contactCount = execSync(
        'wrangler d1 execute zero-infinity-db --command "SELECT COUNT(*) as count FROM contacts;" --remote',
        { encoding: "utf8" }
      );
      console.log("📊 Contact count in production:", contactCount);
      
      const assignmentCount = execSync(
        'wrangler d1 execute zero-infinity-db --command "SELECT COUNT(*) as count FROM contact_assignments;" --remote',
        { encoding: "utf8" }
      );
      console.log("📊 Assignment count in production:", assignmentCount);
      
      const userCount = execSync(
        'wrangler d1 execute zero-infinity-db --command "SELECT COUNT(*) as count FROM users;" --remote',
        { encoding: "utf8" }
      );
      console.log("📊 User count in production:", userCount);
      
    } catch (e) {
      console.warn("⚠️  Could not verify import:", e);
    }
    
    // Step 8: Cleanup temporary files
    console.log("🧹 Step 7: Cleaning up temporary files...");
    try {
      execSync(`rm -f "${exportFile}" "${cleanedFile}"`, { stdio: "inherit" });
      console.log("✅ Temporary files cleaned");
    } catch (e) {
      console.warn("⚠️  Could not clean up temporary files");
    }
    
    // Step 9: Deploy application
    console.log("🚀 Step 8: Deploying application...");
    try {
      execSync("npm run deploy", { stdio: "inherit" });
      console.log("✅ Application deployed");
    } catch (e) {
      console.error("❌ Failed to deploy application:", e);
      process.exit(1);
    }
    
    console.log("🎉 Production database reset completed successfully!");
    console.log("🌐 Application URL: https://zeroinfinity-people-intel.bearwebsolutions.workers.dev");
    console.log("📊 Check the contacts page to verify assignments are working");
    
  } catch (error) {
    console.error("❌ Error during production database reset:", error);
    console.error("💡 Check the logs above and consider restoring from backup if needed");
    process.exit(1);
  }
}

resetProductionDatabase();
