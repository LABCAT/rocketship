# Component Template (annotated)

Based on the reviewed reference components `Alert.astro` (content block with variants) and `Stack.astro` (layout primitive). Replace `<Name>` / `rs-name` throughout.

## Frontmatter

```astro
---
import type { HTMLAttributes } from 'astro/types'

// 1. Exported union types: public API, one per axis.
export type NameVariant = 'default' | 'muted'

// 2. Only when more than one root tag is semantically valid:
//    export type NameTag = 'div' | 'ul' | 'ol'

// 3. Props: class plus the axes, extending the root tag's native attributes.
//    Never a prop that shadows a native attribute (e.g. `title`).
type Props = {
  variant?: NameVariant
  class?: string
} & HTMLAttributes<'div'>

// 4. Destructure with defaults; capture rest for spreading.
const { variant = 'default', class: className, ...attrs } = Astro.props as Props

// 5. The base class is the default: the default variant emits no modifier.
const classes = ['rs-name', variant !== 'default' && `rs-name--${variant}`, className]
---
```

With a polymorphic tag (Stack):

```astro
const { as = 'div', ...attrs } = Astro.props as Props
const Tag = as
---

<Tag role={as === 'div' ? undefined : 'list'} {...attrs} class:list={classes}>
```

## Markup

```astro
<div {...attrs} class:list={classes}>
  <slot />
</div>
```

- The consumer writes every content element and applies the element class. The component renders no titles, descriptions or wrappers.

## Styles

```scss
<style is:global lang="scss">
  @use '../styles/mixins' as *;

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

    /* states nested under the block */
    &:focus-visible {
      outline: 2px solid #{rs-token(color-focus-ring)};
      outline-offset: 2px;
    }

    /* modifiers only reassign variables */
    &--muted {
      --rs-name-bg: #{rs-token(color-surface-elevated)};
    }

    /* element classes the consumer applies; each sets margin: 0 and its own colour */
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

### Tokens

`rs-token(name)` (from the mixins barrel) compiles to the token's custom property with its default value as the fallback, so components render the full default theme, light and dark, even when `variables.scss` is not imported:

```
rs-token(radius-md)        → var(--rs-radius-md, 10px)
rs-token(color-danger-bg)  → var(--rs-color-danger-bg, light-dark(#ffeef0, #2e0a0f))
```

**Opt-in hooks** wrap it as the first fallback; the hook name is never assigned by the library:

```
var(--rs-name-border-radius, #{rs-token(radius-md)})
     └─ opt-in API             └─ token with its default
```

**Variant-owned locals** are assigned on the block and reassigned in modifiers. Override them on `.rs-name` or the instance, not bare `:root`.

Always interpolate `#{rs-token(…)}`. Unknown token names fail the build: stop and ask rather than adding one.

### Units

Authored font sizes use `to-rem()` px. Everything else (spacing, radii, widths, container-query thresholds) is `px`. Prefer `font-size: inherit` for elements that should follow the page.

## Package export

`packages/base/package.json` → `exports`:

```json
"./components/Name": "./src/components/Name.astro"
```

## Story file

`apps/frontend/src/stories/<Name>.stories.tsx`:

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

## Story wrapper

`apps/frontend/src/stories/components/NameDefault.astro`:

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

Rules: library components only, no `<style>` blocks, no story-only classes, no Containers used as spacers. If content needs a visual treatment, it belongs in the base package.
