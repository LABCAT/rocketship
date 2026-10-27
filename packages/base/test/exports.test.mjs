import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const componentsDir = new URL('../src/components/', import.meta.url)
const componentNames = readdirSync(componentsDir)
  .filter((file) => file.endsWith('.astro'))
  .map((file) => basename(file, '.astro'))

// Self-reference: resolves the package through its own exports map, as a consumer would.
const resolveExport = (subpath) => fileURLToPath(import.meta.resolve(`@labcat2020/rocketship${subpath.slice(1)}`))

test('every component has a subpath export that resolves to its source file', () => {
  for (const name of componentNames) {
    const subpath = `./components/${name}`
    assert.ok(pkg.exports[subpath], `missing export ${subpath}`)
    assert.equal(
      resolveExport(subpath),
      fileURLToPath(new URL(`../src/components/${name}.astro`, import.meta.url)),
      `${subpath} resolves to the wrong file`,
    )
  }
})

test('base styles and mixins resolve through the exports map', () => {
  for (const subpath of ['./styles', './styles/mixins']) {
    const resolved = resolveExport(subpath)
    assert.ok(existsSync(resolved), `${subpath} resolves to a missing file: ${resolved}`)
  }
})
