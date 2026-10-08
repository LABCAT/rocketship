# Svelte Component Template (annotated)

Extracted from the Astro components in `packages/base/src/components/` (`Card.astro`, `Button.astro`, `Grid.astro`, `Container.astro`, `Alert.astro`, `Typography.astro`). Replace `<Name>` / `rs-name` throughout, and keep the Astro original next to you as you port.

The port is **copy-style**: selectors, declarations, and their order come across unchanged. Only the Astro-specific syntax (frontmatter, `Astro.props`, `Astro.slots`, `<slot>`, `<style is:global>`) becomes its Svelte 5 equivalent.

## Script

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  // 1. Exported union types — public API, one per variant/size/tag axis.
  export type NameVariant = 'default' | 'muted'
  export type NameTag = 'div' | 'section' | 'article'

  // 2. Props type — always includes as, class, children; extends the native
  //    attributes of the DEFAULT tag (HTMLAttributes<HTMLElement> for a div-like
  //    root; use HTMLButtonAttributes / HTMLAnchorAttributes when the Astro
  //    original extended those instead).
  type Props = {
    as?: NameTag
    variant?: NameVariant
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  // 3. Destructure from $props() with defaults; capture the rest for spreading.
  let {
    as = 'div',
    variant = 'default',
    class: className = '',
    children,
    ...attrs
  }: Props = $props()

  // 4. Derived class string, filtering empty entries.
  const classes = $derived(
    ['rs-name', variant === 'muted' ? 'rs-name--muted' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>
```

## Markup

```svelte
<svelte:element this={as} {...attrs} class={classes}>
  <!-- conditional element pattern (Card's media band):
       Astro `Astro.slots.has('media')` → Svelte `{#if media}`. -->
  {#if media}
    <div class="rs-name__media">{@render media()}</div>
  {/if}

  {@render children?.()}
</svelte:element>
```

- The default slot becomes the `children` snippet; a named Astro slot `<slot name="media" />` becomes a `media?: Snippet` prop rendered with `{@render media()}`.
- Guard a named snippet with `{#if name}` and drop the wrapper element when it is absent — never render an empty wrapper.
- `class={classes}` comes after `{...attrs}` so composed classes win; `class` was already destructured out of `attrs`.
- When the Astro original is <code>&lt;Tag {...attrs} class:list={classes}&gt;</code>, the Svelte form is <code>&lt;svelte:element this={as} {...attrs} class={classes}&gt;</code>.

## Styles

```scss
<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-name {
      /* --- 1. variant-owned locals only (when modifiers swap a set) --- */
      --rs-name-bg: var(--rs-color-surface, #ffffff);

      /* --- 2. reset + box-sizing (only if needed) --- */
      all: unset;
      box-sizing: border-box;

      /* --- 3. layout, then appearance --- */
      /* Opt-in hooks: never assigned above — first fallback only */
      display: block;
      background: var(--rs-name-bg);
      border-radius: var(--rs-name-radius, var(--rs-radius-md, 10px));
      gap: var(--rs-name-gap, var(--rs-space-3, 12px));
      font-size: var(--rs-font-size-md, #{to-rem(16)});

      /* states nested under the block */
      &:focus-visible {
        outline: 2px solid var(--rs-color-focus-ring, #296dff);
        outline-offset: 2px;
      }

      /* modifiers reassign variant-owned locals */
      &--muted {
        --rs-name-bg: var(--rs-color-muted, #4f5b7d);
      }

      /* container-query: restate properties with a larger token fallback;
         keep the same opt-in hook so :root overrides still win */
      @include container-query-up($rs-cq-sm) {
        gap: var(--rs-name-gap, var(--rs-space-4, 16px));
      }

      /* BEM elements nested under the block */
      &__title {
        color: var(--rs-color-fg, #131a2f);
        font-weight: var(--rs-font-weight-semibold, 600);
      }
    }
  }
</style>
```

### Why `:global { ... }`

Svelte scopes selectors and prunes rules it thinks are unused. Astro’s library components use a global style block so `.rs-*` classes are stable, themeable, and usable by adopters — the same contract must hold in Svelte. Wrapping the rule block in `:global { ... }` compiles the whole block unscoped (the equivalent of `<style is:global>`). A `global` attribute on `<style>` is ignored by the Svelte 5 compiler and does not do this.

`:global { ... }` still allows SCSS nesting, so port `&__element`, `&--modifier`, and `&:state` exactly as written in the Astro block. Do not use `:global(.rs-name) { &__title { ... } }` or `:global(&)` — those forms are rejected by the compiler (“can’t have a suffix” / nesting error).

### Shared styles import

`@labcat2020/rocketship/styles/mixins` is the base mixin barrel (`packages/base/src/styles/mixins.scss`, which `@forward`s `functions`, `breakpoints`, `container-query`, and the typography mixins). Import it with the barrel only — never `@use` an individual partial such as `mixins/container-query`, and never copy mixin or token source into `packages/svelte`.

`packages/base/package.json` must expose that barrel from its `exports` map under the Sass conditions (`"sass"` / `"style"`) when `packages/svelte` is scaffolded, so the specifier resolves. If the scaffold wires the barrel differently, change only the specifier — the barrel-only rule stands.

Token custom properties (`--rs-*`) are supplied by the app’s `import '@labcat2020/rocketship/styles'`; a component only references them.

### Token fallback depth

**Opt-in hooks** (spacing, radius, type, etc.) — three levels; the component API name is never assigned by the library:

```
var(--rs-name-radius, var(--rs-radius-md, 10px))
     └─ opt-in API        └─ global token     └─ literal last resort
```

Adopters set `--rs-name-radius` on `:root` or an ancestor.

**Variant-owned locals** (status/interactive colours) — assign on the block, reassign in modifiers; properties read the local:

```
--rs-name-bg: var(--rs-color-surface, #ffffff);
background: var(--rs-name-bg);
```

Override on `.rs-name` / the instance, not bare `:root`.

The literal exists only so the component renders even if `variables.scss` wasn’t imported. Keep literals in sync with the default theme values in `packages/base/src/styles/variables.scss`.

### Fallback font sizes

Always authored through `to-rem()` inside `#{}` interpolation:

```scss
font-size: var(--rs-font-size-md, #{to-rem(16)});
```

Everything else (spacing, radii, widths, cq thresholds) stays in `px`.

## Package export

`packages/svelte/package.json` → `exports` (same key as `packages/base/package.json`):

```json
"./components/Name": "./src/components/Name.svelte"
```

## Story file

`apps/svelte/src/stories/<Name>.stories.ts` (Svelte CSF):

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
</script>

<Container size="content" padded>
  <Name>
    <p class="rs-name__title">Example title</p>
  </Name>
</Container>
```

Rules: library components only, no `<style>` blocks, no story-only classes. If content needs a visual treatment, it belongs in the library (base package or Svelte port), never in the story.

## Worked reference: Card

Astro `packages/base/src/components/Card.astro` → Svelte `packages/svelte/src/components/Card.svelte`.

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type CardTag = 'article' | 'section' | 'div' | 'li'

  type Props = {
    as?: CardTag
    class?: string
    media?: Snippet
    meta?: Snippet
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'article', class: className = '', media, meta, children }: Props = $props()

  const classes = $derived(['rs-card', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes}>
  {#if media}
    <div class="rs-card__media">{@render media()}</div>
  {/if}
  <div class="rs-card__body">
    <div class="rs-card__content">{@render children?.()}</div>
    {#if meta}
      <div class="rs-card__meta">{@render meta()}</div>
    {/if}
  </div>
</svelte:element>
```

The `<style lang="scss">` block is the Astro block wrapped in `:global { ... }`, with `@use '@labcat2020/rocketship/styles/mixins' as *;` above it — every selector and declaration unchanged.
