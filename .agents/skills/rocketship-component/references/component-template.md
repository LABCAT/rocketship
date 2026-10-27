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

## Story file: `apps/astro/src/stories/Name.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/html'
import NameDefault from './components/NameDefault.astro'
import '@labcat2020/rocketship/components/Name'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

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

## Example: `apps/astro/src/stories/components/NameDefaultExample.astro`

Only the component markup and its imports. The docs page renders it and shows its source.

```astro
---
import Name from '@labcat2020/rocketship/components/Name'
---

<Name>
  <h2 class="rs-name__title">Example title</h2>
  <p class="rs-name__description">Example description.</p>
</Name>
```

## Docs page: `apps/astro/src/stories/components/NameDefault.astro`

Full reference: `DisclosureDefault.astro`. The API tables (props and attributes, slots, CSS hooks) follow the description, usage and example; one is shown.

```astro
---
import Container from '@labcat2020/rocketship/components/Container'
import Stack from '@labcat2020/rocketship/components/Stack'
import Table from '@labcat2020/rocketship/components/Table'
import Typography from '@labcat2020/rocketship/components/Typography'
import NameDefaultExample from './NameDefaultExample.astro'
import exampleSource from './NameDefaultExample.astro?raw'
---

<Container size="content" padded>
  <Stack gap="large">
    <Typography as="article">
      <h1>Name</h1>
      <p>What it is and when to use it, in one or two sentences.</p>
    </Typography>

    <NameDefaultExample />

    <Typography as="article">
      <h2 id="usage-heading">Usage</h2>
      <pre
        tabindex="0"
        role="region"
        aria-labelledby="usage-heading"><code>{exampleSource}</code></pre>
    </Typography>

    <Table>
      <Fragment slot="caption">Props and attributes</Fragment>
      <thead>
        <tr>
          <th class="rs-table__column-header" scope="col">Name</th>
          <th class="rs-table__column-header" scope="col">Type</th>
          <th class="rs-table__column-header" scope="col">Default</th>
          <th class="rs-table__column-header" scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr class="rs-table__body-row">
          <th class="rs-table__row-header" scope="row"><code>variant</code></th>
          <td class="rs-table__cell"><code>'default' | 'muted'</code></td>
          <td class="rs-table__cell"><code>'default'</code></td>
          <td class="rs-table__cell">The look.</td>
        </tr>
      </tbody>
    </Table>
  </Stack>
</Container>
```
