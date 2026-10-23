# @labcat2020/rocketship

Astro-focused, CSS-first component library. Design tokens, the default theme, and core components built with SCSS (BEM + `--rs-*` CSS custom properties).

## Install

```bash
npm install @labcat2020/rocketship
```

## Usage

Import a component:

```astro
---
import Button from '@labcat2020/rocketship/components/Button'
---

<Button variant="primary">Click me</Button>
```

Import the base styles (tokens + default theme) once in your app:

```js
import '@labcat2020/rocketship/styles'
```

Inside a `<style lang="scss">` block, import the shared mixin barrel:

```scss
@use '@labcat2020/rocketship/styles/mixins' as *;
```

`./styles/mixins` is a stable export that resolves to `src/styles/mixins.scss`, the barrel that forwards the functions, breakpoint, container-query, and typography mixins. Import the barrel — never individual partials under `mixins/`, which are not exported. Because the barrel is a real package export, consumers resolve it through the package boundary and do not need bundler `loadPaths` workarounds.

## Theming

Theming is CSS-variable based. Components reference `--rs-*` tokens (from `src/styles/variables.scss`) and expose `--rs-<component>-*` override hooks. Adopters can override tokens and component variables from `:root` or any ancestor.
