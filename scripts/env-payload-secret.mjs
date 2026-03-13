import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const envPath = path.resolve(process.cwd(), '.env')
const secret = randomBytes(32).toString('hex')

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const lines = existing ? existing.split(/\r?\n/) : []

let replaced = false

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^(\s*)PAYLOAD_SECRET=/)
  if (match) {
    const prefix = match[1] ?? ''
    lines[index] = `${prefix}PAYLOAD_SECRET=${secret}`
    replaced = true
    break
  }
}

if (!replaced) {
  lines.push(`PAYLOAD_SECRET=${secret}`)
}

const nextContent = lines.join('\n')
const finalContent = nextContent.endsWith('\n') ? nextContent : `${nextContent}\n`

try {
  fs.writeFileSync(envPath, finalContent)
  const action = replaced ? 'updated' : 'written'
  console.log(`PAYLOAD_SECRET ${action} in ${envPath}. Restart the Payload backend server to load the new secret.`)
} catch (error) {
  console.error(`Failed to write PAYLOAD_SECRET to ${envPath}:`, error)
  process.exitCode = 1
}
