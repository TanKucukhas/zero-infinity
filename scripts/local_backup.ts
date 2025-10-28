import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

// Create local SQLite backup
async function createLocalBackup() {
  try {
    console.log("🔄 Creating local SQLite backup...");
    
    const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
    const backupDir = join(process.cwd(), "backups");
    
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    if (!existsSync(sqlitePath)) {
      console.log("ℹ️  No local SQLite database found. Nothing to backup.");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const backupFile = join(backupDir, `backup_local_${timestamp}Z.sqlite`);
    
    copyFileSync(sqlitePath, backupFile);
    
    console.log(`✅ Local backup created: ${backupFile}`);
    
    // Also create a clean backup
    const cleanBackupFile = join(backupDir, "backup_local_clean.sqlite");
    copyFileSync(sqlitePath, cleanBackupFile);
    
    console.log(`✅ Clean local backup created: ${cleanBackupFile}`);
    
  } catch (error) {
    console.error("❌ Error creating local backup:", error);
    process.exit(1);
  }
}

createLocalBackup();
