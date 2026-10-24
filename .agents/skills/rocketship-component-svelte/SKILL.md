---
name: rocketship-component-svelte
description: 'Port or create a Rocketship Svelte component matching repo conventions. Use when asked to add, build, or port a component in packages/svelte (Svelte 5 runes + TypeScript + SCSS + BEM rs- prefix + --rs-* tokens), either as a copy-style port of the Astro component in packages/base or as a Svelte-first component with no Astro original, adding its Storybook stories in apps/svelte.'
---

# Rocketship Svelte Component Authoring

Build a component for `@labcat2020/rocketship-svelte`. **Astro is the source of truth.** Every rule in `.agents/skills/rocketship-component/SKILL.md` applies here unchanged; this skill only adds what is Svelte-specific. The reasoning behind every rule is in `_planning/component-review-decisions.md`.

Two paths:

- **Port path**: a reviewed Astro original exists. Mirror it (copy-style port).
- **Svelte-first path**: no Astro original exists on `main`. Design the component in Svelte from the decisions and the reviewed references, so an Astro version can be ported back. It is provisional: Astro wins when the two diverge.

## Reviewed references

Copy the shape of these, in Astro (`packages/base/src/components/`) and their Svelte ports:

- **Alert**: content block with variants and consumer-owned element classes
- **Stack**: layout primitive with a polymorphic `as`
- **Field**, **Label**, **Fieldset**: form wrapper, caption and group
- **Input**, **Textarea**, **Select**: form controls

Everything else predates the review. Button, Card, Container, Grid and Typography (Astro), and Accordion, Disclosure, Figure, Table and the existing Svelte Field, Label, Input, Textarea and Select, do **not** follow every rule. Never copy their deviations. The Svelte Fieldset in PR #62 copied the unreviewed Astro PR #13 (box, `legend` prop, `disabled` prop, container-query sizing); port it again from the reviewed `Fieldset.astro`.

**Open Astro PRs are unreviewed.** Never port from one, and never treat one as a reference. If an open Astro PR exists for the component you are building, note its number in your PR and follow the decisions instead.

## Before You Start

1. Read the Astro skill (`.agents/skills/rocketship-component/SKILL.md`) and the rules: `rocketship-svelte.mdc`, `rocketship-bem-scss.mdc`, `rocketship-a11y.mdc`, `rocketship-layout-responsive.mdc`, `rocketship-typescript.mdc`.
2. Decide the path. Port path: open the Astro original; it is your template. Svelte-first: open the closest reviewed reference above.
3. Check whether the pattern is genuinely new (`:has()`, `[open]`, `::backdrop`, popover, focus-trapping). If so, stop and tell the user: novel patterns need a hand-written reference first.

## Procedure

### 1. Component file: `packages/svelte/src/components/<Name>.svelte`

```
<script lang="ts">   → exported unions, Props, $props(), $derived classes
(markup)             → fixed root, or <svelte:element this={as}> when the Astro original has `as`
<style lang="scss">  → @use barrel, then :global { .rs-block { ... } }
```

See [component-template.md](./references/component-template.md) for the annotated skeleton.

- **Props**: an exported union per axis; `class?: string`; `children?: Snippet`; defaults in the `$props()` destructure; `...attrs` spread onto the root.
- **Native attribute type** matches the Astro root. A fixed root uses that element's type (`HTMLAttributes<HTMLDivElement>`, `HTMLLabelAttributes`, `HTMLInputAttributes`); a polymorphic root uses `HTMLAttributes<HTMLElement>`.
- **`as?` only when the Astro original has it** (decision 1). Never a single-value union.
- **A prop that narrows a native attribute** (Alert's `role?: 'alert' | 'status' | 'note'`) is declared in `Props` and flows through `...attrs`, as in Astro.
- **The default variant emits no modifier class** (decision 4).
- **Never re-declare a native attribute as a prop** (decision 24). `disabled` on Fieldset flows through `...attrs`.
- **Consumers own content elements** (decision 5). No title, legend, label or description props, and no snippet props that render content into a component wrapper. The consumer writes the element and applies the element class. `children` is the only snippet unless the Astro original has a named slot (decision 31): Fieldset's `legend` slot becomes a `legend` snippet, rendered as `{#if legend}<legend class="rs-fieldset__legend">{@render legend()}</legend>{/if}` before `children`.
- **No props that pass wiring into snippets.** A11y links (`for`, `aria-describedby`) are written by the consumer at both ends (decision 14).
- **Components never render words** (decision 16); decoration such as an `aria-hidden` glyph is fine.

### 2. Styles

- **Port path:** copy the Astro `<style>` block into `<style lang="scss">`, wrapped in `:global { ... }`. Same selectors, declarations and order. Do not redesign.
- **Svelte-first path:** author the block by every style rule in the Astro skill.
- **Import** the barrel only: `@use '@labcat2020/rocketship/styles/mixins' as *;`. It provides `rs-token()`, `to-rem()` and the container-query mixin.
- **Tokens only through `#{rs-token(name)}`**, always interpolated. Never a hex, px or rem fallback, and never a "three-level fallback".
- **Unknown token names fail the build:** stop and ask. Tokens live in `$rs-tokens` (`packages/base/src/styles/mixins/tokens.scss`).
- **Hardcore BEM** (decision 3): every compiled selector is one class plus pseudo-classes on it. `&:disabled &__legend` compiles to a descendant selector and is not allowed.
- **No container queries for size or typography steps** (decision 9). Use them only for a real layout change, and only where the Astro original does.
- **Component boundaries:** no `font-family`, no outer margin, and no `display` on inline components.
- **Form text** inherits the page size (decisions 11, 12, 17).

### 3. Register

- `packages/svelte/package.json` `exports`: `"./components/<Name>": "./src/components/<Name>.svelte"`, the same key as the Astro package.
- `packages/svelte/src/index.ts`: value and type exports alongside the other components.
- `packages/svelte/README.md`: the components table row, the props table, and a `### <Name>` section.
- **Never bump `version`** in a component PR. Publishing runs on merge to `main` for any bumped package.

### 4. Stories: `apps/svelte/src/stories/`

Mirror the Astro stories (port path) or follow the Astro skill's story rules (Svelte-first):

- `<Name>.stories.ts`: Svelte CSF, `parameters: { a11y: { disable: false } }`, one story per file.
- **Title:** layout primitives (Container, Grid, Stack), Button and Typography live in `Base/`; everything else in `Components/`; tokens in `Foundations/`. Match the Astro title.
- **Naming:** a second aspect is a second file, `<Name>.<aspect>.stories.ts` exporting `<Aspect>`, with wrapper `components/<Name><Aspect>.svelte`. A single example exports `Default`; a comparison exports `Variants` or `<Aspect>`. A state (disabled, required, error) sits beside the default in the same story, never a second file, and the story is named for what it shows: `States` for a states comparison (Select), `Default` when the only extra state is native behaviour (Fieldset) (decision 29). Consecutive fieldsets go in `<Stack gap="xlarge">` (decision 30); port Stack's `xlarge` gap first.
- **Wrapper** `components/<Name><Aspect>.svelte` imports only `@labcat2020/rocketship-svelte` components. Examples go in a `<Stack>` inside one `<Container size="content" padded>`. Nested Stacks inside a component are fine; Containers as spacers are not. No `as="main"`, no `<style>`, no story-only classes.
- **Content:** titles are real `h2` elements on `__title`; body text is in block elements; forms follow the Astro skill's Forms rule (`aria-invalid` on errors, the asterisk explained).

### 5. Tests

Every component change updates these by hand:

- `packages/svelte/test/components.test.mjs`: API and compiled-CSS tests for the component.
- `packages/svelte/test/consumer-install.test.mjs`: the published-subpath list and the block-class map.
- `packages/svelte/test/a11y.test.mjs`: the story fixture list. A story missing here never reaches axe.
- `apps/svelte/test/storybook-host.test.mjs`: story structure tests.

### 6. Verify

- `pnpm --filter @labcat2020/rocketship-svelte test` and `check` pass; `pnpm --filter @rocketship/svelte-storybook test` passes; `pnpm build` passes at the root.
- Storybook renders every story in light and dark with no axe violations.
- Port path: diff the style block against the Astro original. It should be identical inside `:global`.

## Recording differences

The PR description lists every intentional difference from the Astro original (Astro slots → Svelte snippets at minimum), notes breaking changes to the published API, and, for Svelte-first, states the provisional status and any open Astro PR. Copy the checklist from `_planning/svelte-port-checklist.md`.
