import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const csvContent = readFileSync('uscities.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`Found ${records.length} cities`);

// Valid US state codes
const validStateCodes = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC'
]);

// Filter records with valid state codes
const validRecords = records.filter((record: any) => {
  const stateCode = record.state_id?.trim();
  return stateCode && validStateCodes.has(stateCode);
});

console.log(`Filtered to ${validRecords.length} cities with valid state codes`);

// Remove duplicates based on city_ascii and state_code
const uniqueRecords = new Map();
validRecords.forEach((record: any) => {
  const key = `${record.city_ascii}_${record.state_id}`;
  if (!uniqueRecords.has(key)) {
    uniqueRecords.set(key, record);
  }
});

const finalRecords = Array.from(uniqueRecords.values());
console.log(`After removing duplicates: ${finalRecords.length} cities`);

// Generate SQL insert statements
const sqlStatements = finalRecords.map((record: any) => {
  const city = record.city.replace(/'/g, "''");
  const cityAscii = record.city_ascii.replace(/'/g, "''");
  const stateCode = record.state_id;
  const countyFips = record.county_fips || null;
  const countyName = record.county_name ? record.county_name.replace(/'/g, "''") : null;
  const lat = record.lat || null;
  const lng = record.lng || null;
  const population = record.population || null;
  const density = record.density || null;
  const timezone = record.timezone || null;
  const zips = record.zips || null;

  return `INSERT INTO cities (city, city_ascii, state_code, county_fips, county_name, lat, lng, population, density, timezone, zips) VALUES ('${city}', '${cityAscii}', '${stateCode}', ${countyFips ? `'${countyFips}'` : 'NULL'}, ${countyName ? `'${countyName}'` : 'NULL'}, ${lat || 'NULL'}, ${lng || 'NULL'}, ${population || 'NULL'}, ${density || 'NULL'}, ${timezone ? `'${timezone}'` : 'NULL'}, ${zips ? `'${zips}'` : 'NULL'});`;
});

// Write to SQL file
const sqlContent = `-- Import cities data
DELETE FROM cities;
${sqlStatements.join('\n')}
`;

import { writeFileSync } from 'fs';
writeFileSync('drizzle/007_import_cities.sql', sqlContent);

console.log('SQL file generated: drizzle/007_import_cities.sql');
console.log(`Generated ${sqlStatements.length} INSERT statements`);
