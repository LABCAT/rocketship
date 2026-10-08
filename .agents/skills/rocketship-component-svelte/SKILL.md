---
name: rocketship-component-svelte
description: 'Port or create a Rocketship Svelte component matching repo conventions. Use when asked to add, build, or port a component in packages/svelte (Svelte 5 runes + TypeScript + SCSS + BEM rs- prefix + --rs-* tokens), mirroring the corresponding Astro component in packages/base and adding its Storybook stories in apps/svelte.'
---

# Rocketship Svelte Component Authoring

Build a component for `@labcat2020/rocketship-svelte` by **mirroring the corresponding Astro component** in `@labcat2020/rocketship`. **Card** (`packages/base/src/components/Card.astro` → `packages/svelte/src/components/Card.svelte`) is the gold-standard pair — copy its shape whenever unsure.

The Svelte library is a **copy-style port**: the public API, `.rs-*` classes, and style rule blocks match the Astro original. It is not a redesign and not a new design system.

## When to Use

- "Add a `<X>` component to the Svelte package"
- "Port the Astro `<X>` component to Svelte"
- Any task referencing a new `.rs-*` block in `packages/svelte/src/components/`

## Before You Start

1. Read the rules — they are binding, not advisory:
   - `.agents/rules/rocketship-svelte.mdc` (Svelte structure, props, `:global` styles, barrel import)
   - `.agents/rules/rocketship-bem-scss.mdc` (naming, variables, declaration order)
   - `.agents/rules/rocketship-layout-responsive.mdc` (container queries vs media queries)
   - `.agents/rules/rocketship-a11y.mdc` (WCAG targets, semantics)
   - `.agents/rules/rocketship-typescript.mdc` (arrow functions, doc blocks)
   - `_planning/svelte-port-checklist.md` (the acceptance contract for a port)
2. Read the **Astro original** — it is your template, not just a reference:
   - `packages/base/src/components/<Name>.astro` — copy its frontmatter types, markup structure, and its full `<style lang="scss">` rule block.
   - Interactive control (`as`/`variant`/`size`) → `Button.astro`
   - Layout wrapper with elements/slots → `Card.astro`
   - Simple layout with size variants → `Grid.astro`
3. If no Astro counterpart exists, say so and stop: the Svelte library ports Astro components and does not invent new ones. New primitives land in `packages/base` first.
4. Check whether the pattern is genuinely new to the repo (`:has()`, `[open]`, `::backdrop`, popover attributes, focus-trapping). If so, flag it: novel patterns need a hand-written reference example before delegation.

## Procedure

### 1. Component file: `packages/svelte/src/components/<Name>.svelte`

Follow this exact structure (see [component-template.md](./references/component-template.md) for the annotated skeleton):

```
<script lang="ts">   → imported types, exported unions, Props, $props(), $derived classes
</script>
(markup)             → single root via <svelte:element this={as}>, snippet guards
<style lang="scss">  → @use barrel, then :global { .rs-block { ... } }
```

Non-negotiables (the full list is in `.agents/rules/rocketship-svelte.mdc`):

- **Props**: exported union types per axis; a `Props` type extending the native attributes of the default tag (e.g. `HTMLAttributes<HTMLElement>`, `HTMLButtonAttributes`); always include `as?`, `variant?`/`size?`, `class?: string`, `children?: Snippet`; destructure from `$props()` with defaults; spread `...attrs` onto the root.
- **Markup**: polymorphic tag — `<svelte:element this={as} {...attrs} class={classes}>` — with `@render children?.()`. Named Astro slots become snippet props guarded by `{#if name}`.
- **Styles**: one `<style lang="scss">` block inside the component, wrapped in `:global { ... }`. Never create a separate component `.scss` file.
- **Import**: `@use '@labcat2020/rocketship/styles/mixins' as *;` — the forwarded barrel (`packages/base/src/styles/mixins.scss`). That `./styles/mixins` subpath is **not exported yet**: `packages/base/package.json` exposes only `.` and `./styles`, so the export must be added when `packages/svelte` is scaffolded before this specifier resolves. Never `@use` individual mixin partials, and never copy mixin or token source into `packages/svelte`.
- **Port the styles as-is**: same selectors, same declarations, same order as the Astro rule block. Do not redesign or re-tokenize.
- **BEM**: block `rs-<name>`, elements nested as `&__element`, modifiers as `&--modifier`, nested under the block selector.
- **Declaration order per rule block**: `--rs-*` custom properties first (only when the Astro block assigns them) → reset (`all: unset`) if needed → `box-sizing` if reset → everything else (layout, then appearance).
- **Tokens**: reference global tokens from `packages/base/src/styles/variables.scss`; the app imports them via `import '@labcat2020/rocketship/styles'`. Keep the two Astro variable patterns — opt-in hooks (three-level fallback, never assigned on the block) and variant-owned locals reassigned in modifiers. Font sizes use `to-rem()`; all other dimensions are `px`.
- **Component variables are the override API**: mirror every `--rs-<name>-*` hook from the Astro original so overrides keep working in Svelte.
- **Missing tokens**: if the Astro original relied on a token that does not exist in `variables.scss`, **stop and tell the user** — never invent hard-coded hex values in the Svelte component. Adding tokens is a design-system decision made in `packages/base`.
- **Dark mode**: never add component-level `prefers-color-scheme` blocks; semantic colour tokens already flip in `variables.scss`.
- **Sizing**: size variants via `@include container-query-up($rs-cq-sm)` (`sm`/`md`/`lg`). Viewport `media-breakpoint-up` is reserved for Container/layout — never leaf components.
- **States**: hover/active/focus-visible/disabled nested under the block or modifier. Focus must be visible.
- **No inline styles for design**: no `style="..."` for design/theming, and no `style:` directives for colours, spacing, radii, or theming.
- **DRY in styles**: preserve the Astro block's shared declarations at the block selector.

### 2. Register the export: `packages/svelte/package.json`

Add `"./components/<Name>": "./src/components/<Name>.svelte"` to `exports`. Keep the naming identical to the Astro entry in `packages/base/package.json` so consumers can switch packages without changing the import path.

### 3. Stories: `apps/svelte/src/stories/`

Mirror the Astro stories from `apps/frontend/src/stories/`. Two files:

- `<Name>.stories.ts` (Svelte CSF) — `<Name>Default.svelte` as the component, title `'Components/<Name>'`, `parameters: { a11y: { disable: false } }`, one default-exported story. The `Base/` group is reserved for the existing primitive components (Button, Typography, Grid, Container). Token documentation stories live in the `Foundations/` group.
- `components/<Name>Default.svelte` (or `<Name><Aspect>.svelte`) — imports only components from `@labcat2020/rocketship-svelte`; composes them inside `<Container size="content" padded>`. Snippet passed where the Astro wrapper used slots. **No `<style>` blocks, no story-only CSS, ever.**
- **Layout**: stack examples vertically inside the single `Container`. Do not reach for `Grid` unless the story is specifically demonstrating composition with it.
- **Scope**: show one aspect per story file. A second aspect (sizes, slots) is a separate story file.
- **Naming**: a single-story file exports `Default`; a multi-example comparison exports `Variants` (or `<Aspect>`).

Story copy follows `.agents/rules/rocketship-story-copy.mdc`: present tense, adopter voice, no roadmap mentions.

### 4. Verify

- `svelte-check` (or the package's check/build script) passes with no type or Sass errors.
- Run the Svelte Storybook (`apps/svelte`) and confirm the new stories render and axe reports no violations.
- Compare the rendered output against the Astro component for visual parity.
- Diff your component against the Astro original: same section order, same naming style, same token fallback depth. Any deviation must be deliberate and recorded (notably Astro slots → Svelte snippets).

## Recording API differences

Note every intentional difference from the Astro component in the PR description — at minimum the slots → snippets change, plus any prop that could not be mirrored. `_planning/svelte-port-checklist.md` has the copy-paste MR checklist.

## Tier Awareness (novel patterns)

Existing components cover: polymorphic tags, BEM elements/modifiers, snippets (named and default), conditional markup, container-query sizes, token-driven tones. They do **not** cover interactive-state primitives: `:has()`, `[open]`, `::backdrop`, the `popover` attribute, focus-trapping. If the requested component needs these, stop and tell the user — the first such component should be hand-written by them to serve as the reference example, not generated.

## A11y semantics

- **Roles**: only apply live-region roles (`alert`, `status`) when the component is genuinely dynamic. For statically rendered content, prefer no role or `role="note"`; if a variant mapping to `role="alert"` is requested, flag it for review.
- **Headings**: if a component renders a title, use a heading element (`h2`–`h4`) rather than `<p>`, so document outline remains meaningful.
- **Snippets and a11y**: because user content arrives through snippets, the component cannot control its structure. Keep every wrapper element that the Astro original rendered, and do not add wrappers that only exist for styling.
