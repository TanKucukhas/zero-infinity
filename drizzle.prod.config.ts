import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Production D1 database connection
    url: "file:./prod.db" // This will be replaced with actual D1 connection
  }
});
