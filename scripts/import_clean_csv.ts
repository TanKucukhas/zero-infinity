/*
  Generates drizzle/006_import_clean_csv.sql from clean.csv, using the new contacts schema.

  - Maps location country/state/city into normalized fields
  - Splits ASSIGNED TO into contact_assignments rows
  - Maps booleans and priority

  Usage:
    pnpm tsx scripts/import_clean_csv.ts
*/
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

function sqlString(v: string | null | undefined): string {
  if (v === undefined || v === null) return 'NULL';
  return `'${v.replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

function toAsciiLower(s: string): string {
  return (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function parseCountriesLoose(raw: string): { code: string; name: string }[] {
  try {
    return JSON.parse(raw);
  } catch {
    const withKeys = raw
      .replace(/\{\s*name:/g, '{"name":')
      .replace(/,\s*code:/g, ',"code":');
    const normalized = withKeys.replace(/'((?:\\'|[^'])*)'/g, (_m, s: string) => {
      const unescaped = s.replace(/\\'/g, "'");
      return JSON.stringify(unescaped);
    });
    return JSON.parse(normalized);
  }
}

function buildAssigneeMap(): Record<string, number> {
  // Map names/initials to user IDs from 005_seed_users.sql
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
  const outPath = path.join(root, 'drizzle', '006_import_clean_csv.sql');
  const countriesPath = path.join(root, 'countries.json');
  const statesPath = path.join(root, 'states.json');

  const countriesRaw = fs.readFileSync(countriesPath, 'utf8');
  const countriesArr = parseCountriesLoose(countriesRaw);
  const countryNameToCode: Record<string,string> = Object.fromEntries(
    countriesArr.map(c => [c.name.toLowerCase(), c.code])
  );

  const statesObj = JSON.parse(fs.readFileSync(statesPath, 'utf8')) as Record<string,string>;
  const stateNameToCode: Record<string,string> = Object.fromEntries(
    Object.entries(statesObj).map(([code, name]) => [name.toLowerCase(), code])
  );

  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const lines: string[] = [];
  lines.push('-- Import: 006_import_clean_csv (generated)');

  const assigneeMap = buildAssigneeMap();
  let contactId = 1; // Start from 1 since we'll be inserting sequentially

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

    const countryName = (r['Location Country'] || '').trim();
    const stateName = (r['State'] || '').trim();
    const cityName = (r['City'] || '').trim();

    const countryCode = countryName ? (countryNameToCode[countryName.toLowerCase()] || null) : null;
    const isUS = (countryName.toLowerCase() === 'united states') || countryCode === 'US';
    const stateCode = isUS && stateName ? (stateNameToCode[stateName.toLowerCase()] || null) : null;
    const cityAscii = isUS && cityName ? toAsciiLower(cityName) : null;

    const locationCountry = isUS || countryCode ? (countryCode || 'US') : null;
    const locationState = isUS ? (stateCode || null) : null;
    const locationCityExpr = (isUS && cityAscii && stateCode)
      ? `(SELECT id FROM cities WHERE city_ascii=${sqlString(cityAscii)} AND state_code=${sqlString(stateCode)} LIMIT 1)`
      : 'NULL';

    const locationStateText = !isUS && stateName ? stateName : null;
    const locationCityText = !isUS && cityName ? cityName : null;

    // Insert contact
    const contactCols = [
      'first_name','last_name','email_primary','email_secondary','company','website','company_linkedin','imdb','facebook','instagram','linkedin','wikipedia','biography','priority','seen_film','doc_branch_member','location_country','location_state','location_city','location_state_text','location_city_text','is_active','created_at'
    ];
    const contactVals = [
      sqlString(first), sqlString(last), sqlString(emailPrimary), sqlString(emailSecondary), sqlString(company), sqlString(website), sqlString(companyLinkedin), sqlString(imdb), sqlString(facebook), sqlString(instagram), sqlString(linkedin), sqlString(wikipedia), sqlString(biography), sqlString(priority), String(seenFilm), String(docBranch), sqlString(locationCountry), sqlString(locationState), locationCityExpr, sqlString(locationStateText), sqlString(locationCityText), String(isActive), `CAST(strftime('%s','now') AS INTEGER) * 1000`
    ];
    lines.push(`INSERT INTO contacts (id,${contactCols.join(',')}) VALUES (${contactId},${contactVals.join(',')});`);

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
    
    contactId++; // Increment for next contact
  }

  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`Generated ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
