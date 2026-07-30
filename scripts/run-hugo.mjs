import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const localBinary = path.resolve('.tools', 'hugo', 'hugo.exe')
const command = process.env.HUGO_BIN || (existsSync(localBinary) ? localBinary : 'hugo')
const result = spawnSync(command, process.argv.slice(2), {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
})

if (result.error) {
  console.error(`Unable to run Hugo: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)

