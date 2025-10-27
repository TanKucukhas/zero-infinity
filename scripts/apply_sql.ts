/**
 * Apply all SQL files from ./drizzle to Cloudflare D1 using Wrangler.
 *
 * Usage:
 *   tsx scripts/apply_sql.ts --local   # apply to local D1 state
 *   tsx scripts/apply_sql.ts --remote  # apply to remote D1
 *
 * Notes:
 * - DB name defaults to 'people_intel' but can be overridden with CF_D1_NAME.
 * - Requires wrangler dev dependency (available in this repo).
 */
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
    p.on('close', (code) => {
      if (code === 0) return resolvePromise()
      reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const isRemote = args.includes('--remote')
  const isLocal = args.includes('--local') || !isRemote

  const dbName = process.env.CF_D1_NAME || 'people_intel'
  const drizzleDir = resolve(process.cwd(), 'drizzle')
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith('.sql'))
    // Skip legacy pre-normalization migrations (000-002)
    .filter((f) => !/^00[0-2]_/.test(f))
    .sort((a, b) => a.localeCompare(b))

  if (files.length === 0) {
    console.error('No .sql files found under ./drizzle')
    process.exit(1)
  }

  console.log(`Applying ${files.length} SQL file(s) to D1: ${dbName} (${isRemote ? 'remote' : 'local'})`)

  for (const f of files) {
    const full = join(drizzleDir, f)
    const modeFlag = isRemote ? '--remote' : '--local'
    console.log(`\n🚀 Executing ${f} ...`)
    await run('npx', ['wrangler', 'd1', 'execute', dbName, modeFlag, '--file', full])
  }

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error('\n❌ Failed:', err.message)
  process.exit(1)
})
