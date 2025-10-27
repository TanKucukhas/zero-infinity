import { readFileSync } from 'fs';

const countriesJson = readFileSync('countries.json', 'utf-8');
const countries = JSON.parse(countriesJson);

console.log(`Found ${countries.length} countries`);

// Generate SQL insert statements
const sqlStatements = countries.map((country: any) => {
  const name = country.name.replace(/'/g, "''");
  const code = country.code;
  return `INSERT INTO countries (code, name) VALUES ('${code}', '${name}');`;
});

// Write to SQL file
const sqlContent = `-- Import countries data from countries.json
DELETE FROM countries;
${sqlStatements.join('\n')}
`;

import { writeFileSync } from 'fs';
writeFileSync('drizzle/008_import_countries.sql', sqlContent);

console.log('SQL file generated: drizzle/008_import_countries.sql');
console.log(`Generated ${sqlStatements.length} INSERT statements`);
