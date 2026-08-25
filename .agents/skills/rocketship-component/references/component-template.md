# Component Template (annotated)

Extracted from `Card.astro`, `Button.astro`, `Grid.astro`, `Container.astro`, `Typography.astro`. Replace `<Name>` / `rs-name` throughout.

## Frontmatter

```astro
---
import type { HTMLAttributes } from 'astro/types'

// 1. Exported union types — public API, one per variant/size/tag axis.
export type NameVariant = 'default' | 'muted'
export type NameTag = 'div' | 'section' | 'article'

// 2. Props type — always includes as, class; extends the native attributes
//    of the DEFAULT tag.
type Props = {
  as?: NameTag
  variant?: NameVariant
  class?: string
} & HTMLAttributes<'div'>

// 3. Destructure with defaults; capture rest for spreading.
const {
  as = 'div',
  variant = 'default',
  class: className,
  ...attrs
} = Astro.props as Props

// 4. Dynamic tag + computed classes (filter undefined entries).
const Tag = as
const classes = [
  'rs-name',
  variant === 'muted' ? 'rs-name--muted' : undefined,
  className,
]
---
```

## Markup

```astro
<Tag {...attrs} class:list={classes}>
  {/* conditional element pattern (Card's media band): */}
  {Astro.slots.has('media') ? (
    <div class="rs-name__media">
      <slot name="media" />
    </div>
  ) : null}

  <slot />
</Tag>
```

- Named slots are opt-in: check `Astro.slots.has('name')` before rendering their wrapper.
- Never render wrapper elements when their slot is empty.

## Styles

```scss
<style is:global lang="scss">
  @use '../styles/mixins' as *;

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
</style>
```

### Token fallback depth

**Opt-in hooks** (spacing, radius, type, etc.) — three levels; the component API name is never assigned by the library:

```
var(--rs-name-radius, var(--rs-radius-md, 10px))
     └─ opt-in API        └─ global token     └─ literal last resort
```

Adopters set `--rs-name-radius` on `:root` or an ancestor.

**Variant-owned locals** (status/interactive colors) — assign on the block, reassign in modifiers; properties read the local:

```
--rs-name-bg: var(--rs-color-surface, #ffffff);
background: var(--rs-name-bg);
```

Override on `.rs-name` / the instance, not bare `:root`.

The literal exists only so the component renders even if `variables.scss` wasn't imported. Keep literals in sync with the default theme values in `variables.scss`.

### Fallback font sizes

Always authored through `to-rem()` inside `#{}` interpolation:

```scss
font-size: var(--rs-font-size-md, #{to-rem(16)});
```

Everything else (spacing, radii, widths, cq thresholds) stays in `px`.

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
import '@labcat/rocketship/components/Name'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof NameDefault> = {
  title: 'Base/Name',
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
import Container from '@labcat/rocketship/components/Container'
import Name from '@labcat/rocketship/components/Name'
---

<Container size="content" padded>
  <Name>
    <p class="rs-name__title">Example title</p>
  </Name>
</Container>
```

Rules: library components only, no `<style>` blocks, no story-only classes. If content needs a visual treatment, it belongs in the base package.
