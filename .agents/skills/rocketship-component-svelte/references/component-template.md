# Component template (Svelte)

The Astro template (`.agents/skills/rocketship-component/references/component-template.md`) translated with the table in the Svelte skill. Replace `Name` / `rs-name` everywhere.

## Component: `packages/svelte/src/components/Name.svelte`

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type NameVariant = 'default' | 'muted'

  type Props = {
    variant?: NameVariant
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLDivElement>

  let { variant = 'default', class: className = '', children, ...attrs }: Props = $props()

  const classes = $derived(
    ['rs-name', variant !== 'default' ? `rs-name--${variant}` : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<div {...attrs} class={classes}>
  {@render children?.()}
</div>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-name {
      --rs-name-bg: #{rs-token(color-surface)};
      --rs-name-color: #{rs-token(color-fg)};
      display: flex;
      flex-direction: column;
      gap: var(--rs-name-gap, #{rs-token(space-2)});
      background: var(--rs-name-bg);
      border-radius: var(--rs-name-border-radius, #{rs-token(radius-md)});
      color: var(--rs-name-color);
      padding: var(--rs-name-padding, #{rs-token(space-4)});

      &--muted {
        --rs-name-bg: #{rs-token(color-surface-elevated)};
      }

      &__title {
        color: var(--rs-name-color);
        font-size: inherit;
        font-weight: var(--rs-name-title-font-weight, #{rs-token(font-weight-semibold)});
        line-height: #{rs-token(line-height-tight)};
        margin: 0;
      }

      &__description {
        color: var(--rs-name-color);
        margin: 0;
      }
    }
  }
</style>
```

## Variations

Polymorphic tag (Stack):

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

Decoration beside the content (Label):

```svelte
<label {...attrs} class={classes}>
  {@render children?.()}{#if required}<span class="rs-label__required" aria-hidden="true">*</span>{/if}
</label>
```

Named snippet for an element with a fixed position (Table caption):

```svelte
<table {...attrs} class={classes}>
  {#if caption}<caption class="rs-table__caption">{@render caption()}</caption>{/if}
  {@render children?.()}
</table>
```

## Package export: `packages/svelte/package.json`

```json
"./components/Name": "./src/components/Name.svelte"
```

## Story file: `apps/svelte/src/stories/Name.stories.ts`

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

## Story wrapper: `apps/svelte/src/stories/components/NameDefault.svelte`

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
