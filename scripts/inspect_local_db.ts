import Database from "better-sqlite3";

// Resilient local database inspection that adapts to current schema
function inspectLocalDatabase() {
  try {
    console.log("🔍 Inspecting local database...\n");

    const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
    const db = new Database(sqlitePath);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all() as Array<{ name: string }>;

    // Counts
    console.log("📊 Database Statistics:");
    const names = ["users","companies","contacts","countries","states","cities"];
    for (const name of names) {
      const hasTable = tables.some(t => t.name === name);
      if (!hasTable) {
        console.log(`   ${name}: 0 (table missing)`);
        continue;
      }
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${name}`).get() as { c: number };
      console.log(`   ${name}: ${row.c}`);
    }
    console.log();

  } catch (error) {
    console.error("❌ Error inspecting local database:", error);
  }
}

inspectLocalDatabase();
