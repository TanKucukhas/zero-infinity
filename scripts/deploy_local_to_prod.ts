import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as readline from "readline";

// Interactive prompts for user confirmation
async function promptUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Clean SQL file for D1 compatibility
function cleanSqlForD1(inputFile: string, outputFile: string): void {
  console.log("🧹 Cleaning SQL file for D1 compatibility...");
  
  const content = readFileSync(inputFile, 'utf-8');
  
  // Split into lines for processing
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  let skipCfKvTable = false;
  
  // Add DROP statements at the beginning
  const dropStatements = [
    'DROP VIEW IF EXISTS contacts_flat;',
    'DROP TABLE IF EXISTS outreach_events;',
    'DROP TABLE IF EXISTS notes;', 
    'DROP TABLE IF EXISTS contact_history;',
    'DROP TABLE IF EXISTS contact_assignments;',
    'DROP TABLE IF EXISTS contact_relationships;',
    'DROP TABLE IF EXISTS contacts;',
    'DROP TABLE IF EXISTS companies;',
    'DROP TABLE IF EXISTS cities;',
    'DROP TABLE IF EXISTS states;',
    'DROP TABLE IF EXISTS countries;',
    'DROP TABLE IF EXISTS social_profiles_new;',
    'DROP TABLE IF EXISTS sessions;',
    'DROP TABLE IF EXISTS accounts;',
    'DROP TABLE IF EXISTS users;'
  ];
  
  // Add DROP statements first
  cleanedLines.push('-- Drop existing tables (in reverse dependency order)');
  cleanedLines.push('PRAGMA foreign_keys=OFF;');
  dropStatements.forEach(stmt => {
    cleanedLines.push(stmt);
  });
  cleanedLines.push('');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip BEGIN TRANSACTION
    if (line === 'BEGIN TRANSACTION;') {
      console.log("  ⚠️  Removing BEGIN TRANSACTION");
      continue;
    }
    
    // Skip COMMIT
    if (line === 'COMMIT;') {
      console.log("  ⚠️  Removing COMMIT");
      continue;
    }
    
    // Skip _cf_KV table creation (multi-line)
    if (line.startsWith('CREATE TABLE "_cf_KV"') || line.startsWith('CREATE TABLE _cf_KV')) {
      console.log("  ⚠️  Removing _cf_KV table creation");
      skipCfKvTable = true;
      continue;
    }
    
    // Skip _cf_KV table INSERT statements
    if (line.startsWith('INSERT INTO "_cf_KV"') || line.startsWith('INSERT INTO _cf_KV')) {
      console.log("  ⚠️  Removing _cf_KV INSERT statement");
      continue;
    }
    
    // Reset skip flag when we hit a semicolon (end of CREATE TABLE)
    if (skipCfKvTable && line === ';') {
      skipCfKvTable = false;
      continue;
    }
    
    // Skip lines that are part of _cf_KV table definition
    if (skipCfKvTable) {
      continue;
    }
    
    // Keep all other lines
    cleanedLines.push(lines[i]);
  }
  
  const cleanedContent = cleanedLines.join('\n');
  writeFileSync(outputFile, cleanedContent);
  
  console.log(`✅ Cleaned SQL saved to: ${outputFile}`);
  console.log(`📊 Original: ${lines.length} lines, Cleaned: ${cleanedLines.length} lines`);
  console.log(`🗑️  Added ${dropStatements.length} DROP TABLE statements`);
}

// Main deployment function
async function deployLocalToProd() {
  try {
    console.log("🚀 Starting Local SQLite to Production D1 Deployment");
    console.log("=" .repeat(60));
    
    // Step 1: Safety confirmation
    console.log("\n⚠️  WARNING: This will replace ALL data in production D1 database!");
    console.log("   Database: people_intel (86778354-cfd2-4820-9973-450d86a1f438)");
    
    // Auto-confirm for automated deployment
    const autoConfirm = process.env.AUTO_CONFIRM === 'true';
    if (!autoConfirm) {
      const confirm1 = await promptUser("\nAre you sure you want to proceed?");
      if (!confirm1) {
        console.log("❌ Deployment cancelled by user");
        process.exit(0);
      }
      
      const confirm2 = await promptUser("Final confirmation - this will DELETE all production data?");
      if (!confirm2) {
        console.log("❌ Deployment cancelled by user");
        process.exit(0);
      }
    } else {
      console.log("✅ Auto-confirmation enabled, proceeding...");
    }
    
    // Step 2: Create backup directory
    const backupDir = join(process.cwd(), "backups");
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    // Step 3: Production backup
    console.log("\n📦 Creating production backup...");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const backupFile = join(backupDir, `pre_deploy_backup_${timestamp}.sql`);
    
    execSync(`wrangler d1 export people_intel --remote --output="${backupFile}"`, {
      stdio: "inherit"
    });
    
    console.log(`✅ Production backup created: ${backupFile}`);
    
    // Step 4: Export local SQLite
    console.log("\n📤 Exporting local SQLite database...");
    const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
    
    if (!existsSync(sqlitePath)) {
      throw new Error(`Local SQLite database not found at: ${sqlitePath}`);
    }
    
    const rawSqlFile = join(backupDir, "local_export_raw.sql");
    execSync(`sqlite3 "${sqlitePath}" .dump > "${rawSqlFile}"`, {
      stdio: "inherit"
    });
    
    console.log(`✅ Local SQLite exported to: ${rawSqlFile}`);
    
    // Step 5: Clean SQL for D1
    const cleanedSqlFile = join(backupDir, `local_export_d1_ready_${timestamp}.sql`);
    cleanSqlForD1(rawSqlFile, cleanedSqlFile);
    
    // Step 6: Deploy to D1
    console.log("\n🚀 Deploying to production D1...");
    execSync(`wrangler d1 execute people_intel --remote --file="${cleanedSqlFile}"`, {
      stdio: "inherit"
    });
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("=" .repeat(60));
    console.log("📋 Summary:");
    console.log(`   • Production backup: ${backupFile}`);
    console.log(`   • Local export: ${rawSqlFile}`);
    console.log(`   • D1-ready SQL: ${cleanedSqlFile}`);
    console.log("\n💡 To rollback if needed:");
    console.log(`   wrangler d1 execute people_intel --remote --file="${backupFile}"`);
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    console.log("\n🔄 To rollback:");
    console.log("   Check the backup file created and restore using:");
    console.log("   wrangler d1 execute people_intel --remote --file=<backup_file>");
    process.exit(1);
  }
}

// Run the deployment
deployLocalToProd();
