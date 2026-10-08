import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(appRoot))
const read = (path) => readFileSync(path, 'utf8')
const readJson = (path) => JSON.parse(read(path))

const sveltePkg = readJson(join(appRoot, 'package.json'))
const rootPkg = readJson(join(repoRoot, 'package.json'))
const astroPkg = readJson(join(repoRoot, 'apps', 'frontend', 'package.json'))
const mainTs = read(join(appRoot, '.storybook', 'main.ts'))

test('apps/svelte is a private Storybook 10 host package', () => {
  assert.equal(sveltePkg.name, '@rocketship/svelte-storybook')
  assert.equal(sveltePkg.private, true)

  const dev = { ...sveltePkg.devDependencies }
  assert.match(dev.storybook, /^(\^|~)?10\./, 'Storybook 10 is required')
  assert.ok(dev['@storybook/svelte-vite'], '@storybook/svelte-vite is required')
  assert.ok(dev['@storybook/addon-a11y'], 'the a11y addon is required')
  assert.ok(dev.sass, 'sass is required')
  assert.ok(dev.vite, 'vite is required')
  assert.ok(
    sveltePkg.dependencies['@labcat2020/rocketship-svelte'],
    'the host depends on the Svelte library',
  )
})

test('the Svelte host uses the svelte-vite framework, a11y addon, and stories glob', () => {
  assert.match(mainTs, /@storybook\/svelte-vite/, 'framework must be @storybook/svelte-vite')
  assert.match(mainTs, /'@storybook\/addon-a11y'/, 'the a11y addon must be registered')
  assert.match(
    mainTs,
    /'\.\.\/src\/\*\*\/\*\.stories\.\*'/,
    'stories glob must be ../src/**/*.stories.*',
  )
})

test('root scripts run the Svelte host on port 6007', () => {
  assert.equal(
    rootPkg.scripts['storybook:svelte'],
    'pnpm --filter @rocketship/svelte-storybook storybook',
  )
  assert.equal(
    rootPkg.scripts['build:storybook:svelte'],
    'pnpm --filter @rocketship/svelte-storybook build-storybook',
  )

  assert.match(sveltePkg.scripts.dev, /-p 6007\b/, 'dev must use port 6007')
  assert.match(sveltePkg.scripts['build-storybook'], /storybook build/)
})

test('the story enables a11y and renders a component from the stories folder', () => {
  const story = read(join(appRoot, 'src', 'stories', 'GettingStarted.stories.ts'))
  assert.match(story, /from '\.\/components\//, 'the story must import a local component')
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the story must enable a11y checks')
})

test('the Astro host is left unchanged', () => {
  assert.equal(astroPkg.name, '@rocketship/frontend')
  assert.match(astroPkg.scripts.storybook, /6006\b/, 'the Astro host keeps port 6006')
  const astroMain = read(join(repoRoot, 'apps', 'frontend', '.storybook', 'main.ts'))
  assert.match(astroMain, /@storybook-astro\/framework/, 'the Astro host keeps its framework')
})
