import { randomBytes } from 'crypto'
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backendRoot = path.join(root, 'apps', 'backend')
const envPath = path.join(backendRoot, '.env')
const examplePath = path.join(backendRoot, '.env.example')

function payloadSecretIsSet(content) {
  const line = content.split(/\r?\n/).find((l) => /^\s*PAYLOAD_SECRET=/.test(l))
  if (!line) return false
  const raw = line.replace(/^\s*PAYLOAD_SECRET=/, '').trim()
  if (!raw) return false
  const unquoted = raw.replace(/^["']|["']$/g, '').trim()
  return unquoted.length > 0
}

function writePayloadSecret() {
  const secret = randomBytes(32).toString('hex')
  const existing = fs.readFileSync(envPath, 'utf8')
  const lines = existing.split(/\r?\n/)
  let replaced = false
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)PAYLOAD_SECRET=/)
    if (m) {
      lines[i] = `${m[1] ?? ''}PAYLOAD_SECRET=${secret}`
      replaced = true
      break
    }
  }
  if (!replaced) lines.push(`PAYLOAD_SECRET=${secret}`)
  const next = lines.join('\n')
  fs.writeFileSync(envPath, next.endsWith('\n') ? next : `${next}\n`)
  console.log(`PAYLOAD_SECRET ${replaced ? 'updated' : 'written'} in apps/backend/.env`)
}

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error(`Missing ${examplePath}`)
    process.exit(1)
  }
  fs.copyFileSync(examplePath, envPath)
  console.log('Created apps/backend/.env from apps/backend/.env.example')
}

let envContent = fs.readFileSync(envPath, 'utf8')
if (!payloadSecretIsSet(envContent)) {
  writePayloadSecret()
}

const nodeModules = path.join(root, 'node_modules')
if (!fs.existsSync(nodeModules)) {
  const install = spawnSync('pnpm', ['install'], { cwd: root, stdio: 'inherit' })
  if (install.status !== 0) process.exit(install.status ?? 1)
}

if (!process.env.CI) {
  console.log('Running pnpm wrangler login (browser)…')
  const login = spawnSync(
    'pnpm',
    ['--filter', '@rocketship/backend', 'exec', 'wrangler', 'login'],
    { cwd: root, stdio: 'inherit' },
  )
  if (login.status !== 0) process.exit(login.status ?? 1)
}

console.log('Next: pnpm dev:backend')
