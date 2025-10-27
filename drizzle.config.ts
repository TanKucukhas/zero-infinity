import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  driver: "d1",
  dialect: "sqlite",
  dbCredentials: { wranglerConfigPath: "./wrangler.jsonc", dbName: "people_intel" }
} as Config;


