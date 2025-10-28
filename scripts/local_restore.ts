import { copyFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

// Restore local SQLite from backup
async function restoreLocal() {
  try {
    const args = process.argv.slice(2);
    const backupType = args[0] || "sqlite"; // sqlite or sql
    
    console.log(`🔄 Restoring local database from ${backupType} backup...`);
    
    const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
    const backupDir = join(process.cwd(), "backups");
    
    if (!existsSync(backupDir)) {
      console.error("❌ Backups directory not found");
      process.exit(1);
    }
    
    if (backupType === "sqlite") {
      // Restore from SQLite backup
      const backups = readdirSync(backupDir)
        .filter(file => file.includes("backup_local") && file.endsWith(".sqlite"))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.error("❌ No local SQLite backups found");
        process.exit(1);
      }
      
      const latestBackup = backups[0];
      const backupFile = join(backupDir, latestBackup);
      
      console.log(`📄 Restoring from: ${latestBackup}`);
      copyFileSync(backupFile, sqlitePath);
      
      console.log("✅ Local database restored from SQLite backup");
      
    } else if (backupType === "sql") {
      // Restore from SQL backup (production data)
      const backups = readdirSync(backupDir)
        .filter(file => file.includes("backup_remote") && file.endsWith(".sql"))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.error("❌ No production SQL backups found");
        process.exit(1);
      }
      
      const latestBackup = backups[0];
      console.log(`📄 Using production backup: ${latestBackup}`);
      console.log("ℹ️  Note: This will restore production data to local SQLite");
      console.log("ℹ️  Make sure to sanitize sensitive data if needed");
      
      // For now, just copy the SQL file - actual restoration would require
      // parsing and executing the SQL statements
      console.log("⚠️  SQL restoration not implemented yet. Use SQLite backup instead.");
      
    } else {
      console.error("❌ Invalid backup type. Use 'sqlite' or 'sql'");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Error restoring local database:", error);
    process.exit(1);
  }
}

restoreLocal();
