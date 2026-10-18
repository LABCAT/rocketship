import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(appRoot))
const storiesDir = join(appRoot, 'src', 'stories')
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

test('no two story files claim the same title and story name', () => {
  const files = readdirSync(storiesDir).filter((name) => /\.stories\.ts$/.test(name))
  const owners = new Map()

  for (const file of files) {
    const source = read(join(storiesDir, file))
    const title = source.match(/title:\s*'([^']+)'/)?.[1]
    if (!title) continue
    for (const [, name] of source.matchAll(/export const (\w+):/g)) {
      const key = `${title}::${name}`
      const files = owners.get(key) ?? []
      files.push(file)
      owners.set(key, files)
    }
  }

  for (const [key, files] of owners) {
    const [title, name] = key.split('::')
    assert.equal(
      files.length,
      1,
      `Storybook derives story ids from the title and export name, so "${title}" / "${name}" must be declared once; found in ${files.join(', ')}`,
    )
  }
})

test('the Table variants share one story file with a11y enabled', () => {
  const tableStories = readdirSync(storiesDir).filter((name) => /^Table.*\.stories\.ts$/.test(name))
  assert.deepEqual(
    tableStories,
    ['Table.stories.ts'],
    'all Table variants belong in Table.stories.ts',
  )

  const story = read(join(storiesDir, 'Table.stories.ts'))
  assert.match(story, /title:\s*'Components\/Table'/)
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Table stories must enable a11y')
  for (const variant of ['Default', 'Striped', 'Compact', 'Hover', 'Combined', 'Overflow']) {
    assert.match(
      story,
      new RegExp(`export const ${variant}: Story =`),
      `Table.stories.ts must export the ${variant} variant`,
    )
  }
})

test('the Figure variants share one story file with a11y enabled', () => {
  const figureStories = readdirSync(storiesDir).filter((name) =>
    /^Figure.*\.stories\.ts$/.test(name),
  )
  assert.deepEqual(
    figureStories,
    ['Figure.stories.ts'],
    'all Figure variants belong in Figure.stories.ts',
  )

  const story = read(join(storiesDir, 'Figure.stories.ts'))
  assert.match(story, /title:\s*'Components\/Figure'/)
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Figure stories must enable a11y')
  for (const variant of ['Default', 'Bordered', 'Caption', 'CaptionAlign']) {
    assert.match(
      story,
      new RegExp(`export const ${variant}: Story =`),
      `Figure.stories.ts must export the ${variant} variant`,
    )
  }
})

test('the Figure stories cover every caption state, including no caption at all', () => {
  const caption = read(join(storiesDir, 'components', 'FigureCaption.svelte'))
  const align = read(join(storiesDir, 'components', 'FigureCaptionAlign.svelte'))

  assert.match(caption, /captionSlot/, 'one Figure story must exercise the caption snippet')
  assert.match(
    caption,
    /<Figure\s*>/,
    'the caption story must include a Figure with no caption at all',
  )
  assert.match(align, /captionAlign="start"/, 'the align story must show the start alignment')
  assert.match(align, /captionAlign="center"/, 'the align story must show the center alignment')
})

test('the Astro host is left unchanged', () => {
  assert.equal(astroPkg.name, '@rocketship/frontend')
  assert.match(astroPkg.scripts.storybook, /6006\b/, 'the Astro host keeps port 6006')
  const astroMain = read(join(repoRoot, 'apps', 'frontend', '.storybook', 'main.ts'))
  assert.match(astroMain, /@storybook-astro\/framework/, 'the Astro host keeps its framework')
})

test('the Field title lives in exactly one story file', () => {
  const storiesDir = join(appRoot, 'src', 'stories')
  const files = readdirSync(storiesDir).filter((name) => /\.stories\.ts$/.test(name))

  const owners = files.filter((file) =>
    /title:\s*'Components\/Field'/.test(read(join(storiesDir, file))),
  )
  assert.deepEqual(owners, ['Field.stories.ts'], 'Components/Field must be declared once')
})

test('the Field stories live in one file exporting Default, Disabled and Snippets', () => {
  const source = read(join(appRoot, 'src', 'stories', 'Field.stories.ts'))
  assert.match(source, /title:\s*'Components\/Field'/, 'Field keeps its Components/Field title')

  for (const name of ['Default', 'Disabled', 'Snippets']) {
    assert.match(
      source,
      new RegExp(`export const ${name}: Story`),
      `Field.stories.ts must export the ${name} story`,
    )
  }

  const files = readdirSync(join(appRoot, 'src', 'stories'))
  assert.ok(
    !files.includes('Field.disabled.stories.ts') && !files.includes('Field.snippets.stories.ts'),
    'the extra Field story files must be collapsed into Field.stories.ts',
  )
})
