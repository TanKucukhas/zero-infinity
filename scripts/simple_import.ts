/*
  Generates simple import for contacts without location data
*/
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

function sqlString(v: string | null | undefined): string {
  if (v === undefined || v === null) return 'NULL';
  return `'${v.replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

function buildAssigneeMap(): Record<string, number> {
  return {
    'CK': 3, 'CYNTHIA': 3, 'CYNTHIA KANE': 3,
    'HEMAL': 2, 'HEMAL TRIVEDI': 2,
    'YETKIN': 1, 'YETKIN YUCE': 1,
    'TAN': 0, 'TAN KUCUKHAS': 0,
    'MATT': 5,
    'PRERANA': 4
  };
}

async function main() {
  const root = process.cwd();
  const csvPath = path.join(root, 'clean.csv');
  const outPath = path.join(root, 'simple_contacts.sql');

  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const lines: string[] = [];
  lines.push('-- Simple contacts import (no location data)');

  const assigneeMap = buildAssigneeMap();
  let contactId = 1;

  for (const r of rows) {
    const first = (r['First Name'] || '').trim();
    const last = (r['Last Name'] || '').trim();
    if (!first && !last) continue;

    const emailPrimary = (r['E-mail'] || '').trim() || null;
    const emailSecondary = (r['Second E-mail'] || '').trim() || null;
    const company = (r['Company'] || '').trim() || null;
    const website = (r[' Website'] || r['Website'] || '').trim() || null;
    const companyLinkedin = (r['Company Linkedin'] || '').trim() || null;
    const imdb = (r['IMDB'] || '').trim() || null;
    const facebook = (r['Facebook'] || '').trim() || null;
    const instagram = (r['Instagram'] || '').trim() || null;
    const linkedin = (r['LinkedIn'] || '').trim() || null;
    const wikipedia = (r['Wikipedia'] || '').trim() || null;
    const biography = (r['Biography'] || '').trim() || null;

    let priority = (r['Priority'] || '').trim().toUpperCase();
    if (!['HIGH','MEDIUM','LOW','NONE'].includes(priority)) priority = 'NONE';
    const seenFilm = ((r['Seen Film?'] || '').trim().toUpperCase() === 'TRUE') ? 1 : 0;
    const docBranch = ((r['Doc Branch Member'] || '').trim().toUpperCase() === 'TRUE') ? 1 : 0;

    const activeStr = (r['ACTIVE'] || '').trim().toUpperCase();
    const isActive = activeStr === 'FALSE' ? 0 : 1;

    // Insert contact with NULL location data
    const contactCols = [
      'first_name','last_name','email_primary','email_secondary','company','website','company_linkedin','imdb','facebook','instagram','linkedin','wikipedia','biography','priority','seen_film','doc_branch_member','location_country','location_state','location_city','location_state_text','location_city_text','is_active','created_at'
    ];
    const contactVals = [
      sqlString(first), sqlString(last), sqlString(emailPrimary), sqlString(emailSecondary), sqlString(company), sqlString(website), sqlString(companyLinkedin), sqlString(imdb), sqlString(facebook), sqlString(instagram), sqlString(linkedin), sqlString(wikipedia), sqlString(biography), sqlString(priority), String(seenFilm), String(docBranch), 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', String(isActive), `CAST(strftime('%s','now') AS INTEGER) * 1000`
    ];
    lines.push(`INSERT OR IGNORE INTO contacts (id,${contactCols.join(',')}) VALUES (${contactId},${contactVals.join(',')});`);

    // Assignments
    const assignedRaw = (r['ASSIGNED TO'] || '')
      .split(/[,&]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (assignedRaw.length) {
      const values: string[] = [];
      for (const a of assignedRaw) {
        const key = a.toUpperCase();
        const uid = assigneeMap[key];
        if (uid === undefined) continue;
        values.push(`(${contactId}, ${uid})`);
      }
      if (values.length) {
        lines.push(`INSERT OR IGNORE INTO contact_assignments (contact_id, user_id) VALUES ${values.join(',')};`);
      }
    }
    
    contactId++;
  }

  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`Generated ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
