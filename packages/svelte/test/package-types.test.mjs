import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
// A throwaway install root outside the repo, standing in for a downstream consumer.
const consumerRoot = join(tmpdir(), `rocketship-types-${randomUUID()}`)
const installedPackage = join(consumerRoot, 'node_modules', '@labcat2020', 'rocketship-svelte')

/** The tarball filename `pnpm pack` produces for a package (`@scope/name` -> `scope-name-version.tgz`). */
const tarballName = ({ name, version }) =>
  `${name.replace('@', '').replace('/', '-')}-${version}.tgz`

/** Compiles a fixture with svelte-check, the type checker a Svelte consumer actually runs. */
const runSvelteCheck = () =>
  execFileSync(join(packageRoot, 'node_modules', '.bin', 'svelte-check'), [
    '--tsconfig',
    join(consumerRoot, 'tsconfig.json'),
    '--output',
    'machine',
  ]).toString()

before(() => {
  rmSync(consumerRoot, { recursive: true, force: true })

  const packs = join(consumerRoot, 'packs')
  mkdirSync(packs, { recursive: true })
  mkdirSync(installedPackage, { recursive: true })

  execFileSync('pnpm', ['pack', '--pack-destination', packs], {
    cwd: packageRoot,
    stdio: 'ignore',
  })

  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const tarball = join(packs, tarballName(pkg))
  assert.ok(existsSync(tarball), `pnpm pack must emit ${tarballName(pkg)}`)
  execFileSync('tar', ['xzf', tarball, '-C', installedPackage, '--strip-components=1'])

  // svelte-check needs `svelte` resolvable from the consumer root to understand `.svelte` modules.
  symlinkSync(
    join(packageRoot, 'node_modules', 'svelte'),
    join(consumerRoot, 'node_modules', 'svelte'),
  )

  writeFileSync(
    join(consumerRoot, 'package.json'),
    JSON.stringify({ name: 'rocketship-types-consumer', private: true, type: 'module' }),
  )
  writeFileSync(
    join(consumerRoot, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
      include: ['consumer.svelte'],
    }),
  )
  writeFileSync(
    join(consumerRoot, 'consumer.svelte'),
    `<script lang="ts">
  import type { RadioValue } from '@labcat2020/rocketship-svelte'

  export const chosen: RadioValue = 'email'
  // @ts-expect-error a boolean is not a radio value: the type is the real union, not \`any\`
  export const rejected: RadioValue = true
</script>

<p>{chosen}</p>
`,
  )
})

after(() => {
  rmSync(consumerRoot, { recursive: true, force: true })
})

test('the published package root types the RadioValue union for consumers', () => {
  const pkg = JSON.parse(readFileSync(join(installedPackage, 'package.json'), 'utf8'))
  const typesEntry = pkg.exports['.'].types

  assert.equal(pkg.types, typesEntry, 'the root `types` field must match the root export')
  assert.ok(
    existsSync(join(installedPackage, typesEntry)),
    `the published tarball must ship ${typesEntry}, which the root types entry points at`,
  )
})

test('a consumer imports RadioValue from the package root and svelte-check accepts it', () => {
  // svelte-check exits 0 even when it reports diagnostics, so the output is the assertion.
  const output = runSvelteCheck()

  assert.doesNotMatch(
    output,
    /has no exported member 'RadioValue'/,
    'RadioValue must be exported from the package root for consumers',
  )
  assert.doesNotMatch(
    output,
    /Unused '@ts-expect-error' directive/,
    'the @ts-expect-error must stay used, proving RadioValue is not silently widened to any',
  )
  assert.match(output, /0 ERRORS/, 'the consumer fixture must type-check without errors')
})
