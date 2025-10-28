import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export function getDb(env: any) {
  // Production/Cloudflare Workers environment
  if (env.DB) {
    return drizzle(env.DB);
  }
  
  // Local development environment
  const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
  
  // Ensure .data directory exists
  const dataDir = join(process.cwd(), ".data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  
  const sqlite = new Database(sqlitePath);
  return drizzleSqlite(sqlite);
}



