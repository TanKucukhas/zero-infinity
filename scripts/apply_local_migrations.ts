import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getDb } from "../src/server/db/client";

// Apply migrations to local SQLite database
async function applyLocalMigrations() {
  try {
    console.log("🔄 Applying migrations to local SQLite database...");
    
    const migrationsDir = join(process.cwd(), "drizzle");
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("ℹ️  No migration files found in drizzle/ directory");
      return;
    }

    const db = getDb({}); // Empty env for local development
    
    for (const file of migrationFiles) {
      console.log(`📄 Applying migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      
      // Split by semicolon and execute each statement
      const statements = sql.split(";").filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await db.run(statement.trim());
        }
      }
    }
    
    console.log("✅ All migrations applied successfully to local database");
    
  } catch (error) {
    console.error("❌ Error applying migrations:", error);
    process.exit(1);
  }
}

applyLocalMigrations();
