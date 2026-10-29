import stylelint from 'stylelint'

const noLoudComments = 'rocketship/no-loud-comments'

/**
 * Reports loud (slash-star) comments. Sass keeps them in the compiled CSS, so explanations are
 * `///`. Uses the SCSS parser's inline flag, which also works inside `.astro` and `.svelte` files.
 */
const noLoudCommentsPlugin = stylelint.createPlugin(noLoudComments, (enabled) => (root, result) => {
  if (!enabled) return
  root.walkComments((comment) => {
    if (comment.raws.inline) return
    stylelint.utils.report({
      message: 'Use /// comments; /* */ ships in the compiled CSS',
      node: comment,
      result,
      ruleName: noLoudComments,
    })
  })
})

/**
 * Enforces the hard style rules in `.agents/rules/rocketship-bem-scss.mdc` on component style
 * blocks, so agents get a failing check instead of relying on reading the rules.
 *
 * @type {import('stylelint').Config}
 */
export default {
  plugins: [noLoudCommentsPlugin],
  overrides: [{ files: ['**/*.astro', '**/*.svelte'], customSyntax: 'postcss-html' }],
  // Pre-review components. Remove each one when it is reviewed (Astro) or ported again (Svelte).
  ignoreFiles: [
    'packages/base/src/components/Button.astro',
    'packages/base/src/components/Card.astro',
    'packages/base/src/components/Typography.astro',
    'packages/svelte/src/components/Button.svelte',
    'packages/svelte/src/components/Card.svelte',
    'packages/svelte/src/components/Disclosure.svelte',
    'packages/svelte/src/components/Field.svelte',
    'packages/svelte/src/components/Figure.svelte',
    'packages/svelte/src/components/Input.svelte',
    'packages/svelte/src/components/Label.svelte',
    'packages/svelte/src/components/Textarea.svelte',
    'packages/svelte/src/components/Typography.svelte',
  ],
  rules: {
    // Every compiled selector is one BEM class, plus pseudo-classes or pseudo-elements on it.
    // Svelte's `:global { }` wrapper is not a selector of ours, so it does not count.
    'selector-max-compound-selectors': [1, { ignoreSelectors: [':global'] }],
    'selector-max-class': 1,
    // `&--x.rs-y` and `&.rs-y` are two classes in one compound; the class rule skips them.
    'selector-disallowed-list': [[/&[\w-]*\./], { splitList: true }],
    'selector-max-type': 0,
    'selector-max-id': 0,
    'selector-max-attribute': 0,
    'selector-max-universal': 0,
    // Colours come from rs-token(), dark mode from light-dark(), the typeface from the page.
    'color-no-hex': true,
    'media-feature-name-disallowed-list': ['prefers-color-scheme'],
    'property-disallowed-list': ['font-family'],
    [noLoudComments]: true,
  },
}
