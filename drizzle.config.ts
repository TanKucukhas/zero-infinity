import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  // Use the current D1 driver for Drizzle Kit
  driver: "d1-http",
  dialect: "sqlite",
  dbCredentials: { 
    wranglerConfigPath: "./wrangler.jsonc", 
    dbName: "people_intel" 
  }
});

