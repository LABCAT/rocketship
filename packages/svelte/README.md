# @labcat2020/rocketship-svelte

Svelte 5 port of the Rocketship component library. Components reuse the same design system as the Astro package (`@labcat2020/rocketship`): design tokens, the mixin barrel, and the base resets are shared, not duplicated.

This package is scaffolded and exports nothing yet. Components are added as copy-style ports of their Astro originals.

## Install

```bash
npm install @labcat2020/rocketship-svelte @labcat2020/rocketship
```

## Usage

Import the base styles (tokens + default theme) once in your app, exactly as with the Astro package:

```js
import '@labcat2020/rocketship/styles'
```

Inside a component's `<style lang="scss">` block, import the shared mixin barrel:

```scss
@use '@labcat2020/rocketship/styles/mixins' as *;
```

`./styles/mixins` is a stable export of `@labcat2020/rocketship` and resolves to `src/styles/mixins.scss`, the barrel that forwards the functions, breakpoint, container-query, and typography mixins. Import the barrel — never individual partials under `mixins/`.

## Theming

Theming is CSS-variable based and unchanged from the Astro library. Components reference the global `--rs-*` tokens and expose `--rs-<component>-*` override hooks. Adopters can override tokens and component variables from `:root` or any ancestor.

## Scripts

```bash
pnpm build   # compile TypeScript
pnpm check   # svelte-check
pnpm test    # node --test
```
