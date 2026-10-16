# @labcat2020/rocketship-svelte

Svelte 5 port of the Rocketship component library. Components reuse the same design system as the Astro package (`@labcat2020/rocketship`): design tokens, the mixin barrel, and the base resets are shared, not duplicated.

Components are either copy-style ports of their Astro originals, or Svelte-first components with no Astro original yet. Either way they render the same BEM classes and follow the same props, token, `:global` style, container-query and a11y conventions, so an Astro version can be ported back from a Svelte-first component. A Svelte-first component is provisional — it may change once the matching Astro component's platinum standard lands, and Astro is the source of truth when the two diverge.

## Components

| Component    | Export                                                | Astro original     |
| ------------ | ----------------------------------------------------- | ------------------ |
| `Container`  | `@labcat2020/rocketship-svelte/components/Container`  | `Container.astro`  |
| `Grid`       | `@labcat2020/rocketship-svelte/components/Grid`       | `Grid.astro`       |
| `Card`       | `@labcat2020/rocketship-svelte/components/Card`       | `Card.astro`       |
| `Typography` | `@labcat2020/rocketship-svelte/components/Typography` | `Typography.astro` |
| `Button`     | `@labcat2020/rocketship-svelte/components/Button`     | `Button.astro`     |
| `Alert`      | `@labcat2020/rocketship-svelte/components/Alert`      | `Alert.astro`      |

Import components from their `./components/*` subpaths. Those subpaths are the package's public surface; deep imports such as `@labcat2020/rocketship-svelte/src/components/Container.svelte` are not exported and will not resolve.

```svelte
<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Grid from '@labcat2020/rocketship-svelte/components/Grid'
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Typography from '@labcat2020/rocketship-svelte/components/Typography'
  import Button from '@labcat2020/rocketship-svelte/components/Button'
</script>

<Container as="main" size="content" padded>
  <Typography as="article">
    <h1>Title</h1>
    <p>Body copy.</p>
  </Typography>
  <Grid columns={3}>
    <Card>…</Card>
    <Card>…</Card>
    <Card>…</Card>
  </Grid>
  <Button variant="primary">Continue</Button>
</Container>
```

Each component spreads unknown attributes onto its rendered element and composes an incoming `class` with its BEM block.

| Component    | Props                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`  | `as` (`div`, `section`, `main`, `article`, `header`, `footer`, `nav`), `size` (`default`, `content`, `wide`, `full`), `padded`, `class`       |
| `Grid`       | `as` (`div`, `ul`, `ol`), `columns` (`2`, `3`, `4`), `class`                                                                                  |
| `Card`       | `as` (`article`, `section`, `div`, `li`), `media` snippet, `meta` snippet, `class`                                                            |
| `Typography` | `as` (`div`, `section`, `article`), `html`, `class`                                                                                           |
| `Button`     | `as` (`button`, `a`), `href`, `variant` (`primary`, `secondary`, `ghost`), `size` (`small`, `medium`, `large`), `disabled`, `type`, `class`   |
| `Alert`      | `as` (`div`, `section`, `aside`, `article`), `variant` (`info`, `success`, `warning`, `error`), `title`, `titleSlot` snippet, `role`, `class` |

### `Typography` `html` prop

`Typography` keeps the `html` prop: pass a string and it renders as raw markup inside the wrapper, taking precedence over the `children` snippet. It is the Svelte equivalent of the Astro component's `set:html`.

**Sanitize before you pass it.** The prop renders trusted HTML verbatim and does not sanitize its input, so it is only safe for content you control or content already sanitized at the boundary. Never pass unsanitized user input, request data, or third-party HTML through it — run it through a sanitizer (for example DOMPurify) first, or render structured markup with the `children` snippet instead.

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
