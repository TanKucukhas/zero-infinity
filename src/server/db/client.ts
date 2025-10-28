import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { getCurrentDbSource } from "./config";

export function getDb(env: any) {
  const source = getCurrentDbSource(env);

  if (source === 'prod') {
    return drizzle(env.DB);
  }

  if (source === 'mock') {
    throw new Error("Database not available in 'mock' mode. Use mock helpers instead.");
  }

  // sqlite (local development)
  const rawPath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
  const sqlitePath = rawPath.startsWith("file:") ? rawPath.replace(/^file:/, "") : rawPath;

  const dataDir = join(process.cwd(), ".data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(sqlitePath);
  return drizzleSqlite(sqlite);
}



