# Component review decisions

Decisions from the line-by-line review of the Astro library with Shane, started 2026-10-23 on Alert. These feed the rewrite of `.agents/skills/rocketship-component/SKILL.md`, the Svelte skill and the `.agents/rules/` files. Nothing here is applied to code yet unless marked done.

## Agreed

### 1. Polymorphic `as` prop only where it means something

- Add `as?` only when the component has more than one semantically valid root element. Restrict it to a union of those tags, as Card does.
- Omit it when only one tag is correct. Alert is a fixed `div`.
- `aside` is wrong for Alert: an explicit role overrides it anyway, and without a role it becomes an unlabelled complementary landmark.

### 2. Roles are opt-in, never implied

- No default role. A statically rendered component is content, and its heading carries the meaning.
- Alert takes `role?: 'alert' | 'status' | 'note'`. The consumer opts in when the content is dynamic (`alert` for an injected error, `status` for "Saved").
- A component's name never implies a role. "Alert" does not mean `role="alert"`.
- Urgency is not tied to the visual variant.

### 3. Hardcore BEM: every compiled selector is a single class

- Selectors are one BEM class, plus pseudo-classes or pseudo-elements on that same class (`:hover`, `:focus-visible`, `::before`).
- No descendant, child, sibling or compound-class selectors. No tag or ID selectors.
- A modifier changes its elements only by reassigning `--rs-*` variables on the block. Elements read those variables.
- SCSS `&__element` / `&--modifier` nesting is fine because it compiles flat. It is source organisation, not selector nesting.
- Parent state that a child must react to (e.g. parent hover) uses CSS style queries: the parent sets a custom property and the child uses `@container style(--rs-x-state: value)`. No `container-type` is needed. Browser support to be checked before this becomes a hard rule.

### 4. The base class is the default

- The default variant emits no modifier class and has no modifier rule.
- No class appears in markup unless a rule exists for it.
- Overrides go through CSS variables, so no `--default` hook class is needed.

### 5. Consumers own content elements

- Components do not render titles. No `title` prop (it hijacks the native tooltip attribute), no title slot and no heading-level prop.
- The consumer writes the element and applies the BEM element class, choosing the heading level that fits the page outline: `<h3 class="rs-alert__title">`.
- No component-rendered content wrappers (Alert loses `rs-alert__body`). This is the Card pattern:
  - the block is a flex column whose `gap` owns all spacing;
  - each element class sets its own typography with `margin: 0`;
  - content must be block elements, never bare inline text (a flex container splits inline runs into separate items).
- Shared element vocabulary across components: `__title` and `__description` mean the same thing on Card and Alert.
- Stories always show real headings on `__title`.

### 6. Components work standalone, including dark mode

- Consumers must be able to use components without importing Rocketship's styles, with their own variables file or none. Fallbacks are the default theme, not redundancy.
- Colour fallbacks use `light-dark()`, so dark mode works with no `@media` block in components. A standalone consumer only needs `:root { color-scheme: light dark; }`.
- The theme picker (RCL-19) forces light or dark by setting `color-scheme` on `:root`.
- A single Sass token map holds every token's light and dark values. An `rs-token()` function writes the fallback:
  `rs-token(color-danger-bg)` → `var(--rs-color-danger-bg, light-dark(#ffeef0, #2e0a0f))`.
- `variables.scss` is generated from the same map, so the tokens and component fallbacks never drift.
- Components never contain hand-written hex values; they only name tokens.

### 7. Shadows are kept exactly as designed

- Light and dark shadows differ in shape, not just colour, and must be kept pixel for pixel.
- Authored in the token map as two separate full values (`light:` and `dark:`).
- Compiled to a layered `box-shadow` in which the inactive layer is transparent:
  `0 1px 2px light-dark(<light colour>, transparent), 0 0 0 1px light-dark(transparent, <dark colour>)`.

### 8. Components inherit the font

- Components never set `font-family`. They take on the typeface of the page around them, so they blend into any theme.
- Consumers who import Rocketship's styles get the Rocketship font from `body`.
- Colours, spacing and radii are the component's own design; the typeface belongs to the page.

### 9. Container queries are for layout changes, against any container

- Use container queries when a component's layout changes with the space it has (Grid gaining columns, Card media moving beside text). Not for cosmetic density steps.
- Alert drops its container queries and has one comfortable size.
- The `container-query-up` mixin stops requiring the `rs-component` name and queries the nearest container of any kind (`@container (min-width: …)`). Rocketship's Container stays a container; consumers can make any element one (e.g. a slide-over panel with `container-type: inline-size`) and components inside respond to that box.
- Body copy never shrinks on small screens.
- Breakpoints are px, chosen by eye: container queries `$rs-cq-sm/md/lg` 500/700/900px; viewport `$rs-breakpoints` 576/768/992/1200px (Container/layout only). `rem` is for font sizes only.

### 10. Variant names describe the message; token names describe the palette role

- Alert's variant is `error` (what happened); the semantic token is `danger` (the red role, also used by e.g. a destructive Button where nothing has failed).
- The modifier is where the component translates between the two. This is the component tier's job.
- Do not rename one to match the other.

### 11. Body text inherits the page's size

- `__description` (was `__body`) sets only `color` and `margin: 0`. Font size and line height inherit from the page, so alert body copy matches body copy everywhere else.
- `--rs-alert-body-font-size` and `--rs-alert-body-line-height` hooks are removed; consumers own the element and can class it.
- `margin: 0` on every element class, because consumer-written elements arrive with browser margins and the block's `gap` owns spacing.
- Accessibility rule: any element that sits on a component-owned background sets its own `color`, so host-page rules like `p { color: grey }` cannot break contrast.

### 12. Heading level is semantics; the class is the look

- An `h2` and an `h4` carrying `rs-alert__title` render identically. Choose the level for the page outline, never for size.
- The title class must set a font size to cancel tag defaults and host heading styles. It uses `font-size: inherit`, so the title matches the alert's body size on any site.
- Hierarchy comes from weight: semibold title over regular body. One hook, `--rs-alert-title-font-weight`.
- `line-height: rs-token(line-height-tight)`, `margin: 0`, and its own `color` (decision 11).
- Units: authored font sizes are always `to-rem()` px. `inherit` is a keyword, not a unit. No `em` font sizes. If more size contrast is ever needed, add a rem step through a token.

### 13. Components never set their own outer margin; Stack owns the space between them

- A component styles its inside only. Whoever places it decides the spacing around it.
- New layout primitive `Stack` (`rs-stack`): a flex column whose `gap` owns vertical spacing between children. Built in Astro first and reviewed line by line like Alert, then ported to Svelte.
- Stories stack examples with `<Stack>` inside a single `<Container size="content" padded>`. No nested Containers used as spacers, and no story CSS.
- Draft API (to be confirmed in review): `as?: 'div' | 'ul' | 'ol'`, `gap?: 'small' | 'medium' | 'large'` (default `medium` emits no modifier), `class?`. When rendered as a list, it adds `role="list"`, because `list-style: none` drops list semantics in Safari/VoiceOver.

### 14. Field is a plain wrapper; consumers write the label, control, hint and error

- Extends decision 5 to forms. `Field` renders `<div class="rs-field"><slot /></div>`: a flex column whose `gap` owns the spacing. No named slots, no wrapper divs (`__label`, `__control`), no `as`.
- The consumer writes every element and applies the element class: `<p class="rs-field__hint" id="…">`, `<p class="rs-field__error" id="…">`.
- No id props (`hintId`, `errorId`). A11y wiring is an id match between the control's `aria-describedby` and the hint or error, so both ends live in the consumer's markup, where they can see them and keep them in sync.
- A flex column stretches its children, so the control needs no wrapper to fill the width.

### 15. Label is always a `<label>`

- Applies decision 1: only `<label>` gives the control its accessible name, links through `for` and makes the caption a click target. `span`/`div` silently dropped `for` and left the control unlabelled.
- No `as` prop. `for` flows through `...attrs`; no `for: htmlFor` alias.
- Captions for a group of controls are `<fieldset>` + `<legend>` (Fieldset), never a non-label Label.

### 16. The control's `required` attribute is the source of truth; components render no words

- `required?: boolean` on Label renders only a decorative `<span class="rs-label__required" aria-hidden="true">*</span>`. The control's own `required` attribute drives validation and is what assistive tech announces, so a visually hidden "(required)" only doubles the announcement (or lies when the control is not required). No `requiredText`, no `__sr-only` helper, no global `sr-only` utility for this.
- Explaining the asterisk ("* marks required fields") is form-level copy owned by the consumer (WCAG 3.3.2).
- Words are content (decision 5). "(optional)" is consumer-written in their language, on an element class: `<span class="rs-label__optional">(optional)</span>`. No `optional` / `optionalText` props.
- A component may render decoration (a glyph, an icon); it never renders language.

### 17. Form text inherits the page size; hierarchy comes from weight and colour

- Extends decisions 11 and 12 to forms. Hints and errors are often the most important text on a form, so they never shrink.
- `rs-label`: `font-size: inherit`, medium weight through `--rs-label-font-weight`, tight line height, its own `color`, `margin: 0`.
- `__hint`: inherits size and line height, muted colour, `margin: 0`.
- `__error`: inherits size and line height, semibold so it is not signalled by colour alone (WCAG 1.4.1), `margin: 0`.
- `.rs-field` has one gap, `--rs-field-gap` defaulting to `space-2`. No font-size hooks (`--rs-label-font-size`, `--rs-field-hint-font-size`, `--rs-field-error-font-size`) and no container-query steps.

### 18. A token's name is its contrast contract; use one only for the role it names

- `color-danger-fg` is text *on* `danger-bg` (near-black in light mode), so on a page surface an error styled with it reads as body text. Never pick a token by the message ("danger") when its role ("text on a danger surface") does not match.
- Accent tokens are strokes and fills (non-text, 3:1). Text needs 4.5:1. Using an accent for text couples two contracts: retuning the accent for softer borders would silently break text contrast.
- New token `color-danger-text: (alias: color-danger-accent)`: red text on page surfaces, must keep 4.5:1 (today 5.18–5.80 light, 5.43–7.08 dark). `rs-field__error` and `rs-label__required` read it through `--rs-field-error-color` / `--rs-label-required-color`.
- When a role needs a value nothing else has, give it its own token, even as an alias. If the accent ever changes, the alias becomes a value and no component changes.

### 19. Inline components set no `display`; the parent decides

- Label sets no `display`, `align-items` or `gap`. In Field's flex column it is blockified and stretched (a full-width click target); beside a checkbox it stays inline. One component, both layouts, because the parent owns placement (decision 13).
- Flex on a text container splits the text and its markers into separate boxes: long labels wrap as a column with the marker beside the block, and whitespace between items is dropped.
- Spacing inside the component stays inside it: `rs-label__required` has `margin-inline-start: space-1`, so the asterisk follows the last word wherever the label wraps.

### 20. A control's edge is not a hairline: `color-border-control`

- WCAG 1.4.11: the visual boundary of a control needs 3:1 against what surrounds it. `color-border` (decorative hairlines, 1.43–1.98) fails, and an input's surface fill differs from the page by only 1.06, so the border is the only cue.
- New token `color-border-control: (light: #7e89a8, dark: #5d6f9f)`, same blue-grey family as `color-border`, ≥3:1 on every surface (light 3.11–3.48, dark 3.04–3.97). Used by every text-entry and selection control (Input, Textarea, and Select, Checkbox, File when they are reviewed).
- Input and Textarea (Astro) inherit the page font (`font: inherit`; native controls do not), pad `space-2` × `space-3`, use `radius-sm`, and show the focus ring on `:focus-visible`.
- The error state comes from the control's own `aria-invalid="true"`; the component derives `rs-input--invalid` from it (one source of truth) and only swaps the border to `color-danger-accent` (a stroke, decision 18).

### 21. Text controls have one size

- Input and Textarea have no `size` prop. Text inherits the page size (decision 17) and padding is fixed, so an input is about 41px tall at 16px text and lines up with a medium Button.
- Size steps are cosmetic density (decision 9), and a sub-16px input makes iOS Safari zoom the page on focus.
- Density is opt-in through the padding hooks (`--rs-input-padding-block`, `--rs-input-padding-inline`) on any ancestor.
- The Svelte Input/Textarea (RCL-53) have `sm`/`md`/`lg`, hex fallbacks, `font-family` and container queries; they are realigned in a follow-up port.

### 22. A control is one element; decoration is painted, not added

- Select renders a single `<select {...attrs} class="rs-select">`, like Input: `class`, `id` and `aria-*` all land on the control. No wrapper span, no `__control` element, no SVG icon element.
- The chevron is two `linear-gradient` background layers coloured by `--rs-select-icon-color` (`color-muted`), so it follows the theme and dims with the control's own `opacity` when disabled. No sibling selector (decision 3).
- When `multiple` or a numeric `size` makes it a list box, the frontmatter adds the derived modifier `rs-select--list`, which removes the chevron. No attribute selectors.
- `@media (forced-colors: active)` inside the rule restores `appearance: auto`, because forced-colours mode can drop background images; high-contrast users get the native arrow.
- No `:invalid` styling: a required select with an empty placeholder matches `:invalid` on load. The error state comes only from `aria-invalid` (decision 20).

### 23. Form controls have no hover state

- Rest is `color-border-control`, focus is the focus ring, error is the danger border. Nothing changes on hover.
- A hover border reads as focus, sticks on touch screens after a tap, and made Select behave differently from Input and Textarea in the same form.
- The affordance for Select is `cursor: pointer` and the chevron.

### 24. A prop never re-declares a native attribute

- Extends decision 1 (props only where they mean something). Fieldset loses its `disabled` prop: `HTMLAttributes<'fieldset'>` already types it, and it flows through `...attrs` like `disabled` on Input, Textarea and Select.
- The native attribute does the work: a disabled `<fieldset>` disables every descendant control (except those in its first `<legend>`), they match `:disabled` and dim through their own rules, and assistive tech announces them as unavailable.

### 25. Fieldset groups; it does not box

- Extends decisions 13 and 14. Fieldset is Field's counterpart for several controls: it gives them a shared name (the legend) and nothing visual beyond spacing. No background, border, radius or padding, and no hooks for them.
- Visual containment is composition: a consumer who wants a panel puts the Fieldset in a Card. A boxed group would make radio and checkbox groups heavier than the plain Fields beside them.
- The block resets the native chrome (`border: 0`, `margin: 0`, `padding: 0`, `min-inline-size: 0` so it can shrink below its content) and is a flex column whose `gap` owns the spacing.

### 26. The legend is a flex item: `float: inline-start`

- A fieldset's first non-floated legend is laid out in the border area, outside the anonymous content box that `display: flex` and `gap` apply to. Without a border, it sits flush on the first control and the gap cannot reach it.
- `rs-fieldset__legend` sets `float: inline-start`, which opts it out of that layout. It becomes an ordinary flex item (flex items ignore `float`, so nothing floats), stretches like Label in Field, and the block's `gap` owns its spacing. No `margin-block-end` patch (decision 11).
- Semantics are unchanged: the accessible name and the disabled exemption both come from the first `<legend>` child, not its layout.

### 27. The legend is a group caption: a size step over Label, readable when disabled

- Extends decisions 12 and 17. `rs-fieldset__legend`: `font-size-lg` (18px) through `--rs-fieldset-legend-font-size`, semibold through `--rs-fieldset-legend-font-weight`, `line-height-tight` with no hook, its own `color` through `--rs-fieldset-legend-color` (`color-fg`), `margin: 0`, `padding: 0`.
- Weight alone is not enough: at the same size, semibold over Label's medium is barely visible, and two fieldsets read as one list of fields. The legend heads a section, so it takes decision 12's "rem step through a token". Label, hints and errors still inherit; nothing shrinks (decision 17).
- No disabled legend style. A disabled fieldset dims its controls through their own `:disabled` rules and the caption stays readable, as a Label does beside a disabled control.
- The PR's `&:disabled { &__legend }` was a parent-state descendant rule (forbidden by decision 3) that compiled to the invalid `.rs-fieldset:disabled__legend` and never matched. Nesting an element under a pseudo-class is never valid; parent state is a block variable or a style query.

### 28. Fieldset's gap is the form rhythm; option spacing is composition

- One gap, `--rs-fieldset-gap` defaulting to `space-4`, the same as Stack's default. A fieldset of Fields reads like the Stack of Fields around it, with the legend 16px above the first part.
- The gap spaces the fieldset's parts. Tighter spacing between options (radios, checkboxes) comes from wrapping them in `<Stack gap="small">`, not from a second Fieldset value or a modifier. Whether option groups need that wrapper is settled in the Checkbox/Radio review.

### 29. A state is not an aspect; the story is named for what it shows

- Extends the story-scope rule (one aspect per story file). A state (disabled, required, error) sits beside the default in the same story, never in its own file, because a state is judged against the default next to it.
- The name says what the story shows. A control with several states is a states comparison (`Components/Select` → `States`). A component whose only extra state is native behaviour shows its normal use as `Default`, with the state as one example inside it: `Components/Fieldset` → `Default` (an address group and a disabled one), no separate `Disabled` file.
- Aspects that are separate comparisons (Button sizes, Stack gaps) keep their own story files.
- Stories show only library controls once they exist for the example; a group that needs a control still under review waits for that review rather than showing native stand-ins.

### 30. Groups are further apart than their parts

- Extends decisions 13 and 28. Space between groups must be at least twice the space within them, or the groups run together. Two fieldsets in a default Stack (16px) sit as far apart as the Fields inside each (16px); `large` (24px, 1.5×) still read as one list.
- The placer owns that space, not Fieldset (no outer margin): consecutive fieldsets go in `<Stack gap="xlarge">` (`space-8`, 40px, 2.5× the 16px inside).
- Stack gains `xlarge` (`rs-stack--xlarge` reassigns `--rs-stack-gap` to `space-8`), continuing its two-token steps (`space-2`, `-4`, `-6`, `-8`). Existing gaps are unchanged.
- Space and the larger legend (decision 27) work together: the legend opens each group, the space closes the one before.

### 31. A named slot only where position is structure

- Extends decision 5. Consumers still write the words, but a component renders the content element through a named slot when the element has a structural position the component must guarantee. A legend names its fieldset only as the first child, so Fieldset takes `<Fragment slot="legend">Billing address</Fragment>` and renders `<legend class="rs-fieldset__legend"><slot name="legend" /></legend>` before the default slot.
- The slot is optional (a group can be named by `aria-labelledby`); the legend element renders only when the slot is filled, so no empty `<legend>`. A slot, unlike a string prop, takes markup (a heading inside the legend).
- Alert's title has no structural position, so it stays consumer-written. Svelte: a `legend` snippet guarded by `{#if legend}`.

### 32. SCSS explanations are `///` doc comments above the rule

- An explanatory comment in a style block sits above the rule it explains, as a Sass doc comment (`///`), the SCSS counterpart of a JSDoc block (`rocketship-typescript.mdc`).
- Never `/* */` or `/** */`: Sass keeps those "loud" comments in the compiled CSS, so they ship to every consumer. `///` and `//` are stripped.
- Existing `//` comments inside rules (Select's forced-colours note) are aligned when those components are next touched.

### 33. A prop never fakes a state the platform cannot express in markup

- Extends decision 24. `indeterminate` is a DOM property only script can set (`el.indeterminate = true`); there is no HTML attribute, and `aria-checked` is not allowed on a native checkbox. A prop could only add a class that paints a dash while assistive tech announces "not checked".
- Checkbox has no `indeterminate` prop and no `--indeterminate` class. `.rs-checkbox:indeterminate` paints the dash, so the look and the announcement always match. Docs show the one-line script; stories cannot show the state without one.

### 34. Choice marks are a `::before` clipped shape painted from a token

- Extends decision 22 (decoration is painted, not added). Checkbox and Radio are one `<input>` with `appearance: none`; the tick, dash and dot are the input's own `::before`, shaped with `clip-path` (tick polygon, dash inset, Radio's circle) and filled with `background: var(--rs-checkbox-mark-color)`, so the mark follows the theme and dark mode.
- Not an SVG data URI (its colour is a literal and cannot follow the theme, decision 6) and not gradients (they cannot draw a tick).
- States reassign the block's variables: rest is `color-surface` with a `color-border-control` edge and a transparent mark; `:checked` and `:indeterminate` set fill and border to `color-accent` (a fill, 3:1) and the mark to `color-accent-contrast`. Mark on fill: 5.8:1 light, 3.2:1 dark (graphics need 3:1, WCAG 1.4.11).
- Forced colours restore `appearance: auto` (decision 22); the native control returns and the pseudo-element is not drawn.

### 35. Choice controls meet target size on their own: 24px

- WCAG 2.2 2.5.8 (AA) needs a 24×24 target unless an exception applies (spacing, an equivalent target such as a `<Label for>`). Restyled controls lose the user-agent exception. A component must pass on its own, not only when composed well: a select-row checkbox in a table may have no visible label and no spacing.
- Checkbox and Radio are 24px through `--rs-checkbox-size` / `--rs-radio-size`, a literal: it is the component's own geometry and no token states the role (like Select's chevron size and Input's 2px focus outline).
- Edge `border-width-sm` (1px) in `color-border-control`, matching the text controls; `color-border-control` already meets 3:1 at 1px. Corners `radius-sm` (Checkbox) and `radius-pill` (Radio), each with a hook.
- AAA (2.5.5, 44×44) is a matter of the row a control sits in, not the box.

### 36. A choice row is `<Field inline>`

- Extends decisions 14 and 19. Checkbox and Radio render no label; the consumer writes `<Label for>` beside the control. `Field` takes `inline?: boolean`, which adds `rs-field--inline`: a two-column grid (`auto 1fr`, `align-items: start`, `column-gap` through `--rs-field-inline-gap`, default `space-2`). The default flex column is unchanged.
- Hints and errors sit under the Label, not the box: `rs-field__hint` and `rs-field__error` read `grid-column: var(--rs-field-text-column, auto)`, which the modifier sets to `2`. In the default column the property has no effect. No descendant selector (decision 3).
- The Label's first line centres on the 24px box with `padding-block-start: calc((24px - 1lh) / 2)` set by the inline modifier through a variable Label reads, never a magic number.
- Option groups compose: `<Fieldset>` with its legend, then `<Stack gap="small">` of `<Field inline>` rows (decision 28). No 44px row minimum by default; AA is met by the box (decision 35).

### 37. A group's hint and error belong to the fieldset

- Extends decisions 5, 14 and 20. A message about a radio group ("Choose a delivery option") is written after the legend as `<p class="rs-fieldset__error" id="…">` (or `rs-fieldset__hint`), and the fieldset points at it with `aria-describedby`, so screen readers announce it on entering the group. The consumer writes both ends.
- Fieldset gains `__hint` and `__error` with Field's tokens and hooks pattern (`color-muted`; `color-danger-text`, semibold; `margin: 0`). Borrowing `rs-field__error` inside a fieldset would use another block's element.
- Each radio in an invalid group carries `aria-invalid="true"`, which drives its danger border (decision 20). Words plus colour, never colour alone.

### 38. Form controls change state instantly

- Extends decisions 20–23. Checkbox and Radio have no transitions, like Input, Textarea, Select and the native controls: ticking is a direct action, and a fade only delays the confirmation. No motion also means no `prefers-reduced-motion` opt-out to maintain.
- State colours are reassigned custom properties (decision 34), which do not interpolate without `@property`; a fade is not worth that machinery.
- `transition-fast` stays for Button and links. Disabled follows Input: `opacity: 0.55`, `cursor: not-allowed`, and the Label beside it stays readable. At rest the choice controls have `cursor: pointer` (decision 23's affordance).

### 39. Choice stories show rows and groups as consumers build them

- Extends decision 29. `Components/Checkbox` → `States`: `<Field inline>` rows in `<Stack gap="small">` (unchecked with a hint, checked, indeterminate, disabled, disabled checked, a required terms box in error with the "Fields marked * are required." line). `Components/Radio` → `States`: three fieldsets in `<Stack gap="xlarge">` (a group with one option checked, the same group disabled, a group in error through `rs-fieldset__error` and `aria-invalid` on each radio).
- No `Focused` stories: `autofocus` steals focus on load, an a11y problem in itself; focus is checked by keyboard.
- A state only script can set (decision 33) is shown with a one-line inline script in the story wrapper, which is also its usage example. Scripts are behaviour, so the no-story-CSS rule is unaffected. If the story host does not run it, the example is left out rather than faked.

## Parked for later

- **Button review:** `rs-button--primary` is emitted with no rule; `rs-button--medium` is the default but has a rule that redefines the base; 18 `--rs-button-*` tokens live in `:root` in `variables.scss` instead of the component; `all: unset` sits before the custom properties.
- **Card review:** stories use `<p class="rs-card__title">`; titles should be headings.
- **Typography mixins:** `lists.scss` uses tag and child selectors (`ol > li > ul`). Decide deliberately whether prose is an exception to rule 3.
- **Alert:** once the role goes, "error" is conveyed by colour plus title text only. Decide on a non-colour signal.
- **Style queries:** check current browser support (Firefox) before making rule 3's style-query clause binding.
- **Svelte:** `Alert.svelte` has the same issues, and `packages/svelte/test/components.test.mjs` asserts the prop-beats-slot title behaviour. The `@labcat2020/rocketship/styles/mixins` subpath export is needed for `rs-token()` to reach Svelte.

## Alert topics still to review

- Variant colour modifiers
- `__title` / `__description` styles
- Story wrapper (nested padded Containers) and story scope

## Progress

- Branch `feat/token-system-stack`: `$rs-tokens` map, `rs-token()` and `rs-token-properties` in `styles/mixins/tokens.scss`; `variables.scss` generated from the map (`color-scheme: light dark`, `light-dark()` colours, layered shadows). Every token verified identical to `main` in light and dark. Stack component and `Base/Stack` stories (Default, Gaps) built. Storybook's colour-scheme toolbar now sets `color-scheme` on `:root`. Not yet reviewed line by line with Shane; not committed.
- Alert rebuilt with decisions 1–12 (padding 16/20px, gap 8px) and its story moved onto Stack. `container-query-up` now queries the nearest container of any kind. Astro and Svelte skills plus the bem-scss, layout, a11y and themes rules updated. `Alert.svelte` is now out of date and needs porting (step 5).
- Authoring rule: always interpolate, `#{rs-token(space-4)}`, because Sass does not evaluate functions inside custom property values.
- PR #11 (RCL-32): Field and Label rebuilt with decisions 14–19, `color-danger-text` alias added, stories split into `Components/Field` → `Default` and `Components/Label` → `Markers`. Skill and a11y/bem-scss rules updated. Verified light and dark, axe clean. Astro Input and Textarea added (decisions 20–21). The Svelte skill, `rocketship-svelte.mdc`, the Svelte template and `svelte-port-checklist.md` were rewritten to defer to the Astro skill and decisions 1–21; the old versions sent agents to pre-review templates and open Astro PRs (PR #62 copied unreviewed PR #13).
- PR #10 (RCL-31): Select rebuilt with decisions 20–23 as a single `<select>` with a painted chevron; `Components/Select` → `States`; the Field story uses it. The Svelte Select (RCL-54) still has a wrapper, SVG icon, sizes, a `placeholder` prop and `:invalid` styling.
- PR #13 (RCL-28): Fieldset rebuilt with decisions 24–32 as an unboxed `<fieldset>` group whose `legend` slot renders a floated `rs-fieldset__legend` as its first child; `Components/Fieldset` → `Default`, groups in an xlarge Stack. Stack (Astro) gains `xlarge`; the Svelte Stack still has three gaps. Astro and Svelte skills, a11y/bem-scss/svelte rules and the port checklist updated. The Svelte Fieldset (PR #62) still copies the unreviewed design.
- PR #15 (RCL-30): Checkbox and Radio rebuilt with decisions 33–39 as one `<input>` each with a clipped `::before` mark, 24px, in `<Field inline>` rows. Field gains `inline`, Label `--rs-label-offset`, Fieldset `__hint`/`__error`. `Components/Checkbox` → `States` and `Components/Radio` → `States`. Mark on fill measured 5.8:1 light, 3.2:1 dark. Svelte ports of Field inline, Label offset, Fieldset hint/error and Stack xlarge are still to do.
- Open: whether the source of truth becomes a DTCG `tokens.json` (W3C Design Tokens format) that generates `$rs-tokens`, so Figma variables can sync with it.
- Parked: Grid renders `ul`/`ol` with `list-style: none` but no `role="list"` (same Safari/VoiceOver issue Stack handles).

## Sequence

1. Finish the Alert review (decisions only).
2. Token system refactor: token map, `rs-token()`, `light-dark()`, generated `variables.scss`, layered shadows.
3. Build Stack, then rebuild Alert and its story on top of the token system with every decision above.
4. Rewrite the skill and rules in one pass, with Alert as the reference example.
5. Port the changes to Svelte.
