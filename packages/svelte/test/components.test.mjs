import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { compile, preprocess } from 'svelte/compiler'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { createRawSnippet } from 'svelte'
import { render } from 'svelte/server'
import { preprocessCSS, resolveConfig } from 'vite'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(packageRoot))
const componentsDir = join(packageRoot, 'src', 'components')
// Compiled components are emitted inside node_modules so bare `svelte` imports resolve.
const renderCache = join(packageRoot, 'node_modules', '.cache', 'rocketship-svelte-component-tests')

/**
 * Compiles a component to a server-renderable ES module, mirroring how the Svelte
 * compiler consumes the component source at build time. Component imports are rewritten
 * to the compiled sibling so cross-component imports resolve from the cache directory.
 */
const compileServerModule = async (name) => {
  const source = readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')
  const { code } = await preprocess(source, vitePreprocess(), { filename: `${name}.svelte` })
  const { js } = compile(code, { generate: 'server', filename: `${name}.svelte` })
  return js.code.replace(
    /(['"])\.\/([A-Za-z0-9_.]+)\.svelte\1/g,
    (_, quote, base) => `${quote}./${base}.compiled.mjs${quote}`,
  )
}

let serverComponentsWritten = false

/**
 * Every component is compiled up front: Accordion imports Disclosure, so both modules
 * have to exist on disk before either is imported.
 */
const writeServerComponents = async () => {
  if (serverComponentsWritten) return
  mkdirSync(renderCache, { recursive: true })
  for (const entry of readdirSync(componentsDir)) {
    if (!entry.endsWith('.svelte')) continue
    const name = entry.replace(/\.svelte$/, '')
    writeFileSync(join(renderCache, `${name}.compiled.mjs`), await compileServerModule(name))
  }
  serverComponentsWritten = true
}

/** Compiles a component to a server module and imports it. */
const loadComponent = async (name) => {
  await writeServerComponents()
  return (await import(pathToFileURL(join(renderCache, `${name}.compiled.mjs`)).href)).default
}

/** Renders a component and returns the server-rendered body markup. */
const renderMarkup = (Component, props = {}) => render(Component, { props }).body

/** Returns the opening tag for the first element with the given name. */
const openingTag = (markup, name) => markup.match(new RegExp(`<${name}\\b[^>]*>`))?.[0] ?? ''

/** Parses the class attribute of the first element with the given name into tokens. */
const classList = (markup, name = 'div') =>
  (openingTag(markup, name).match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean)

/** Renders a Svelte snippet around raw markup, standing in for a default slot. */
const snippet = (html) => createRawSnippet(() => ({ render: () => html }))

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

/**
 * Client-side harness for the interactive components. Svelte's client runtime needs a
 * DOM before it is imported, so the JSDOM globals are installed lazily and the client
 * build of `svelte` is resolved through its package `browser` entry.
 */
let clientRuntime
const ensureClientDom = () => {
  if (clientRuntime) return clientRuntime

  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
  const window = dom.window

  globalThis.window = window
  globalThis.document = window.document
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
  for (const key of Object.getOwnPropertyNames(window)) {
    if (!/^(HTML|SVG|DOM|Element|Node|Text|Comment|DocumentFragment|Event|MouseEvent|KeyboardEvent|CSS)/.test(key)) continue
    if (typeof globalThis[key] === 'undefined' && typeof window[key] === 'function') {
      globalThis[key] = window[key]
    }
  }
  globalThis.requestAnimationFrame = window.requestAnimationFrame
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame
  globalThis.getComputedStyle = window.getComputedStyle

  return (clientRuntime = { dom, window })
}

const require = createRequire(import.meta.url)
const clientCache = join(packageRoot, 'node_modules', '.cache', 'rocketship-svelte-client-tests')

/**
 * Compiles a component (or a test fixture) with `generate: 'client'` and writes it to the
 * cache. Relative component imports and the bare `svelte` specifier are rewritten so the
 * generated modules resolve from the cache directory. Shared components use a stable file
 * name so fixtures can import them by path; fixtures get a unique name.
 */
const writeClientComponent = async (name, source, { stable = false } = {}) => {
  ensureClientDom()
  const clientEntry = pathToFileURL(
    join(dirname(require.resolve('svelte/package.json')), require('svelte/package.json').exports['.'].browser),
  ).href

  const { code } = await preprocess(source, vitePreprocess(), { filename: `${name}.svelte` })
  const { js } = compile(code, { generate: 'client', filename: `${name}.svelte` })

  const rewritten = js.code
    .replace(/(['"])\.\/([A-Za-z0-9_.]+)\.svelte\1/g, (_, quote, base) => `${quote}./${base}.compiled.mjs${quote}`)
    .replace(/(['"])svelte\1/g, (_, quote) => `${quote}${clientEntry}${quote}`)

  mkdirSync(clientCache, { recursive: true })
  const file = join(clientCache, stable ? `${name}.compiled.mjs` : `${name}-${randomUUID()}.compiled.mjs`)
  writeFileSync(file, rewritten)
  return file
}

const importClientComponent = async (file) => (await import(pathToFileURL(file).href)).default

const loadClientComponent = async (name, source, options) =>
  importClientComponent(await writeClientComponent(name, source, options))

const loadComponentSource = (name) => readFileSync(join(componentsDir, `${name}.svelte`), 'utf8')

const mountFixture = async (markup, script = '') => {
  const { window } = ensureClientDom()
  const clientEntry = pathToFileURL(
    join(dirname(require.resolve('svelte/package.json')), require('svelte/package.json').exports['.'].browser),
  ).href
  const { mount, flushSync } = await import(clientEntry)

  // Both components must exist on disk before either is imported, because the compiled
  // Accordion imports the compiled Disclosure at module link time.
  for (const name of ['Accordion', 'Disclosure']) {
    await writeClientComponent(name, loadComponentSource(name), { stable: true })
  }

  const Fixture = await loadClientComponent(`Fixture-${randomUUID()}`, `<script lang="ts">
  import Accordion from './Accordion.svelte'
  import Disclosure from './Disclosure.svelte'
  ${script}
</script>
${markup}`)

  const target = window.document.createElement('div')
  window.document.body.appendChild(target)
  const instance = mount(Fixture, { target })
  flushSync()

  return { window, target, instance, flushSync, details: () => [...target.querySelectorAll('details')] }
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

test('Disclosure and Accordion are exported with subpaths and exported prop union types', () => {
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const index = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8')

  for (const name of ['Accordion', 'Disclosure']) {
    assert.equal(
      pkg.exports[`./components/${name}`],
      `./src/components/${name}.svelte`,
      `packages/svelte must export ./components/${name}`,
    )
    assert.match(index, new RegExp(`export \\{ default as ${name} \\}`), `${name} must be re-exported`)
    assert.match(index, new RegExp(`export type \\* from './components/${name}.svelte'`), `${name} prop types must be re-exported`)
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
  assert.ok(classList(markup, 'details').includes('rs-disclosure'), 'the root must be a details element with rs-disclosure')
  assert.match(root, /id="notes"/, 'native attributes must spread onto the root')
  assert.match(root, /data-testid="notes"/, 'data attributes must spread onto the root')
  assert.ok(markup.includes('<summary class="rs-disclosure__summary"'), 'the summary must carry its element class')
  assert.ok(markup.includes('rs-disclosure__label'), 'the summary label must carry its element class')
  assert.ok(
    markup.includes('<span class="rs-disclosure__indicator" aria-hidden="true">'),
    'the indicator must be decorative',
  )
  assert.ok(markup.includes('<div class="rs-disclosure__panel">'), 'the panel must carry its element class')

  const closed = renderMarkup(Disclosure, { summary: 'Release notes' })
  assert.ok(!openingTag(closed, 'details').includes('open'), 'a closed disclosure must not render the open attribute')

  const opened = renderMarkup(Disclosure, { summary: 'Release notes', open: true })
  assert.match(openingTag(opened, 'details'), /\bopen\b/, 'an open disclosure must render the open attribute')
})

test('Disclosure falls back to the summary snippet when no summary string is given', async () => {
  const Disclosure = await loadComponent('Disclosure')
  const markup = renderMarkup(Disclosure, {
    summarySlot: snippet('<strong>Custom</strong> label'),
    children: snippet('<p>Body</p>'),
  })

  assert.ok(markup.includes('<strong>Custom</strong> label'), 'the summary snippet must render inside the summary')

  const preferred = renderMarkup(Disclosure, {
    summary: 'Plain label',
    summarySlot: snippet('<strong>Custom</strong> label'),
  })
  assert.ok(preferred.includes('Plain label'), 'the summary string wins when both are provided')
  assert.ok(!preferred.includes('<strong>Custom</strong>'), 'the snippet must not render when a summary string exists')
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

  assert.equal(target.querySelector('[data-state]').textContent, 'true', 'a native toggle must reach the bound state')
  assert.equal(element.open, true)
})

test('keyboard activation toggles a summary and leaves the native behaviour intact', async () => {
  const { window, flushSync, details } = await mountFixture(`<Disclosure summary="Keyboard">body</Disclosure>`)
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
  assert.deepEqual(details().map((element) => element.open), [true, false, false])

  activateSummary(window, second, flushSync)
  assert.deepEqual(
    details().map((element) => element.open),
    [false, true, false],
    'opening a sibling must close the previously open disclosure',
  )

  activateSummary(window, third, flushSync)
  assert.deepEqual(details().map((element) => element.open), [false, false, true])

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
  assert.deepEqual(details().map((element) => element.open), [true, true])

  activateSummary(window, first, flushSync)
  assert.deepEqual(details().map((element) => element.open), [false, true])
})

test('Accordion renders rs-accordion and marks single mode, and spreads attrs', async () => {
  const Accordion = await loadComponent('Accordion')
  const multiple = renderMarkup(Accordion, { 'data-testid': 'faq', children: snippet('<p>x</p>') })
  const multipleTag = openingTag(multiple, 'div')
  assert.ok(classList(multiple, 'div').includes('rs-accordion'))
  assert.match(multipleTag, /data-testid="faq"/)
  assert.ok(!multiple.includes('rs-accordion--single'), 'multiple mode must not render the single modifier')

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
  assert.deepEqual(details().map((element) => element.open), [true, true, false, false])

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
  assert.deepEqual(details().map((element) => element.open), [true, false])

  instance.setShowA(false)
  flushSync()
  assert.equal(details().length, 1, 'the removed item must leave the DOM')

  const remaining = details()[0]
  assert.equal(remaining.open, false, 'the surviving item must stay closed')
  activateSummary(window, remaining, flushSync)
  assert.deepEqual(details().map((element) => element.open), [true])
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
    /@container\s+rs-component\s*\(min-width:\s*500px\)/,
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
