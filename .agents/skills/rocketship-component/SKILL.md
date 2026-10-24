---
name: rocketship-component
description: 'Create a new Rocketship component exactly matching repo conventions. Use when asked to add, build, or scaffold a component in packages/base (Astro + SCSS + BEM rs- prefix + --rs-* tokens), including its Storybook stories in apps/frontend.'
---

# Rocketship Component Authoring

Build a new component for `@labcat2020/rocketship` the way Shane builds them by hand. **Alert** (`packages/base/src/components/Alert.astro`), **Stack** (`packages/base/src/components/Stack.astro`), **Field**, **Label**, **Fieldset**, **Input**, **Textarea**, **Select**, **Checkbox** and **Radio** are the reviewed reference components: Alert for a content block with variants, Stack for a layout primitive with `as`, Field, Label and Fieldset for form wiring and grouping, Input, Textarea and Select for form controls, Checkbox and Radio for choice controls. Copy their shape whenever unsure. Button, Card, Container, Grid and Typography predate the review and do not yet follow every rule below; do not copy their deviations.

The reasoning behind every rule is recorded in `_planning/component-review-decisions.md`.

## When to Use

- "Add a `<X>` component to the base package"
- "Build the Disclosure / Dialog / Callout component"
- Any task referencing a new `.rs-*` block in `_planning/tasks.md`

## Before You Start

1. Read the rules. They are binding, not advisory:
   - `.agents/rules/rocketship-bem-scss.mdc` (selectors, naming, tokens, declaration order)
   - `.agents/rules/rocketship-layout-responsive.mdc` (container queries vs media queries)
   - `.agents/rules/rocketship-a11y.mdc` (WCAG targets, roles, headings)
   - `.agents/rules/rocketship-typescript.mdc` (arrow functions, doc blocks)
2. Read the closest reference component:
   - Content block with variants and element classes → `Alert.astro`
   - Layout primitive with a polymorphic tag → `Stack.astro`
   - Form wrapper, caption or group → `Field.astro`, `Label.astro`, `Fieldset.astro`
   - Form control → `Input.astro`, `Select.astro`; choice control → `Checkbox.astro`, `Radio.astro`
   - Interactive control → `Button.astro` (pre-review: see the Button notes in the decisions file)
3. Check whether the pattern is genuinely new (no `:has()`, `[open]`, `::backdrop`, popover attributes exist anywhere yet). If so, flag it: novel patterns need a hand-written reference example before delegation.

## Procedure

### 1. Component file: `packages/base/src/components/<Name>.astro`

Follow this structure (see [component-template.md](./references/component-template.md) for the annotated skeleton):

```
---
(frontmatter)          → types, Props, destructuring, class computation
---
(markup)               → single root element, class:list, <slot />
<style is:global lang="scss">  → @use barrel, then .rs-block { ... }
```

#### Props and markup

- **Exported union types** for each axis (`export type AlertVariant = ...`), a `Props` type extending `HTMLAttributes<'...'>` of the root tag, `class?: string`, defaults in the destructure, and `...attrs` spread onto the root.
- **`as?` only when more than one root tag is semantically valid.** Restrict it to a union of those tags (Stack: `'div' | 'ul' | 'ol'`). Omit it when only one tag is correct (Alert is always a `div`).
- **Never shadow a native attribute with a prop.** A prop named `title` hijacks the tooltip attribute; choose another name or, better, let the consumer write the element.
- **Never re-declare a native attribute as a prop.** `HTMLAttributes<'fieldset'>` already types `disabled`; it flows through `...attrs`, as on Input, Textarea and Select. The same goes for `checked`; React names such as `defaultChecked` never appear.
- **Never fake a state the platform cannot express in markup.** `indeterminate` is a DOM property only script can set, so Checkbox has no `indeterminate` prop: it styles `:indeterminate`, and the look always matches what assistive tech announces.
- **The base class is the default.** The default variant emits no modifier class: `['rs-alert', variant !== 'info' && \`rs-alert--${variant}\`, className]`. No class may appear in markup unless a rule exists for it.
- **Consumers own content elements.** Do not render titles, descriptions or content wrappers, and do not take title/heading props or slots. The consumer writes the element and applies the BEM element class, choosing the heading level for the page outline: `<h3 class="rs-alert__title">`. The root renders `<slot />` directly.
- **A named slot only where position is structure.** When an element must sit in a fixed place to work (a legend names its fieldset only as the first child), the component renders it through an optional named slot and guarantees the position: `{Astro.slots.has('legend') && <legend class="rs-fieldset__legend"><slot name="legend" /></legend>}`. The consumer still writes the words (`<Fragment slot="legend">Billing address</Fragment>`). Everything else stays consumer-written.
- **Content is block elements.** A flex block splits bare inline text into separate items, so stories and docs always show content inside elements.
- **No id props for a11y wiring.** When one element points at another (`aria-describedby` → hint, `for` → control), the consumer writes both ends in their own markup. Field takes no `hintId`/`errorId`; the consumer writes `<p class="rs-field__hint" id="…">`.
- **Components never render words.** Text is content and belongs to the consumer, in their language: no `requiredText`/`optionalText` props. A component may render decoration (Label's `aria-hidden` asterisk).

#### Styles

- **One `<style is:global lang="scss">` block** inside the component. Never a separate component `.scss` file.
- **Import the barrel only**: `@use '../styles/mixins' as *;`.
- **Explanations are `///` doc comments above the rule** they explain. Never `/* */` or `/** */`: Sass keeps those in the compiled CSS.
- **Every compiled selector is a single BEM class** (plus pseudo-classes/elements on that same class). No descendant, child, sibling, compound-class, tag or ID selectors. `&__element` / `&--modifier` nesting is fine because it compiles flat.
- **Modifiers change elements only by reassigning `--rs-*` variables on the block.** Elements read the variables. For parent state that a child must react to (e.g. parent hover), use a style query: the parent sets a custom property and the child uses `@container style(--rs-x-state: value)`.
- **Tokens only through `rs-token()`.** Write `#{rs-token(space-4)}`, which compiles to `var(--rs-space-4, 16px)`. Always interpolate it, because Sass does not evaluate functions inside custom property values. Never write a hex, px or rem literal as a token fallback.
- **Missing tokens fail the build.** `rs-token()` raises an error for unknown names. If a component needs a token that does not exist, **stop and tell the user**. Adding a token is a design-system decision made in `$rs-tokens` (`styles/mixins/tokens.scss`), with the user's approval.
- **The Foundations stories show every token.** Adding, renaming or removing a token updates its Foundations page in the same change: every `color-*` token appears in `stories/components/ColorsDocument.astro` (likewise Spacing, Borders, Shadows), aliases included.
- **Two component-variable patterns:**
  - **Opt-in hooks** (spacing, radius, borders, type): never assigned on the block; used as the first fallback: `border-radius: var(--rs-alert-border-radius, #{rs-token(radius-md)})`. Adopters set them on `:root` or any ancestor.
  - **Variant-owned locals** (colours that variants swap as a set): assigned on the block, reassigned in modifiers, read by properties: `--rs-alert-bg: #{rs-token(color-surface-elevated)}` then `background: var(--rs-alert-bg)`.
- **Variant names describe the message; token names describe the palette role.** Alert's `error` variant reads the `danger` tokens. The modifier translates between them; never rename one to match the other.
- **Use a token only for the role its name states.** `color-danger-fg` is text *on* `danger-bg`; `color-danger-accent` is a stroke (3:1). Red text on a page surface is `color-danger-text` (4.5:1). `color-border` is a decorative hairline; the edge of a control (input, select, checkbox) is `color-border-control` (3:1, WCAG 1.4.11). If no token states the role you need, stop and ask: the answer may be a new alias token.
- **Declaration order per rule block**: `--rs-*` custom properties first → reset (`all: unset`) if needed → `box-sizing` if reset → everything else (layout, then appearance).
- **No outer margin.** A component styles its inside only. Spacing between components belongs to whoever places them (Stack, Grid, the page).
- **Grouping is not boxing.** A semantic group (Fieldset) adds no background, border, radius or padding; a consumer who wants a panel composes it in a Card. Reset the native chrome you do not want (`border: 0`, `margin: 0`, `padding: 0`, `min-inline-size: 0` on a fieldset) rather than restyling it.
- **Parent state never nests an element under a pseudo-class.** `&:disabled { &__legend {} }` compiles to the invalid `.rs-fieldset:disabled__legend`. Parent state is a block variable or a style query; usually the child needs no state at all (a disabled fieldset's legend stays readable, like a Label beside a disabled control).
- **Inline components set no `display`.** Label is blockified inside Field's flex column and stays inline beside a checkbox; the parent decides. Never make a text container a flex row: it splits text from its markers and drops whitespace.
- **Never set `font-family`.** Components inherit the typeface of the page so they blend into any theme.
- **Body copy inherits size and line height.** Elements such as `__description`, `__hint` and `__error` set only `color` (plus weight where hierarchy needs it) and `margin: 0`. Hints and errors never shrink.
- **Heading level is semantics; the class is the look.** A title class sets `font-size: inherit` (cancelling tag defaults and host heading styles), its weight, line height, colour and `margin: 0`, so `h2` and `h4` render identically.
- **Every element class sets `margin: 0`**, because consumer-written elements arrive with browser margins and the block's `gap` owns spacing.
- **Any element on a component-owned background sets its own `color`**, so host rules like `p { color: grey }` cannot break contrast.
- **Units**: authored font sizes use `to-rem()` px; everything else is `px`. No `em` font sizes.
- **Dark mode is in the tokens.** Never add `prefers-color-scheme` blocks to components; `rs-token()` colours compile to `light-dark()`.
- **Container queries are for layout changes** (columns appearing, media moving beside text), not cosmetic density steps. A component with one layout has one size. Viewport `media-breakpoint-up` is reserved for Container/layout.
- **States**: hover/active/focus-visible/disabled nested under the block or modifier. Focus must be visible. States reassign the block's own variables (`&:checked { --rs-checkbox-bg: … }`).
- **Form controls change state instantly.** No transitions on controls; ticking or focusing is a direct action, and no motion means no `prefers-reduced-motion` opt-out. `transition-fast` is for Button and links.

### 2. Register the export: `packages/base/package.json`

Add `"./components/<Name>": "./src/components/<Name>.astro"` to `exports`.

### 3. Stories: `apps/frontend/src/stories/`

Two files, matching `Alert.stories.tsx` / `components/AlertVariants.astro`:

- `<Name>.stories.tsx`: `Meta`/`StoryObj` from `@storybook/html`; import the wrapper Astro file plus each used library component's style side effect (`import '@labcat2020/rocketship/components/X'`); title `'Components/<Name>'`; `parameters: { a11y: { disable: false } }`. Layout primitives (Container, Grid, Stack) and Button/Typography live in `Base/`; token documentation lives in `Foundations/`.
- `components/<Name><Aspect>.astro`: imports only `@labcat2020/rocketship` components. Examples go in a `<Stack>` inside a single `<Container size="content" padded>`. **No `<style>` blocks, no story-only CSS, and never Containers used as spacers.**
- **Content**: show real headings on `__title` (use `h2`, since the story canvas has no other headings) and block elements for body text.
- **Roles**: only show a live-region role where the example would genuinely be dynamic.
- **Forms**: every control has a `<Label for>`; error examples set `aria-invalid="true"` and `aria-describedby` on the control; a story with a required asterisk also shows the "Fields marked * are required." line. Choice controls sit in `<Field inline>` rows; option groups are a Fieldset holding a `<Stack gap="small">` of rows. Native `<input>`/`<select>`/`<textarea>` stand in until the library has the control component.
- **Script-only states** (`indeterminate`) are shown with a one-line `<script is:inline>` in the wrapper, which doubles as the usage example. Never fake them with a class. No `autofocus` in stories: it steals focus on load.
- **Scope**: one aspect per story file. A second aspect (sizes, gaps) is a separate story file. States are not aspects: a disabled, required or error example sits beside the default in the same story, never in its own file. Name the story for what it shows: a control with several states exports `States` (Select); a component whose only extra state is native behaviour exports `Default` with the state as one example (Fieldset).
- **Naming**: a single-story file exports `Default`; a multi-example comparison exports `Variants`, `States` (or `<Aspect>`). Add the story to `apps/frontend/.storybook/preview.ts` sort order when it sits in `Base/`.

Story copy follows `.agents/rules/rocketship-story-copy.mdc`: present tense, adopter voice, no roadmap mentions.

### 4. Verify

- `pnpm --filter @labcat2020/rocketship build` passes, and Storybook compiles the component's Sass with no errors.
- Check every story in Storybook in **light and dark** (toolbar colour-scheme switch) and confirm axe reports no violations.
- Diff your component against `Alert.astro` / `Stack.astro`: same section order, same naming style, `rs-token()` everywhere. Any deviation must be deliberate and explained.

## Tier Awareness (novel patterns)

Existing components cover: polymorphic tags, BEM elements/modifiers, consumer-owned element classes, token-driven tones, layout primitives. They do **not** cover interactive-state primitives: `:has()`, `[open]`, `::backdrop`, the `popover` attribute, focus-trapping. If the requested component needs these, stop and tell the user. The first such component is hand-written by them as the reference example (per the project's Tier A/Tier B methodology), not generated.

## A11y semantics

- **Roles are opt-in, never implied.** Statically rendered content has no role by default. Expose a narrow `role?` union (Alert: `'alert' | 'status' | 'note'`) so the consumer can opt in when content is injected dynamically. A component's name never implies a role: "Alert" does not mean `role="alert"`. Never map a visual variant to a live-region role.
- **Lists keep their semantics.** A component rendered as `ul`/`ol` with `list-style: none` adds `role="list"`, because Safari/VoiceOver drops list semantics otherwise.
- **Headings** come from the consumer at the level the outline needs; never hard-code a heading level in a component.
- **Meaning is not colour alone.** Status variants rely on the consumer's title text to say what happened; make sure examples do.
- **Form controls** (Input, Textarea, Select; Checkbox and Radio share the invalid, disabled and no-hover rules) set `font: inherit` (native controls do not inherit the page font), have one size with padding hooks for density, and derive their `--invalid` modifier from the control's own `aria-invalid="true"`; never add an `invalid` or `size` prop, and never style `:invalid`. They have no hover state.
- **A control is one element.** `class`, `id` and `aria-*` land on the native control; no wrapper span. Decoration such as Select's chevron is painted with `background-image` from a token colour, not added as an element, and an `@media (forced-colors: active)` block restores `appearance: auto`. States that change the decoration (Select's list box) are derived modifiers, never attribute selectors.
- **Choice controls** (Checkbox, Radio) are one `<input>` with `appearance: none`: no wrapping label, hidden input or `__control` span, and no sibling selectors. The tick, dash and dot are the input's own `::before`, shaped with `clip-path` and filled from a variable (`--rs-checkbox-mark-color`), never an SVG data URI whose colour is a literal. `:checked` sets fill and border to `color-accent` and the mark to `color-accent-contrast`. The box is 24px (`--rs-checkbox-size`), so it meets WCAG 2.5.8 target size on its own; edge `border-width-sm` in `color-border-control`; `cursor: pointer`; under forced colours `appearance: auto` and the pseudo-element is dropped.
- **Choice rows** are `<Field inline>`: a two-column grid with the control first and the Label, hint and error in the second column (`grid-column` read from a variable the modifier sets). The Label's first line centres on the control through `--rs-label-offset`.
- **Group messages** belong to the fieldset: `<p class="rs-fieldset__error" id="…">` after the legend, `aria-describedby` on the fieldset, and `aria-invalid` on each radio. Never borrow `rs-field__error` inside a fieldset.
- **Forms.** A label is always a `<label>` (no `as`); captions for a group of controls are `<Fieldset>` with its `legend` slot, which renders `<legend class="rs-fieldset__legend">` as the first child (no `legend` prop). The legend sets `float: inline-start` so it leaves the native border-notch layout and becomes a flex item the block's `gap` spaces; the accessible name still comes from the first `<legend>`. The legend heads a section: `font-size-lg` and semibold, a size step over Label (weight alone does not separate groups). Labels, hints and errors still inherit the page size. Fieldset's gap is `space-4`; tighter option spacing is a `<Stack gap="small">` inside it. Groups sit further apart than their parts: consecutive fieldsets go in `<Stack gap="xlarge">` (40px, at least twice the space inside a group), never a Fieldset margin. The control's own `required` attribute is the source of truth for required state, so never add visually hidden "(required)" text. The invalid state is `aria-invalid="true"` on the control.
