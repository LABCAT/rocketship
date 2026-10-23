import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile, preprocess } from 'svelte/compiler'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { render } from 'svelte/server'
import { preprocessCSS, resolveConfig } from 'vite'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(packageRoot))
// A throwaway install root outside the repo, standing in for a downstream consumer.
const consumerRoot = join(tmpdir(), `rocketship-consumer-${randomUUID()}`)
const installedScope = join(consumerRoot, 'node_modules', '@labcat2020')
// Compiled components are emitted inside node_modules so bare `svelte` imports resolve.
const renderCache = join(packageRoot, 'node_modules', '.cache', 'rocketship-consumer-tests')

const componentSubpaths = [
  'Accordion',
  'Alert',
  'Button',
  'Card',
  'Container',
  'Disclosure',
  'Field',
  'Figure',
  'Grid',
  'Input',
  'Label',
  'Select',
  'Stack',
  'Table',
  'Textarea',
  'Typography',
]

/** The tarball filename `pnpm pack` produces for a package (`@scope/name` -> `scope-name-version.tgz`). */
const tarballName = ({ name, version }) =>
  `${name.replace('@', '').replace('/', '-')}-${version}.tgz`

/** Packs a workspace package the way the publish workflow does, into the consumer's packs directory. */
const packPackage = (packageDir, destination) => {
  const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
  execFileSync('pnpm', ['pack', '--pack-destination', destination], {
    cwd: packageDir,
    stdio: 'ignore',
  })
  const tarball = join(destination, tarballName(pkg))
  assert.ok(existsSync(tarball), `pnpm pack must emit ${tarballName(pkg)}`)
  return tarball
}

/** Extracts a tarball into a directory as if it had been installed from the registry. */
const installTarball = (tarball, installPath) => {
  mkdirSync(installPath, { recursive: true })
  execFileSync('tar', ['xzf', tarball, '-C', installPath, '--strip-components=1'])
}

/** Resolves a specifier the way Node would for a module at the consumer root. */
const resolveFromConsumer = (specifier) =>
  createRequire(join(consumerRoot, 'package.json')).resolve(specifier)

/**
 * Compiles a `<style lang="scss">` body with Vite's Sass pipeline rooted at the
 * consumer, so bare `@use` specifiers resolve through the consumer's node_modules.
 */
const compileStyleInConsumer = async (block) => {
  const config = await resolveConfig(
    { configFile: false, root: consumerRoot, logLevel: 'silent' },
    'build',
  )
  const filename = join(consumerRoot, 'Probe.svelte')
  const source = `<style lang="scss">\n${block}\n</style>`

  const style = async ({ content, attributes, filename: file }) => {
    if (attributes.lang !== 'scss') return
    const { code } = await preprocessCSS(content, `${file}.scss`, config)
    return { code }
  }

  const { code } = await preprocess(source, { style }, { filename })
  return code
}

/** Compiles a published component source to a server-renderable module and imports it. */
const loadInstalledComponent = async (sourcePath) => {
  const source = readFileSync(sourcePath, 'utf8')
  const { code } = await preprocess(source, vitePreprocess(), { filename: sourcePath })
  const { js } = compile(code, { generate: 'server', filename: sourcePath })
  mkdirSync(renderCache, { recursive: true })
  const file = join(renderCache, `installed-${randomUUID()}.mjs`)
  writeFileSync(file, js.code)
  const module = await import(pathToFileURL(file).href)
  return module.default
}

/** Returns the `<style>` body from a component source so its rules can be compiled. */
const styleBlockOf = (source) => source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''

before(() => {
  rmSync(consumerRoot, { recursive: true, force: true })
  mkdirSync(installedScope, { recursive: true })
  writeFileSync(
    join(consumerRoot, 'package.json'),
    JSON.stringify({ name: 'rocketship-consumer', private: true, type: 'module' }),
  )

  const packs = join(consumerRoot, 'packs')
  mkdirSync(packs, { recursive: true })

  installTarball(
    packPackage(join(repoRoot, 'packages', 'base'), packs),
    join(installedScope, 'rocketship'),
  )
  installTarball(
    packPackage(join(repoRoot, 'packages', 'svelte'), packs),
    join(installedScope, 'rocketship-svelte'),
  )
})

after(() => {
  rmSync(consumerRoot, { recursive: true, force: true })
})

test('a clean consumer install resolves every published component subpath from the tarballs', () => {
  const installedPkg = JSON.parse(
    readFileSync(join(installedScope, 'rocketship-svelte', 'package.json'), 'utf8'),
  )
  const exportedComponents = Object.keys(installedPkg.exports)
    .filter((key) => key.startsWith('./components/'))
    .map((key) => key.replace('./components/', ''))

  assert.deepEqual(
    [...componentSubpaths].sort(),
    [...exportedComponents].sort(),
    'every ./components/* export in the published tarball must be covered here',
  )

  for (const name of componentSubpaths) {
    const specifier = `@labcat2020/rocketship-svelte/components/${name}`
    const resolved = resolveFromConsumer(specifier)

    assert.ok(
      resolved.startsWith(installedScope),
      `${specifier} must resolve inside the consumer install, not the repo`,
    )
    assert.ok(
      resolved.endsWith(`src/components/${name}.svelte`),
      `${specifier} must resolve to the published component source`,
    )
    assert.ok(existsSync(resolved), `${specifier} must point at a file that exists in the tarball`)
  }
})

test('each published component compiles and server-renders its BEM block class', async () => {
  const blockByComponent = {
    Alert: 'rs-alert',
    Button: 'rs-button',
    Card: 'rs-card',
    Container: 'rs-container',
    Grid: 'rs-grid',
    Select: 'rs-select',
    Stack: 'rs-stack',
    Typography: 'rs-typography',
  }

  for (const [name, block] of Object.entries(blockByComponent)) {
    const sourcePath = resolveFromConsumer(`@labcat2020/rocketship-svelte/components/${name}`)
    const Component = await loadInstalledComponent(sourcePath)
    const markup = render(Component, { props: {} }).body

    assert.match(
      markup,
      new RegExp(`class="[^"]*\\b${block}\\b`),
      `${name} installed from the tarball must render .${block}`,
    )
  }
})

test('the published subpaths reject unknown components and repo-relative deep imports', () => {
  for (const specifier of [
    '@labcat2020/rocketship-svelte/components/Nope',
    '@labcat2020/rocketship-svelte/src/components/Container.svelte',
    '@labcat2020/rocketship-svelte/src/components/Container',
  ]) {
    assert.throws(
      () => resolveFromConsumer(specifier),
      (error) => error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
      `${specifier} must not be exported, so consumers cannot deep-import repo files`,
    )
  }
})

test('the published base tarball exports the mixins barrel for consumers', () => {
  const resolved = resolveFromConsumer('@labcat2020/rocketship/styles/mixins')

  assert.ok(
    resolved.startsWith(installedScope),
    'the mixins subpath must resolve inside the consumer install, not the repo',
  )
  assert.ok(
    resolved.endsWith('src/styles/mixins.scss'),
    'the mixins subpath must resolve to the published barrel',
  )

  const barrel = readFileSync(resolved, 'utf8')
  for (const forwarded of ['mixins/container-query', 'mixins/functions', 'mixins/breakpoints']) {
    assert.ok(
      barrel.includes(`@forward '${forwarded}'`),
      `the published barrel must forward ${forwarded}`,
    )
  }
})

test('a consumer compiles a published component style block through the barrel with no loadPaths workaround', async () => {
  const containerPath = resolveFromConsumer('@labcat2020/rocketship-svelte/components/Container')
  const css = await compileStyleInConsumer(styleBlockOf(readFileSync(containerPath, 'utf8')))

  assert.ok(css.includes('.rs-container'), 'the published Container style block must compile')
  assert.match(
    css,
    /@media\s*\(min-width:\s*992px\)/,
    'the barrel mixins must resolve through the consumer install without bundler loadPaths',
  )
})

test('an unexported base subpath is rejected from a consumer install', () => {
  assert.throws(
    () => resolveFromConsumer('@labcat2020/rocketship/styles/mixins/container-query'),
    (error) => error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
    'only the barrel is exported, never individual mixin partials',
  )
})
