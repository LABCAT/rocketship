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

## Theming

Theming is CSS-variable based. Components reference `--rs-*` tokens (from `src/styles/variables.scss`) and expose `--rs-<component>-*` override hooks. Adopters can override tokens and component variables from `:root` or any ancestor.