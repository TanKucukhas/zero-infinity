/*
  Generates drizzle/004_seed_locations.sql from countries.json, states.json, and uscities.csv
  - Countries: 245 entries
  - States: 61 US states/territories
  - Cities: ~31,000 US cities

  Usage:
    pnpm tsx scripts/seed_locations.ts
*/
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

function parseCountriesLoose(raw: string): { code: string; name: string }[] {
  // Try strict JSON first
  try {
    return JSON.parse(raw);
  } catch {
    // Normalize JS-like array of objects into strict JSON
    // - Convert keys to double-quoted
    // - Convert single-quoted strings to valid JSON strings
    const withKeys = raw
      .replace(/\{\s*name:/g, '{"name":')
      .replace(/,\s*code:/g, ',"code":');

    const normalized = withKeys.replace(/'((?:\\'|[^'])*)'/g, (_m, s: string) => {
      // Unescape \' to '
      const unescaped = s.replace(/\\'/g, "'");
      // Safely JSON-stringify the content to handle quotes/backslashes
      return JSON.stringify(unescaped);
    });

    return JSON.parse(normalized);
  }
}

function escapeSql(value: string | null | undefined): string {
  if (value === undefined || value === null) return 'NULL';
  return `'$${value.replace(/\$/g, '$$$$')}'`.replace(/^'\$\$/,'') // noop for template safety
    .replace(/^$/, "''") // empty string
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''");
}

function sqlString(value: string | null | undefined): string {
  if (value === undefined || value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const root = process.cwd();
  const countriesPath = path.join(root, 'countries.json');
  const statesPath = path.join(root, 'states.json');
  const citiesPath = path.join(root, 'uscities.csv');

  const outPath = path.join(root, 'drizzle', '004_seed_locations.sql');
  const out: string[] = [];

  out.push('-- Seed: 004_seed_locations (generated)');
  out.push('BEGIN;');
  out.push('DELETE FROM cities;');
  out.push('DELETE FROM states;');
  out.push('DELETE FROM countries;');

  // Parse countries.json (loose format: [{name: 'X', code: 'US'}, ...])
  const countriesRaw = fs.readFileSync(countriesPath, 'utf8');
  const countries: { code: string; name: string }[] = parseCountriesLoose(countriesRaw);

  // Countries inserts (batch)
  const countryValues = countries.map(c => `(${sqlString(c.code)}, ${sqlString(c.name)})`);
  out.push('INSERT INTO countries (code, name) VALUES');
  out.push(countryValues.join(',\n') + ';');

  // Parse states.json (object map {"CA":"California",...})
  const statesObj = JSON.parse(fs.readFileSync(statesPath, 'utf8')) as Record<string,string>;
  const statesArr = Object.entries(statesObj).map(([code, name]) => ({ code, name }));
  // Add country_code = 'US' for all
  const stateChunks = chunk(statesArr, 200);
  for (const ch of stateChunks) {
    const values = ch.map(s => `(${sqlString(s.code)}, ${sqlString(s.name)}, 'US')`);
    out.push('INSERT INTO states (code, name, country_code) VALUES');
    out.push(values.join(',\n') + ';');
  }

  // Parse uscities.csv and insert in chunks
  const citiesText = fs.readFileSync(citiesPath, 'utf8');
  const parsed = Papa.parse<Record<string, string>>(citiesText, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  const cityCols = ['city','city_ascii','state_id','state_name','county_fips','county_name','lat','lng','population','density','timezone','zips'];

  const toAscii = (s: string) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  const cityTuples: string[] = [];
  for (const r of rows) {
    const stateCode = (r['state_id'] || '').toUpperCase();
    if (!stateCode) continue;
    const city = r['city'] || '';
    const cityAscii = toAscii(r['city_ascii'] || city);
    const countyFips = r['county_fips'] || null;
    const countyName = r['county_name'] || null;
    const lat = r['lat'] ? Number(r['lat']) : null;
    const lng = r['lng'] ? Number(r['lng']) : null;
    const population = r['population'] ? Number(r['population']) : null;
    const density = r['density'] ? Number(r['density']) : null;
    const timezone = r['timezone'] || null;
    const zips = r['zips'] || null;
    cityTuples.push(`(${sqlString(city)}, ${sqlString(cityAscii)}, ${sqlString(stateCode)}, ${sqlString(countyFips)}, ${sqlString(countyName)}, ${lat ?? 'NULL'}, ${lng ?? 'NULL'}, ${population ?? 'NULL'}, ${density ?? 'NULL'}, ${sqlString(timezone)}, ${sqlString(zips)})`);
  }

  const cityChunks = chunk(cityTuples, 500);
  for (const ch of cityChunks) {
    out.push('INSERT INTO cities (city, city_ascii, state_code, county_fips, county_name, lat, lng, population, density, timezone, zips) VALUES');
    out.push(ch.join(',\n') + ';');
  }

  out.push('COMMIT;');

  fs.writeFileSync(outPath, out.join('\n'));
  // eslint-disable-next-line no-console
  console.log(`Generated ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
