import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Create production backup using wrangler d1 export
async function createProdBackup() {
  try {
    console.log("🔄 Creating production D1 backup...");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const backupDir = join(process.cwd(), "backups");
    
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = join(backupDir, `backup_remote_${timestamp}Z.sql`);
    
    // Export D1 database
    execSync(`wrangler d1 export people_intel --output="${backupFile}"`, {
      stdio: "inherit"
    });
    
    console.log(`✅ Production backup created: ${backupFile}`);
    
    // Also create a clean backup without timestamps for easy reference
    const cleanBackupFile = join(backupDir, "backup_remote_clean.sql");
    execSync(`wrangler d1 export people_intel --output="${cleanBackupFile}"`, {
      stdio: "inherit"
    });
    
    console.log(`✅ Clean backup created: ${cleanBackupFile}`);
    
  } catch (error) {
    console.error("❌ Error creating production backup:", error);
    process.exit(1);
  }
}

createProdBackup();
