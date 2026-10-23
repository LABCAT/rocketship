import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { compile, preprocess } from 'svelte/compiler'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { createRawSnippet } from 'svelte'
import { render } from 'svelte/server'
import { preprocessCSS, resolveConfig } from 'vite'

const require = createRequire(import.meta.url)
const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(packageRoot))
const componentsDir = join(packageRoot, 'src', 'components')
// Compiled components are emitted inside node_modules so bare `svelte` imports resolve.
const renderCache = join(packageRoot, 'node_modules', '.cache', 'rocketship-svelte-component-tests')

/**
 * Compiles component source to a server-renderable ES module and imports it, mirroring
 * how the Svelte compiler consumes the component source at build time. Sibling
 * component imports are compiled too, so composed components (Field renders Label)
 * resolve instead of failing on the raw `.svelte` specifier.
 */
const runCache = join(renderCache, randomUUID())

const compileComponent = async (source, filename) => {
  const { code } = await preprocess(source, vitePreprocess(), { filename: `${filename}.svelte` })
  const { js } = compile(code, { generate: 'server', filename: `${filename}.svelte` })

  const siblings = [
    ...new Set(
      [...js.code.matchAll(/from\s+['"]\.\/([A-Za-z0-9_]+)\.svelte['"]/g)].map((match) => match[1]),
    ),
  ]
  for (const sibling of siblings) await loadComponent(sibling)

  const rewritten = js.code.replace(
    /from\s+(['"])\.\/([A-Za-z0-9_]+)\.svelte\1/g,
    (_, quote, sibling) => `from ${quote}./${sibling}.compiled.mjs${quote}`,
  )

  mkdirSync(runCache, { recursive: true })
  const file = join(runCache, `${filename}.compiled.mjs`)
  writeFileSync(file, rewritten)
  const module = await import(pathToFileURL(file).href)
  return module.default
}

const loadComponent = async (name) =>
  compileComponent(readFileSync(join(componentsDir, `${name}.svelte`), 'utf8'), name)

/** Compiles a throwaway wrapper component so several instances can render in one pass. */
const loadInline = async (source) => compileComponent(source, `inline-${randomUUID()}`)

/** Renders a component and returns the server-rendered body markup. */
const renderMarkup = (Component, props = {}) => render(Component, { props }).body

/**
 * Strips the Svelte server-render anchor comments (`<!--[0-->`, `<!--]-->`) so assertions can
 * read the markup the way a consumer sees it. Blocks left empty by a false `{#if}` become `<!---->`,
 * which is removed too.
 */
const visible = (markup) => markup.replace(/<!--[\s\S]*?-->/g, '')

/** Returns the opening tag for the first element with the given name. */
const openingTag = (markup, name) => markup.match(new RegExp(`<${name}\\b[^>]*>`))?.[0] ?? ''

/** Parses the class attribute of the first element with the given name into tokens. */
const classList = (markup, name = 'div') =>
  (openingTag(markup, name).match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean)

/** Renders a Svelte snippet around raw markup, standing in for a default slot. */
const snippet = (html) => createRawSnippet(() => ({ render: () => html }))

/**
 * Installs a jsdom window on `globalThis` and returns the Svelte client runtime. Svelte resolves
 * its entry through the `browser` export condition, which `node --test` does not set, so the
 * client module is imported from its file path instead.
 */
const setupDom = async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  })
  for (const key of Object.getOwnPropertyNames(dom.window)) {
    if (key in globalThis) continue
    try {
      globalThis[key] = dom.window[key]
    } catch {
      // Read-only accessor on the Node global (location, top, ...): the component does not use it.
    }
  }

  const clientEntry = join(
    dirname(require.resolve('svelte/package.json')),
    'src',
    'index-client.js',
  )
  const client = await import(pathToFileURL(clientEntry).href)
  return { ...client, dom }
}

const { mount, tick, unmount, createRawSnippet: createClientSnippet } = await setupDom()

/**
 * Renders a Svelte snippet for a client-mounted component. The `svelte` entry resolves to the
 * server build under `node --test`, and a server snippet cannot be rendered by the client runtime.
 */
const clientSnippet = (html) => createClientSnippet(() => ({ render: () => html }))

/** Compiles a component for the browser and imports it, so effects and bindings run. */
const loadClientComponent = async (name) => {
  const source = readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')
  const { code } = await preprocess(source, vitePreprocess(), { filename: `${name}.svelte` })
  const { js } = compile(code, { generate: 'client', filename: `${name}.svelte` })
  mkdirSync(renderCache, { recursive: true })
  const file = join(renderCache, `${name}-client-${randomUUID()}.mjs`)
  writeFileSync(file, js.code)
  const module = await import(pathToFileURL(file).href)
  return module.default
}

/**
 * Stands in for the platform ResizeObserver so a test can drive a re-measure on demand. The
 * callbacks are collected because the component registers one observer over two targets.
 */
const observerCallbacks = new Set()
globalThis.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    observerCallbacks.add(this.callback)
  }
  unobserve() {}
  disconnect() {
    observerCallbacks.delete(this.callback)
  }
}

/** Fires every observed resize, as the browser would after a layout change. */
const resize = () => {
  for (const callback of observerCallbacks) callback([])
}

/** jsdom does no layout, so the scroll and client widths are stubbed to model an overflow. */
const setOverflow = (element, scrollWidth, clientWidth) => {
  Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true })
  Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true })
}

/** Mounts a component into a detached target and returns the element plus a teardown. */
const mountComponent = async (Component, props = {}) => {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const instance = mount(Component, { target, props })
  await tick()
  return {
    instance,
    target,
    unmount: () => {
      unmount(instance)
      target.remove()
    },
  }
}

/**
 * Client-side fixture harness for the interactive components (Accordion/Disclosure). It shares
 * the jsdom globals and Svelte client runtime installed by setupDom above, so both harnesses run
 * against one DOM. Components are compiled with `generate: 'client'` and their relative component
 * imports and the bare `svelte` specifier are rewritten to resolve from the cache directory.
 */
const ensureClientDom = () => ({ window: globalThis.window, dom: globalThis.document })

const clientCache = join(packageRoot, 'node_modules', '.cache', 'rocketship-svelte-client-tests')

/** Reads a component's raw source so it can be compiled for the client. */
const loadComponentSource = (name) => readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')

/**
 * Compiles a component (or a test fixture) with `generate: 'client'` and writes it to the cache.
 * Shared components use a stable file name so fixtures can import them by path; fixtures get a
 * unique name.
 */
const writeClientComponent = async (name, source, { stable = false } = {}) => {
  ensureClientDom()
  const clientEntry = pathToFileURL(
    join(
      dirname(require.resolve('svelte/package.json')),
      require('svelte/package.json').exports['.'].browser,
    ),
  ).href

  const { code } = await preprocess(source, vitePreprocess(), { filename: `${name}.svelte` })
  const { js } = compile(code, { generate: 'client', filename: `${name}.svelte` })

  const rewritten = js.code
    .replace(
      /(['"])\.\/([A-Za-z0-9_.]+)\.svelte\1/g,
      (_, quote, base) => `${quote}./${base}.compiled.mjs${quote}`,
    )
    .replace(/(['"])svelte\1/g, (_, quote) => `${quote}${clientEntry}${quote}`)

  mkdirSync(clientCache, { recursive: true })
  const file = join(
    clientCache,
    stable ? `${name}.compiled.mjs` : `${name}-${randomUUID()}.compiled.mjs`,
  )
  writeFileSync(file, rewritten)
  return file
}

const importClientComponent = async (file) => (await import(pathToFileURL(file).href)).default

const loadFixtureComponent = async (name, source, options) =>
  importClientComponent(await writeClientComponent(name, source, options))

const mountFixture = async (markup, script = '') => {
  const { window } = ensureClientDom()
  const clientEntry = pathToFileURL(
    join(
      dirname(require.resolve('svelte/package.json')),
      require('svelte/package.json').exports['.'].browser,
    ),
  ).href
  const { mount, flushSync } = await import(clientEntry)

  // Both components must exist on disk before either is imported, because the compiled
  // Accordion imports the compiled Disclosure at module link time.
  for (const name of ['Accordion', 'Disclosure']) {
    await writeClientComponent(name, loadComponentSource(name), { stable: true })
  }

  const Fixture = await loadFixtureComponent(
    `Fixture-${randomUUID()}`,
    `<script lang="ts">
  import Accordion from './Accordion.svelte'
  import Disclosure from './Disclosure.svelte'
  ${script}
</script>
${markup}`,
  )

  const target = window.document.createElement('div')
  window.document.body.appendChild(target)
  const instance = mount(Fixture, { target })
  flushSync()

  return {
    window,
    target,
    instance,
    flushSync,
    details: () => [...target.querySelectorAll('details')],
  }
}

/** Simulates a summary activation the way a keyboard or pointer user would trigger it. */
const activateSummary = (window, details, flushSync, key = 'Enter') => {
  const summary = details.querySelector('summary')
  const keydown = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  summary.dispatchEvent(keydown)
  summary.click()
  details.dispatchEvent(new window.Event('toggle', { bubbles: true }))
  flushSync()
  return keydown.defaultPrevented
}

/**
 * Mounts a fixture that composes the form controls with Field and Label, so the wiring Field
 * hands to a control can be exercised against the real components rather than a stub. The
 * controls are compiled to stable siblings first, because the fixture links them at import time.
 */
const mountControlFixture = async (markup, script = '') => {
  const { window } = ensureClientDom()
  const clientEntry = pathToFileURL(
    join(
      dirname(require.resolve('svelte/package.json')),
      require('svelte/package.json').exports['.'].browser,
    ),
  ).href
  const { mount, flushSync } = await import(clientEntry)

  for (const name of ['Field', 'Input', 'Label', 'Select', 'Textarea']) {
    await writeClientComponent(name, loadComponentSource(name), { stable: true })
  }

  const Fixture = await loadFixtureComponent(
    `ControlFixture-${randomUUID()}`,
    `<script lang="ts">
  import Field from './Field.svelte'
  import Input from './Input.svelte'
  import Label from './Label.svelte'
  import Select from './Select.svelte'
  import Textarea from './Textarea.svelte'
  ${script}
</script>
${markup}`,
  )

  const target = window.document.createElement('div')
  window.document.body.appendChild(target)
  const instance = mount(Fixture, { target })
  flushSync()

  return {
    window,
    target,
    instance,
    flushSync,
    input: () => target.querySelector('input'),
    textarea: () => target.querySelector('textarea'),
    select: () => target.querySelector('select'),
  }
}

/** Types into a control the way a user would, so the bound state is what the test reads. */
const typeInto = (window, element, next) => {
  element.value = next
  element.dispatchEvent(new window.Event('input', { bubbles: true }))
}

/** Picks an option the way the native dropdown does: the browser sets the value, then fires change. */
const chooseOption = (window, element, next) => {
  element.value = next
  element.dispatchEvent(new window.Event('change', { bubbles: true }))
}

const containerModifiers = [
  'rs-container--full-width',
  'rs-container--wide',
  'rs-container--content',
]

test('packages/svelte exports the Alert, Button, Card, Container, Grid, Stack and Typography subpaths like the Astro package', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const basePkg = JSON.parse(
    readFileSync(join(repoRoot, 'packages', 'base', 'package.json'), 'utf8'),
  )

  for (const name of ['Alert', 'Button', 'Card', 'Container', 'Grid', 'Stack', 'Typography']) {
    assert.equal(
      pkg.exports[`./components/${name}`],
      `./src/components/${name}.svelte`,
      `packages/svelte must export ./components/${name}`,
    )
    assert.ok(
      basePkg.exports[`./components/${name}`],
      `the Astro package must expose the same ./components/${name} key`,
    )
  }

  assert.ok(
    pkg.files.includes('src/components'),
    'src/components must be in files[] so the published tarball contains the Svelte components',
  )
})

test('packages/svelte exports Table from the barrel and as a subpath, without an Astro counterpart', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const basePkg = JSON.parse(
    readFileSync(join(repoRoot, 'packages', 'base', 'package.json'), 'utf8'),
  )
  const barrel = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  assert.equal(
    pkg.exports['./components/Table'],
    './src/components/Table.svelte',
    'packages/svelte must export ./components/Table',
  )
  assert.ok(
    !basePkg.exports?.['./components/Table'],
    'Table is Svelte-first, so the Astro package must not expose it yet',
  )
  assert.match(
    barrel,
    /export \{ default as Table \} from '\.\/components\/Table\.svelte'/,
    'the barrel must export the Table value',
  )
  assert.match(
    barrel,
    /export type \* from '\.\/components\/Table\.svelte'/,
    'the barrel must re-export the Table prop union types',
  )
})

test('Container renders .rs-container and only the modifier for each size', async () => {
  const Container = await loadComponent('Container')

  const cases = [
    { label: 'default (no prop)', props: {}, expected: [] },
    { label: 'default', props: { size: 'default' }, expected: [] },
    { label: 'full', props: { size: 'full' }, expected: ['rs-container--full-width'] },
    { label: 'wide', props: { size: 'wide' }, expected: ['rs-container--wide'] },
    { label: 'content', props: { size: 'content' }, expected: ['rs-container--content'] },
  ]

  for (const { label, props, expected } of cases) {
    const classes = classList(renderMarkup(Container, props))
    assert.ok(classes.includes('rs-container'), `Container ${label} must render .rs-container`)
    for (const modifier of containerModifiers) {
      if (expected.includes(modifier)) {
        assert.ok(classes.includes(modifier), `Container ${label} must render ${modifier}`)
      } else {
        assert.ok(!classes.includes(modifier), `Container ${label} must not render ${modifier}`)
      }
    }
  }
})

test('Container padded is independent of size and never implies a width modifier', async () => {
  const Container = await loadComponent('Container')

  const defaultClasses = classList(renderMarkup(Container, { padded: true }))
  assert.ok(defaultClasses.includes('rs-container'))
  assert.ok(defaultClasses.includes('rs-container--padded'))
  for (const modifier of containerModifiers) {
    assert.ok(!defaultClasses.includes(modifier), `padded alone must not add ${modifier}`)
  }

  const contentClasses = classList(renderMarkup(Container, { size: 'content', padded: true }))
  assert.ok(contentClasses.includes('rs-container--content'))
  assert.ok(contentClasses.includes('rs-container--padded'))

  const unpaddedClasses = classList(renderMarkup(Container, { size: 'content' }))
  assert.ok(!unpaddedClasses.includes('rs-container--padded'))
})

test('Container as renders the requested tag while keeping the block class', async () => {
  const Container = await loadComponent('Container')

  assert.ok(openingTag(renderMarkup(Container), 'div').startsWith('<div'))

  for (const tag of ['section', 'main', 'article', 'header', 'footer', 'nav']) {
    const markup = renderMarkup(Container, { as: tag })
    assert.ok(openingTag(markup, tag).length > 0, `Container as="${tag}" must render a <${tag}>`)
    assert.ok(!openingTag(markup, 'div'), `Container as="${tag}" must not render a <div>`)
    assert.ok(classList(markup, tag).includes('rs-container'))
  }
})

test('Container spreads native attributes and lets a consumer class compose with the block', async () => {
  const Container = await loadComponent('Container')

  const markup = renderMarkup(Container, {
    as: 'section',
    id: 'page',
    'data-region': 'main',
    class: 'consumer-class',
    children: snippet('<p>body</p>'),
  })

  const tag = openingTag(markup, 'section')
  assert.match(tag, /id="page"/)
  assert.match(tag, /data-region="main"/)
  assert.match(markup, /<p>body<\/p>/)

  const classes = classList(markup, 'section')
  assert.deepEqual(classes, ['rs-container', 'consumer-class'])
})

test('Typography renders .rs-typography around a children snippet', async () => {
  const Typography = await loadComponent('Typography')

  const markup = renderMarkup(Typography, { children: snippet('<h1>Title</h1>') })
  const classes = classList(markup)

  assert.deepEqual(classes, ['rs-typography'])
  assert.match(markup, /<h1>Title<\/h1>/)
})

test('Typography html renders raw markup and takes precedence over children', async () => {
  const Typography = await loadComponent('Typography')

  const markup = renderMarkup(Typography, {
    html: '<p class="intro-text">From html</p>',
    children: snippet('<p>From children</p>'),
  })

  assert.match(markup, /<p class="intro-text">From html<\/p>/)
  assert.doesNotMatch(markup, /From children/)
})

test('Typography as and class mirror the Astro component and spread native attributes', async () => {
  const Typography = await loadComponent('Typography')

  assert.ok(openingTag(renderMarkup(Typography), 'div').startsWith('<div'))

  for (const tag of ['section', 'article']) {
    const markup = renderMarkup(Typography, { as: tag, class: 'consumer-class', lang: 'en' })
    const classes = classList(markup, tag)
    assert.deepEqual(classes, ['rs-typography', 'consumer-class'])
    assert.match(openingTag(markup, tag), /lang="en"/)
  }
})

/** Compiles a `<style lang="scss">` body through the real Vite Sass pipeline. */
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

/** Extracts the `<style>` body from a component so its rules can be compiled directly. */
const styleBlockOf = (name) => {
  const source = readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')
  return source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''
}

test('Container styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Container'))

  for (const selector of [
    '.rs-container',
    '.rs-container--content',
    '.rs-container--wide',
    '.rs-container--full-width',
    '.rs-container--padded',
    '.rs-container--no-gutters',
  ]) {
    assert.ok(css.includes(selector), `compiled Container CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@media\s*\(min-width:\s*992px\)/,
    'the content modifier keeps the lg breakpoint from media-breakpoint-up',
  )
})

test('Typography styles compile through the shared barrel and keep the Astro element rules', async () => {
  const css = await compileStyleBlock(styleBlockOf('Typography'))

  for (const selector of ['.rs-typography', '.rs-typography h1', '.rs-typography a']) {
    assert.ok(css.includes(selector), `compiled Typography CSS must contain ${selector}`)
  }
  assert.ok(
    css.includes('.rs-typography .intro-text'),
    'the intro-text element rule must be preserved',
  )
})

test('Button renders .rs-button with exactly one variant and one size modifier', async () => {
  const Button = await loadComponent('Button')

  const variants = ['primary', 'secondary', 'ghost']
  const sizes = ['small', 'medium', 'large']
  const modifiers = [
    ...variants.map((v) => `rs-button--${v}`),
    ...sizes.map((s) => `rs-button--${s}`),
  ]

  for (const variant of variants) {
    for (const size of sizes) {
      const classes = classList(renderMarkup(Button, { variant, size }), 'button')
      assert.deepEqual(classes, ['rs-button', `rs-button--${variant}`, `rs-button--${size}`])
      for (const modifier of modifiers) {
        const expected = modifier === `rs-button--${variant}` || modifier === `rs-button--${size}`
        assert.equal(
          classes.includes(modifier),
          expected,
          `Button ${variant}/${size} must ${expected ? '' : 'not '}render ${modifier}`,
        )
      }
    }
  }
})

test('Button defaults to a primary medium button and honours the type attribute', async () => {
  const Button = await loadComponent('Button')

  const defaultTag = openingTag(renderMarkup(Button), 'button')
  assert.ok(defaultTag.startsWith('<button'), 'Button defaults to the button tag')
  assert.match(defaultTag, /type="button"/, 'Button defaults to type="button"')
  assert.deepEqual(classList(renderMarkup(Button), 'button'), [
    'rs-button',
    'rs-button--primary',
    'rs-button--medium',
  ])

  for (const type of ['submit', 'reset']) {
    assert.match(
      openingTag(renderMarkup(Button, { type }), 'button'),
      new RegExp(`type="${type}"`),
      `Button type="${type}" must reach the native attribute`,
    )
  }
})

test('Button disabled disables the native button and composes a consumer class', async () => {
  const Button = await loadComponent('Button')

  const markup = renderMarkup(Button, { disabled: true, class: 'consumer-class' })
  const tag = openingTag(markup, 'button')

  assert.match(tag, /\bdisabled\b/, 'disabled must render the native disabled attribute')
  assert.deepEqual(classList(markup, 'button'), [
    'rs-button',
    'rs-button--primary',
    'rs-button--medium',
    'consumer-class',
  ])
})

test('Button href or as="a" renders a disabled-aware link, never a button', async () => {
  const Button = await loadComponent('Button')

  const linkMarkup = renderMarkup(Button, { href: '/docs' })
  assert.ok(!openingTag(linkMarkup, 'button'), 'a href must not render a <button>')
  assert.match(openingTag(linkMarkup, 'a'), /href="\/docs"/)

  const disabledMarkup = renderMarkup(Button, { href: '/docs', disabled: true })
  const disabledTag = openingTag(disabledMarkup, 'a')
  assert.match(disabledTag, /aria-disabled="true"/, 'disabled link exposes aria-disabled')
  assert.match(disabledTag, /role="link"/, 'disabled link keeps an explicit role')
  assert.match(disabledTag, /tabindex="-1"/, 'disabled link is removed from tab order')
  assert.doesNotMatch(disabledTag, /href=/, 'disabled link drops href')
  assert.deepEqual(classList(disabledMarkup, 'a'), [
    'rs-button',
    'rs-button--primary',
    'rs-button--medium',
  ])

  const asMarkup = renderMarkup(Button, { as: 'a' })
  assert.ok(!openingTag(asMarkup, 'button'), 'as="a" must not render a <button>')
  assert.match(openingTag(asMarkup, 'a'), /href="#"/, 'an enabled link falls back to href="#"')
})

test('Button styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Button'))

  for (const selector of [
    '.rs-button',
    '.rs-button--secondary',
    '.rs-button--ghost',
    '.rs-button--small',
    '.rs-button--medium',
    '.rs-button--large',
  ]) {
    assert.ok(css.includes(selector), `compiled Button CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'Button sizes must restate through the sm container query',
  )
})

test('Card renders the block plus body/content wrappers and no media band by default', async () => {
  const Card = await loadComponent('Card')

  const markup = renderMarkup(Card, { children: snippet('<p>Body</p>') })

  assert.deepEqual(classList(markup, 'article'), ['rs-card'])
  assert.ok(markup.includes('rs-card__body'), 'Card always renders the body wrapper')
  assert.ok(markup.includes('rs-card__content'), 'Card always renders the content wrapper')
  assert.ok(!markup.includes('rs-card__media'), 'Card omits the media band when media is absent')
  assert.ok(!markup.includes('rs-card__meta'), 'Card omits the meta row when meta is absent')
})

test('Card renders media and meta wrappers only when their snippets are provided', async () => {
  const Card = await loadComponent('Card')

  const mediaMarkup = renderMarkup(Card, { media: snippet('<img alt="" src="x.png" />') })
  assert.ok(mediaMarkup.includes('rs-card__media'), 'media snippet renders the media band')
  assert.match(mediaMarkup, /<img[^>]*src="x\.png"/)

  const metaMarkup = renderMarkup(Card, { meta: snippet('<span>Tag</span>') })
  assert.ok(metaMarkup.includes('rs-card__meta'), 'meta snippet renders the meta row')
  assert.ok(!metaMarkup.includes('rs-card__media'), 'a meta-only card keeps the media band off')

  const fullMarkup = renderMarkup(Card, {
    media: snippet('<img alt="" src="x.png" />'),
    meta: snippet('<span>Tag</span>'),
    children: snippet('<p>Body</p>'),
  })
  assert.ok(fullMarkup.indexOf('rs-card__media') < fullMarkup.indexOf('rs-card__body'))
  assert.ok(fullMarkup.indexOf('rs-card__body') < fullMarkup.indexOf('rs-card__meta'))
})

test('Card as and class mirror the Astro component and spread native attributes', async () => {
  const Card = await loadComponent('Card')

  for (const tag of ['section', 'div', 'li']) {
    const markup = renderMarkup(Card, { as: tag, class: 'consumer-class', id: 'card-1' })
    assert.ok(openingTag(markup, tag).length > 0, `Card as="${tag}" must render a <${tag}>`)
    assert.ok(!openingTag(markup, 'article'), `Card as="${tag}" must not render an <article>`)
    assert.deepEqual(classList(markup, tag), ['rs-card', 'consumer-class'])
    assert.match(openingTag(markup, tag), /id="card-1"/)
  }
})

test('Card styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Card'))

  for (const selector of [
    '.rs-card',
    '.rs-card__media',
    '.rs-card__body',
    '.rs-card__content',
    '.rs-card__meta',
    '.rs-card__title',
    '.rs-card__description',
    '.rs-card__token',
  ]) {
    assert.ok(css.includes(selector), `compiled Card CSS must contain ${selector}`)
  }
})

test('Grid renders .rs-grid with exactly the column modifier for each column count', async () => {
  const Grid = await loadComponent('Grid')

  const cases = [
    { columns: 2, expected: [] },
    { columns: 3, expected: ['rs-grid--3-cols'] },
    { columns: 4, expected: ['rs-grid--4-cols'] },
  ]
  const allModifiers = ['rs-grid--3-cols', 'rs-grid--4-cols']

  for (const { columns, expected } of cases) {
    const classes = classList(renderMarkup(Grid, { columns }))
    assert.deepEqual(classes, ['rs-grid', ...expected], `Grid columns=${columns} class list`)
    for (const modifier of allModifiers) {
      assert.equal(
        classes.includes(modifier),
        expected.includes(modifier),
        `Grid columns=${columns} must ${expected.includes(modifier) ? '' : 'not '}render ${modifier}`,
      )
    }
  }

  assert.deepEqual(classList(renderMarkup(Grid)), ['rs-grid'], 'Grid defaults to two columns')
})

test('Grid as renders a list while keeping the block class and spreads native attributes', async () => {
  const Grid = await loadComponent('Grid')

  assert.ok(openingTag(renderMarkup(Grid), 'div').startsWith('<div'))

  for (const tag of ['ul', 'ol']) {
    const markup = renderMarkup(Grid, {
      as: tag,
      columns: 3,
      class: 'consumer-class',
      'data-region': 'cards',
      children: snippet('<li>Item</li>'),
    })
    assert.ok(openingTag(markup, tag).length > 0, `Grid as="${tag}" must render a <${tag}>`)
    assert.ok(!openingTag(markup, 'div'), `Grid as="${tag}" must not render a <div>`)
    assert.deepEqual(classList(markup, tag), ['rs-grid', 'rs-grid--3-cols', 'consumer-class'])
    assert.match(openingTag(markup, tag), /data-region="cards"/)
    assert.match(markup, /<li>Item<\/li>/)
  }
})

test('Grid styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Grid'))

  for (const selector of ['.rs-grid', '.rs-grid--3-cols', '.rs-grid--4-cols']) {
    assert.ok(css.includes(selector), `compiled Grid CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'the base grid restates two columns at the sm container query',
  )
  assert.match(
    css,
    /@container\s*\(min-width:\s*700px\)/,
    'the 3/4 column modifiers restate at the md container query',
  )
})

test('Alert renders .rs-alert and emits no modifier for the default info variant', async () => {
  const Alert = await loadComponent('Alert')

  assert.deepEqual(
    classList(renderMarkup(Alert)),
    ['rs-alert'],
    'info is the base class, no modifier',
  )
  assert.deepEqual(classList(renderMarkup(Alert, { variant: 'info' })), ['rs-alert'])

  const modifiers = ['rs-alert--info', 'rs-alert--success', 'rs-alert--warning', 'rs-alert--error']
  for (const variant of ['success', 'warning', 'error']) {
    const classes = classList(renderMarkup(Alert, { variant }))
    assert.deepEqual(classes, ['rs-alert', `rs-alert--${variant}`], `Alert ${variant} class list`)
    for (const modifier of modifiers) {
      assert.equal(
        classes.includes(modifier),
        modifier === `rs-alert--${variant}`,
        `Alert ${variant} must ${modifier === `rs-alert--${variant}` ? '' : 'not '}render ${modifier}`,
      )
    }
  }
})

test('Alert is always a div and takes no as prop, mirroring the Astro original', async () => {
  const Alert = await loadComponent('Alert')
  const source = loadComponentSource('Alert')

  assert.ok(openingTag(renderMarkup(Alert), 'div').startsWith('<div'), 'the root is a div')
  assert.doesNotMatch(
    source,
    /export type AlertTag/,
    'Alert has no tag union, so it takes no as prop',
  )
  assert.doesNotMatch(
    source,
    /svelte:element/,
    'the root is a fixed div, not a polymorphic element',
  )
})

test('Alert takes an opt-in role with no default and never derives it from the variant', async () => {
  const Alert = await loadComponent('Alert')

  for (const variant of ['info', 'success', 'warning', 'error']) {
    assert.doesNotMatch(
      openingTag(renderMarkup(Alert, { variant }), 'div'),
      /role=/,
      `Alert ${variant} must render no role of its own`,
    )
  }

  for (const role of ['alert', 'status', 'note']) {
    assert.match(
      openingTag(renderMarkup(Alert, { role }), 'div'),
      new RegExp(`role="${role}"`),
      `Alert must forward the ${role} role the consumer opts into`,
    )
  }
})

test('Alert renders consumer content directly, with no title prop, snippet or body wrapper', async () => {
  const Alert = await loadComponent('Alert')

  const markup = visible(
    renderMarkup(Alert, {
      children: snippet(
        '<h3 class="rs-alert__title">Saved</h3><p class="rs-alert__description">Body</p>',
      ),
    }),
  )

  assert.match(markup, /<h3 class="rs-alert__title">Saved<\/h3>/)
  assert.match(markup, /<p class="rs-alert__description">Body<\/p>/)
  assert.ok(
    markup.indexOf('<h3') < markup.indexOf('<p'),
    'the consumer content renders in the order it was written',
  )
  assert.doesNotMatch(markup, /rs-alert__body/, 'Alert renders no content wrapper of its own')

  const source = loadComponentSource('Alert')
  assert.doesNotMatch(
    source,
    /title\??:/,
    'Alert takes no title prop, which would shadow the native attribute',
  )
  assert.doesNotMatch(
    source,
    /titleSlot/,
    'Alert takes no title snippet; the consumer writes the element',
  )
  assert.doesNotMatch(source, /<h[1-6]/, 'Alert never hard-codes a heading level')
})

test('Alert composes a consumer class and spreads native attributes onto the div', async () => {
  const Alert = await loadComponent('Alert')

  const markup = renderMarkup(Alert, {
    variant: 'success',
    class: 'consumer-class',
    id: 'alert-1',
    'data-region': 'banner',
  })
  const tag = openingTag(markup, 'div')

  assert.deepEqual(classList(markup), ['rs-alert', 'rs-alert--success', 'consumer-class'])
  assert.match(tag, /id="alert-1"/)
  assert.match(tag, /data-region="banner"/)
})

test('Alert styles compile through the shared barrel with the Astro rule block and no container queries', async () => {
  const source = styleBlockOf('Alert')
  const css = await compileStyleBlock(source)

  for (const selector of [
    '.rs-alert',
    '.rs-alert--success',
    '.rs-alert--warning',
    '.rs-alert--error',
    '.rs-alert__title',
    '.rs-alert__description',
  ]) {
    assert.ok(css.includes(selector), `compiled Alert CSS must contain ${selector}`)
  }

  assert.ok(!css.includes('.rs-alert--info'), 'the default variant has no modifier rule')
  assert.ok(!css.includes('rs-alert__body'), 'the body wrapper is gone from the styles too')
  assert.ok(!/@container/.test(css), 'Alert has one comfortable size, so no container queries')
  assert.ok(!/@media\s*\(min-width/.test(css), 'Alert uses no viewport media queries either')
  assert.ok(!/font-family/.test(css), 'components never set font-family')
  assert.match(css, /font-size:\s*inherit/, 'the title class cancels tag defaults with inherit')
  assert.match(
    css,
    /--rs-alert-bg:\s*var\(--rs-color-surface-elevated,/,
    'every token reaches the stylesheet through rs-token()',
  )
  assert.deepEqual(
    [...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([hex]) => hex),
    [],
    'Alert names tokens only, never a hex literal',
  )
})

test('Stack is exported from the barrel, as a subpath, with its prop union types', async () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const basePkg = JSON.parse(
    readFileSync(join(repoRoot, 'packages', 'base', 'package.json'), 'utf8'),
  )
  const barrel = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  assert.equal(pkg.exports['./components/Stack'], './src/components/Stack.svelte')
  assert.equal(
    basePkg.exports?.['./components/Stack'],
    './src/components/Stack.astro',
    'Stack is a port, so the import path matches the Astro entry',
  )
  assert.match(barrel, /export \{ default as Stack \} from '\.\/components\/Stack\.svelte'/)
  assert.match(barrel, /export type \* from '\.\/components\/Stack\.svelte'/)

  const source = loadComponentSource('Stack')
  assert.match(source, /export type StackTag = 'div' \| 'ul' \| 'ol'/)
  assert.match(source, /export type StackGap = 'small' \| 'medium' \| 'large'/)
})

test('Stack renders .rs-stack on a div with no gap modifier for the default medium gap', async () => {
  const Stack = await loadComponent('Stack')

  assert.deepEqual(
    classList(renderMarkup(Stack)),
    ['rs-stack'],
    'medium is the base class, no modifier',
  )
  assert.deepEqual(classList(renderMarkup(Stack, { gap: 'medium' })), ['rs-stack'])

  for (const gap of ['small', 'large']) {
    assert.deepEqual(classList(renderMarkup(Stack, { gap })), ['rs-stack', `rs-stack--${gap}`])
  }
})

test('Stack as renders the requested tag and adds role="list" for ul and ol only', async () => {
  const Stack = await loadComponent('Stack')

  assert.doesNotMatch(openingTag(renderMarkup(Stack), 'div'), /role=/, 'a div needs no role')

  for (const tag of ['ul', 'ol']) {
    const markup = renderMarkup(Stack, {
      as: tag,
      gap: 'large',
      class: 'consumer-class',
      children: snippet('<li>Item</li>'),
    })
    assert.ok(openingTag(markup, tag).length > 0, `Stack as="${tag}" must render a <${tag}>`)
    assert.match(
      openingTag(markup, tag),
      /role="list"/,
      `Stack as="${tag}" must keep list semantics, because list-style: none drops them in Safari`,
    )
    assert.deepEqual(classList(markup, tag), ['rs-stack', 'rs-stack--large', 'consumer-class'])
    assert.match(markup, /<li>Item<\/li>/)
  }
})

test('Stack spreads native attributes onto the root', async () => {
  const Stack = await loadComponent('Stack')

  const markup = renderMarkup(Stack, { as: 'div', id: 'team', 'data-region': 'list' })
  const tag = openingTag(markup, 'div')

  assert.match(tag, /id="team"/)
  assert.match(tag, /data-region="list"/)
})

test('Stack styles compile through the shared barrel and mirror the Astro rule block', async () => {
  const source = styleBlockOf('Stack')
  const css = await compileStyleBlock(source)

  for (const selector of ['.rs-stack', '.rs-stack--small', '.rs-stack--large']) {
    assert.ok(css.includes(selector), `compiled Stack CSS must contain ${selector}`)
  }

  assert.match(css, /--rs-stack-gap:\s*var\(--rs-space-4,/, 'medium reads the space-4 token')
  assert.match(css, /\.rs-stack--small\s*\{\s*--rs-stack-gap:\s*var\(--rs-space-2,/, 'small is 8px')
  assert.match(
    css,
    /\.rs-stack--large\s*\{\s*--rs-stack-gap:\s*var\(--rs-space-6,/,
    'large is 24px',
  )
  assert.ok(!css.includes('.rs-stack--medium'), 'medium has no modifier rule')
  assert.match(
    css,
    /list-style:\s*none/,
    'the list marker is removed, which is why role=list is added',
  )
  assert.deepEqual(
    [...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([hex]) => hex),
    [],
    'Stack names tokens only, never a hex literal',
  )
})

const tableModifiers = ['rs-table--striped', 'rs-table--compact', 'rs-table--hover']

const tableRows = (rows) =>
  `<thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead><tbody>${rows
    .map(([name, role]) => `<tr><td>${name}</td><td>${role}</td></tr>`)
    .join('')}</tbody>`

test('Table renders .rs-table-holder around .rs-table with only the modifiers that were set', async () => {
  const Table = await loadComponent('Table')

  const cases = [
    { label: 'no modifiers', props: {}, expected: [] },
    { label: 'striped', props: { striped: true }, expected: ['rs-table--striped'] },
    { label: 'compact', props: { compact: true }, expected: ['rs-table--compact'] },
    { label: 'hover', props: { hover: true }, expected: ['rs-table--hover'] },
    {
      label: 'striped + compact + hover',
      props: { striped: true, compact: true, hover: true },
      expected: tableModifiers,
    },
    {
      label: 'explicit false',
      props: { striped: false, compact: false, hover: false },
      expected: [],
    },
  ]

  for (const { label, props, expected } of cases) {
    const markup = renderMarkup(Table, { ...props, children: snippet(tableRows([])) })

    assert.ok(
      openingTag(markup, 'div').includes('rs-table-holder'),
      `Table ${label} must wrap the table in .rs-table-holder`,
    )
    assert.ok(
      markup.indexOf('<div') < markup.indexOf('<table'),
      `Table ${label} must render the holder before the table`,
    )

    const classes = classList(markup, 'table')
    assert.ok(classes.includes('rs-table'), `Table ${label} must render .rs-table`)
    for (const modifier of tableModifiers) {
      assert.equal(
        classes.includes(modifier),
        expected.includes(modifier),
        `Table ${label} must ${expected.includes(modifier) ? '' : 'not '}render ${modifier}`,
      )
    }
  }
})

test('Table puts consumer classes on the holder and never on the table, per the Svelte rules', async () => {
  const Table = await loadComponent('Table')

  const markup = renderMarkup(Table, {
    striped: true,
    class: 'consumer-class',
    children: snippet(tableRows([])),
  })

  assert.deepEqual(classList(markup, 'div'), ['rs-table-holder', 'consumer-class'])
  assert.deepEqual(classList(markup, 'table'), ['rs-table', 'rs-table--striped'])
})

test('Table renders the caption inside the table so it is exposed as the table name', async () => {
  const Table = await loadComponent('Table')

  const withCaption = renderMarkup(Table, {
    caption: 'Quarterly revenue by region',
    children: snippet(tableRows([])),
  })
  const captionIndex = withCaption.indexOf('<caption>')
  const closeTableIndex = withCaption.indexOf('</table>')

  assert.ok(captionIndex > -1, 'a caption prop must render a <caption>')
  assert.ok(
    captionIndex < closeTableIndex,
    'the caption must sit inside the table so assistive tech reads it as the table name',
  )
  assert.match(withCaption, /<caption>Quarterly revenue by region<\/caption>/)
  assert.equal((withCaption.match(/<caption>/g) ?? []).length, 1)

  const withoutCaption = renderMarkup(Table, { children: snippet(tableRows([])) })
  assert.ok(!withoutCaption.includes('<caption>'), 'no caption prop must render no <caption>')
  assert.ok(
    !openingTag(withCaption, 'table').includes('<caption>'),
    'the caption must not leak into the table tag itself',
  )
})

test('Table treats a blank caption as absent so no empty name reaches the table', async () => {
  const Table = await loadComponent('Table')

  for (const caption of ['', '   ', '\n\t']) {
    const markup = renderMarkup(Table, { caption, children: snippet(tableRows([])) })
    assert.ok(
      !markup.includes('<caption>'),
      `caption ${JSON.stringify(caption)} must not render an empty <caption>`,
    )
  }
})

test('Table spreads native attributes onto the holder while children render inside the table', async () => {
  const Table = await loadComponent('Table')

  const markup = renderMarkup(Table, {
    id: 'revenue',
    'data-region': 'finance',
    children: snippet(tableRows([['Ada Lovelace', 'Engineer']])),
  })

  const holder = openingTag(markup, 'div')
  assert.match(holder, /id="revenue"/)
  assert.match(holder, /data-region="finance"/)
  assert.ok(
    markup.includes('<td>Ada Lovelace</td>'),
    'children must render inside the table, standing in for thead/tbody',
  )
  assert.ok(
    !openingTag(markup, 'table').includes('id="revenue"'),
    'the table must not take the attributes the holder owns',
  )
})

test('Table as renders the requested holder tag while keeping the block class', async () => {
  const Table = await loadComponent('Table')

  assert.ok(openingTag(renderMarkup(Table, { children: snippet('') }), 'div').startsWith('<div'))

  const section = renderMarkup(Table, { as: 'section', children: snippet('') })
  assert.ok(openingTag(section, 'section').length > 0, 'as="section" must render a <section>')
  assert.ok(!openingTag(section, 'div'), 'as="section" must not also render a <div>')
  assert.ok(classList(section, 'section').includes('rs-table-holder'))
})

test('Table server-renders no scroll-region semantics, because nothing has been measured yet', async () => {
  const Table = await loadComponent('Table')

  const markup = renderMarkup(Table, {
    caption: 'Quarterly revenue by region',
    children: snippet(tableRows([])),
  })

  const holder = openingTag(markup, 'div')
  assert.ok(!/role="/.test(holder), 'SSR must not claim a region before measuring an overflow')
  assert.ok(!/tabindex/.test(holder), 'SSR must not add a tab stop before measuring an overflow')
})

test('Table makes the holder keyboard-scrollable only while it overflows, and clears it again', async () => {
  const Table = await loadClientComponent('Table')

  const { target, unmount: teardown } = await mountComponent(Table, {
    caption: 'Quarterly revenue by region',
    children: clientSnippet(tableRows([['Ada Lovelace', 'Engineer']])),
  })

  try {
    const holder = target.querySelector('.rs-table-holder')
    assert.ok(holder, 'the holder must be rendered')

    assert.equal(holder.getAttribute('role'), null, 'a table that fits is not a scroll region')
    assert.equal(holder.getAttribute('tabindex'), null, 'a table that fits stays out of tab order')
    assert.equal(holder.getAttribute('aria-label'), null, 'a table that fits needs no region name')

    setOverflow(holder, 900, 300)
    resize()
    await tick()

    assert.equal(holder.getAttribute('tabindex'), '0', 'an overflowing holder must be tabbable')
    assert.equal(holder.getAttribute('role'), 'region', 'an overflowing holder must be a region')
    assert.equal(
      holder.getAttribute('aria-label'),
      'Quarterly revenue by region',
      'the region must be named from the caption',
    )

    setOverflow(holder, 300, 300)
    resize()
    await tick()

    assert.equal(holder.getAttribute('role'), null, 'the region role must be removed when it fits')
    assert.equal(holder.getAttribute('tabindex'), null, 'the tab stop must be removed when it fits')
  } finally {
    teardown()
  }
})

test('Table names the scroll region from label first, then caption, then a generic name', async () => {
  const Table = await loadClientComponent('Table')

  const cases = [
    {
      label: 'label wins',
      props: { label: 'Revenue', caption: 'Caption text' },
      expected: 'Revenue',
    },
    { label: 'caption fallback', props: { caption: 'Caption text' }, expected: 'Caption text' },
    { label: 'generic fallback', props: {}, expected: 'Table' },
    {
      label: 'blank label falls through',
      props: { label: '  ', caption: 'Caption text' },
      expected: 'Caption text',
    },
  ]

  for (const { label, props, expected } of cases) {
    const { target, unmount: teardown } = await mountComponent(Table, {
      ...props,
      children: clientSnippet(tableRows([])),
    })
    try {
      const holder = target.querySelector('.rs-table-holder')
      setOverflow(holder, 900, 300)
      resize()
      await tick()
      assert.equal(holder.getAttribute('aria-label'), expected, `${label}: wrong region name`)
    } finally {
      teardown()
    }
  }
})

test('Table keeps a consumer-supplied role, tabindex and label instead of overwriting them', async () => {
  const Table = await loadClientComponent('Table')

  const { target, unmount: teardown } = await mountComponent(Table, {
    role: 'group',
    tabindex: -1,
    'aria-label': 'Custom name',
    caption: 'Quarterly revenue by region',
    children: clientSnippet(tableRows([])),
  })

  try {
    const holder = target.querySelector('.rs-table-holder')
    setOverflow(holder, 900, 300)
    resize()
    await tick()

    assert.equal(holder.getAttribute('role'), 'group', 'an explicit role must survive')
    assert.equal(holder.getAttribute('tabindex'), '-1', 'an explicit tabindex must survive')
    assert.equal(holder.getAttribute('aria-label'), 'Custom name', 'an explicit label must survive')
  } finally {
    teardown()
  }
})

test('Table re-measures on resize, so a holder that shrinks later becomes scrollable', async () => {
  const Table = await loadClientComponent('Table')

  const { target, unmount: teardown } = await mountComponent(Table, {
    children: clientSnippet(tableRows([['Ada Lovelace', 'Engineer']])),
  })

  try {
    const holder = target.querySelector('.rs-table-holder')
    setOverflow(holder, 400, 400)
    resize()
    await tick()
    assert.equal(holder.getAttribute('tabindex'), null, 'no tab stop while the table fits')

    setOverflow(holder, 1200, 400)
    resize()
    await tick()
    assert.equal(holder.getAttribute('tabindex'), '0', 'the tab stop appears once it overflows')
    assert.equal(
      holder.getAttribute('aria-label'),
      'Table',
      'an unnamed region falls back to Table',
    )

    setOverflow(holder, 400, 1200)
    resize()
    await tick()
    assert.equal(
      holder.getAttribute('tabindex'),
      null,
      'growing past the content clears the tab stop',
    )
  } finally {
    teardown()
  }
})

test('Table stops observing once unmounted, so a late resize cannot touch a detached holder', async () => {
  const Table = await loadClientComponent('Table')

  const { target, unmount: teardown } = await mountComponent(Table, {
    children: clientSnippet(tableRows([])),
  })
  const holder = target.querySelector('.rs-table-holder')
  setOverflow(holder, 900, 300)
  resize()
  await tick()
  assert.equal(holder.getAttribute('tabindex'), '0', 'precondition: the holder overflows')

  teardown()

  assert.equal(observerCallbacks.size, 0, 'unmounting must disconnect the ResizeObserver')
  assert.doesNotThrow(() => resize(), 'firing a resize after teardown must be a no-op')
})

test('Table styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Table'))

  for (const selector of [
    '.rs-table-holder',
    '.rs-table',
    '.rs-table--striped',
    '.rs-table--compact',
    '.rs-table--hover',
    '.rs-table caption',
  ]) {
    assert.ok(css.includes(selector), `compiled Table CSS must contain ${selector}`)
  }

  assert.ok(
    !/@media/.test(css),
    'Table has no size variants, so it must not reach for viewport media queries',
  )
})

/** Builds a `children` snippet that renders the wiring Field hands to the control. */
const controlSnippet = () =>
  createRawSnippet((wiring) => ({
    render: () => {
      const props = wiring()
      const describedBy = props['aria-describedby']
      const invalid = props['aria-invalid']
      return [
        '<input',
        ` id="${props.id}"`,
        describedBy ? ` aria-describedby="${describedBy}"` : '',
        invalid ? ` aria-invalid="${invalid}"` : '',
        props.required ? ' required' : '',
        props.disabled ? ' disabled' : '',
        ' />',
      ].join('')
    },
  }))

/** Reads an attribute value off the first tag that carries it. */
const attributeValue = (markup, name) =>
  markup.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? undefined

test('Label renders .rs-label, defaults to <label> and only forwards for on a real label', async () => {
  const Label = await loadComponent('Label')

  const markup = renderMarkup(Label, { for: 'email', children: snippet('Email') })
  const tag = openingTag(markup, 'label')
  assert.ok(tag.startsWith('<label'), 'Label defaults to the label tag')
  assert.match(tag, /for="email"/)
  assert.deepEqual(classList(markup, 'label'), ['rs-label'])
  assert.match(markup, />Email</)

  for (const nonLabelTag of ['span', 'div']) {
    const nonLabel = renderMarkup(Label, { as: nonLabelTag, for: 'email' })
    assert.ok(
      openingTag(nonLabel, nonLabelTag).length > 0,
      `Label as="${nonLabelTag}" must render a <${nonLabelTag}>`,
    )
    assert.doesNotMatch(
      openingTag(nonLabel, nonLabelTag),
      /for=/,
      `Label as="${nonLabelTag}" must not render for — only a real label can own it`,
    )
    assert.ok(classList(nonLabel, nonLabelTag).includes('rs-label'))
  }
})

test('Label required and optional markers stay inside the label element', async () => {
  const Label = await loadComponent('Label')

  const required = renderMarkup(Label, { required: true, children: snippet('Email') })
  assert.match(required, /<span class="rs-label__required" aria-hidden="true">\*<\/span>/)
  assert.match(required, /<span class="rs-label__sr-only">\(required\)<\/span>/)
  assert.doesNotMatch(required, /rs-label__optional/)

  const optional = renderMarkup(Label, { optional: true, children: snippet('Phone') })
  assert.match(optional, /<span class="rs-label__optional">\(optional\)<\/span>/)
  assert.doesNotMatch(optional, /rs-label__required/)

  const both = renderMarkup(Label, { required: true, optional: true, children: snippet('Email') })
  assert.match(both, /rs-label__required/, 'required wins when both are set')
  assert.doesNotMatch(
    both,
    /rs-label__optional/,
    'required and optional are exclusive — never both',
  )

  const custom = renderMarkup(Label, {
    required: true,
    requiredText: '(must fill)',
    optionalText: '(nice to have)',
  })
  assert.match(custom, /<span class="rs-label__sr-only">\(must fill\)<\/span>/)

  const customOptional = renderMarkup(Label, {
    optional: true,
    requiredText: '(must fill)',
    optionalText: '(nice to have)',
  })
  assert.match(customOptional, /<span class="rs-label__optional">\(nice to have\)<\/span>/)

  const plain = renderMarkup(Label, { children: snippet('Notes') })
  assert.doesNotMatch(plain, /rs-label__required/)
  assert.doesNotMatch(plain, /rs-label__optional/)
})

test('Label composes a consumer class and spreads native attributes', async () => {
  const Label = await loadComponent('Label')

  const markup = renderMarkup(Label, {
    class: 'consumer-class',
    id: 'email-label',
    'data-test': 'label',
    children: snippet('Email'),
  })

  assert.deepEqual(classList(markup, 'label'), ['rs-label', 'consumer-class'])
  const tag = openingTag(markup, 'label')
  assert.match(tag, /id="email-label"/)
  assert.match(tag, /data-test="label"/)
})

test('Field renders the label, control, hint and error blocks it is given', async () => {
  const Field = await loadComponent('Field')

  const markup = renderMarkup(Field, {
    label: 'Email',
    hint: 'We only use this to reach you.',
    error: 'Enter a valid address.',
    children: controlSnippet(),
  })

  assert.ok(classList(markup).includes('rs-field'))
  assert.match(markup, /class="rs-field__label"/)
  assert.match(markup, /class="rs-field__control"/)
  assert.match(markup, /class="rs-field__hint"/)
  assert.match(markup, /class="rs-field__error"/)
  assert.match(markup, /We only use this to reach you\./)
  assert.match(markup, /Enter a valid address\./)

  const bare = renderMarkup(Field, { children: controlSnippet() })
  assert.doesNotMatch(bare, /rs-field__label/)
  assert.doesNotMatch(bare, /rs-field__hint/)
  assert.doesNotMatch(bare, /rs-field__error/)
  assert.match(bare, /class="rs-field__control"/)
})

test('Field generates an id, links the label to the control and derives hint and error ids', async () => {
  const Field = await loadComponent('Field')

  const markup = renderMarkup(Field, {
    label: 'Email',
    hint: 'Helper',
    error: 'Problem',
    children: controlSnippet(),
  })

  const controlId = attributeValue(openingTag(markup, 'input'), 'id')
  assert.match(controlId, /^rs-field-/, 'a missing id must be generated with the rs-field prefix')

  assert.equal(
    attributeValue(openingTag(markup, 'label'), 'for'),
    controlId,
    'the generated label for must match the control id',
  )

  const hintTag = markup.match(/<div class="rs-field__hint" id="([^"]*)"/)?.[1]
  const errorTag = markup.match(/<div class="rs-field__error" id="([^"]*)"/)?.[1]
  assert.equal(hintTag, `${controlId}-hint`)
  assert.equal(errorTag, `${controlId}-error`)

  const describedBy = attributeValue(openingTag(markup, 'input'), 'aria-describedby')
  assert.equal(describedBy, `${controlId}-hint ${controlId}-error`)
})

test('Field respects an explicit id and explicit hint and error ids', async () => {
  const Field = await loadComponent('Field')

  const markup = renderMarkup(Field, {
    id: 'account-email',
    hintId: 'account-email-help',
    errorId: 'account-email-error',
    label: 'Email',
    hint: 'Helper',
    error: 'Problem',
    children: controlSnippet(),
  })

  assert.equal(attributeValue(openingTag(markup, 'input'), 'id'), 'account-email')
  assert.equal(attributeValue(openingTag(markup, 'label'), 'for'), 'account-email')
  assert.match(markup, /class="rs-field__hint" id="account-email-help"/)
  assert.match(markup, /class="rs-field__error" id="account-email-error"/)
  assert.equal(
    attributeValue(openingTag(markup, 'input'), 'aria-describedby'),
    'account-email-help account-email-error',
  )

  const derived = renderMarkup(Field, {
    id: 'account-email',
    label: 'Email',
    hint: 'Helper',
    error: 'Problem',
    children: controlSnippet(),
  })
  assert.equal(
    attributeValue(derived, 'aria-describedby'),
    'account-email-hint account-email-error',
  )
})

test('Field only lists the hint and error ids that are actually rendered', async () => {
  const Field = await loadComponent('Field')

  const hintOnly = renderMarkup(Field, {
    id: 'f1',
    hint: 'Helper',
    children: controlSnippet(),
  })
  assert.equal(attributeValue(openingTag(hintOnly, 'input'), 'aria-describedby'), 'f1-hint')
  assert.doesNotMatch(hintOnly, /aria-invalid/)

  const errorOnly = renderMarkup(Field, {
    id: 'f2',
    error: 'Problem',
    children: controlSnippet(),
  })
  assert.equal(attributeValue(openingTag(errorOnly, 'input'), 'aria-describedby'), 'f2-error')
  assert.equal(attributeValue(openingTag(errorOnly, 'input'), 'aria-invalid'), 'true')

  const neither = renderMarkup(Field, { id: 'f3', children: controlSnippet() })
  assert.doesNotMatch(neither, /aria-describedby/)
  assert.doesNotMatch(neither, /aria-invalid/)
})

test('Field marks an error invalid and clears it once the error is removed', async () => {
  const Field = await loadComponent('Field')

  const invalid = renderMarkup(Field, { id: 'f1', error: 'Problem', children: controlSnippet() })
  assert.equal(attributeValue(openingTag(invalid, 'input'), 'aria-invalid'), 'true')

  const valid = renderMarkup(Field, { id: 'f1', children: controlSnippet() })
  assert.doesNotMatch(openingTag(valid, 'input'), /aria-invalid/)
})

test('Field propagates required and disabled to the control wiring and label', async () => {
  const Field = await loadComponent('Field')

  const markup = renderMarkup(Field, {
    id: 'f1',
    label: 'Email',
    required: true,
    disabled: true,
    children: controlSnippet(),
  })

  const input = openingTag(markup, 'input')
  assert.match(input, /\brequired\b/, 'required must reach the control')
  assert.match(input, /\bdisabled\b/, 'disabled must reach the control')
  assert.ok(classList(markup).includes('rs-field--disabled'))
  assert.match(markup, /<span class="rs-label__required" aria-hidden="true">\*<\/span>/)

  const enabled = renderMarkup(Field, { id: 'f1', label: 'Email', children: controlSnippet() })
  assert.doesNotMatch(openingTag(enabled, 'input'), /\brequired\b/)
  assert.doesNotMatch(openingTag(enabled, 'input'), /\bdisabled\b/)
  assert.ok(!classList(enabled).includes('rs-field--disabled'))
})

test('Field exposes aria-disabled on the wrapper only while disabled', async () => {
  const Field = await loadComponent('Field')

  const disabled = renderMarkup(Field, { id: 'f1', disabled: true, children: controlSnippet() })
  assert.match(openingTag(disabled, 'div'), /aria-disabled="true"/)

  const enabled = renderMarkup(Field, { id: 'f1', children: controlSnippet() })
  assert.doesNotMatch(openingTag(enabled, 'div'), /aria-disabled/)

  const explicit = renderMarkup(Field, {
    id: 'f1',
    'aria-disabled': 'true',
    children: controlSnippet(),
  })
  assert.match(
    openingTag(explicit, 'div'),
    /aria-disabled="true"/,
    'a consumer aria-disabled must be forwarded while enabled',
  )

  const override = renderMarkup(Field, {
    id: 'f1',
    disabled: true,
    'aria-disabled': 'false',
    children: controlSnippet(),
  })
  assert.match(
    openingTag(override, 'div'),
    /aria-disabled="true"/,
    'the disabled prop owns aria-disabled on the wrapper',
  )
})

test('Field disabled dims the label, control, hint and error together', async () => {
  const css = await compileStyleBlock(styleBlockOf('Field'))
  const disabledBlock = css.match(/\.rs-field--disabled[^{]*\{([^}]*)\}/)?.[0] ?? ''

  for (const element of ['__label', '__control', '__hint', '__error']) {
    assert.match(
      disabledBlock,
      new RegExp(`\\.rs-field--disabled\\s+\\.rs-field${element}\\b`),
      `the disabled modifier must dim .rs-field${element}`,
    )
  }

  assert.match(disabledBlock, /opacity:\s*0?\.\d+/, 'dimming must use a reduced opacity')
})

test('Field forwards requiredText and optionalText to the Label it renders', async () => {
  const Field = await loadComponent('Field')

  const required = renderMarkup(Field, {
    id: 'f1',
    label: 'Email',
    required: true,
    requiredText: '(must fill)',
    children: controlSnippet(),
  })
  assert.match(required, /<span class="rs-label__sr-only">\(must fill\)<\/span>/)

  const optional = renderMarkup(Field, {
    id: 'f2',
    label: 'Referral code',
    optional: true,
    optionalText: '(nice to have)',
    children: controlSnippet(),
  })
  assert.match(optional, /<span class="rs-label__optional">\(nice to have\)<\/span>/)
})

test('Field passes its control id into the labelSlot so for cannot drift', async () => {
  const Field = await loadComponent('Field')
  const labelSlot = createRawSnippet((id) => ({
    render: () => `<label class="custom-label" for="${id()}">Custom</label>`,
  }))

  const markup = renderMarkup(Field, {
    id: 'account-name',
    labelSlot,
    children: controlSnippet(),
  })

  const controlId = attributeValue(openingTag(markup, 'input'), 'id')
  assert.equal(controlId, 'account-name')
  assert.equal(
    attributeValue(openingTag(markup, 'label'), 'for'),
    controlId,
    'the labelSlot id must be the control id Field generated or received',
  )

  const generated = renderMarkup(Field, { labelSlot, children: controlSnippet() })
  const generatedId = attributeValue(openingTag(generated, 'input'), 'id')
  assert.match(generatedId, /^rs-field-/, 'a missing id must still be generated for the slot')
  assert.equal(attributeValue(openingTag(generated, 'label'), 'for'), generatedId)
})

test('Field gives each instance a distinct generated id', async () => {
  const TwoFields = await loadInline(`<script>
    import Field from './Field.svelte'
  </script>
  <Field label="One">
    {#snippet children(control)}
      <input {...control} />
    {/snippet}
  </Field>
  <Field label="Two">
    {#snippet children(control)}
      <input {...control} />
    {/snippet}
  </Field>`)

  const markup = renderMarkup(TwoFields)
  const ids = [...markup.matchAll(/<input id="([^"]*)"/g)].map((match) => match[1])

  assert.equal(ids.length, 2, 'both fields must render a control')
  assert.notEqual(ids[0], ids[1], 'two Field instances must not share a generated id')

  const fors = [...markup.matchAll(/<label[^>]*for="([^"]*)"/g)].map((match) => match[1])
  assert.deepEqual(fors, ids, 'each label for must follow its own control id')
})

test('Field keeps hint and error ids in sync when they come from snippets', async () => {
  const Field = await loadComponent('Field')

  const markup = renderMarkup(Field, {
    id: 'custom',
    hintId: 'custom-hint',
    hintSlot: snippet('Custom helper'),
    errorSlot: snippet('Custom problem'),
    children: controlSnippet(),
  })

  assert.match(markup, /Custom helper/)
  assert.match(markup, /Custom problem/)
  assert.match(markup, /class="rs-field__hint" id="custom-hint"/)
  assert.match(markup, /class="rs-field__error" id="custom-error"/)
  assert.equal(
    attributeValue(openingTag(markup, 'input'), 'aria-describedby'),
    'custom-hint custom-error',
  )
})

test('Field as and class mirror the Astro component and spread native attributes', async () => {
  const Field = await loadComponent('Field')

  assert.ok(openingTag(renderMarkup(Field), 'div').startsWith('<div'))

  const markup = renderMarkup(Field, {
    as: 'section',
    class: 'consumer-class',
    'data-region': 'account',
    children: controlSnippet(),
  })
  assert.ok(openingTag(markup, 'section').length > 0, 'Field as="section" must render a <section>')
  assert.deepEqual(classList(markup, 'section'), ['rs-field', 'consumer-class'])
  assert.match(openingTag(markup, 'section'), /data-region="account"/)

  const wrapped = renderMarkup(Field, { id: 'field-section', children: controlSnippet() })
  assert.equal(
    attributeValue(openingTag(wrapped, 'input'), 'id'),
    'field-section',
    'Field id is the control id, not a wrapper attribute',
  )
})

test('Field styles compile through the shared barrel and keep the Astro selectors', async () => {
  const css = await compileStyleBlock(styleBlockOf('Field'))

  for (const selector of [
    '.rs-field',
    '.rs-field__control',
    '.rs-field__hint',
    '.rs-field__error',
  ]) {
    assert.ok(css.includes(selector), `compiled Field CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'Field restates its gap at the sm container query',
  )
})

test('Label styles compile through the shared barrel and keep the Astro selectors', async () => {
  const css = await compileStyleBlock(styleBlockOf('Label'))

  for (const selector of [
    '.rs-label',
    '.rs-label__required',
    '.rs-label__optional',
    '.rs-label__sr-only',
  ]) {
    assert.ok(css.includes(selector), `compiled Label CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'Label restates its type scale at the sm container query',
  )
})

test('packages/svelte/src/index.ts re-exports Field and Label with their prop union types', () => {
  const index = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

  const unions = {
    Field: ['FieldTag', 'FieldControlProps'],
    Label: ['LabelTag'],
  }

  for (const [name, exportedTypes] of Object.entries(unions)) {
    assert.match(
      index,
      new RegExp(`export \\{ default as ${name} \\} from './components/${name}\\.svelte'`),
      `index.ts must export the ${name} component`,
    )
    assert.match(
      index,
      new RegExp(`export type \\* from './components/${name}\\.svelte'`),
      `index.ts must re-export the ${name} prop union types`,
    )
    assert.equal(
      pkg.exports[`./components/${name}`],
      `./src/components/${name}.svelte`,
      `package.json must expose ./components/${name}`,
    )

    const source = readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')
    for (const exportedType of exportedTypes) {
      assert.match(
        source,
        new RegExp(`export type ${exportedType}\\b`),
        `${name}.svelte must export the ${exportedType} union`,
      )
    }
  }
})

test('Disclosure and Accordion are exported with subpaths and exported prop union types', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const index = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  for (const name of ['Accordion', 'Disclosure']) {
    assert.equal(
      pkg.exports[`./components/${name}`],
      `./src/components/${name}.svelte`,
      `packages/svelte must export ./components/${name}`,
    )
    assert.match(
      index,
      new RegExp(`export \\{ default as ${name} \\}`),
      `${name} must be re-exported`,
    )
    assert.match(
      index,
      new RegExp(`export type \\* from './components/${name}.svelte'`),
      `${name} prop types must be re-exported`,
    )
  }

  const disclosure = loadComponentSource('Disclosure')
  assert.match(disclosure, /export type DisclosureTag = 'details'/)
  const accordion = loadComponentSource('Accordion')
  assert.match(accordion, /export type AccordionMode = 'multiple' \| 'single'/)
  assert.match(accordion, /export type AccordionTag = 'div' \| 'section' \| 'article' \| 'ul'/)
})

test('Disclosure renders native details/summary, the rs-disclosure classes, and spreads attrs', async () => {
  const Disclosure = await loadComponent('Disclosure')
  const markup = renderMarkup(Disclosure, {
    summary: 'Release notes',
    id: 'notes',
    'data-testid': 'notes',
    children: snippet('<p>Body</p>'),
  })

  const root = openingTag(markup, 'details')
  assert.ok(
    classList(markup, 'details').includes('rs-disclosure'),
    'the root must be a details element with rs-disclosure',
  )
  assert.match(root, /id="notes"/, 'native attributes must spread onto the root')
  assert.match(root, /data-testid="notes"/, 'data attributes must spread onto the root')
  assert.ok(
    markup.includes('<summary class="rs-disclosure__summary"'),
    'the summary must carry its element class',
  )
  assert.ok(
    markup.includes('rs-disclosure__label'),
    'the summary label must carry its element class',
  )
  assert.ok(
    markup.includes('<span class="rs-disclosure__indicator" aria-hidden="true">'),
    'the indicator must be decorative',
  )
  assert.ok(
    markup.includes('<div class="rs-disclosure__panel">'),
    'the panel must carry its element class',
  )

  const closed = renderMarkup(Disclosure, { summary: 'Release notes' })
  assert.ok(
    !openingTag(closed, 'details').includes('open'),
    'a closed disclosure must not render the open attribute',
  )

  const opened = renderMarkup(Disclosure, { summary: 'Release notes', open: true })
  assert.match(
    openingTag(opened, 'details'),
    /\bopen\b/,
    'an open disclosure must render the open attribute',
  )
})

test('Disclosure falls back to the summary snippet when no summary string is given', async () => {
  const Disclosure = await loadComponent('Disclosure')
  const markup = renderMarkup(Disclosure, {
    summarySlot: snippet('<strong>Custom</strong> label'),
    children: snippet('<p>Body</p>'),
  })

  assert.ok(
    markup.includes('<strong>Custom</strong> label'),
    'the summary snippet must render inside the summary',
  )

  const preferred = renderMarkup(Disclosure, {
    summary: 'Plain label',
    summarySlot: snippet('<strong>Custom</strong> label'),
  })
  assert.ok(preferred.includes('Plain label'), 'the summary string wins when both are provided')
  assert.ok(
    !preferred.includes('<strong>Custom</strong>'),
    'the snippet must not render when a summary string exists',
  )
})

test('bind:open stays in sync with the native details state in both directions', async () => {
  const { window, target, flushSync, details } = await mountFixture(
    `<Disclosure summary="Bound" bind:open>body</Disclosure>
  <p data-state>{open}</p>`,
    `let { open = $bindable(false) } = $props()`,
  )

  const element = details()[0]
  const state = () => target.querySelector('[data-state]').textContent
  assert.equal(element.open, false)
  assert.equal(state(), 'false')

  activateSummary(window, element, flushSync)
  assert.equal(element.open, true, 'activating the summary must open the element')
  assert.equal(state(), 'true', 'the bound parent state must follow the element')

  activateSummary(window, element, flushSync)
  assert.equal(element.open, false, 'activating again must close the element')
  assert.equal(state(), 'false', 'the bound parent state must follow the element on close')
})

test('a programmatic open prop drives the element and a native toggle reports back', async () => {
  const { window, target, flushSync, details } = await mountFixture(
    `<Disclosure summary="Controlled" bind:open>body</Disclosure>
  <p data-state>{open}</p>`,
    `let { open = $bindable(false) } = $props()`,
  )

  const element = details()[0]
  element.open = true
  element.dispatchEvent(new window.Event('toggle', { bubbles: true }))
  flushSync()

  assert.equal(
    target.querySelector('[data-state]').textContent,
    'true',
    'a native toggle must reach the bound state',
  )
  assert.equal(element.open, true)
})

test('keyboard activation toggles a summary and leaves the native behaviour intact', async () => {
  const { window, flushSync, details } = await mountFixture(
    `<Disclosure summary="Keyboard">body</Disclosure>`,
  )
  const element = details()[0]

  for (const key of ['Enter', ' ']) {
    const prevented = activateSummary(window, element, flushSync, key)
    assert.equal(prevented, false, `the ${key} keydown must not be prevented`)
    assert.equal(element.open, true, `the ${key} key must open the disclosure`)

    activateSummary(window, element, flushSync, key)
    assert.equal(element.open, false, `the ${key} key must close the disclosure again`)
  }
})

test('single-open mode closes the sibling that was open', async () => {
  const { window, flushSync, details } = await mountFixture(`<Accordion mode="single">
    <Disclosure summary="A">a</Disclosure>
    <Disclosure summary="B">b</Disclosure>
    <Disclosure summary="C">c</Disclosure>
  </Accordion>`)

  const [first, second, third] = details()
  activateSummary(window, first, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true, false, false],
  )

  activateSummary(window, second, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, true, false],
    'opening a sibling must close the previously open disclosure',
  )

  activateSummary(window, third, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, false, true],
  )

  activateSummary(window, third, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, false, false],
    'closing the open disclosure must leave every sibling closed',
  )
})

test('multiple mode keeps siblings open independently', async () => {
  const { window, flushSync, details } = await mountFixture(`<Accordion>
    <Disclosure summary="A">a</Disclosure>
    <Disclosure summary="B">b</Disclosure>
  </Accordion>`)

  const [first, second] = details()
  activateSummary(window, first, flushSync)
  activateSummary(window, second, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true, true],
  )

  activateSummary(window, first, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, true],
  )
})

test('Accordion renders rs-accordion and marks single mode, and spreads attrs', async () => {
  const Accordion = await loadComponent('Accordion')
  const multiple = renderMarkup(Accordion, { 'data-testid': 'faq', children: snippet('<p>x</p>') })
  const multipleTag = openingTag(multiple, 'div')
  assert.ok(classList(multiple, 'div').includes('rs-accordion'))
  assert.match(multipleTag, /data-testid="faq"/)
  assert.ok(
    !multiple.includes('rs-accordion--single'),
    'multiple mode must not render the single modifier',
  )

  const single = renderMarkup(Accordion, { mode: 'single' })
  assert.deepEqual(classList(single, 'div'), ['rs-accordion', 'rs-accordion--single'])
})

test('two initially-open items in single mode settle to one open disclosure', async () => {
  const { details } = await mountFixture(`<Accordion mode="single">
    <Disclosure summary="A" open>a</Disclosure>
    <Disclosure summary="B" open>b</Disclosure>
    <Disclosure summary="C">c</Disclosure>
  </Accordion>`)

  assert.deepEqual(
    details().map((element) => element.open),
    [false, true, false],
    'the last registered open disclosure wins',
  )
})

test('mode can change at runtime and a second single-mode accordion stays isolated', async () => {
  const { window, flushSync, details, instance } = await mountFixture(
    `<Accordion {mode}>
    <Disclosure summary="A">a</Disclosure>
    <Disclosure summary="B">b</Disclosure>
  </Accordion>
  <Accordion mode="single">
    <Disclosure summary="X">x</Disclosure>
    <Disclosure summary="Y">y</Disclosure>
  </Accordion>`,
    `let mode = $state('multiple')
  export const setMode = (value: 'multiple' | 'single') => { mode = value }`,
  )

  const [first, second, x, y] = details()
  activateSummary(window, first, flushSync)
  activateSummary(window, second, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true, true, false, false],
  )

  activateSummary(window, x, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true, true, true, false],
    'a separate accordion must not close disclosures in another accordion',
  )

  instance.setMode('single')
  flushSync()
  assert.deepEqual(
    details().map((element) => element.open),
    [false, true, true, false],
    'switching to single mode must collapse the first accordion to its most recent panel and leave the other alone',
  )

  activateSummary(window, y, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, true, false, true],
    'the two accordions must stay isolated from each other',
  )
})

test('an item removed from a single-open accordion stops receiving sibling updates', async () => {
  const { window, flushSync, details, instance } = await mountFixture(
    `<Accordion mode="single">
    {#if showA}<Disclosure summary="A">a</Disclosure>{/if}
    <Disclosure summary="B">b</Disclosure>
  </Accordion>`,
    `let showA = $state(true)
  export const setShowA = (value: boolean) => { showA = value }`,
  )

  activateSummary(window, details()[0], flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true, false],
  )

  instance.setShowA(false)
  flushSync()
  assert.equal(details().length, 1, 'the removed item must leave the DOM')

  const remaining = details()[0]
  assert.equal(remaining.open, false, 'the surviving item must stay closed')
  activateSummary(window, remaining, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [true],
  )
})

test('Disclosure and Accordion styles compile through the shared barrel with the expected selectors', async () => {
  const disclosure = await compileStyleBlock(styleBlockOf('Disclosure'))
  for (const selector of [
    '.rs-disclosure',
    '.rs-disclosure__summary',
    '.rs-disclosure__label',
    '.rs-disclosure__indicator',
    '.rs-disclosure__panel',
    '.rs-disclosure[open]',
  ]) {
    assert.ok(disclosure.includes(selector), `compiled Disclosure CSS must contain ${selector}`)
  }
  assert.match(
    disclosure,
    /@container\s*\(min-width:\s*500px\)/,
    'Disclosure type scale must restate at the sm container query',
  )
  assert.match(
    disclosure,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)/,
    'Disclosure must respect reduced motion',
  )
  assert.match(
    disclosure,
    /@media \(prefers-reduced-motion: reduce\) \{\s*:global \.rs-disclosure \.rs-disclosure__indicator,\s*:global \.rs-disclosure \.rs-disclosure__panel \{\s*transition: none;/,
    'reduced motion must drop the indicator and panel transitions',
  )
  assert.ok(!/@keyframes/.test(disclosure), 'Disclosure must not depend on keyframes animations')

  const accordion = await compileStyleBlock(styleBlockOf('Accordion'))
  for (const selector of ['.rs-accordion', '.rs-accordion--single']) {
    assert.ok(accordion.includes(selector), `compiled Accordion CSS must contain ${selector}`)
  }
})

test('the README Astro-original column matches what is actually on disk', () => {
  const readme = readFileSync(join(packageRoot, 'README.md'), 'utf8')
  const astroDir = join(repoRoot, 'packages', 'base', 'src', 'components')

  const rows = [...readme.matchAll(/^\|\s*`([A-Za-z]+)`\s*\|[^|]*\|\s*([^|]+?)\s*\|$/gm)].map(
    ([, component, provenance]) => ({ component, provenance }),
  )

  assert.ok(rows.length > 0, 'the README component table must list components')

  for (const { component, provenance } of rows) {
    // The claim must track the filesystem, so an unmerged Astro PR cannot be cited as the
    // original and a later port cannot leave a stale `— (Svelte-first)` behind.
    const hasAstroOriginal = existsSync(join(astroDir, `${component}.astro`))
    if (hasAstroOriginal) {
      assert.equal(
        provenance,
        `\`${component}.astro\``,
        `README must name \`${component}.astro\` as the original because it exists on disk`,
      )
    } else {
      assert.equal(
        provenance,
        '— (Svelte-first)',
        `README must mark ${component} as Svelte-first because packages/base/src/components/${component}.astro does not exist`,
      )
    }
  }
})

test('Figure is exported from the barrel, as a subpath, with its prop union types', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const barrel = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  assert.equal(
    pkg.exports['./components/Figure'],
    './src/components/Figure.svelte',
    'packages/svelte must export ./components/Figure',
  )
  assert.match(
    barrel,
    /export \{ default as Figure \} from '\.\/components\/Figure\.svelte'/,
    'the barrel must export the Figure value',
  )
  assert.match(
    barrel,
    /export type \* from '\.\/components\/Figure\.svelte'/,
    'the barrel must re-export the Figure prop union types',
  )

  const source = loadComponentSource('Figure')
  for (const union of ['FigureTag', 'FigureVariant', 'FigureCaptionAlign']) {
    assert.match(source, new RegExp(`export type ${union}\\b`), `Figure must export ${union}`)
  }
})

test('Figure renders a figure root with the media wrapper and no caption by default', async () => {
  const Figure = await loadComponent('Figure')

  const markup = renderMarkup(Figure, { children: snippet('<img alt="" src="x.png" />') })

  assert.ok(openingTag(markup, 'figure').length > 0, 'Figure must default to a <figure> root')
  assert.deepEqual(classList(markup, 'figure'), ['rs-figure'])
  assert.ok(markup.includes('rs-figure__media'), 'Figure always renders the media wrapper')
  assert.match(markup, /<img[^>]*src="x\.png"/, 'children render inside the media wrapper')
  assert.ok(
    markup.indexOf('rs-figure__media') < markup.indexOf('<img'),
    'children must render inside the media wrapper, not beside it',
  )
  assert.ok(
    !markup.includes('figcaption'),
    'no caption prop or snippet must render no <figcaption>',
  )
  assert.ok(
    !markup.includes('rs-figure__caption'),
    'no caption prop or snippet must render no caption element at all',
  )
})

test('Figure renders the caption prop as a figcaption inside the figure root', async () => {
  const Figure = await loadComponent('Figure')

  const markup = visible(
    renderMarkup(Figure, {
      caption: 'Deployment pipeline stages',
      children: snippet('<img alt="" src="x.png" />'),
    }),
  )

  assert.match(
    markup,
    /<figcaption class="rs-figure__caption">Deployment pipeline stages<\/figcaption>/,
    'the caption prop must render inside a figcaption',
  )
  assert.ok(
    markup.indexOf('</figure>') > markup.indexOf('</figcaption>'),
    'the figcaption must sit inside the figure so assistive tech associates it',
  )
  assert.equal((markup.match(/<figcaption/g) ?? []).length, 1, 'exactly one figcaption renders')
})

test('Figure renders the caption snippet and combines it with the caption prop', async () => {
  const Figure = await loadComponent('Figure')

  const slotOnly = visible(
    renderMarkup(Figure, {
      captionSlot: snippet('Fig. 1 — <em>Edge</em> reads.'),
      children: snippet('<img alt="" src="x.png" />'),
    }),
  )
  assert.ok(
    slotOnly.includes('rs-figure__caption'),
    'a caption snippet alone must render the caption element',
  )
  assert.match(slotOnly, /Fig\. 1 — <em>Edge<\/em> reads\./)

  const both = visible(
    renderMarkup(Figure, {
      caption: 'Fig. 1',
      captionSlot: snippet(' — Edge reads.'),
      children: snippet('<img alt="" src="x.png" />'),
    }),
  )
  assert.equal((both.match(/<figcaption/g) ?? []).length, 1, 'prop and snippet share one caption')
  assert.match(
    both,
    /<figcaption class="rs-figure__caption">Fig\. 1\s*— Edge reads\.<\/figcaption>/,
    'the caption prop renders before the snippet, in source order',
  )
  assert.ok(
    both.indexOf('Fig. 1') < both.indexOf('— Edge reads.'),
    'the prop text must precede the snippet text',
  )
})

test('Figure treats a blank caption as absent, but a snippet still renders the caption element', async () => {
  const Figure = await loadComponent('Figure')

  for (const caption of ['', '   ', '\n\t']) {
    const markup = visible(
      renderMarkup(Figure, {
        caption,
        children: snippet('<img alt="" src="x.png" />'),
      }),
    )
    assert.ok(
      !markup.includes('rs-figure__caption'),
      `caption ${JSON.stringify(caption)} must not render a caption element`,
    )
  }

  const withSlot = visible(
    renderMarkup(Figure, {
      caption: '   ',
      captionSlot: snippet('From the snippet.'),
      children: snippet('<img alt="" src="x.png" />'),
    }),
  )
  assert.match(
    withSlot,
    /<figcaption class="rs-figure__caption">From the snippet\.<\/figcaption>/,
    'a blank prop is dropped while the snippet still renders',
  )
})

test('Figure as="div" swaps figcaption for a role="note" caption, keeping the block classes', async () => {
  const Figure = await loadComponent('Figure')

  const markup = visible(
    renderMarkup(Figure, {
      as: 'div',
      caption: 'Rendered as a plain container',
      children: snippet('<img alt="" src="x.png" />'),
    }),
  )

  assert.ok(openingTag(markup, 'div').length > 0, 'as="div" must render a <div> root')
  assert.ok(!openingTag(markup, 'figure'), 'as="div" must not also render a <figure>')
  assert.deepEqual(classList(markup, 'div'), ['rs-figure'])
  assert.ok(
    !markup.includes('<figcaption'),
    'a <figcaption> outside a <figure> is invalid, so the div root must not render one',
  )
  assert.match(
    markup,
    /<div class="rs-figure__caption" role="note">Rendered as a plain container<\/div>/,
    'the div root pairs the caption with role="note"',
  )
})

test('Figure renders exactly the bordered and caption-align modifiers that were set', async () => {
  const Figure = await loadComponent('Figure')
  const variants = ['rs-figure--bordered']
  const alignments = ['rs-figure__caption--center']

  const cases = [
    { label: 'defaults', props: { caption: 'C' }, expected: [] },
    { label: 'default variant', props: { variant: 'default', caption: 'C' }, expected: [] },
    {
      label: 'bordered',
      props: { variant: 'bordered', caption: 'C' },
      expected: ['rs-figure--bordered'],
    },
  ]

  for (const { label, props, expected } of cases) {
    const classes = classList(renderMarkup(Figure, props), 'figure')
    for (const modifier of variants) {
      assert.equal(
        classes.includes(modifier),
        expected.includes(modifier),
        `Figure ${label} must ${expected.includes(modifier) ? '' : 'not '}render ${modifier}`,
      )
    }
  }

  const alignCases = [
    { label: 'default alignment', props: { caption: 'C' }, expected: [] },
    { label: 'start', props: { captionAlign: 'start', caption: 'C' }, expected: [] },
    {
      label: 'center',
      props: { captionAlign: 'center', caption: 'C' },
      expected: ['rs-figure__caption--center'],
    },
  ]

  for (const { label, props, expected } of alignCases) {
    const classes = classList(renderMarkup(Figure, props), 'figcaption')
    assert.ok(classes.includes('rs-figure__caption'), `Figure ${label} must keep the caption class`)
    for (const modifier of alignments) {
      assert.equal(
        classes.includes(modifier),
        expected.includes(modifier),
        `Figure ${label} must ${expected.includes(modifier) ? '' : 'not '}render ${modifier}`,
      )
    }
  }
})

test('Figure spreads native attributes and composes a consumer class on the root only', async () => {
  const Figure = await loadComponent('Figure')

  const markup = renderMarkup(Figure, {
    id: 'pipeline',
    'data-region': 'docs',
    class: 'consumer-class',
    variant: 'bordered',
    caption: 'Pipeline',
    children: snippet('<img alt="" src="x.png" />'),
  })

  const root = openingTag(markup, 'figure')
  assert.match(root, /id="pipeline"/)
  assert.match(root, /data-region="docs"/)
  assert.deepEqual(classList(markup, 'figure'), [
    'rs-figure',
    'rs-figure--bordered',
    'consumer-class',
  ])
  assert.ok(
    !root.includes('rs-figure__media'),
    'the media wrapper must not take the attributes the root owns',
  )
  assert.ok(
    !openingTag(markup, 'figcaption').includes('consumer-class'),
    'the consumer class belongs to the root, not the caption',
  )
})

test('Figure styles compile through the shared barrel and keep every selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Figure'))

  for (const selector of [
    '.rs-figure',
    '.rs-figure--bordered',
    '.rs-figure__media',
    '.rs-figure__caption',
    '.rs-figure__caption--center',
  ]) {
    assert.ok(css.includes(selector), `compiled Figure CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'the caption type scale must restate at the sm container query',
  )
  assert.ok(
    !/@media/.test(css),
    'Figure sizes with container queries, so it must not reach for viewport media queries',
  )
  assert.match(
    css,
    /var\(--rs-figure-caption-color, var\(--rs-color-muted,/,
    'the caption colour keeps the opt-in hook over the token over the literal',
  )
  assert.ok(
    /\.rs-figure--bordered\s+\.rs-figure__media\s*\{[^}]*border:\s*var\(--rs-figure-media-border-width/ms.test(
      css,
    ),
    'only the bordered modifier frames the media',
  )

  const baseMedia = css.match(/^\s*:global\s+\.rs-figure__media\s*\{([^}]*)\}/m)?.[1] ?? ''
  assert.ok(
    baseMedia.length > 0,
    'the compiled CSS must contain a standalone .rs-figure__media rule',
  )
  assert.ok(
    !/(^|[\s;])border:/.test(baseMedia),
    'the default variant must not draw a media border at all',
  )
})

test('Input and Textarea are exported from the barrel, as subpaths, with their prop union types', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const barrel = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  for (const name of ['Input', 'Textarea']) {
    assert.equal(
      pkg.exports[`./components/${name}`],
      `./src/components/${name}.svelte`,
      `packages/svelte must export ./components/${name}`,
    )
    assert.match(
      barrel,
      new RegExp(`export \\{ default as ${name} \\} from '\\./components/${name}\\.svelte'`),
      `the barrel must export the ${name} value`,
    )
    assert.match(
      barrel,
      new RegExp(`export type \\* from '\\./components/${name}\\.svelte'`),
      `the barrel must re-export the ${name} prop union types`,
    )
  }

  const input = loadComponentSource('Input')
  assert.match(
    input,
    /export type InputType = 'text' \| 'email' \| 'password' \| 'number' \| 'search' \| 'url' \| 'tel'/,
  )
  assert.match(input, /export type InputSize = 'sm' \| 'md' \| 'lg'/)

  const textarea = loadComponentSource('Textarea')
  assert.match(textarea, /export type TextareaSize = 'sm' \| 'md' \| 'lg'/)
})

test('Input renders .rs-input with the default text type and one size modifier', async () => {
  const Input = await loadComponent('Input')

  const bare = classList(renderMarkup(Input), 'input')
  assert.deepEqual(bare, ['rs-input', 'rs-input--md'], 'the default size is md')
  assert.match(openingTag(renderMarkup(Input), 'input'), /type="text"/, 'the default type is text')

  for (const size of ['sm', 'md', 'lg']) {
    const classes = classList(renderMarkup(Input, { size }), 'input')
    assert.deepEqual(classes, ['rs-input', `rs-input--${size}`])
  }
})

test('Input renders every supported native input type', async () => {
  const Input = await loadComponent('Input')

  for (const type of ['text', 'email', 'password', 'number', 'search', 'url', 'tel']) {
    const tag = openingTag(renderMarkup(Input, { type }), 'input')
    assert.match(
      tag,
      new RegExp(`type="${type}"`),
      `Input type="${type}" must render on the element`,
    )
  }
})

test('Input invalid raises aria-invalid and the invalid class, but an explicit attribute wins', async () => {
  const Input = await loadComponent('Input')

  const invalid = openingTag(renderMarkup(Input, { invalid: true }), 'input')
  assert.match(invalid, /aria-invalid="true"/)
  assert.ok(
    classList(renderMarkup(Input, { invalid: true }), 'input').includes('rs-input--invalid'),
    'the invalid state must add the modifier',
  )

  const valid = openingTag(renderMarkup(Input), 'input')
  assert.doesNotMatch(valid, /aria-invalid/, 'a valid control must not announce aria-invalid')
  assert.ok(
    !classList(renderMarkup(Input), 'input').includes('rs-input--invalid'),
    'a valid control must not carry the invalid modifier',
  )

  const overridden = renderMarkup(Input, { invalid: true, 'aria-invalid': 'false' })
  assert.match(
    openingTag(overridden, 'input'),
    /aria-invalid="false"/,
    'an explicit aria-invalid must win over the invalid prop',
  )
  assert.ok(
    !classList(overridden, 'input').includes('rs-input--invalid'),
    'the modifier must follow the effective aria-invalid, not the prop alone',
  )
})

test('Textarea renders .rs-textarea with one size modifier', async () => {
  const Textarea = await loadComponent('Textarea')

  const bare = classList(renderMarkup(Textarea), 'textarea')
  assert.deepEqual(bare, ['rs-textarea', 'rs-textarea--md'], 'the default size is md')

  for (const size of ['sm', 'md', 'lg']) {
    const classes = classList(renderMarkup(Textarea, { size }), 'textarea')
    assert.deepEqual(classes, ['rs-textarea', `rs-textarea--${size}`])
  }
})

test('Textarea invalid raises aria-invalid and the invalid class, but an explicit attribute wins', async () => {
  const Textarea = await loadComponent('Textarea')

  assert.match(
    openingTag(renderMarkup(Textarea, { invalid: true }), 'textarea'),
    /aria-invalid="true"/,
  )
  assert.ok(
    classList(renderMarkup(Textarea, { invalid: true }), 'textarea').includes(
      'rs-textarea--invalid',
    ),
    'the invalid state must add the modifier',
  )
  assert.doesNotMatch(
    openingTag(renderMarkup(Textarea), 'textarea'),
    /aria-invalid/,
    'a valid textarea must not announce aria-invalid',
  )

  const overridden = renderMarkup(Textarea, { invalid: true, 'aria-invalid': 'false' })
  assert.match(openingTag(overridden, 'textarea'), /aria-invalid="false"/)
  assert.ok(!classList(overridden, 'textarea').includes('rs-textarea--invalid'))
})

test('the controls spread native attributes and compose a consumer class with the block', async () => {
  const Input = await loadComponent('Input')
  const Textarea = await loadComponent('Textarea')

  const input = openingTag(
    renderMarkup(Input, {
      name: 'email',
      placeholder: 'you@example.com',
      autocomplete: 'email',
      class: 'consumer-class',
    }),
    'input',
  )
  assert.match(input, /name="email"/)
  assert.match(input, /placeholder="you@example.com"/)
  assert.match(input, /autocomplete="email"/)
  assert.deepEqual(classList(renderMarkup(Input, { class: 'consumer-class' }), 'input'), [
    'rs-input',
    'rs-input--md',
    'consumer-class',
  ])

  const textarea = openingTag(
    renderMarkup(Textarea, { rows: 4, placeholder: 'Notes', class: 'consumer-class' }),
    'textarea',
  )
  assert.match(textarea, /rows="4"/)
  assert.match(textarea, /placeholder="Notes"/)
  assert.deepEqual(classList(renderMarkup(Textarea, { class: 'consumer-class' }), 'textarea'), [
    'rs-textarea',
    'rs-textarea--md',
    'consumer-class',
  ])
})

test('bind:value round-trips for Input in both directions', async () => {
  const { window, target, instance, flushSync, input } = await mountControlFixture(
    `<Input bind:value={text} />
  <p data-echo>{text}</p>`,
    `let text = $state('initial')
  export const read = () => text
  export const write = (next: string) => { text = next }`,
  )

  const element = input()
  assert.equal(element.value, 'initial', 'the initial state must reach the element')
  assert.equal(target.querySelector('[data-echo]').textContent, 'initial')

  typeInto(window, element, 'typed by the user')
  flushSync()
  assert.equal(instance.read(), 'typed by the user', 'typing must update the bound state')
  assert.equal(target.querySelector('[data-echo]').textContent, 'typed by the user')

  instance.write('set from the parent')
  flushSync()
  assert.equal(element.value, 'set from the parent', 'a parent update must reach the element')
  assert.equal(target.querySelector('[data-echo]').textContent, 'set from the parent')
})

test('bind:value round-trips for Textarea in both directions', async () => {
  const { window, target, instance, flushSync, textarea } = await mountControlFixture(
    `<Textarea bind:value={notes} />
  <p data-echo>{notes}</p>`,
    `let notes = $state('draft')
  export const read = () => notes
  export const write = (next: string) => { notes = next }`,
  )

  const element = textarea()
  assert.equal(element.value, 'draft', 'the initial state must reach the element')
  assert.equal(target.querySelector('[data-echo]').textContent, 'draft')

  typeInto(window, element, 'multi\nline\nnotes')
  flushSync()
  assert.equal(instance.read(), 'multi\nline\nnotes', 'typing must update the bound state')
  assert.equal(target.querySelector('[data-echo]').textContent, 'multi\nline\nnotes')

  instance.write('rewritten by the parent')
  flushSync()
  assert.equal(element.value, 'rewritten by the parent', 'a parent update must reach the element')
})

test('the invalid state Field derives from its error reaches the Input control', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Work email" error="Enter a valid email address.">
    {#snippet children(control)}
      <Input {...control} type="email" />
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('input')
  const errorId = target.querySelector('.rs-field__error').id
  assert.equal(
    element.getAttribute('aria-invalid'),
    'true',
    'the error must mark the control invalid',
  )
  assert.equal(
    element.getAttribute('aria-describedby'),
    errorId,
    'the control must point at the error text',
  )
  assert.ok(
    element.classList.contains('rs-input--invalid'),
    'the Field error must reach the control styling',
  )
})

test('the invalid state Field derives from its error reaches the Textarea control', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Release notes" error="Add at least ten characters.">
    {#snippet children(control)}
      <Textarea {...control} rows="3" />
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('textarea')
  assert.equal(element.getAttribute('aria-invalid'), 'true')
  assert.ok(element.classList.contains('rs-textarea--invalid'))
})

test('a Field without an error leaves its control valid', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Work email" hint="We send deployment alerts here.">
    {#snippet children(control)}
      <Input {...control} type="email" />
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('input')
  assert.equal(element.getAttribute('aria-invalid'), null, 'no error must mean no aria-invalid')
  assert.ok(!element.classList.contains('rs-input--invalid'))
  assert.equal(
    element.getAttribute('aria-describedby'),
    target.querySelector('.rs-field__hint').id,
    'the control must still point at the hint',
  )
})

test('Field wires the control id to the label and the described-by ids to the control', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Workspace" hint="Shown in the dashboard header." error="This name is taken.">
    {#snippet children(control)}
      <Input {...control} />
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('input')
  const label = target.querySelector('label')
  assert.equal(label.getAttribute('for'), element.id, 'the label must point at the control id')
  assert.equal(
    element.getAttribute('aria-describedby'),
    `${target.querySelector('.rs-field__hint').id} ${target.querySelector('.rs-field__error').id}`,
    'both the hint and the error must be described',
  )
})

test('a disabled Field disables the control and blocks interaction, while an enabled one stays focusable', async () => {
  const { window, target } = await mountControlFixture(
    `<Field label="Region" disabled>
    {#snippet children(control)}
      <Input {...control} />
    {/snippet}
  </Field>
  <Field label="Workspace">
    {#snippet children(control)}
      <Input {...control} />
    {/snippet}
  </Field>`,
  )

  const [disabled, enabled] = target.querySelectorAll('input')
  assert.equal(disabled.disabled, true, 'the disabled Field must disable its control')

  disabled.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'BODY',
    'a disabled control must not take focus, so it cannot receive typed input',
  )

  enabled.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'INPUT',
    'precondition: an enabled control takes focus, so the disabled assertion is meaningful',
  )
})

test('a standalone disabled control blocks focus while the enabled one stays focusable', async () => {
  const { window, target } = await mountControlFixture(
    `<Input disabled />
  <Textarea disabled rows="2" />
  <Input />`,
  )

  const [disabledInput, disabledTextarea, enabledInput] = target.querySelectorAll('input, textarea')
  assert.equal(disabledInput.disabled, true)
  assert.equal(disabledTextarea.disabled, true)

  // Other tests in this file share one jsdom document and may leave a control focused.
  if (window.document.activeElement instanceof window.HTMLElement) {
    window.document.activeElement.blur()
  }

  disabledInput.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'BODY',
    'a disabled Input must not take focus, so it cannot receive typed input',
  )

  disabledTextarea.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'BODY',
    'a disabled Textarea must not take focus, so it cannot receive typed input',
  )

  enabledInput.focus()
  assert.equal(window.document.activeElement.tagName, 'INPUT')
})

test('a disabled Field disables a Textarea control too', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Frozen transcript" disabled>
    {#snippet children(control)}
      <Textarea {...control} rows="2" />
    {/snippet}
  </Field>`,
  )

  assert.equal(target.querySelector('textarea').disabled, true)
})

test('Input and Textarea styles compile through the shared barrel with container queries', async () => {
  const input = await compileStyleBlock(styleBlockOf('Input'))
  for (const selector of [
    '.rs-input',
    '.rs-input--sm',
    '.rs-input--md',
    '.rs-input--lg',
    '.rs-input--invalid',
  ]) {
    assert.ok(input.includes(selector), `compiled Input CSS must contain ${selector}`)
  }
  assert.match(
    input,
    /@container\s*\(min-width:\s*500px\)/,
    'Input must restate its type scale at the sm container query',
  )
  assert.ok(
    !/@media\s*\(min-width/.test(input),
    'Input sizes with container queries, so it must not use viewport min-width media queries',
  )
  assert.match(
    input,
    /var\(--rs-input-bg, var\(--rs-color-surface,/,
    'the invalid modifier keeps the opt-in hook over the token over the literal',
  )

  const textarea = await compileStyleBlock(styleBlockOf('Textarea'))
  for (const selector of [
    '.rs-textarea',
    '.rs-textarea--sm',
    '.rs-textarea--md',
    '.rs-textarea--lg',
    '.rs-textarea--invalid',
  ]) {
    assert.ok(textarea.includes(selector), `compiled Textarea CSS must contain ${selector}`)
  }
  assert.match(
    textarea,
    /resize:\s*var\(--rs-textarea-resize,\s*vertical\)/,
    'the resize default is a token hook, so a consumer can override it',
  )
  assert.match(textarea, /@container\s*\(min-width:\s*500px\)/)
  assert.ok(!/@media\s*\(min-width/.test(textarea), 'Textarea must not use viewport media queries')
})

test('Select is exported from the barrel, as a subpath, with its prop union types', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const basePkg = JSON.parse(
    readFileSync(join(repoRoot, 'packages', 'base', 'package.json'), 'utf8'),
  )
  const barrel = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  assert.equal(pkg.exports['./components/Select'], './src/components/Select.svelte')
  assert.ok(
    !basePkg.exports?.['./components/Select'],
    'Select is Svelte-first, so the Astro package must not expose it yet',
  )
  assert.match(barrel, /export \{ default as Select \} from '\.\/components\/Select\.svelte'/)
  assert.match(barrel, /export type \* from '\.\/components\/Select\.svelte'/)
  assert.match(loadComponentSource('Select'), /export type SelectSize = 'sm' \| 'md' \| 'lg'/)
})

test('Select is a native select inside .rs-select with one size modifier and the chevron', async () => {
  const Select = await loadComponent('Select')

  const markup = renderMarkup(Select)
  assert.ok(
    /<span class="rs-select rs-select--md">\s*<select/.test(visible(markup)),
    'the select must sit inside the .rs-select block, so the chevron can be positioned',
  )
  assert.deepEqual(classList(renderMarkup(Select, { size: 'md' }), 'select'), [
    'rs-select__control',
  ])
  assert.match(openingTag(markup, 'select'), /class="rs-select__control"/)
  assert.match(markup, /class="rs-select__icon"/, 'the chevron is part of the block')
  assert.match(openingTag(markup, 'svg'), /aria-hidden="true"/, 'the chevron is decorative')
  assert.match(openingTag(markup, 'svg'), /focusable="false"/)

  for (const size of ['sm', 'md', 'lg']) {
    const classes = classList(renderMarkup(Select, { size }), 'span')
    assert.deepEqual(classes, ['rs-select', `rs-select--${size}`])
  }
})

test('Select forwards a numeric native size and drops the chevron for a listbox', async () => {
  const Select = await loadComponent('Select')

  const markup = renderMarkup(Select, { size: 4 })
  assert.match(
    openingTag(markup, 'select'),
    /size="4"/,
    'a numeric size is the native visible-row count, not a variant',
  )
  assert.ok(
    classList(markup, 'span').includes('rs-select--md'),
    'a listbox still carries the default size modifier',
  )
  assert.doesNotMatch(
    markup,
    /rs-select__icon/,
    'a listbox has no dropdown affordance, so the chevron must not render',
  )
})

test('Select invalid raises aria-invalid and the invalid class, but an explicit attribute wins', async () => {
  const Select = await loadComponent('Select')

  const invalid = renderMarkup(Select, { invalid: true })
  assert.match(openingTag(invalid, 'select'), /aria-invalid="true"/)
  assert.deepEqual(classList(invalid, 'span'), ['rs-select', 'rs-select--md', 'rs-select--invalid'])

  const valid = renderMarkup(Select)
  assert.doesNotMatch(openingTag(valid, 'select'), /aria-invalid/)
  assert.ok(!classList(valid, 'span').includes('rs-select--invalid'))

  const overridden = renderMarkup(Select, { invalid: true, 'aria-invalid': 'false' })
  assert.match(openingTag(overridden, 'select'), /aria-invalid="false"/)
  assert.ok(
    !classList(overridden, 'span').includes('rs-select--invalid'),
    'the modifier must follow the effective aria-invalid, not the prop alone',
  )
})

test('Select renders the placeholder as a disabled empty-valued option and leaves it out when absent', async () => {
  const Select = await loadComponent('Select')

  const withPlaceholder = renderMarkup(Select, { placeholder: 'Choose a team' })
  const option = withPlaceholder.match(/<option\b[^>]*>[^<]*<\/option>/)?.[0] ?? ''
  assert.match(option, /value=""/, 'the placeholder must own the empty value')
  assert.match(option, /disabled/, 'the placeholder must not be selectable')
  assert.match(option, /Choose a team/)

  assert.doesNotMatch(
    renderMarkup(Select, { placeholder: '   ' }),
    /<option/,
    'a whitespace-only placeholder is no placeholder',
  )
  assert.doesNotMatch(
    renderMarkup(Select),
    /<option/,
    'without a placeholder the component renders no option of its own',
  )
})

test('Select renders the options handed to it through the children snippet, optgroups included', async () => {
  const Select = await loadComponent('Select')

  const markup = visible(
    renderMarkup(Select, {
      placeholder: 'Choose a team',
      children: snippet(
        '<optgroup label="Design"><option value="product">Product design</option></optgroup>' +
          '<option value="platform">Platform</option>',
      ),
    }),
  )

  assert.match(markup, /<optgroup label="Design">/)
  assert.match(markup, /<option value="product">Product design<\/option>/)
  assert.ok(
    markup.indexOf('Choose a team') < markup.indexOf('Product design'),
    'the placeholder renders before the snippet options',
  )
})

test('Select composes a consumer class and spreads native attributes onto the select', async () => {
  const Select = await loadComponent('Select')

  const markup = renderMarkup(Select, {
    name: 'region',
    required: true,
    class: 'consumer-class',
  })
  const tag = openingTag(markup, 'select')

  assert.match(tag, /name="region"/)
  assert.match(tag, /required/, 'native attributes land on the control, not the wrapper')
  assert.deepEqual(classList(markup, 'select'), ['rs-select__control'])
  assert.deepEqual(classList(markup, 'span'), ['rs-select', 'rs-select--md', 'consumer-class'])
})

test('bind:value round-trips for Select in both directions', async () => {
  const { window, target, instance, flushSync, select } = await mountControlFixture(
    `<Select bind:value={team} placeholder="Choose a team">
    <option value="product">Product design</option>
    <option value="platform">Platform</option>
  </Select>
  <p data-echo>{team}</p>`,
    `let team = $state('product')
  export const read = () => team
  export const write = (next: string) => { team = next }`,
  )

  const element = select()
  assert.equal(element.value, 'product', 'the initial state must reach the element')
  assert.equal(target.querySelector('[data-echo]').textContent, 'product')

  chooseOption(window, element, 'platform')
  flushSync()
  assert.equal(instance.read(), 'platform', 'a user pick must update the bound state')
  assert.equal(target.querySelector('[data-echo]').textContent, 'platform')

  instance.write('product')
  flushSync()
  assert.equal(element.value, 'product', 'a parent update must reach the element')
  assert.equal(target.querySelector('[data-echo]').textContent, 'product')
})

test('Select keeps the placeholder unreachable once a real option is chosen', async () => {
  const { window, target, instance, flushSync, select } = await mountControlFixture(
    `<Select bind:value={team} placeholder="Choose a team">
    <option value="product">Product design</option>
    <option value="platform">Platform</option>
  </Select>
  <p data-echo>{team}</p>`,
    `let team = $state('')
  export const read = () => team
  export const write = (next: string) => { team = next }`,
  )

  const element = select()
  const [placeholder, product, platform] = element.options

  assert.ok(
    placeholder.disabled,
    'the placeholder must be a disabled option, so the dropdown cannot offer it again',
  )
  assert.equal(placeholder.value, '')
  assert.equal(element.value, '', 'an empty value starts on the placeholder')
  assert.equal(target.querySelector('[data-echo]').textContent, '')

  chooseOption(window, element, 'platform')
  flushSync()

  assert.equal(instance.read(), 'platform', 'a user pick must reach the bound state')
  assert.equal(element.value, 'platform')
  assert.equal(placeholder.selected, false, 'the chosen option owns the selection')
  assert.equal(platform.selected, true)
  assert.ok(
    placeholder.disabled,
    'the placeholder stays disabled after a pick, so it cannot be chosen back',
  )

  // The placeholder's `selected` attribute is reactive, so it has to leave the placeholder once a
  // value is set. Otherwise a form reset, and the first paint after hydration, would return to it.
  assert.ok(
    !placeholder.hasAttribute('selected'),
    'the placeholder must drop selected once a value is set',
  )
  assert.equal(
    platform.selected,
    true,
    'the element reports the chosen option as selected, so a reset target exists',
  )

  // A parent reset is still allowed to move the control back to the placeholder.
  instance.write('')
  flushSync()
  assert.equal(element.value, '', 'a parent update may reset the control to the placeholder')
  assert.equal(product.selected, false)
})

test('Select with a stale bound value selects nothing but keeps the placeholder disabled', async () => {
  const { window, target, instance, flushSync, select } = await mountControlFixture(
    `<Select bind:value={team} placeholder="Choose a team">
    <option value="product">Product design</option>
  </Select>
  <p data-echo>{team}</p>`,
    `let team = $state('retired-team')
  export const read = () => team`,
  )

  const element = select()
  assert.equal(
    element.selectedIndex,
    -1,
    'a value that matches no option must leave the control with nothing selected, not jump to the placeholder',
  )

  chooseOption(window, element, 'product')
  flushSync()
  assert.equal(instance.read(), 'product', 'the user can recover by picking a real option')
  assert.equal(target.querySelector('[data-echo]').textContent, 'product')
  assert.equal(element.options[0].disabled, true)
})

test('the invalid state Field derives from its error reaches the Select control', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Billing plan" error="Choose a plan before you start the trial.">
    {#snippet children(control)}
      <Select {...control} placeholder="Choose a plan">
        <option value="starter">Starter</option>
      </Select>
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('select')
  assert.equal(
    element.getAttribute('aria-invalid'),
    'true',
    'the error must mark the control invalid',
  )
  assert.equal(
    element.getAttribute('aria-describedby'),
    target.querySelector('.rs-field__error').id,
    'the control must point at the error text',
  )
  assert.ok(
    target.querySelector('.rs-select').classList.contains('rs-select--invalid'),
    'the Field error must reach the control styling',
  )
  assert.equal(
    target.querySelector('label').getAttribute('for'),
    element.id,
    'the label must point at the select',
  )
})

test('a Field without an error leaves its Select control valid and pointed at the hint', async () => {
  const { target } = await mountControlFixture(
    `<Field label="Team" hint="Controls which runbooks appear in your sidebar.">
    {#snippet children(control)}
      <Select {...control} placeholder="Choose a team">
        <option value="platform">Platform</option>
      </Select>
    {/snippet}
  </Field>`,
  )

  const element = target.querySelector('select')
  assert.equal(element.getAttribute('aria-invalid'), null, 'no error must mean no aria-invalid')
  assert.ok(!target.querySelector('.rs-select').classList.contains('rs-select--invalid'))
  assert.equal(element.getAttribute('aria-describedby'), target.querySelector('.rs-field__hint').id)
})

test('a disabled Field disables its Select control while an enabled one stays focusable', async () => {
  const { window, target } = await mountControlFixture(
    `<Field label="Region" disabled>
    {#snippet children(control)}
      <Select {...control}><option value="eu">Europe</option></Select>
    {/snippet}
  </Field>
  <Field label="Workspace">
    {#snippet children(control)}
      <Select {...control}><option value="acme">Acme</option></Select>
    {/snippet}
  </Field>`,
  )

  const [disabled, enabled] = target.querySelectorAll('select')
  assert.equal(disabled.disabled, true, 'the disabled Field must disable its control')

  if (window.document.activeElement instanceof window.HTMLElement) {
    window.document.activeElement.blur()
  }
  disabled.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'BODY',
    'a disabled Select must not take focus, so it cannot be opened',
  )

  enabled.focus()
  assert.equal(
    window.document.activeElement.tagName,
    'SELECT',
    'precondition: an enabled Select takes focus, so the disabled assertion is meaningful',
  )
})

test('Select styles compile through the shared barrel with container queries and no viewport media queries', async () => {
  const css = await compileStyleBlock(styleBlockOf('Select'))

  for (const selector of [
    '.rs-select',
    '.rs-select--sm',
    '.rs-select--md',
    '.rs-select--lg',
    '.rs-select--invalid',
    '.rs-select__control',
    '.rs-select__icon',
  ]) {
    assert.ok(css.includes(selector), `compiled Select CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s*\(min-width:\s*500px\)/,
    'Select must restate its touch-target scale at the sm container query',
  )
  assert.ok(
    !/@media\s*\(min-width/.test(css),
    'Select sizes with container queries, so it must not use viewport min-width media queries',
  )
  assert.match(
    css,
    /appearance:\s*none/,
    'the native arrow is replaced by the chevron, so the control must reset its appearance',
  )
  assert.match(
    css,
    /--rs-select-bg:\s*var\(--rs-color-surface,\s*#ffffff\)/,
    'the variant-owned background keeps the token over the literal',
  )
  assert.match(
    css,
    /\.rs-select--invalid\s+:global\s+\.rs-select__control\s*\{[^}]*--rs-select-bg:\s*var\(--rs-select-invalid-bg\)/m,
    'the invalid modifier reassigns the local the control already reads',
  )
  assert.match(
    css,
    /--rs-select-invalid-bg:\s*var\(--rs-color-danger-bg,/,
    'the invalid local keeps the semantic danger token over the literal',
  )

  // Every literal in the block must restate a value that already exists in variables.scss; a new
  // hex would mean a colour the design system does not define.
  const source = styleBlockOf('Select')
  const knownLiterals = new Set([
    '#ffffff',
    '#c8d2eb',
    '#131a2f',
    '#296dff',
    '#2f5bdb',
    '#4f5b7d',
    '#ffeef0',
    '#f0a8b0',
    '#c5221f',
  ])
  const authored = [...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([hex]) => hex.toLowerCase())
  const invented = authored.filter((hex) => !knownLiterals.has(hex))
  assert.deepEqual(invented, [], 'Select must not introduce hex values of its own')
})
