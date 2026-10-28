import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { compile, preprocess } from 'svelte/compiler'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import axe from 'axe-core'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(packageRoot))
const componentsDir = join(packageRoot, 'src', 'components')
const storiesDir = join(repoRoot, 'apps', 'svelte', 'src', 'stories', 'components')

const require = createRequire(import.meta.url)
const sveltePkgPath = require.resolve('svelte/package.json')
const sveltePkg = require(sveltePkgPath)
const clientEntry = pathToFileURL(join(dirname(sveltePkgPath), sveltePkg.exports['.'].browser)).href

// jsdom globals must exist before the Svelte client runtime is imported.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
const window = dom.window
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
for (const key of Object.getOwnPropertyNames(window)) {
  if (
    !/^(HTML|SVG|DOM|Element|Node|Text|Comment|DocumentFragment|Event|MouseEvent|KeyboardEvent|CSS)/.test(
      key,
    )
  )
    continue
  if (typeof globalThis[key] === 'undefined' && typeof window[key] === 'function')
    globalThis[key] = window[key]
}
globalThis.requestAnimationFrame = window.requestAnimationFrame
globalThis.cancelAnimationFrame = window.cancelAnimationFrame
globalThis.getComputedStyle = window.getComputedStyle
// `bind:value` on a `<select>` observes its options with a MutationObserver, which is not part of
// the HTML/SVG/Event group copied above.
globalThis.MutationObserver = window.MutationObserver

const { mount, flushSync } = await import(clientEntry)

const cache = join(packageRoot, 'node_modules', '.cache', 'rocketship-svelte-a11y-tests')

/**
 * Compiles a `.svelte` source to the client cache. Package subpath imports of the
 * components are rewritten to relative paths first, so the shared rewrite below turns
 * them into the compiled siblings in the same directory.
 */
const compileToCache = async (name, source) => {
  const normalised = source.replace(
    /@labcat2020\/rocketship-svelte\/components\/([A-Za-z0-9_]+)/g,
    './$1.svelte',
  )
  const { code } = await preprocess(normalised, vitePreprocess(), { filename: `${name}.svelte` })
  const { js } = compile(code, { generate: 'client', filename: `${name}.svelte` })
  const rewritten = js.code
    .replace(
      /(['"])\.\/([A-Za-z0-9_.]+)\.svelte\1/g,
      (_, q, base) => `${q}./${base}.compiled.mjs${q}`,
    )
    .replace(/(['"])svelte\1/g, (_, q) => `${q}${clientEntry}${q}`)
  mkdirSync(cache, { recursive: true })
  const file = join(cache, `${name}.compiled.mjs`)
  writeFileSync(file, rewritten)
  return file
}

const storyFixtures = [
  { label: 'DisclosureDefault', file: 'DisclosureDefault.svelte' },
  { label: 'DisclosureSnippets', file: 'DisclosureSnippets.svelte' },
  { label: 'AccordionMultiple', file: 'AccordionMultiple.svelte' },
  { label: 'AccordionSingle', file: 'AccordionSingle.svelte' },
  { label: 'FieldsetDefault', file: 'FieldsetDefault.svelte' },
  { label: 'FigureDefault', file: 'FigureDefault.svelte' },
  { label: 'FigureBordered', file: 'FigureBordered.svelte' },
  { label: 'FigureCaption', file: 'FigureCaption.svelte' },
  { label: 'FigureCaptionAlign', file: 'FigureCaptionAlign.svelte' },
  { label: 'InputDefault', file: 'InputDefault.svelte' },
  { label: 'InputSizes', file: 'InputSizes.svelte' },
  { label: 'InputStates', file: 'InputStates.svelte' },
  { label: 'TextareaDefault', file: 'TextareaDefault.svelte' },
  { label: 'TextareaSizes', file: 'TextareaSizes.svelte' },
  { label: 'TextareaStates', file: 'TextareaStates.svelte' },
  { label: 'SelectStates', file: 'SelectStates.svelte' },
  { label: 'AlertVariants', file: 'AlertVariants.svelte' },
  { label: 'StackDefault', file: 'StackDefault.svelte' },
  { label: 'StackGaps', file: 'StackGaps.svelte' },
]

const runAxe = (target) =>
  axe.run(target, {
    rules: {
      // jsdom has no layout engine, so contrast cannot be computed here. The Storybook
      // a11y addon covers colour contrast in a real browser.
      'color-contrast': { enabled: false },
    },
  })

// Negative control: without this, a broken harness would silently report "no violations".
test('the axe harness reports real violations', async () => {
  const target = window.document.createElement('div')
  target.innerHTML = '<img src="avatar.png"><button></button>'
  window.document.body.innerHTML = ''
  window.document.body.appendChild(target)

  const results = await runAxe(target)
  const ids = results.violations.map((violation) => violation.id)
  assert.ok(ids.includes('image-alt'), `expected image-alt, got ${ids.join(', ') || 'none'}`)
  assert.ok(ids.includes('button-name'), `expected button-name, got ${ids.join(', ') || 'none'}`)
})

test('the story examples render without axe violations', async () => {
  // Components must be on disk before the stories that import them are linked.
  for (const name of [
    'Accordion',
    'Alert',
    'Card',
    'Container',
    'Disclosure',
    'Field',
    'Fieldset',
    'Figure',
    'Input',
    'Label',
    'Select',
    'Stack',
    'Textarea',
  ]) {
    await compileToCache(name, readFileSync(join(componentsDir, `${name}.svelte`), 'utf8'))
  }

  const failures = []
  for (const { label, file } of storyFixtures) {
    const source = readFileSync(join(storiesDir, file), 'utf8')
    const compiled = await compileToCache(`${label}-${randomUUID()}`, source)
    const Story = (await import(pathToFileURL(compiled).href)).default

    const target = window.document.createElement('div')
    window.document.body.innerHTML = ''
    window.document.body.appendChild(target)
    mount(Story, { target })
    flushSync()

    const results = await runAxe(target)
    for (const violation of results.violations) {
      failures.push(
        `${label}: ${violation.id} (${violation.nodes.length} node(s)) — ${violation.help}`,
      )
    }
  }

  assert.deepEqual(failures, [], 'every story fixture must pass axe')
})
