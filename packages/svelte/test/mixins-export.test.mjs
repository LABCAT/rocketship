import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preprocess } from 'svelte/compiler'
import { preprocessCSS, resolveConfig } from 'vite'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const basePackageJson = join(
  packageRoot,
  'node_modules',
  '@labcat2020',
  'rocketship',
  'package.json',
)

/**
 * Compiles a Svelte `<style lang="scss">` block with Vite's Sass pipeline,
 * mirroring how a real component resolves `@use` specifiers.
 */
const compileStyleBlock = async (block) => {
  const config = await resolveConfig(
    { configFile: false, root: packageRoot, logLevel: 'silent' },
    'build',
  )
  const filename = join(packageRoot, 'src', 'Probe.svelte')
  const source = `<style lang="scss">\n${block}\n</style>`

  const style = async ({ content, attributes, filename: file }) => {
    if (attributes.lang !== 'scss') return
    const { code } = await preprocessCSS(content, `${file}.scss`, config)
    return { code }
  }

  const { code } = await preprocess(source, { style }, { filename })
  return code
}

test('@labcat2020/rocketship exposes the mixins barrel as a stable subpath', () => {
  const pkg = JSON.parse(readFileSync(basePackageJson, 'utf8'))
  assert.equal(pkg.exports['./styles/mixins'].default, './src/styles/mixins.scss')
  assert.ok(
    pkg.files.includes('src/styles'),
    'src/styles must stay in files[] so the published tarball contains the mixins barrel',
  )
})

test('@use "@labcat2020/rocketship/styles/mixins" resolves in a Svelte <style lang="scss"> block', async () => {
  const css = await compileStyleBlock(
    [
      "@use '@labcat2020/rocketship/styles/mixins' as *;",
      '.rs-probe { width: to-rem(16); }',
      '@include container-query-up($rs-cq-sm) { .rs-probe { color: red; } }',
    ].join('\n'),
  )

  assert.match(css, /width:\s*1rem/, 'to-rem() from the barrel should compile')
  assert.match(
    css,
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
    'the barrel should forward the container-query mixins',
  )
})

test('an unexported base subpath is rejected, proving the export is what resolves', async () => {
  await assert.rejects(
    compileStyleBlock("@use '@labcat2020/rocketship/styles/not-exported' as *;"),
    /is not exported|Can't find stylesheet/,
  )
})
