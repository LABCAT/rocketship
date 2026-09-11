---
name: rocketship-component
description: 'Create a new Rocketship component exactly matching repo conventions. Use when asked to add, build, or scaffold a component in packages/base (Astro + SCSS + BEM rs- prefix + --rs-* tokens), including its Storybook stories in apps/frontend.'
---

# Rocketship Component Authoring

Build a new component for `@labcat2020/rocketship` following the exact patterns extracted from the five existing components (Button, Card, Container, Grid, Typography). **Card** (`packages/base/src/components/Card.astro`) is the gold-standard reference — copy its shape whenever unsure.

## When to Use

- "Add a `<X>` component to the base package"
- "Build the Disclosure / Dialog / Callout component"
- Any task referencing a new `.rs-*` block in `_planning/tasks.md`

## Before You Start

1. Read the rules — they are binding, not advisory:
   - `.agents/rules/rocketship-bem-scss.mdc` (naming, variables, declaration order)
   - `.agents/rules/rocketship-layout-responsive.mdc` (container queries vs media queries)
   - `.agents/rules/rocketship-a11y.mdc` (WCAG targets, semantics)
   - `.agents/rules/rocketship-typescript.mdc` (arrow functions, doc blocks)
2. Read the closest existing component as your template:
   - Interactive/control → `Button.astro`
   - Layout wrapper with elements/slots → `Card.astro`
   - Simple layout with size variants → `Grid.astro`
3. Check whether the pattern is genuinely new (no `:has()`, `[open]`, `::backdrop`, popover attributes exist anywhere yet). If so, flag it: novel patterns need a hand-written reference example before delegation.

## Procedure

### 1. Component file: `packages/base/src/components/<Name>.astro`

Follow this exact structure (see [component-template.md](./references/component-template.md) for the annotated skeleton):

```
---
(frontmatter)          → types, Props, destructuring, class computation
---
(markup)               → single root tag via dynamic Tag, class:list
<style is:global lang="scss">  → @use barrel, then .rs-block { ... }
```

Non-negotiables:

- **Props**: explicit exported union types (`export type XVariant = ...`), a `Props` type extending `HTMLAttributes<'...'>`, always include `as?:` (polymorphic tag) and `class?: string`; destructure with defaults; spread `...attrs` onto the root.
- **Markup**: dynamic tag pattern — `const Tag = as` then `<Tag {...attrs} class:list={classes}>`. Compose classes into an array (`['rs-x', variant && \`rs-x--${variant}\`, className]`) or inline them; filter `undefined`.
- **Styles**: one `<style is:global lang="scss">` block inside the component. Never create separate component `.scss` files.
- **Import**: `@use '../styles/mixins' as *;` — the barrel only. Never `@use` individual mixin partials.
- **BEM**: block `rs-<name>`, elements nested as `&__element`, modifiers as `&--modifier`, nested under the block selector.
- **Declaration order per rule block**: `--rs-*` custom properties first (only when defined on the block — see below) → reset (`all: unset`) if needed → `box-sizing` if reset → everything else (layout, then appearance).
- **Tokens**: reference global tokens from `variables.scss` (`--rs-color-*`, `--rs-space-*`, `--rs-font-size-*`, `--rs-radius-*`, `--rs-border-width-*`). Font sizes use `#{to-rem(16)}` fallbacks; all other dimensions are `px`. Two component-variable patterns — pick by need:
  - **Opt-in hooks** (default; Card): never assign `--rs-<name>-*` on the block. Use them as the first fallback in properties so adopters can set them on `:root` or an ancestor: `border-radius: var(--rs-card-border-radius, var(--rs-radius-md, 10px))`. Prefer this for spacing, radius, borders, shadows, typography.
  - **Variant-owned locals** (Alert / Button colors): assign `--rs-<name>-*` on the block and reassign in modifiers when variants must swap a coordinated set. Properties then read `var(--rs-alert-bg)`. These are overridden on `.rs-alert` / the instance, not via bare `:root` (the block redefines them). Do **not** use this pattern for static layout/type hooks.
- **Component variables are the override API**: every `--rs-<name>-*` custom property is a documented customization point. Prefer exposing a variable over inlining a token when a dev might plausibly want to override that aspect. Inline global tokens directly only for structural internals that make no sense to override.
- **Missing tokens**: if the component needs a semantic token that does not exist in `variables.scss` (e.g. status colors like `--rs-color-success-*`), **stop and tell the user** — never invent hard-coded hex values inside the component. Adding new global tokens is a design-system decision made in `variables.scss` (light and dark sections), with the user's approval.
- **Dark mode**: never add component-level `prefers-color-scheme` blocks with hard-coded values. Semantic color tokens already flip in `variables.scss`; components only reference them.
- **Sizing**: size variants via `@include container-query-up($rs-cq-sm)` (sm/md/lg from `mixins/container-query.scss`). Viewport `media-breakpoint-up` is reserved for Container/layout only — never leaf components.
- **States**: hover/active/focus-visible/disabled nested under the block or modifier. Focus must be visible (`outline: 2px solid var(--rs-color-focus-ring, ...)` + offset).
- **DRY in styles**: hoist shared declarations (e.g. `font-family`) to the block selector; never repeat them per element.

### 2. Register the export: `packages/base/package.json`

Add `"./components/<Name>": "./src/components/<Name>.astro"` to `exports`.

### 3. Stories: `apps/frontend/src/stories/`

Two files, matching `Card.stories.tsx` / `components/CardDefault.astro`:

- `<Name>.stories.tsx` — `Meta`/`StoryObj` from `@storybook/html`, import the wrapper Astro file plus each used library component's style side effects (`import '@labcat2020/rocketship/components/X'`), title `'Components/<Name>'`, `parameters: { a11y: { disable: false } }`, one default-exported story object. The `Base/` group is reserved for the existing primitive components (Button, Typography, Grid, Container) — no new components go there. Token documentation stories live in the `Foundations/` group (e.g. `'Foundations/Colors'`).
- `components/<Name>Default.astro` (or `<Name><Aspect>.astro`) — frontmatter imports only `@labcat2020/rocketship` components; body composes them inside `<Container size="content" padded>`. **No `<style>` blocks, no story-only CSS, ever.**
- **Layout**: stack examples vertically inside the single `Container`. Do not reach for `Grid` or other layout components unless the story is specifically demonstrating composition with them.
- **Scope**: show one aspect per story (e.g. four variants, or a default usage). If you need to demonstrate a secondary feature (slots, sizes), that is a separate story file — don't cram it into the same wrapper.
- **Naming**: a single-story file exports `Default` (Storybook convention — the sidebar shows `Component > Default`); a multi-example comparison exports `Variants` (or `<Aspect>`). Only add extra stories when there is genuinely more than one aspect worth showing.

Story copy follows `.agents/rules/rocketship-story-copy.mdc`: present tense, adopter voice, no roadmap mentions.

### 4. Verify

- `pnpm build` (or the package's check script) passes with no type or Sass errors.
- Run Storybook (`pnpm storybook`) and confirm the new stories render and axe reports no violations.
- Diff your output against `Card.astro`: same section order, same naming style, same token fallback depth. Any deviation should be deliberate and explainable.

## Tier Awareness (novel patterns)

Existing components cover: polymorphic tags, BEM elements/modifiers, named slots, conditional markup, container-query sizes, token-driven tones. They do **not** cover interactive-state primitives: `:has()`, `[open]`, `::backdrop`, the `popover` attribute, focus-trapping. If the requested component needs these, stop and tell the user — the first such component should be hand-written by them to serve as the reference example (per the project's Tier A/Tier B methodology), not generated.

## A11y semantics

- **Roles**: only apply live-region roles (`alert`, `status`) when the component is genuinely dynamic. For statically rendered content, prefer no role or `role="note"`; if a variant mapping to `role="alert"` is requested, flag it for review.
- **Headings**: if a component renders a title, use a heading element (`h2`–`h4`) rather than `<p>`, so document outline remains meaningful.
