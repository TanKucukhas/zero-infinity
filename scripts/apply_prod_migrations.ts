import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Apply migrations to production D1 database
async function applyProdMigrations() {
  try {
    console.log("🔄 Applying migrations to production D1 database...");
    
    // Safety checks
    const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (branch !== "master" && branch !== "main") {
      console.error("❌ Production migrations can only be run from master/main branch");
      process.exit(1);
    }
    
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (status.trim()) {
      console.error("❌ Working tree must be clean before applying production migrations");
      console.error("Uncommitted changes:", status);
      process.exit(1);
    }
    
    // Check for recent backup
    const backupDir = join(process.cwd(), "backups");
    const backups = readdirSync(backupDir)
      .filter(file => file.includes("backup_remote") && file.endsWith(".sql"))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.error("❌ No production backups found. Run 'npm run db:backup:prod' first");
      process.exit(1);
    }
    
    const latestBackup = backups[0];
    const backupTime = latestBackup.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/)?.[1];
    if (!backupTime) {
      console.error("❌ Could not parse backup timestamp");
      process.exit(1);
    }
    
    const backupDate = new Date(backupTime.replace(/_/g, " ").replace(/-/g, "/"));
    const now = new Date();
    const diffMinutes = (now.getTime() - backupDate.getTime()) / (1000 * 60);
    
    if (diffMinutes > 10) {
      console.error(`❌ Latest backup is ${Math.round(diffMinutes)} minutes old. Run 'npm run db:backup:prod' first`);
      process.exit(1);
    }
    
    console.log(`✅ Safety checks passed. Latest backup: ${latestBackup}`);
    
    const migrationsDir = join(process.cwd(), "drizzle");
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("ℹ️  No migration files found in drizzle/ directory");
      return;
    }

    for (const file of migrationFiles) {
      console.log(`📄 Applying migration to D1: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      
      // Use wrangler to execute SQL on D1
      execSync(`wrangler d1 execute people_intel --file="${join(migrationsDir, file)}"`, {
        stdio: "inherit"
      });
    }
    
    console.log("✅ All migrations applied successfully to production D1");
    
  } catch (error) {
    console.error("❌ Error applying migrations to production:", error);
    process.exit(1);
  }
}

applyProdMigrations();
