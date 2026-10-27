import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import * as sass from 'sass'
import type { Plugin } from 'vite'

/**
 * Strips Vite query suffixes so the module id maps to a real `.astro` path.
 */
const astroFilePath = (id: string): string => id.split('?')[0] ?? id

/**
 * Reads top-level `<style>` blocks from an Astro source file, ignoring frontmatter.
 */
const extractStyleBlocks = (source: string): Array<{ css: string; lang: string | null }> => {
  const withoutFrontmatter = source.replace(/^---[\s\S]*?---/m, '')
  const blocks: Array<{ css: string; lang: string | null }> = []
  const regex = /<style((?:\s[^>]*)?)>([\s\S]*?)<\/style>/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(withoutFrontmatter)) !== null) {
    const langMatch = match[1].match(/\blang\s*=\s*['"]?([\w-]+)/)
    blocks.push({ css: match[2].trim(), lang: langMatch ? langMatch[1] : null })
  }

  return blocks
}

/**
 * Compiles a style block to CSS. Plain CSS is returned as-is; Sass/SCSS is
 * compiled with the component file as the resolution URL for `@use`.
 */
const compileBlock = (filePath: string, css: string, lang: string | null): string | null => {
  if (!lang || lang === 'css') {
    return css
  }

  if (lang !== 'scss' && lang !== 'sass') {
    return null
  }

  return sass.compileString(css, {
    url: pathToFileURL(filePath),
    syntax: lang === 'sass' ? 'indented' : 'scss',
  }).css
}

/**
 * Builds a browser IIFE that injects compiled CSS once per component block.
 */
const styleInjectionSnippet = (filePath: string, index: number, css: string): string => {
  const markerValue = JSON.stringify(`${filePath}:${index}`)
  return `
(function() {
  if (typeof document === 'undefined') { return; }
  const value = ${markerValue};
  const tagged = document.head.querySelectorAll('style[data-rs-scss]');
  for (const node of tagged) {
    if (node.getAttribute('data-rs-scss') === value) { return; }
  }
  const style = document.createElement('style');
  style.setAttribute('data-rs-scss', value);
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();`
}

/**
 * Compiles SCSS from the original `.astro` file and injects it into
 * storybook-astro’s client stub for both `storybook dev` and `storybook build`.
 */
const transformAstroStub = (code: string, id: string) => {
  const filePath = astroFilePath(id)
  if (!filePath.endsWith('.astro')) {
    return null
  }
  if (!code.includes('isAstroComponentFactory')) {
    return null
  }

  let source: string
  try {
    source = readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }

  const compiled = extractStyleBlocks(source)
    .map((block, index) => {
      const css = compileBlock(filePath, block.css, block.lang)
      return css ? styleInjectionSnippet(filePath, index, css) : ''
    })
    .join('\n')

  if (!compiled) {
    return null
  }

  const withoutSkipWarns = code.replace(
    /\(function\(\) \{\s*if \(typeof console !== 'undefined'\) \{ console\.warn\([\s\S]*?preprocessed styles are not supported[\s\S]*?\); \}\s*\}\)\(\);/g,
    '',
  )

  const withoutRawScss = withoutSkipWarns.replace(
    /\(function\(\) \{[\s\S]*?style\.textContent = "[^"]*@use[\s\S]*?\}\)\(\);/g,
    '',
  )

  return {
    code: `${compiled}\n${withoutRawScss}`,
    map: null,
  }
}

/**
 * Vite plugin that compiles `<style lang="scss">` in Astro components for
 * Storybook. storybook-astro 1.x inlines raw `<style>` on the client stub and
 * skips preprocessors in both dev and static builds.
 */
export const compileAstroScssPlugin = (): Plugin => ({
  name: 'compile-astro-scss-for-storybook',
  enforce: 'post',
  transform: transformAstroStub,
})
