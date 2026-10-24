import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const tokensDir = join(packageRoot, 'src', 'tokens')
const resolverFile = 'rocketship.resolver.json'
export const tokenMapPath = join(packageRoot, 'src', 'styles', 'mixins', 'token-map.scss')

const genericFonts = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
])

/** Reads a JSON file from the tokens folder. */
const readJson = (file) => JSON.parse(readFileSync(join(tokensDir, file), 'utf8'))

/**
 * Loads the token files a DTCG resolver puts in effect for one mode, in resolution order.
 * Sets always apply; the `mode` modifier contributes the files of the requested context.
 */
const sourcesFor = (resolver, mode) =>
  resolver.resolutionOrder
    .flatMap(({ $ref }) => {
      const [, kind, name] = $ref.split('/')
      if (kind === 'sets') return resolver.sets[name].sources
      const contexts = resolver.modifiers[name].contexts
      if (!contexts[mode]) throw new Error(`Modifier '${name}' has no '${mode}' context.`)
      return contexts[mode]
    })
    .map(({ $ref }) => readJson($ref))

/**
 * Flattens DTCG groups into `name → { type, value }`. Group names join with `-` to form the
 * CSS name, `$root` adds no segment, and a group's `$type` passes down to its tokens.
 * Later sources override earlier ones, as the resolver's resolution order requires.
 */
const flatten = (group, tokens, path = [], type = undefined) => {
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith('$') && key !== '$root') continue
    const nodePath = key === '$root' ? path : [...path, key]
    if ('$value' in node) {
      tokens.set(nodePath.join('-'), { type: node.$type ?? type, value: node.$value })
    } else {
      flatten(node, tokens, nodePath, node.$type ?? type)
    }
  }
  return tokens
}

/** Resolves every token for one mode into a single ordered map. */
const tokensFor = (resolver, mode) =>
  sourcesFor(resolver, mode).reduce((tokens, source) => flatten(source, tokens), new Map())

/** Turns a `{group.token}` reference into the CSS token name it points at. */
const aliasName = (value) =>
  typeof value === 'string' && /^\{.+\}$/.test(value)
    ? value
        .slice(1, -1)
        .replace(/\.\$root$/, '')
        .replaceAll('.', '-')
    : undefined

/** Writes a dimension or duration as CSS; a zero length stays unitless. */
const formatLength = ({ value, unit }) => (value === 0 ? '0' : `${value}${unit}`)

/** Writes an sRGB colour as hex when opaque, otherwise as `rgb()` with alpha. */
const formatColor = ({ colorSpace, components, alpha = 1, hex }) => {
  if (colorSpace !== 'srgb') throw new Error(`Unsupported colour space '${colorSpace}'.`)
  if (alpha === 1 && hex) return hex
  const channels = hex
    ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    : components.map((c) => Math.round(c * 255))
  return alpha === 1 ? `rgb(${channels.join(' ')})` : `rgb(${channels.join(' ')} / ${alpha})`
}

/** Writes a shadow (one layer or several) as a `box-shadow` value; zero spread is omitted. */
const formatShadow = (value) => {
  const layers = (Array.isArray(value) ? value : [value]).map(
    ({ offsetX, offsetY, blur, spread, color }) =>
      [offsetX, offsetY, blur, ...(spread.value === 0 ? [] : [spread])]
        .map(formatLength)
        .concat(formatColor(color))
        .join(' '),
  )
  return layers.length === 1 ? layers[0] : `(${layers.join(', ')})`
}

/** Writes a font stack as a Sass list, quoting every family name except generic keywords. */
const formatFontFamily = (value) => {
  const names = (Array.isArray(value) ? value : [value]).map((name) =>
    genericFonts.has(name) ? name : `'${name}'`,
  )
  return `(${names.join(', ')})`
}

/** Writes one resolved DTCG value as a Sass value, or `(alias: name)` for a reference. */
const formatValue = (name, { type, value }, tokens) => {
  const alias = aliasName(value)
  if (alias) {
    if (!tokens.has(alias)) throw new Error(`Token '${name}' references unknown token '${alias}'.`)
    return `(alias: ${alias})`
  }
  switch (type) {
    case 'color':
      return formatColor(value)
    case 'dimension':
    case 'duration':
      return formatLength(value)
    case 'shadow':
      return formatShadow(value)
    case 'fontFamily':
      return formatFontFamily(value)
    case 'fontWeight':
    case 'number':
      return String(value)
    default:
      throw new Error(`Token '${name}' has unsupported type '${type}'.`)
  }
}

/**
 * Renders `$rs-tokens` from the resolver's light and dark modes. A token with the same value in
 * both modes is written once; colours and shadows that differ become a `(light, dark)` pair.
 */
export const renderTokenMap = () => {
  const resolver = readJson(resolverFile)
  const light = tokensFor(resolver, 'light')
  const dark = tokensFor(resolver, 'dark')

  const entries = [...light].map(([name, token]) => {
    if (!dark.has(name)) throw new Error(`Token '${name}' is missing from dark mode.`)
    const lightValue = formatValue(name, token, light)
    const darkValue = formatValue(name, dark.get(name), dark)
    if (lightValue === darkValue) return `  ${name}: ${lightValue},`
    const isAlias = lightValue.startsWith('(alias') || darkValue.startsWith('(alias')
    if (!['color', 'shadow'].includes(token.type) || isAlias) {
      throw new Error(`Token '${name}' differs by mode; only colour and shadow values may.`)
    }
    return `  ${name}: (light: ${lightValue}, dark: ${darkValue}),`
  })

  const darkOnly = [...dark.keys()].filter((name) => !light.has(name))
  if (darkOnly.length) throw new Error(`Tokens missing from light mode: ${darkOnly.join(', ')}.`)

  return [
    '// Generated from src/tokens/*.tokens.json by `pnpm --filter @labcat2020/rocketship tokens`.',
    '// Do not edit: change the JSON and run the command again.',
    '$rs-tokens: (',
    ...entries,
    ');',
    '',
  ].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(tokenMapPath, renderTokenMap())
}
