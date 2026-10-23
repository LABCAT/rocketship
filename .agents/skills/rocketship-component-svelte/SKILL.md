---
name: rocketship-component-svelte
description: 'Port or create a Rocketship Svelte component matching repo conventions. Use when asked to add, build, or port a component in packages/svelte (Svelte 5 runes + TypeScript + SCSS + BEM rs- prefix + --rs-* tokens), either as a copy-style port of the Astro component in packages/base or as a Svelte-first component with no Astro original, adding its Storybook stories in apps/svelte.'
---

# Rocketship Svelte Component Authoring

Build a component for `@labcat2020/rocketship-svelte`. There are two valid paths:

- **Port path** — an Astro original exists: mirror the corresponding Astro component in `@labcat2020/rocketship` (copy-style port). **Alert** and **Stack** are the reviewed Astro references — copy their shape whenever unsure.
- **Svelte-first path** — no Astro original exists: design the component in Svelte following the same conventions, so a later Astro version can be ported back from it.

Either way the public API, `.rs-*` classes, and style rule blocks follow the shared design system. It is not a redesign and not a new design system. Every rule in `.agents/skills/rocketship-component/SKILL.md` (`as` only when meaningful, opt-in roles, consumer-owned element classes, `rs-token()`, hardcore BEM, no font-family, no outer margin) applies on both paths. The reasoning is in `_planning/component-review-decisions.md`.

A Svelte-first component is **provisional**: it may need updates once the founder's "platinum standard" for the matching Astro component is defined or merged. **Astro is the source of truth when the two diverge** (tracked by a follow-up platinum pass task).

## When to Use

- "Add a `<X>` component to the Svelte package"
- "Port the Astro `<X>` component to Svelte"
- "Add a new Svelte component" (no Astro original yet — Svelte-first path)
- Any task referencing a new `.rs-*` block in `packages/svelte/src/components/`

## Before You Start

1. Read the rules — they are binding, not advisory:
   - `.agents/rules/rocketship-svelte.mdc` (port vs Svelte-first paths, Svelte structure, props, `:global` styles, barrel import)
   - `.agents/rules/rocketship-bem-scss.mdc` (naming, variables, declaration order)
   - `.agents/rules/rocketship-layout-responsive.mdc` (container queries vs media queries)
   - `.agents/rules/rocketship-a11y.mdc` (WCAG targets, semantics)
   - `.agents/rules/rocketship-typescript.mdc` (arrow functions, doc blocks)
   - `_planning/svelte-port-checklist.md` (the acceptance contract — pick the port or Svelte-first variant)
2. Decide the path:
   - **An Astro original exists** → read it — it is your template, not just a reference:
     - `packages/base/src/components/<Name>.astro` — copy its frontmatter types, markup structure, and its full `<style lang="scss">` rule block.
     - Interactive control (`as`/`variant`/`size`) → `Button.astro`
     - Layout wrapper with elements/slots → `Card.astro`
     - Simple layout with size variants → `Grid.astro`
   - **No Astro counterpart exists** → this is a Svelte-first component. Design it in Svelte following the same conventions (BEM `rs-`, `--rs-*` tokens, `:global` styles, container queries, a11y, typed props), so a later Astro version can be ported back from it. If an open Astro PR for the same component exists, consult it so the two converge. Note the provisional status in the PR: Astro is the source of truth on divergence.
3. Check whether the pattern is genuinely new to the repo (`:has()`, `[open]`, `::backdrop`, popover attributes, focus-trapping). If so, flag it: novel patterns need a hand-written reference example before delegation.

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

- **Props**: exported union types per axis; a `Props` type extending the native attributes of the root tag (e.g. `HTMLAttributes<HTMLDivElement>`, `HTMLButtonAttributes`); `class?: string`, `children?: Snippet`; destructure from `$props()` with defaults; spread `...attrs` onto the root. Include `as?` only when the Astro original has it.
- **Markup**: a fixed root tag, or `<svelte:element this={as} {...attrs} class={classes}>` when the Astro original is polymorphic, with `@render children?.()`. Named Astro slots become snippet props guarded by `{#if name}`. The default variant emits no modifier class.
- **Styles**: one `<style lang="scss">` block inside the component, wrapped in `:global { ... }`. Never create a separate component `.scss` file.
- **Import**: `@use '@labcat2020/rocketship/styles/mixins' as *;` — the forwarded barrel (`packages/base/src/styles/mixins.scss`), exported as the `./styles/mixins` subpath. It provides `rs-token()`, `to-rem()` and the container-query mixin. Never `@use` individual mixin partials, and never copy mixin or token source into `packages/svelte`.
- **Port the styles as-is** (port path): same selectors, same declarations, same order as the Astro rule block. Do not redesign or re-tokenize. (Svelte-first path: author the rule block in Svelte following the same conventions below.)
- **BEM**: block `rs-<name>`, elements nested as `&__element`, modifiers as `&--modifier`, nested under the block selector.
- **Declaration order per rule block**: `--rs-*` custom properties first (only when the Astro block assigns them) → reset (`all: unset`) if needed → `box-sizing` if reset → everything else (layout, then appearance).
- **Tokens**: reference tokens only through `#{rs-token(name)}` from the mixins barrel (always interpolated). Keep the two Astro variable patterns: opt-in hooks (`var(--rs-name-x, #{rs-token(…)})`, never assigned on the block) and variant-owned locals reassigned in modifiers. Font sizes use `to-rem()`; all other dimensions are `px`.
- **Component variables are the override API**: expose a `--rs-<name>-*` hook for each overridable aspect. Port path: mirror every hook from the Astro original so overrides keep working. Svelte-first: define hooks the same way so a later Astro port can reuse them.
- **Missing tokens**: unknown `rs-token()` names fail the build. **Stop and tell the user**; never invent hard-coded values in the Svelte component. Adding tokens is a design-system decision made in `$rs-tokens` in `packages/base`.
- **Dark mode**: never add component-level `prefers-color-scheme` blocks; token colours compile to `light-dark()`.
- **Container queries**: only for layout changes (port path: only where the Astro original uses them). Viewport `media-breakpoint-up` is reserved for Container/layout — never leaf components.
- **States**: hover/active/focus-visible/disabled nested under the block or modifier. Focus must be visible.
- **No inline styles for design**: no `style="..."` for design/theming, and no `style:` directives for colours, spacing, radii, or theming.
- **DRY in styles**: keep the shared declarations at the block selector.

### 2. Register the export: `packages/svelte/package.json`

Add `"./components/<Name>": "./src/components/<Name>.svelte"` to `exports`. Keep the naming identical to the Astro entry in `packages/base/package.json` so consumers can switch packages without changing the import path.

### 3. Stories: `apps/svelte/src/stories/`

Mirror the Astro stories from `apps/frontend/src/stories/` (port path), or write fresh stories in the same shape (Svelte-first path). Two files:

- `<Name>.stories.ts` (Svelte CSF) — `<Name>Default.svelte` as the component, title `'Components/<Name>'`, `parameters: { a11y: { disable: false } }`, one default-exported story. The `Base/` group is reserved for the existing primitive components (Button, Typography, Grid, Container). Token documentation stories live in the `Foundations/` group.
- `components/<Name>Default.svelte` (or `<Name><Aspect>.svelte`) — imports only components from `@labcat2020/rocketship-svelte`; composes them inside `<Container size="content" padded>`. Snippet passed where the Astro wrapper used slots. **No `<style>` blocks, no story-only CSS, ever.**
- **Layout**: stack examples in a `<Stack>` inside the single `Container`, mirroring the Astro story. Never use Containers as spacers.
- **Scope**: show one aspect per story file. A second aspect (sizes, slots) is a separate story file.
- **Naming**: a single-story file exports `Default`; a multi-example comparison exports `Variants` (or `<Aspect>`).

Story copy follows `.agents/rules/rocketship-story-copy.mdc`: present tense, adopter voice, no roadmap mentions.

### 4. Verify

- `svelte-check` (or the package's check/build script) passes with no type or Sass errors.
- Run the Svelte Storybook (`apps/svelte`) and confirm the new stories render and axe reports no violations.
- Port path: compare the rendered output against the Astro component for visual parity, and diff your component against the Astro original — same section order, same naming style, same token fallback depth. Any deviation must be deliberate and recorded (notably Astro slots → Svelte snippets).
- Svelte-first path: there is no Astro component to compare against. Confirm the conventions were followed (BEM `rs-` classes, `--rs-*` tokens, `:global` styles, container queries, a11y, typed props) and note any open Astro PR for the same component.

## Recording API differences

Port path: note every intentional difference from the Astro component in the PR description — at minimum the slots → snippets change, plus any prop that could not be mirrored. Svelte-first path: note that the component is provisional (Astro is the source of truth on divergence; a platinum pass is tracked) and any open Astro PR consulted. `_planning/svelte-port-checklist.md` has the copy-paste MR checklist for both paths.

## Tier Awareness (novel patterns)

Existing components cover: polymorphic tags, BEM elements/modifiers, snippets (named and default), conditional markup, container-query sizes, token-driven tones. They do **not** cover interactive-state primitives: `:has()`, `[open]`, `::backdrop`, the `popover` attribute, focus-trapping. If the requested component needs these, stop and tell the user — the first such component should be hand-written by them to serve as the reference example, not generated.

## A11y semantics

- **Roles**: opt-in only. No default role, never derived from a visual variant (port path: exactly as the Astro original).
- **Headings**: components never render titles or hard-code heading levels; consumers write the heading and apply the `__title` class.
- **Snippets and a11y**: because user content arrives through snippets, the component cannot control its structure. Keep every wrapper element that the Astro original rendered (port path), and do not add wrappers that only exist for styling.
