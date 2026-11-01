# @labcat2020/rocketship

A CSS-first component library for Astro. For Svelte, use [`@labcat2020/rocketship-svelte`](https://www.npmjs.com/package/@labcat2020/rocketship-svelte).

- Style almost everything with CSS variables, from the global design tokens down to each component
- Plain BEM classes for anything the variables don't cover
- Light and dark mode built in
- Design tokens in the [W3C standard format](https://www.designtokens.org/tr/2025.10/format/), so your Figma designs can use the same colours and spacing as the code

See all the components in [Storybook](https://rocketship3000.pages.dev).

## Install

```bash
pnpm add @labcat2020/rocketship
```

## Usage

Import the styles once in your base layout, then import the components you need:

```astro
---
import '@labcat2020/rocketship/styles'
import Button from '@labcat2020/rocketship/components/Button'
---

<Button variant="primary">Click me</Button>
```

## Theming

Light and dark mode follow the user's OS setting. To change the theme, set `--rs-*` variables in your own CSS:

```css
:root {
  --rs-color-accent: #e4572e; /* change any --rs-* variable */
  color-scheme: dark; /* always use dark mode */
}
```
