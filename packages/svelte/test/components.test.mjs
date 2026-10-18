import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

  const clientEntry = join(dirname(require.resolve('svelte/package.json')), 'src', 'index-client.js')
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

const containerModifiers = [
  'rs-container--full-width',
  'rs-container--wide',
  'rs-container--content',
]

test('packages/svelte exports the Alert, Button, Card, Container, Grid and Typography subpaths like the Astro package', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const basePkg = JSON.parse(
    readFileSync(join(repoRoot, 'packages', 'base', 'package.json'), 'utf8'),
  )

  for (const name of ['Alert', 'Button', 'Card', 'Container', 'Grid', 'Typography']) {
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
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
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
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
    'the base grid restates two columns at the sm container query',
  )
  assert.match(
    css,
    /@container\s+rs-component\s*\(min-width:\s*700px\)/,
    'the 3/4 column modifiers restate at the md container query',
  )
})

test('Alert renders .rs-alert with exactly one status modifier per variant', async () => {
  const Alert = await loadComponent('Alert')

  const variants = ['info', 'success', 'warning', 'error']
  const modifiers = variants.map((v) => `rs-alert--${v}`)

  for (const variant of variants) {
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

  assert.deepEqual(classList(renderMarkup(Alert)), ['rs-alert', 'rs-alert--info'], 'info default')
})

test('Alert derives role from the variant and lets an explicit role win', async () => {
  const Alert = await loadComponent('Alert')

  for (const variant of ['info', 'success']) {
    assert.match(
      openingTag(renderMarkup(Alert, { variant }), 'div'),
      /role="status"/,
      `Alert ${variant} must announce as status`,
    )
  }
  for (const variant of ['warning', 'error']) {
    assert.match(
      openingTag(renderMarkup(Alert, { variant }), 'div'),
      /role="alert"/,
      `Alert ${variant} must announce as alert`,
    )
  }

  assert.match(
    openingTag(renderMarkup(Alert, { variant: 'error', role: 'status' }), 'div'),
    /role="status"/,
    'an explicit role overrides the variant-derived role',
  )
  assert.match(
    openingTag(renderMarkup(Alert, { variant: 'info', role: 'alert' }), 'div'),
    /role="alert"/,
    'an explicit role overrides the variant-derived role in both directions',
  )
})

test('Alert renders the title from the prop or the title snippet and always the body', async () => {
  const Alert = await loadComponent('Alert')

  const titled = renderMarkup(Alert, { title: 'Heads up', children: snippet('<p>Body</p>') })
  assert.match(titled, /<h4 class="rs-alert__title">Heads up<\/h4>/)
  assert.match(titled, /<div class="rs-alert__body">[\s\S]*?<p>Body<\/p>[\s\S]*?<\/div>/)

  const slotted = renderMarkup(Alert, {
    titleSlot: snippet('<em>Slotted title</em>'),
    children: snippet('<p>Body</p>'),
  })
  assert.match(slotted, /<h4 class="rs-alert__title">[\s\S]*?<em>Slotted title<\/em>[\s\S]*?<\/h4>/)

  const titleWins = renderMarkup(Alert, {
    title: 'Prop title',
    titleSlot: snippet('<em>Slotted title</em>'),
  })
  assert.match(titleWins, /<h4 class="rs-alert__title">Prop title<\/h4>/)
  assert.doesNotMatch(titleWins, /Slotted title/)

  const bare = renderMarkup(Alert, { children: snippet('<p>Body</p>') })
  assert.doesNotMatch(bare, /rs-alert__title/, 'Alert omits the title element when none is given')
  assert.match(bare, /rs-alert__body/)
})

test('Alert as and class mirror the Astro component and spread native attributes', async () => {
  const Alert = await loadComponent('Alert')

  for (const tag of ['section', 'aside', 'article']) {
    const markup = renderMarkup(Alert, {
      as: tag,
      variant: 'success',
      class: 'consumer-class',
      id: 'alert-1',
    })
    assert.ok(openingTag(markup, tag).length > 0, `Alert as="${tag}" must render a <${tag}>`)
    assert.ok(
      markup.indexOf(`<${tag}`) < markup.indexOf('<div'),
      `Alert as="${tag}" must use the requested tag as the root element`,
    )
    assert.deepEqual(classList(markup, tag), ['rs-alert', 'rs-alert--success', 'consumer-class'])
    assert.match(openingTag(markup, tag), /id="alert-1"/)
  }
})

test('Alert styles compile through the shared barrel and keep every Astro selector', async () => {
  const css = await compileStyleBlock(styleBlockOf('Alert'))

  for (const selector of [
    '.rs-alert',
    '.rs-alert--success',
    '.rs-alert--warning',
    '.rs-alert--error',
    '.rs-alert__title',
    '.rs-alert__body',
  ]) {
    assert.ok(css.includes(selector), `compiled Alert CSS must contain ${selector}`)
  }

  assert.match(
    css,
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
    'Alert padding and type scale restate at the sm container query',
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
    { label: 'explicit false', props: { striped: false, compact: false, hover: false }, expected: [] },
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
    { label: 'label wins', props: { label: 'Revenue', caption: 'Caption text' }, expected: 'Revenue' },
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
    assert.equal(holder.getAttribute('aria-label'), 'Table', 'an unnamed region falls back to Table')

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
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
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
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
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
