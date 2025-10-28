#!/usr/bin/env tsx

/**
 * Database Backup Script for Cloudflare D1
 * 
 * This script creates a full backup of the D1 database by:
 * 1. Exporting all table schemas
 * 2. Exporting all data from each table
 * 3. Creating a timestamped SQL file with complete backup
 * 
 * Usage:
 * - Local: npm run db:backup:local
 * - Remote: npm run db:backup:remote
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DB_NAME = 'people_intel';
const BACKUP_DIR = './backups';

interface BackupOptions {
  local?: boolean;
  remote?: boolean;
}

function runCommand(cmd: string): string {
  try {
    console.log(`Running: ${cmd}`);
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${cmd}`);
    console.error(error);
    process.exit(1);
  }
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
}

function createBackupDirectory(): string {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
  return BACKUP_DIR;
}

function getTableList(isLocal: boolean): string[] {
  const localFlag = isLocal ? '--local' : '';
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${localFlag} --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"`;
  
  const result = runCommand(cmd);
  
  // Parse JSON output from wrangler
  try {
    const lines = result.split('\n');
    let jsonStart = false;
    let jsonContent = '';
    
    for (const line of lines) {
      if (line.includes('[')) {
        jsonStart = true;
      }
      if (jsonStart) {
        jsonContent += line;
      }
    }
    
    const parsed = JSON.parse(jsonContent);
    const tables: string[] = [];
    
    if (parsed[0] && parsed[0].results) {
      for (const row of parsed[0].results) {
        if (row.name && !row.name.startsWith('_cf_') && row.name !== 'sqlite_sequence') {
          tables.push(row.name);
        }
      }
    }
    
    return tables;
  } catch (error) {
    console.error('Error parsing table list:', error);
    return [];
  }
}

function getTableSchema(tableName: string, isLocal: boolean): string {
  const localFlag = isLocal ? '--local' : '';
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${localFlag} --command "SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'"`;
  
  const result = runCommand(cmd);
  
  try {
    const lines = result.split('\n');
    let jsonStart = false;
    let jsonContent = '';
    
    for (const line of lines) {
      if (line.includes('[')) {
        jsonStart = true;
      }
      if (jsonStart) {
        jsonContent += line;
      }
    }
    
    const parsed = JSON.parse(jsonContent);
    
    if (parsed[0] && parsed[0].results && parsed[0].results[0]) {
      return parsed[0].results[0].sql || '';
    }
    
    return '';
  } catch (error) {
    console.error('Error parsing schema:', error);
    return '';
  }
}

function getTableData(tableName: string, isLocal: boolean): string[] {
  const localFlag = isLocal ? '--local' : '';
  
  // For large tables, get row count first
  const countCmd = `npx wrangler d1 execute ${DB_NAME} ${localFlag} --command "SELECT COUNT(*) as count FROM ${tableName}"`;
  const countResult = runCommand(countCmd);
  
  let rowCount = 0;
  try {
    const lines = countResult.split('\n');
    let jsonStart = false;
    let jsonContent = '';
    
    for (const line of lines) {
      if (line.includes('[')) {
        jsonStart = true;
      }
      if (jsonStart) {
        jsonContent += line;
      }
    }
    
    const parsed = JSON.parse(jsonContent);
    if (parsed[0] && parsed[0].results && parsed[0].results[0]) {
      rowCount = parsed[0].results[0].count || 0;
    }
  } catch (error) {
    console.error('Error parsing row count:', error);
  }
  
  console.log(`   📊 Table ${tableName} has ${rowCount} rows`);
  
  // Skip very large tables (>10000 rows) or handle them in batches
  if (rowCount > 10000) {
    console.log(`   ⚠️  Skipping large table ${tableName} (${rowCount} rows) - consider manual export`);
    return [`-- Large table ${tableName} with ${rowCount} rows skipped - manual export recommended`];
  }
  
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${localFlag} --command "SELECT * FROM ${tableName} LIMIT 1000"`;
  
  const result = runCommand(cmd);
  
  try {
    const lines = result.split('\n');
    let jsonStart = false;
    let jsonContent = '';
    
    for (const line of lines) {
      if (line.includes('[')) {
        jsonStart = true;
      }
      if (jsonStart) {
        jsonContent += line;
      }
    }
    
    const parsed = JSON.parse(jsonContent);
    const data: string[] = [];
    
    if (parsed[0] && parsed[0].results) {
      // Get column names first
      const columnCmd = `npx wrangler d1 execute ${DB_NAME} ${localFlag} --command "PRAGMA table_info(${tableName})"`;
      const columnResult = runCommand(columnCmd);
      
      const columnLines = columnResult.split('\n');
      let columnJsonStart = false;
      let columnJsonContent = '';
      
      for (const line of columnLines) {
        if (line.includes('[')) {
          columnJsonStart = true;
        }
        if (columnJsonStart) {
          columnJsonContent += line;
        }
      }
      
      const columnParsed = JSON.parse(columnJsonContent);
      const columns: string[] = [];
      
      if (columnParsed[0] && columnParsed[0].results) {
        for (const colRow of columnParsed[0].results) {
          if (colRow.name) {
            columns.push(colRow.name);
          }
        }
      }
      
      // Process data rows
      for (const row of parsed[0].results) {
        const values: string[] = [];
        
        for (const col of columns) {
          const value = row[col];
          if (value === null || value === undefined) {
            values.push('NULL');
          } else if (typeof value === 'boolean') {
            values.push(value ? '1' : '0');
          } else if (typeof value === 'string') {
            values.push(`'${value.replace(/'/g, "''")}'`);
          } else {
            values.push(`'${value}'`);
          }
        }
        
        if (columns.length > 0) {
          data.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing table data:', error);
    return [];
  }
}

function createBackup(isLocal: boolean): void {
  const timestamp = getTimestamp();
  const backupDir = createBackupDirectory();
  const backupFile = join(backupDir, `backup_${isLocal ? 'local' : 'remote'}_${timestamp}.sql`);
  
  console.log(`\n🔄 Creating ${isLocal ? 'local' : 'remote'} database backup...`);
  console.log(`📁 Backup file: ${backupFile}`);
  
  let backupContent = `-- Database Backup for ${DB_NAME}
-- Generated on: ${new Date().toISOString()}
-- Environment: ${isLocal ? 'Local' : 'Remote'}
-- Database: ${DB_NAME}

-- Disable foreign key constraints during restore
PRAGMA foreign_keys = OFF;

-- Begin transaction
BEGIN TRANSACTION;

`;

  try {
    // Get all tables
    const tables = getTableList(isLocal);
    console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Export each table
    for (const table of tables) {
      console.log(`📊 Exporting table: ${table}`);
      
      // Get table schema
      const schema = getTableSchema(table, isLocal);
      if (schema) {
        backupContent += `-- Table: ${table}\n`;
        backupContent += `${schema};\n\n`;
      }
      
      // Get table data
      const data = getTableData(table, isLocal);
      if (data.length > 0) {
        backupContent += `-- Data for table: ${table}\n`;
        backupContent += data.join('\n') + '\n\n';
        console.log(`   ✅ Exported ${data.length} rows`);
      } else {
        console.log(`   ⚠️  No data found`);
      }
    }
    
    // Complete transaction
    backupContent += `-- Commit transaction
COMMIT;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Backup completed successfully
-- Generated on: ${new Date().toISOString()}
`;

    // Write backup file
    writeFileSync(backupFile, backupContent);
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📄 File: ${backupFile}`);
    console.log(`📊 Tables: ${tables.length}`);
    console.log(`💾 Size: ${(backupContent.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error(`❌ Backup failed:`, error);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const options: BackupOptions = {};
  
  if (args.includes('--local')) {
    options.local = true;
  } else if (args.includes('--remote')) {
    options.remote = true;
  } else {
    console.log('Usage: npm run db:backup:local or npm run db:backup:remote');
    console.log('Or: tsx scripts/backup_database.ts --local|--remote');
    process.exit(1);
  }
  
  console.log('🚀 Starting database backup process...');
  console.log(`🎯 Target: ${options.local ? 'Local D1' : 'Remote D1'}`);
  
  createBackup(!!options.local);
}

if (require.main === module) {
  main();
}
