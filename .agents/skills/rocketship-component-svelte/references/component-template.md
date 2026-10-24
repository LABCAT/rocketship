# Svelte Component Template (annotated)

Based on the reviewed references: Alert (fixed root, variants), Stack (polymorphic `as`), Label (fixed root, decoration) and Table (positional snippet). Replace `<Name>` / `rs-name` throughout.

On the port path only Astro syntax changes: frontmatter → `<script>`, `Astro.props` → `$props()`, `<slot />` → `{@render children?.()}`, `<style is:global>` → `<style lang="scss">` + `:global { }`. Selectors, declarations and their order come across unchanged.

## Script: fixed root (Alert)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  // 1. Exported union per public axis.
  export type NameVariant = 'default' | 'muted'

  // 2. Props: the axes, class and children, extending the root element's own attributes.
  //    No `as` unless the Astro original has one. No content props (title, label text).
  type Props = {
    variant?: NameVariant
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLDivElement>

  // 3. Defaults in the destructure; the rest spreads onto the root.
  let { variant = 'default', class: className = '', children, ...attrs }: Props = $props()

  // 4. The base class is the default: the default variant adds no modifier.
  const classes = $derived(
    ['rs-name', variant !== 'default' ? `rs-name--${variant}` : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<div {...attrs} class={classes}>
  {@render children?.()}
</div>
```

## Polymorphic root (Stack)

```svelte
<script lang="ts">
  export type NameTag = 'div' | 'ul' | 'ol'

  type Props = {
    as?: NameTag
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'div', class: className = '', children, ...attrs }: Props = $props()
</script>

<svelte:element this={as} role={as === 'div' ? undefined : 'list'} {...attrs} class={classes}>
  {@render children?.()}
</svelte:element>
```

## Decoration next to the content (Label)

```svelte
<label {...attrs} class={classes}>
  {@render children?.()}{#if required}<span class="rs-label__required" aria-hidden="true">*</span>{/if}
</label>
```

The consumer writes every content element and applies the element class. A component may render decoration (a glyph), never words, and never takes ids or wiring for the consumer's elements.

## Positional snippet (Table caption)

An Astro named slot for an element whose position is structure becomes a named snippet guarded by `{#if}`:

```svelte
<table {...attrs} class={classes}>
  {#if caption}<caption class="rs-table__caption">{@render caption()}</caption>{/if}
  {@render children?.()}
</table>
```

## Styles

```scss
<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-name {
      /* 1. variant-owned locals (only when modifiers swap a set) */
      --rs-name-bg: #{rs-token(color-surface)};
      --rs-name-color: #{rs-token(color-fg)};

      /* 2. reset + box-sizing (only if needed) */

      /* 3. layout, then appearance. Opt-in hooks are never assigned above. */
      display: flex;
      flex-direction: column;
      gap: var(--rs-name-gap, #{rs-token(space-2)});
      background: var(--rs-name-bg);
      border-radius: var(--rs-name-border-radius, #{rs-token(radius-md)});
      color: var(--rs-name-color);
      padding: var(--rs-name-padding, #{rs-token(space-4)});

      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      /* modifiers only reassign variables */
      &--muted {
        --rs-name-bg: #{rs-token(color-surface-elevated)};
      }

      /* element classes the consumer applies: margin 0 and their own colour */
      &__title {
        color: var(--rs-name-color);
        font-size: inherit;
        font-weight: var(--rs-name-title-font-weight, #{rs-token(font-weight-semibold)});
        line-height: #{rs-token(line-height-tight)};
        margin: 0;
      }
    }
  }
</style>
```

`:global { ... }` compiles the block unscoped, like Astro's `is:global`, so `.rs-*` classes are stable and consumer elements match. SCSS nesting (`&__element`, `&--modifier`, `&:state`) works inside it. `:global(.rs-name) { &__title { … } }` and `:global(&)` are compiler errors.

`rs-token(name)` compiles to `var(--rs-name, <default>)` with `light-dark()` colours, so the component renders the default theme with or without the app importing `@labcat2020/rocketship/styles`. Always interpolate it.

## Package export

`packages/svelte/package.json` → `exports` (same key as `packages/base/package.json`):

```json
"./components/Name": "./src/components/Name.svelte"
```

## Story file

`apps/svelte/src/stories/<Name>.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/svelte'
import NameDefault from './components/NameDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Name',
  component: NameDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof NameDefault>

export default meta
type Story = StoryObj<typeof NameDefault>

export const Default: Story = {}
```

## Story wrapper

`apps/svelte/src/stories/components/NameDefault.svelte`:

```svelte
<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Name from '@labcat2020/rocketship-svelte/components/Name'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'
</script>

<Container size="content" padded>
  <Stack>
    <Name>
      <h2 class="rs-name__title">Example title</h2>
      <p class="rs-name__description">Example description.</p>
    </Name>
  </Stack>
</Container>
```

Library components only, no `<style>` blocks, no story-only classes, no Containers as spacers.
