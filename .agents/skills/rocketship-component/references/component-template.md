# Component template (Astro)

Built from the reviewed `Alert.astro`. Replace `Name` / `rs-name` everywhere. The numbered notes under each block say what each part is; do not copy them into code.

## Component: `packages/base/src/components/Name.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types'

export type NameVariant = 'default' | 'muted'

type Props = {
  variant?: NameVariant
  class?: string
} & HTMLAttributes<'div'>

const { variant = 'default', class: className, ...attrs } = Astro.props as Props
const classes = ['rs-name', variant !== 'default' && `rs-name--${variant}`, className]
---

<div {...attrs} class:list={classes}>
  <slot />
</div>

<style is:global lang="scss">
  @use '../styles/mixins' as *;

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
</style>
```

1. One exported union per option. Booleans for on/off options.
2. `Props` extends the root tag's native attributes.
3. The default variant adds no class.
4. `--rs-name-bg` and `--rs-name-color` are variant-owned locals: set on the block, reassigned in modifiers.
5. `--rs-name-gap`, `--rs-name-border-radius`, `--rs-name-padding` and `--rs-name-title-font-weight` are opt-in hooks: never assigned.
6. Modifiers only reassign variables.
7. `__title` and `__description` are classes the consumer puts on their own elements.

## Variations

Polymorphic tag (Stack):

```astro
---
const { as = 'div', class: className, ...attrs } = Astro.props as Props
const Tag = as
---

<Tag role={as === 'div' ? undefined : 'list'} {...attrs} class:list={classes}>
  <slot />
</Tag>
```

Boolean option (Table):

```ts
const classes = ['rs-table', striped && 'rs-table--striped', className]
```

Decoration beside the slot (Label):

```astro
<label {...attrs} class:list={['rs-label', className]}>
  <slot />{
    required && (
      <span class="rs-label__required" aria-hidden="true">
        *
      </span>
    )
  }
</label>
```

Named slot for an element with a fixed position (Table):

```astro
<table {...attrs} class:list={classes}>
  {
    Astro.slots.has('caption') && (
      <caption class="rs-table__caption">
        <slot name="caption" />
      </caption>
    )
  }
  <slot />
</table>
```

## Package export: `packages/base/package.json`

```json
"./components/Name": "./src/components/Name.astro"
```

## Story file: `apps/frontend/src/stories/Name.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/html'
import NameDefault from './components/NameDefault.astro'
import '@labcat2020/rocketship/components/Name'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof NameDefault> = {
  title: 'Components/Name',
  component: NameDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof NameDefault>

export const Default: Story = {}
```

## Story wrapper: `apps/frontend/src/stories/components/NameDefault.astro`

```astro
---
import Container from '@labcat2020/rocketship/components/Container'
import Name from '@labcat2020/rocketship/components/Name'
import Stack from '@labcat2020/rocketship/components/Stack'
---

<Container size="content" padded>
  <Stack>
    <Name>
      <h2 class="rs-name__title">Example title</h2>
      <p class="rs-name__description">Example description.</p>
    </Name>
  </Stack>
</Container>
```
