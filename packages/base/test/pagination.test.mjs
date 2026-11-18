import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// Astro and Vite are installed with the Storybook host, so resolve them from there.
const hostRequire = createRequire(new URL('../../../apps/astro/package.json', import.meta.url))
const hostRoot = fileURLToPath(new URL('../../../apps/astro/', import.meta.url))
const componentPath = fileURLToPath(new URL('../src/components/Pagination.astro', import.meta.url))

let server
let container
let Pagination

before(async () => {
  const { getViteConfig } = await import(hostRequire.resolve('astro/config'))
  const { createServer } = await import(hostRequire.resolve('vite'))
  const { experimental_AstroContainer: AstroContainer } = await import(
    hostRequire.resolve('astro/container')
  )
  const config = await getViteConfig(
    {},
    { root: hostRoot },
  )({ mode: 'development', command: 'serve' })
  server = await createServer({
    ...config,
    root: hostRoot,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  Pagination = (await server.ssrLoadModule(componentPath)).default
  container = await AstroContainer.create()
})

after(async () => {
  await server?.close()
})

const render = (props) => container.renderToString(Pagination, { props })

/** The visible sequence of items, e.g. `['1', '…', '4', '5', '6', '…', '10']`, without prev/next. */
const sequence = (html) =>
  [...html.matchAll(/<li class="rs-pagination__item"[^>]*>([\s\S]*?)<\/li>/g)]
    .map(([, inner]) => inner.replace(/<[^>]+>/g, ''))
    .slice(1, -1)

test('renders a labelled nav landmark with a list of links', async () => {
  const html = await render({ currentPage: 2, totalPages: 5, baseUrl: '/jobs' })
  assert.match(html, /^<nav aria-label="Pagination" class="rs-pagination">/)
  assert.match(html, /<ul class="rs-pagination__list" role="list">/)
  assert.match(html, /href="\/jobs\?page=3"/)
})

test('marks only the current page with aria-current="page"', async () => {
  const html = await render({ currentPage: 3, totalPages: 5 })
  assert.equal(html.match(/aria-current="page"/g).length, 1)
  assert.match(
    html,
    /rs-pagination__link--current" href="\?page=3" aria-label="Page 3" aria-current="page"/,
  )
})

test('shows every page when they fit, and nothing for a single page', async () => {
  assert.deepEqual(sequence(await render({ currentPage: 1, totalPages: 5 })), [
    '1',
    '2',
    '3',
    '4',
    '5',
  ])
  assert.equal(await render({ currentPage: 1, totalPages: 1 }), '')
})

test('collapses long ranges with ellipses and a stable number of slots', async () => {
  const total = 20
  const cases = {
    1: ['1', '2', '3', '4', '5', '…', '20'],
    4: ['1', '2', '3', '4', '5', '…', '20'],
    5: ['1', '…', '4', '5', '6', '…', '20'],
    10: ['1', '…', '9', '10', '11', '…', '20'],
    16: ['1', '…', '15', '16', '17', '…', '20'],
    17: ['1', '…', '16', '17', '18', '19', '20'],
    20: ['1', '…', '16', '17', '18', '19', '20'],
  }
  for (const [currentPage, expected] of Object.entries(cases)) {
    const html = await render({ currentPage: Number(currentPage), totalPages: total })
    assert.deepEqual(sequence(html), expected, `page ${currentPage}`)
  }
})

test('siblingCount widens the window around the current page', async () => {
  const html = await render({ currentPage: 10, totalPages: 20, siblingCount: 2 })
  assert.deepEqual(sequence(html), ['1', '…', '8', '9', '10', '11', '12', '…', '20'])
})

test('hides ellipses from assistive tech', async () => {
  const html = await render({ currentPage: 10, totalPages: 20 })
  assert.equal(html.match(/<li class="rs-pagination__item" aria-hidden="true">/g).length, 2)
})

test('renders previous and next as plain text when there is nowhere to go', async () => {
  const first = await render({ currentPage: 1, totalPages: 3 })
  assert.match(first, /<span class="rs-pagination__disabled">Previous<\/span>/)
  assert.match(first, /<a class="rs-pagination__link" href="\?page=2" rel="next">Next<\/a>/)

  const last = await render({ currentPage: 3, totalPages: 3 })
  assert.match(last, /<a class="rs-pagination__link" href="\?page=2" rel="prev">Previous<\/a>/)
  assert.match(last, /<span class="rs-pagination__disabled">Next<\/span>/)
})

test('builds hrefs from baseUrl and param, keeping an existing query string', async () => {
  const plain = await render({ currentPage: 1, totalPages: 3, baseUrl: '/jobs', param: 'p' })
  assert.match(plain, /href="\/jobs\?p=2"/)
  const query = await render({ currentPage: 1, totalPages: 3, baseUrl: '/jobs?q=design' })
  assert.match(query, /href="\/jobs\?q=design&amp;page=2"/)
})

test('hrefFor takes over href building', async () => {
  const html = await render({
    currentPage: 2,
    totalPages: 3,
    baseUrl: '/ignored',
    hrefFor: (page) => `/jobs/page/${page}`,
  })
  assert.match(html, /href="\/jobs\/page\/1"/)
  assert.doesNotMatch(html, /ignored/)
})

test('labels can be translated', async () => {
  const html = await render({
    currentPage: 2,
    totalPages: 3,
    previousLabel: 'Précédent',
    nextLabel: 'Suivant',
    pageLabel: 'Page {page} des résultats',
    'aria-label': 'Pagination des résultats',
  })
  assert.match(html, /aria-label="Pagination des résultats"/)
  assert.match(html, />Précédent<\/a>/)
  assert.match(html, />Suivant<\/a>/)
  assert.match(html, /aria-label="Page 2 des résultats"/)
})

test('clamps out-of-range and invalid input', async () => {
  assert.match(await render({ currentPage: 99, totalPages: 3 }), /aria-current="page">3</)
  assert.match(await render({ currentPage: -4, totalPages: 3 }), /aria-current="page">1</)
  assert.match(await render({ currentPage: Number.NaN, totalPages: 3 }), /aria-current="page">1</)
})

test('passes class and native attributes to the nav', async () => {
  const html = await render({ currentPage: 1, totalPages: 2, class: 'jobs', id: 'results-pages' })
  assert.match(html, /<nav [^>]*id="results-pages"/)
  assert.match(html, /class="rs-pagination jobs"/)
})
