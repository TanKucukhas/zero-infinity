import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { 
    // Accept DEV_SQLITE_PATH as a filesystem path (recommended) or a drizzle URL starting with "file:"
    // Always ensure drizzle receives a URL with the "file:" prefix
    url: (() => {
      const p = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
      return p.startsWith("file:") ? p : `file:${p}`;
    })()
  }
});

