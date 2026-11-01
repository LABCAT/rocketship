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

- `color-danger-fg` is text _on_ `danger-bg` (near-black in light mode), so on a page surface an error styled with it reads as body text. Never pick a token by the message ("danger") when its role ("text on a danger surface") does not match.
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
- States reassign the block's variables: rest is `color-surface` with a `color-border-control` edge and a transparent mark; `:checked` and `:indeterminate` set fill and border to `color-accent` (a fill, 3:1) and the mark to `color-accent-contrast`. Mark on fill: 5.8:1 light, 6.0:1 dark since decision 104 (graphics need 3:1, WCAG 1.4.11).
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

### 40. Table is one `<table>`; scrolling belongs to whoever places it

- Extends decision 22. Table renders `<table {...attrs} class="rs-table">`: `class`, `id`, `aria-*`, modifiers and hooks all land on the semantic element. No component-rendered wrapper (the PR's `rs-table-holder` was a second block that the table's class, modifiers and hooks could not reach, because custom properties do not flow up).
- Rows, cells and the caption are consumer-written with element classes (decisions 3 and 5), as in GOV.UK Frontend's `govuk-table`.
- Overflow scrolling is not part of Table. A scrollable region must be focusable and named, and that wiring stays in the consumer's markup (decision 14), so the scroll wrapper is placed by the consumer, the way spacing is placed by Stack (decision 13).
- Never make the table itself scroll: `overflow` needs `display: block`, which strips table semantics in Safari/VoiceOver.
- A bordered, rounded table keeps its box on `rs-table` with `border-collapse: separate; border-spacing: 0`; cell backgrounds are clipped to the radius by `clip-path` on the block (decision 48).

### 41. Scroll is a layout primitive; the consumer names the region

- New `Scroll` (`rs-scroll`) in `Base/`, beside Stack and Container: `<div {...attrs} class="rs-scroll"><slot /></div>`. Built in this PR because Table's overflow example needs it, and reviewed line by line like Stack.
- By default it scrolls sideways when its content is too wide (`overflow-x: auto`), with no modifier (decision 4).
- `vertical?: boolean` (`rs-scroll--vertical`) also lets it scroll up and down. A boolean because the consumer's question is yes/no ("can this also scroll vertically?"); an `axis="both"` union named the CSS mechanics instead. "Vertical" is a deliberate physical name: it is the direction a person sees, and `block` meant nothing to a reader.
- Sideways scrolling stays `auto` when vertical is on. Once one axis scrolls, CSS computes `visible` on the other to `auto` (and `clip` to `hidden`), so the only choices are a sideways scrollbar that appears only for too-wide content, or `hidden`, which cuts that content off unreachably. Normal-width content never shows a sideways scrollbar.
- Vertical scrolling only happens when the box is constrained. That height belongs to whoever places it (decision 13): one opt-in hook, `--rs-scroll-max-block-size`, never assigned by the library, or the parent's own layout. No preset heights (decision 9).
- No visual styling (border, padding, background). The box belongs to the content; a table's border stays on `rs-table` (decision 40). The only paint is the library focus ring on `:focus-visible`, because the region is focusable.
- A11y is consumer-written, never implied (decisions 2 and 14): `<Scroll tabindex="0" role="region" aria-labelledby="…">`, labelled by the table's `<caption id>` or a heading. A scrollable region must be keyboard-reachable (Safari does not focus scroll containers on its own) and a focusable region needs a name. The skill and a11y rule make the three attributes mandatory, and stories always show them.

### 42. `striped` is a boolean that sets a variable; body rows read it

- `striped?: boolean` emits `rs-table--striped`. Independent display options that combine are booleans; mutually exclusive sets are a `variant` union (Alert). Off is the default and emits no class (decision 4).
- Decision 3 holds with no exceptions: the modifier never reaches into rows. It assigns the variant-owned local `--rs-table-stripe-bg: #{rs-token(color-surface-elevated)}`, and `.rs-table__body-row:nth-child(even)` reads `var(--rs-table-stripe-bg, transparent)`. A structural pseudo-class on the element's own class is allowed.
- Stripes belong to body rows only, so the row class is `rs-table__body-row`. A generic `__row` would stripe a second header row. (Header rows get no class; decision 46.)
- Stripe/surface contrast (about 1.06) is fine because striping is a scanning aid that carries no meaning (WCAG 1.4.11 does not apply). Body text keeps 4.5:1 on both surfaces.

### 43. Table has one density; padding hooks make it denser

- Applies decisions 9 and 21 to Table: no `compact` prop, no `--rs-table-compact-padding-*` hooks. A density step is cosmetic, and a component with one layout has one size.
- Header and body cells read `--rs-table-cell-padding-block` (default `space-2`) and `--rs-table-cell-padding-inline` (default `space-3`). Consumers set them on the table, a section, or `:root` for a dense app.
- Cell text inherits the page size (decisions 11 and 17). Dense means tighter spacing, never smaller type.

### 44. Static tables have no hover state

- Extends decision 23 beyond form controls: a hover highlight promises an action. On a static table nothing happens on click, the highlight sticks on touch after a tap, and it matched the stripe colour, so it disappeared on striped rows.
- No `hover` prop and no `--rs-table-hover-bg`. Striping is the place-keeping aid, and it works without a pointer.
- Interactive rows (selection, a row that opens a record) make a data table: focus states, `aria-selected`, keyboard handling, highlight driven by focus and selection. That is a separate JS component and a novel pattern, hand-written first under the skill's tier rule.

### 45. The table is its own box

- The surface, border and radius live on `rs-table` itself; the box is the default look (Alert, Card), not a `bordered` modifier. An open GOV.UK-style table is `--rs-table-border-width: 0` plus `--rs-table-bg: transparent`.
- `border-collapse: separate; border-spacing: 0`, because `collapse` ignores `border-radius`. Cells draw only their dividers, so the look matches `collapse`.
- Borders and dividers use `color-border`: they are decorative hairlines, and structure is carried by the markup (`th`, `scope`). WCAG 1.4.11 applies to control edges (`color-border-control`), not table rules (decision 18).
- `inline-size: 100%` and `text-align: start` (logical, correct in RTL). No `font-family`, `font-size` or `line-height`: the table inherits the page (decisions 8 and 11).
- Opt-in hooks only: `--rs-table-bg`, `--rs-table-color`, `--rs-table-border-width`, `--rs-table-border-color`, `--rs-table-border-radius`.

### 46. Table element classes exist only where Rocketship has a rule

- Vocabulary: `rs-table__caption` (rendered by Table through the `caption` slot, decision 54), `rs-table__column-header` (`<th scope="col">`), `rs-table__row-header` (`<th scope="row">`), `rs-table__cell` (`<td>`), `rs-table__body-row`, `rs-table__foot-row`.
- Header classes are named for the ARIA role their `scope` produces (`columnheader`, `rowheader`), so the class and the attribute visibly agree. Row headers get a look of their own (weight on the body surface), which `thead th` never covered.
- `<thead>`, `<tbody>`, `<tfoot>` and header rows get no class: they have no rules. Applies decision 4: an `rs-` class with no rule promises styling the library does not provide. Consumers who want to style a row add their own class; they own the markup. A class such as `__head-row` arrives together with its first real rule (e.g. a sticky header).
- `__foot-row` (totals) sets `--rs-table-cell-font-weight: semibold`, and cells read `var(--rs-table-cell-font-weight, inherit)`. Rows style their cells only by setting variables the cells inherit (decision 3).
- `__caption` is shared vocabulary with Figure (decision 5).

### 47. Rows switch dividers by variable; cells draw them

- Header cells, row headers and cells draw `border-block-end` from `var(--rs-table-row-divider-width, <table border width>)` and `border-block-start` from `var(--rs-table-row-divider-start-width, 0)`, both in the table's border colour.
- `__body-row:last-child` and `__foot-row:last-child` set `--rs-table-row-divider-width: 0` so the last line does not double the table border. `__foot-row:first-child` sets the start width, so a totals row draws its own line above it. Replaces `tbody tr:last-child td` (decision 3), and row headers in the last row now lose their line too.
- Dividers reuse `--rs-table-border-width` / `--rs-table-border-color`. No `--rs-table-head-border-width`: the header background already separates it.
- The divider widths are internal locals set by row pseudo-classes, not documented hooks; `--rs-table-row-divider-width: 0` on a table removes all row dividers.
- Accepted edge: several `<tbody>` groups lose the divider between groups.

### 48. Corners are clipped on the block, not rounded per cell

- `border-radius` rounds only the table's own box; cell backgrounds (header, stripes) paint square corners over it.
- `.rs-table` sets `clip-path: inset(0 round var(--rs-table-border-radius, #{rs-token(radius-md)}))`, reading the same hook as `border-radius`, so the clip and the radius always match.
- No per-cell corner radii: they would need row-set corner variables, four cell rules and a `calc()` inner radius, plus a case for tables without `<thead>`.
- Accepted cost: anything painted outside the table's box is clipped. The table has no shadow, and focus rings of links in cells sit inside the cell padding.

### 49. Header cells cancel browser defaults and share one weight

- `__column-header` and `__row-header` set `text-align: inherit` (browsers centre `th`), their own `color` from `--rs-table-color` (decision 11), and `font-weight: var(--rs-table-header-font-weight, semibold)`. The class, not the tag, is the look (decision 12).
- `__column-header` alone gets the header background, `var(--rs-table-head-bg, #{rs-token(color-surface-elevated)})`, and `vertical-align: bottom`, so wrapped and single-line headers share a baseline above the data. Row headers sit on the body surface and stripes.
- No `white-space: nowrap`: long labels wrap instead of forcing the table wider than its content.
- No `--rs-table-head-color`: `color-fg` keeps 4.5:1 on both surfaces. The header and stripes share `color-surface-elevated` (the same raised-surface role, decision 18); a separate token only if a theme needs them to differ.

### 50. Cells read their own colour; numeric columns are an element modifier

- `__cell` sets `color: var(--rs-table-color, #{rs-token(color-fg)})` (decision 11) and `font-weight: var(--rs-table-cell-font-weight, inherit)` (decision 46). No `text-align`: `td` inherits the table's `start`.
- `__cell` and `__row-header` use `vertical-align: top`, so short cells line up with the first line of a wrapped neighbour.
- `rs-table__cell--numeric` and `rs-table__column-header--numeric` set `text-align: end` and `font-variant-numeric: tabular-nums`, so place values line up and the header sits over its figures. Plain cells stay the default (decision 4); each selector is one class (decision 3). Same as GOV.UK's `govuk-table__cell--numeric`.
- No other alignment modifiers; consumers own their own classes for those.

### 51. The caption is the table's title

- `rs-table__caption` is styled like a `__title` (decision 12): `font-size: inherit`, `font-weight: var(--rs-table-caption-font-weight, semibold)`, `line-height-tight`, its own `color: var(--rs-table-caption-color, color-fg)` (decision 11), `text-align: start` (browsers centre captions).
- It is the table's accessible name and the usual target of `<Scroll aria-labelledby>`, so it is not muted small print.
- It sits outside the table's box on the page surface: aligned with the box edge, `padding-block-end: space-4` (16px, the same as a legend above its first control; 8px read as part of the table), no inline padding. Verified in Chromium that the block's `clip-path` does not clip it (top or bottom); Firefox and Safari to verify.
- No `caption-side` rule (top is the browser default) and no `--bottom` modifier.
- When a page heading already names the table, the consumer omits the caption and points `aria-labelledby` at the heading; no prop.

### 54. The caption is a named slot (applies decision 31)

- `<caption>` names its table only as the first child, a structural position like Fieldset's legend. Table renders `<caption class="rs-table__caption"><slot name="caption" /></caption>` before the default slot, only when the slot is filled.
- Consumers still write the words: `<Fragment slot="caption">Build usage this month</Fragment>`. To label a `<Scroll>`, they slot an element with an id, `<span slot="caption" id="usage-caption">…</span>`, and point `aria-labelledby` at it. Both ends stay in their markup; no id prop (decision 14).
- Amends decisions 46 and 51, which had the consumer write the `<caption>` element.

### 52. Table stories: the full anatomy, then stripes; overflow belongs to Scroll

- `Components/Table` → `Default` (`Table.stories.tsx`, `TableDefault.astro`): one table showing the whole vocabulary: caption, column headers (one `--numeric`), body rows with a row header, numeric cells, and a `<tfoot>` totals row. It doubles as the copy-paste reference.
- `Components/Table` → `Striped` (`Table.striped.stories.tsx`, `TableStriped.astro`): six rows, so the stripes read. One aspect per file, like `Stack` / `Stack.gaps`.
- The overflow example moves to `Base/Scroll`; Table stories import only Table, Container and Stack.
- Content is real data in the library's voice, with figures and a total (monthly build usage: Project, Owner, Builds, Minutes; caption "Build usage this month"). The PR's roster of historical people had no figures for `--numeric` and no natural total.

### 53. Scroll's vertical axis works out of the box

- Extends decision 41. `rs-scroll--vertical` sets `max-block-size: var(--rs-scroll-max-block-size, 70dvh)` and `overflow-y: auto`. Without a limit it never scrolls vertically, a silent no-op, and stories (no CSS) could not show it.
- The hook is still never assigned by the library; `70dvh` is only its fallback, so there is still one height and no presets. `dvh` follows the mobile browser bar. No token: a viewport fraction is a layout limit, not a themeable design value.
- `Base/Scroll` → `Horizontal` (an eleven-column table labelled by its caption, overflowing sideways) and `Vertical` (an `h2` with an id labelling a `<Scroll vertical>` of Cards), named for what each shows (decision 29). Scroll joins the `Base/` sort order.
- Sticky table headers inside a vertical Scroll are undecided; they would bring `__head-row` with them (decision 46).

### 55. Tokens are W3C DTCG JSON; the Sass map is generated

- The source of truth is DTCG 2025.10 files in `packages/base/src/tokens/`: `foundation.tokens.json` (shared by both modes), `light.tokens.json`, `dark.tokens.json`, and `rocketship.resolver.json`, whose `mode` modifier selects light or dark (the DTCG Resolver module). Figma exports variables the same way, one file per mode.
- Names are nested groups (`color` → `danger` → `bg`), joined with `-` for CSS (`--rs-color-danger-bg`). A name that is also a group uses the spec's `$root` key (`color.accent.$root`).
- `scripts/build-tokens.mjs` generates `$rs-tokens` into `styles/mixins/token-map.scss`. It is committed and published because consumers' Sass cannot read JSON. `build` regenerates it, `pnpm --filter @labcat2020/rocketship tokens` regenerates it by hand, and a test fails when the map and the JSON disagree.
- Only colours and shadows may differ between modes. An alias is the same in both.
- Each theme is a complete theme with its own light and dark, never a layer on top of Rocketship. Planet themes are separate packages with the same layout: `packages/theme-<planet>/src/tokens/`.
- The JSON ships in the package (`@labcat2020/rocketship/tokens/*`) for Figma and other tools.
- Verified on the switch: every component stylesheet compiles byte-identical; `:root` has the same declarations in a new order, and single-word font family names are now quoted.

### 56. Figure is a fixed `<figure>` (applies decision 1)

- No `as` prop. `figure` is the only semantically valid root.
- PR #5's `as="div"` existed only to swap `<figcaption>` for `<div role="note">`, which decision 2 forbids. Content that is not a figure does not use Figure.
- The Svelte-first Figure (PR #51) still has `as`, and must be re-ported once the Astro Figure lands.

### 57. The caption is a named slot, rendered last (applies decisions 31 and 54)

- `<figcaption>` names its figure only as the first or last child, a structural position. Figure renders `<figcaption class="rs-figure__caption"><slot name="caption" /></figcaption>` after the default slot, only when the slot is filled.
- No `caption` string prop. Consumers write the words and may use markup (`<cite>`, links).
- No position option, as in decision 51. Media sits directly in the figure: no `__media` wrapper (decision 5).

### 58. Media carries a consumer-written element class (applies decisions 3 and 5)

- Consumers write `<img class="rs-figure__media">` (or on a `<video>`, `<svg>`, or a `<picture>`'s `<img>`). One rule: `display: block; inline-size: auto; block-size: auto; max-inline-size: 100%; max-block-size: var(--rs-figure-media-max-block-size, 80svh)`.
- Media never upscales past its natural size, and a tall image never exceeds 80% of the viewport. Only max sizes are set, so the aspect ratio holds with no cropping or `object-fit`. Set the hook to `none` to lift the cap.
- No descendant selectors for media types, as PR #5 had. A Table inside a Figure needs no class; it is already full width.

### 59. Media corners are rounded by default; no bordered variant

- `rs-figure__media` sets `border-radius: var(--rs-figure-media-radius, rs-token(radius-md))`, matching Table, Card and Alert. Set the variable to `0` to square it.
- `border-radius` clips an `<img>` directly, so no `overflow: hidden` wrapper is needed.
- No `bordered` variant until something needs it; borders look wrong on transparent images and diagrams. If added, it is a boolean that sets a variable (decision 42).

### 60. The caption reads like a hint (applies decisions 8, 9, 11 and 17)

- `rs-figure__caption` inherits font size and line height, takes `color: var(--rs-figure-caption-color, rs-token(color-muted))`, `margin: 0` and `text-align: start` (some hosts centre figcaptions).
- No `font-family`, no font-size hook and no container-query size step.

### 61. Figure is a flex column with no outer margin (applies decisions 5, 9 and 13)

- `rs-figure`: `display: flex; flex-direction: column; gap: var(--rs-figure-gap, rs-token(space-3)); margin: 0`. The gap owns media-to-caption spacing; `margin: 0` cancels the browser's `1em 40px`.
- `space-3` is tighter than Table's caption spacing (`space-4`) so a caption reads as attached to its image.
- No `container-type`: Figure's layout never changes with width.
- The figure is as wide as its media: `inline-size: fit-content; max-inline-size: 100%`. The caption sets `contain: inline-size`, so it wraps to the image's width instead of stretching the figure (Chrome 105, Safari 15.4, Firefox 101). Tall images are capped by default, so consumers don't each have to fix a 1000px portrait.

### 62. Figure stories: `Default` is landscape; `Portrait` is its own aspect

- `Components/Figure` → `Default` (`Figure.stories.tsx`, `FigureDefault.astro`): Artemis II on Pad 39B at sunset, the everyday landscape case.
- `Components/Figure` → `Portrait` (`Figure.portrait.stories.tsx`, `FigurePortrait.astro`): Apollo 11 from the launch-tower camera. It shows behaviour the landscape does not, the 80svh cap and the caption wrapping to the image's width, so it is a second aspect, not a state (decision 29). Photos match the library's theme.
- Images are NASA public domain, committed as WebP in `apps/astro/src/stories/assets/` with `CREDITS.md`. Each `<img>` has real `alt`, `width` and `height`; the caption adds what alt does not, with the credit in `<cite>`.
- A `<cite>` (or any inline element) moved to its own line needs `{' '}` at the end of the line before it: Astro drops the line break instead of rendering a space.
- Story images are served by Storybook's `staticDirs` at `/story-assets/`, not imported: Astro image imports give dev-only `/@fs/` paths in the static build.
- PR #5's no-caption, rich-caption, table and prose stories are dropped: an empty slot teaches nothing, a table already has its caption, and prose is parked.

### 63. File Input shares Input's box

- Applies decisions 17, 20, 21 and 9 to File Input. `rs-file-input` is Input's box: `font: inherit`, `line-height-base`, `color-border-control` edge, `radius-sm`, `color-surface`. No `min-height`, no `font-size-sm`, no container-query step.
- The browse button sits inside the box, so the box pads `space-1` (one hook, `--rs-file-input-padding`) and the button pads `space-1` × `space-3`. 1px + 4px + 31.2px button + 4px + 1px = 41.2px, Input's height at 16px, so the two line up in a form at any page font size.
- The PR's own box (44px, 14px text, `radius-md`, a bigger button above `$rs-cq-sm`) made the file field taller, rounder and smaller-texted than the Input beside it.

### 64. Story titles are human words

- A story title is what a reader calls the component, with spaces: `Components/File Input`, `Components/Range Input`. The import name stays `FileInput`; the title is docs, not code.
- Existing camel-case titles (`Foundations/BordersAndRadius`) are aligned when next touched.

### 65. The browse button is the library's button shape

- `::file-selector-button` is a pill (`radius-pill`, hook `--rs-file-input-button-border-radius`), semibold, `color-surface-elevated` fill and `color-fg` text (about 16:1), like Button, so it reads as pressable inside a box that matches every other field.
- No edge of its own: it is part of the input, whose `color-border-control` edge meets WCAG 1.4.11 for the whole control.
- No flex centring: one line of text placed by padding.

### 66. The browse button has no hover, active or transition

- Applies decisions 23 and 38. File Input is a form control: no hover or active change on the button, no transition on the box or the button. The affordance is `cursor: pointer` and the pill shape (decision 65).
- The PR's `brightness(1.05)` was barely visible on a near-white fill, and its transitions animated only the hover and an `aria-invalid` border that never changes under the user.
- Button keeps its hover: a standalone action has no surrounding control to signal it.

### 67. A disabled File Input dims as a whole; the platform blocks it

- Applies decision 38: `&:disabled` sets `opacity: 0.55` and `cursor: not-allowed` on the block, and the opacity dims the button with it.
- `&:disabled::file-selector-button` resets only `cursor: not-allowed`, because the button's own `cursor: pointer` would otherwise win.
- No `pointer-events: none`: the native `disabled` attribute already stops the picker opening (decision 24). Blocking in CSS duplicated it and implied disabling lives in styles.

### 68. An invalid File Input swaps only its border

- Applies decision 20: `rs-file-input--invalid` (derived from `aria-invalid`) reassigns only `--rs-file-input-border-color` to `color-danger-accent`, so every control in a form shows an error the same way.
- The button keeps its look. The error already has the red edge, the semibold `rs-field__error` text (WCAG 1.4.1) and `aria-describedby`; a pink pill read like a destructive "remove file" action.
- Nothing swaps the button's colours, so they are opt-in hooks, not locals: `--rs-file-input-button-bg` (`color-surface-elevated`), `--rs-file-input-button-color` (`color-fg`). The border colour stays a local.

### 69. The filename is the value: `color-fg`

- The input's own text ("No file chosen", then the file name or "3 files") reads `var(--rs-file-input-color, #{rs-token(color-fg)})`, like Input's `--rs-input-color`.
- Once a file is picked, that text is the field's value, the thing the user checks. Input shows its value in `color-fg` and mutes only the placeholder.
- No pseudo-class separates the empty text from a chosen file, so one colour serves both and the value wins. Contrast was not the issue (`color-muted` is about 6.9:1); hierarchy and parity were.

### 70. In forced colours the browse button gets a system edge

- Extends decision 22's forced-colours rule. The pill is shaped only by its fill with `border: 0`; forced colours repaint the fill in the system button colour, often the box's own colour, leaving floating text.
- `&::file-selector-button` adds `@media (forced-colors: active) { border: 1px solid ButtonBorder; }`. `ButtonBorder` is a CSS system colour, so it follows the user's theme, and normal rendering is unchanged.
- Narrower than Select's `appearance: auto`: the button's text and padding survive forced colours, only the edge was lost. The box's border and focus ring already survive.
- Reasoned from the spec, not yet seen rendered: check on Windows with a contrast theme.

### 71. Range Input has one size: a 24px thumb on a 4px track

- Applies decisions 9 and 35. No container-query step (the PR grew the thumb from 20px to 24px and the track from 4px to 6px above `$rs-cq-sm`), so no `-cq` hooks. The step was backwards: narrow containers are usually phones, where fingers need the larger thumb.
- The thumb is 24px, Checkbox and Radio's target size (WCAG 2.2 2.5.8 on its own) and their height in the same form. The box is thumb + `space-2` = 32px.
- The track is a 4px guide; the handle is the thumb. The browser's hit area is the whole input box, so a thicker track would add weight, not usability.
- Both are the component's own geometry, read as hooks with literal fallbacks like `--rs-checkbox-size`: `--rs-range-input-thumb-size` (24px), `--rs-range-input-track-height` (4px). Never assigned by the library.

### 72. The range track is one colour; the thumb shows the value

- No progress fill before the thumb. Chromium and WebKit have no part for it, so a fill needs a script writing the value into a variable on every input; CSS-only comes first. `::-moz-range-progress` alone would make the slider look different per browser.
- The thumb's position is the value, and assistive tech reads it from the native control. When the exact number matters, the consumer writes it beside the slider (an `<output>` or the hint).
- A filled slider, if ever wanted, is a JS-tier pattern added deliberately, like interactive tables (decision 44).

### 73. An invalid range turns both of its edges danger

- Applies decisions 20 and 68: invalid swaps the control's edges, nothing else. A slider has two, the track (its rest outline) and the thumb's ring, so `rs-range-input--invalid` reassigns `--rs-range-input-track-color` and `--rs-range-input-thumb-border-color` to `color-danger-accent`. Checkbox does the same when checked and invalid.
- Swapping one alone read as two states. Both are strokes, so `danger-accent` is used for its role (decision 18); the thumb's `color-surface` fill is unchanged.
- A range always satisfies `min`/`max`, but can break a consumer rule ("at least one worker"), so it derives the modifier from `aria-invalid` like every control.

### 74. In forced colours Range Input is the native slider

- Applies decision 34's fallback. Forced colours repaint the track (a background) in `Canvas`, so it vanishes and the thumb floats. `@media (forced-colors: active) { appearance: auto; }` on the block, and again on `::-webkit-slider-thumb` because WebKit sets the thumb's appearance separately; Firefox's thumb follows the input.
- The native slider draws track, thumb and focus in the user's system colours. File Input only adds an edge (decision 70) because its button keeps text and padding; a range loses its whole track.
- Reasoned from the spec, not yet seen rendered: check on Windows with a contrast theme.

### 75. Range Input sets its height, never its width

- Applies decisions 13 and 14. No `inline-size: 100%`: Field's flex column stretches it like Input, Select and File Input, and outside a Field the placer decides its width. The PR's rule made a bare range fill any toolbar or cell.
- `block-size` stays (thumb + `space-2`): the native box is about 16px, so a 24px thumb would overflow it and the focus ring would cut through it.
- No `box-sizing`: the input has no padding or border, so it changed nothing.

### 76. No vendor-prefixed properties

- `appearance` only, never `-webkit-appearance`: every engine supports the standard property (Safari since 15.4), and in Chromium and WebKit the prefixed name is an alias, so each pair set one value twice. Checkbox, Radio and Select already use plain `appearance`.
- A prefixed _selector_ is fine where it is the only way to reach a part (`::-webkit-slider-thumb`, `::-moz-range-track`); the properties inside it are standard.

### 77. The range thumb is a ringed handle

- `color-surface` fill with a `border-width-md` (2px) `color-accent` ring (about 5.6:1 light, 6:1 dark, WCAG 1.4.11), clear over the track in rest and invalid states.
- Not a solid accent disc: an accent fill means "selected" on Checkbox and Radio, and a slider has no on state. A ring reads as a handle to drag.
- 2px, not the 1px control edge: the thumb is the moving, primary affordance, and 1px on a 24px disc read faint. Hooks `--rs-range-input-thumb-bg`, `--rs-range-input-thumb-border-width`.
- `border-radius: #{rs-token(radius-pill)}`, the way Radio draws its circle, not `50%`.

### 78. File and Range stories: every attribute does what the copy says

- Extends decision 39. `Components/File Input` → `States` and `Components/Range Input` → `States`: a default with a hint, an error, and a disabled field, each a `<Field>` with `<Label for>`. File Input's required certificate brings the "Fields marked * are required." line.
- A hint states what the control allows but cannot show: "PDF only. You can attach several files." for `accept` plus `multiple`. The PR's "Attach one file per release" contradicted `multiple`.
- No `<datalist>` on the range: browsers draw its tick marks only on the native slider, so with `appearance: none` it rendered nothing. `step` does the snapping. Visible ticks would be a reviewed component feature, not story markup.
- An error example shows a rule the control cannot express. "Build workers" uses `min={1}` rather than allowing 0 and then reporting it; the error is a rollout below the 50% already released, which `min` and `max` cannot encode, with a message that says which way to move.

### 79. Fields in a form are a large Stack apart

- Extends decision 30. Fields stacked in the default Stack sat 16px apart against Field's 8px inside gap, the bare 2× minimum. With hints and errors they read as one run of text.
- Consecutive Fields go in `<Stack gap="large">` (`space-6`, 24px, 3× the inside gap). Applied to every form story: Input, Textarea, Select, File Input, Range Input, Field, Label.
- Option rows stay `<Stack gap="small">` (decision 28), and consecutive fieldsets stay `xlarge` (decision 30).
- Open: Fieldset's own gap is still `space-4` (decision 28), so Fields inside a fieldset are now closer than standalone Fields. Decide whether Fieldset moves to `space-6`.

### 80. A set of checkboxes is a Fieldset, not a component

- No "Checkbox Set" component. A set of related checkboxes is the same composition as a radio group (decisions 28, 36): `<Fieldset>` whose legend asks the question, holding a `<Stack gap="small">` of `<Field inline>` rows. The legend names the group for assistive tech; a new component would only repeat Fieldset.
- A standalone checkbox (terms, "Email me a monthly summary") is its own `<Field inline>` in the form's `<Stack gap="large">` (decision 79), spaced like any field.
- Two stories, so the sidebar names what each canvas shows (decision 29: the story is named for what it shows). `Components/Checkbox` → `States` (`Checkbox.stories.tsx`): each state as its own `<Field inline>` in a `<Stack gap="large">`, like Input → States: unchecked with a hint, checked, disabled, disabled checked, and a required terms box in error with the "Fields marked * are required." line. `Components/Checkbox` → `Set` (`Checkbox.set.stories.tsx`, `CheckboxSet.astro`): a "Notify me about" Fieldset with an indeterminate "All topics" (indeterminate only means something over a group), checked, unchecked, and two disabled rows with hints.
- No headings or explanation copy in a canvas. Bare `<h2>`/`<p>` brought browser margins and three competing titles, and an Input in a Checkbox story was noise. A states comparison is not a form, so a list of rows there is fine; the PR #15 story read as a set because it mixed that comparison with grouping.
- **Amended 2026-10-26 (RCL-12, RCL-21):** Storybook is the library's docs site, so a component story is a docs page, written like the Foundations stories. Each page, in one `<Container size="content" padded>` and a `<Stack gap="large">`: a `Typography` article with an `<h1>` and a short usage description; the live example; a "Usage" `<h2>` with the example's source in `<pre><code>`; and the API as library `<Table>`s (props and attributes, slots, CSS hooks), each named by its caption. The example is its own file (`<Name><Aspect>Example.astro`), rendered by the page and shown with `?raw`, so the code cannot drift from what renders. The code block scrolls sideways on narrow screens, so it is a named focusable region like Scroll (decision 41): `<h2 id="usage-heading">` and `<pre tabindex="0" role="region" aria-labelledby="usage-heading">`. The bare-heading problem above came from unstyled `<h2>`/`<p>`; prose now lives in `Typography`. Disclosure is the first; other components move over in RCL-21.

### 81. The Astro library ships no JavaScript; Popover is the native `popover` attribute

- No Astro component ships a script. Behaviour comes from the platform (`popover`, `<details>`, `<dialog>`, invoker attributes), never from a component's `<script>`.
- One exception: Tooltip may ship a small script, because the platform cannot dismiss a hover or focus tooltip with Escape (WCAG 1.4.13).
- Popover renders `<div popover="auto" {...attrs} class="rs-popover"><slot /></div>`. The platform gives the top layer, light dismiss, Escape, one `auto` popover open at a time, the trigger's expanded state, and Tab order from the trigger into the panel. No focus trap: a popover is non-modal (modal is Dialog, RCL-13).
- The consumer writes the trigger: `<Button popovertarget="id">` (Button already spreads native attributes). `popovertarget` over `commandfor`/`command` because it is supported everywhere; revisit if Dialog standardises on invoker commands.
- `popover="auto"` sits before `{...attrs}`, so `popover="manual"` or `"hint"` overrides it with no prop (decision 24).

### 82. Popover is a fixed `div` with no role (applies decisions 1 and 2)

- One valid root, so no `as`. A popover is not a dialog: no role by default. A consumer whose panel is a named group adds `role` and `aria-labelledby` through attrs.

### 83. A closed popover stays hidden: flex only on `:popover-open`

- `display: flex` on `.rs-popover` would beat the browser's `[popover]:not(:popover-open) { display: none }` and show a closed popover. The flex column and its `gap` sit on `.rs-popover:popover-open`, a pseudo-class on the block (decision 3).

### 84. Popover anchors to its trigger where anchor positioning exists

- `popovertarget` makes the trigger the popover's implicit anchor. Inside `@supports (position-area: block-end)`: `position-anchor: auto`, `position-area: block-end span-inline-end`, `position-try-fallbacks: flip-block, flip-inline`, `margin: 0`, and `margin-block-start` through `--rs-popover-offset` (`space-2`). Without support the browser default stays: centred in the viewport.
- `position-anchor: auto` is explicit because Firefox computes `normal` (mdn/content#45514). Verified in Chromium only; Firefox and Safari to check.

### 85. Popover surface: an elevated card with a shadow

- `color-surface-elevated`, `color-border` hairline, `radius-md`, `shadow-md`, padding `space-4`, gap `space-2`, `color: color-fg`. All opt-in hooks (`--rs-popover-bg`, `-border-color`, `-border-width`, `-border-radius`, `-shadow`, `-padding`, `-gap`) except `--rs-popover-color`, which elements read.
- `max-inline-size: var(--rs-popover-max-inline-size, 320px)`. No size token states a panel width, so this is a literal in a hook, as Figure's `80svh` is. Decide whether a token is needed.
- No transition (decision 38's reasoning). A fade needs `@starting-style` and `transition-behavior: allow-discrete`, its own decision.

### 86. Popover content is consumer-written `__title` and `__description` (applies decision 5)

- Same vocabulary and rules as Alert. No close button and no words (decision 16): light dismiss and Escape close it; a consumer may add `<Button popovertarget="id" popovertargetaction="hide">` with their own words.
- A toggletip (a click-to-open "more info" button) is a Popover, not a Tooltip mode: `<Button popovertarget="x">` plus `<Popover id="x">`. Tooltip stays hover and focus only.

### 87. Popover story: a closed trigger; axe runs with it open

- `Components/Popover` → `Default` (`Popover.stories.tsx`, `PopoverDefault.astro`): a secondary Button "Build 482" opening a "Build 482 passed" panel. The story loads closed, as a consumer's page would.
- No Stack: one example, and Stack's stretch made the trigger (and so the anchor) full width. Button and Popover sit in the Container, as the Button stories do.
- No script opens it: the story shows real use, and the library ships no JavaScript (decision 81). Axe checks the open panel after the trigger is clicked; it was run that way in light and dark.

### 88. Tooltip is a plain wrapper, like Field; CSS shows it

- Tooltip renders `<span {...attrs} class="rs-tooltip"><slot /></span>` around a consumer-written trigger and content: the same pattern as Field (decision 14). The open state must come from a common ancestor, because sibling and `:has()` selectors are out (decision 3).
- `.rs-tooltip:hover` and `.rs-tooltip:focus-within` set `--rs-tooltip-open: true`. The content shows through `@container style(--rs-tooltip-open: true)`, the parent-state pattern from decision 3, with no `container-type`. The block resets it to `false`, so the content never inherits it from an outer tooltip.
- It shows on hover, on focus (a click focuses the button too) and on a tap. It hides when the pointer and focus have both left. It stays open while the pointer is over it (decision 92).
- A `span` with `display: inline-block`, a narrow exception to decision 19: its box must hug the trigger to be the anchor (decision 91). An inline box is only one text line tall, so a tooltip anchored to it overlapped a 44px button by 3px. Side effect: a link with a tooltip cannot wrap across lines. No `as` (decision 1), no variants (decision 4), no `title` prop (decision 5), and no props beyond `class` and native attributes.
- Native HTML has no cross-browser hover tooltip yet. The `title` attribute cannot be reached by keyboard or touch, and `interestfor` with `popover="hint"` only works in Chrome and Edge (142+). A click-to-open toggletip is a button plus a native `popover`, so it belongs to Popover (RCL-14), not Tooltip. Most libraries keep the two apart, as Carbon (`Tooltip` and `Toggletip`) and Spectrum (`Tooltip` and `ContextualHelp`) do.

### 89. A small script adds Escape; CSS does everything else

- WCAG 1.4.13 needs hover and focus content to be dismissible without moving the pointer or focus. CSS cannot react to a key, so a short guarded `<script is:inline>` adds only that.
- On Escape it adds `rs-tooltip--dismissed` to each open block and prevents the key's default, so a surrounding `<dialog>` stays open. `.rs-tooltip--dismissed:hover` and `.rs-tooltip--dismissed:focus-within` set `--rs-tooltip-open: false`. Each is one class plus a pseudo-class (decision 3), and they come after the open state at the same specificity, so they win.
- It removes the class once the pointer and focus have both left the block (`pointerout` and `focusout`, checking `relatedTarget`), so the next hover or focus opens it again.
- It is inline because the Storybook host does not serve bundled Astro component scripts (the request 404s); it does run inline ones, as Checkbox → Set's does. The script repeats with each Tooltip, but a `Symbol.for('rs-tooltip')` guard on `window` attaches the listeners once per page. It listens on `document`, so tooltips added later work too.
- Without the script, the tooltip still opens and closes on hover and focus; only Escape is lost.
- This is the one exception to decision 81 (RCL-14 Popover): no Astro component ships a script. Shane approved it on 2026-10-26 ("tooltips will be allowed a small amount of js"), because no platform feature dismisses a hover or focus tooltip with Escape.

### 90. The consumer writes the content element and the wiring

- Decisions 5 and 58: the consumer writes both elements inside `<Tooltip>`:
  ```astro
  <Tooltip>
    <Button aria-describedby="tooltip-deploy">Deploy</Button>
    <span class="rs-tooltip__content" role="tooltip" id="tooltip-deploy">…</span>
  </Tooltip>
  ```
- `aria-describedby` when the tooltip adds information, `aria-labelledby` when it is the trigger's only name. The consumer writes both ends (decision 14). Screen readers read it while it is hidden.
- `role="tooltip"` is written by the consumer, so roles stay opt-in (decision 2).
- The content is phrasing text only: no links or buttons, because it disappears when focus moves into it.
- No trigger class. The consumer writes only what Field already asks for: the content's class, `role` and `id`, plus the trigger's `aria-describedby`. An earlier `rs-tooltip__trigger` class was dropped because a forgotten class misplaced the tooltip silently.

### 91. Placement is CSS anchor positioning: above, flipping below

- The block sets `anchor-name: --rs-tooltip` and `anchor-scope: --rs-tooltip`, so each content anchors to its own wrapper, although every wrapper uses the same name.
- `__content` is `position: fixed` with `position-area: block-start` and `position-try-fallbacks: flip-block`. Fixed positioning escapes a scrolling ancestor's overflow, such as `Scroll`. An ancestor's `clip-path`, such as Table's (decision 48), still clips it.
- CSS anchor positioning is Baseline since Firefox 147 (January 2026). `anchor-scope` is in Chrome, Safari 26 and Firefox 147, so there is no fallback.
- The gap is the `--rs-tooltip-offset` hook (`space-2`), a block-end margin that `flip-block` mirrors.
- No `z-index`: it is not in the top layer, so a positioned element later in the page can paint over it. Left out until a real page hits this; the fix is then a `z-index` token, not a hand-written number.

### 92. A transparent bridge keeps it open across the gap

- `__content::before` is an empty, absolutely positioned box that extends offset plus border width beyond both block edges, so moving the pointer from the trigger onto the tooltip never leaves the block's `:hover`.
- It covers the border too, because `::before` is placed from the padding box. Without the border width there was a 1px dead strip, and the tooltip closed when the pointer crossed it.
- The bridge only overlaps empty space, never the trigger, so it cannot steal its clicks.

### 93. The tooltip looks like a small raised surface

- `color-surface` background, `color-fg` text, `color-border` edge, `radius-sm`, `shadow-md`, `space-1` / `space-2` padding. Every token is used in its named role (decision 18). No inverted dark bubble, because no token names that role.
- Colours are block locals (`--rs-tooltip-bg`, `--rs-tooltip-color`, `--rs-tooltip-border-color`), read by the content. Offset, max width, border width, radius and padding are opt-in hooks.
- `inline-size: max-content` up to `max-inline-size: 280px` (hook `--rs-tooltip-max-inline-size`, no token), so short text stays on one line and long text wraps.
- Font size and line height come from the page (decisions 8 and 11). No arrow. In forced colours the border keeps the edge where the shadow drops out.
- It differs from Popover (decision 85) on purpose: a smaller radius, tighter padding and narrower width read as a quick label, not a panel; and `color-surface` stands out more than Popover's `color-surface-elevated` on the light page, which suits short-lived text. Do not align them.

### 94. Tooltip story: two buttons, each with a tooltip

- `Components/Tooltip` → `Default` (`Tooltip.stories.tsx`, `TooltipDefault.astro`): a primary "Deploy" and a secondary "Roll back" button, each in its own `<Tooltip>` and described by its content, placed straight in the Container like Button → Variants. A Stack would stretch the buttons to full width. No instruction copy in the canvas (decision 80).
- The buttons sit at the top of the canvas, so the tooltips flip below, which shows `flip-block` working.

### 95. Dialog is a native modal `<dialog>`; the platform does the behaviour

- Applies decisions 1 and 22. `Dialog` renders `<dialog {...attrs} class="rs-dialog"><slot /></dialog>`. No `as`.
- Modal only. `showModal()` gives the top layer, an inert page behind, focus moved inside, Escape to close and focus returned to the trigger. No hand-written focus trap or key handling. A non-modal panel is a different component (Popover).
- Props: `role?: 'alertdialog'` (decision 2: the consumer opts in for a confirmation that interrupts) and `class?`. `open` and `closedby` are native and flow through `...attrs` (decision 24).
- The name and description are consumer-written: `aria-labelledby` points at `rs-dialog__title`, `aria-describedby` at `rs-dialog__description` (decisions 5 and 14). No id props.

### 96. Opening and closing need no script

- The trigger is an invoker command: `<Button command="show-modal" commandfor="delete-project">`. Closing is `<form method="dialog">`: its submit buttons close the dialog and set `returnValue` (`"cancel"`, `"delete"`). Escape closes it too.
- Verified in Chromium: open, `:modal`, Escape, focus returning to the trigger, `returnValue`. Firefox and Safari support for `command`/`commandfor` comes from memory (Firefox 144, Safari 26.2) and still needs checking.

### 97. Layout applies only while modal: `.rs-dialog:modal`

- `display: flex` on the block would beat the browser's `display: none` for a closed dialog and show it. The flex column sits under `&:modal`, a pseudo-class on the block's own class (decision 3). No `[open]` attribute selector.
- `:modal` is supported everywhere we test (Chrome 105, Firefox 103, Safari 15.6). It also means an `open`-attribute, non-modal dialog gets no layout, which matches decision 95.

### 98. New token `color-backdrop`

- `Foundations/Colors` shows it under Surfaces, after Control border.

- No token states a scrim role. `color-fg` turns light in dark mode and `color-bg` is light in light mode, so neither works for both.
- `color-backdrop`: light `#131a2f` at 0.5 (the `fg` navy), dark `#060b18` at 0.7 (the `bg` near-black). Added to `light.tokens.json` / `dark.tokens.json`, and the map is regenerated.
- `.rs-dialog::backdrop` reads `var(--rs-dialog-backdrop, color-backdrop)`. A pseudo-element on the block (decision 3).
- In dark mode the scrim barely changes an already dark page. The panel is separated by `shadow-lg`'s dark-mode glow and the surface colour.

### 99. The panel is a raised surface with one width

- `color-surface`, `color-border` hairline (decorative, decision 45), `radius-md`, `shadow-lg`, padding `space-6`, gap `space-4`, `color-fg`. Hooks: `--rs-dialog-bg`, `-border-width`, `-border-color`, `-border-radius`, `-padding`, `-gap`.
- `inline-size: min(100%, var(--rs-dialog-inline-size, 560px))`. A literal, because it is the component's own geometry and no token states the role (decision 35). The browser's modal `max-width`/`max-height` keep a gutter on phones, and its `overflow: auto` scrolls a tall dialog.
- `overscroll-behavior: contain`, so scrolling the dialog never scrolls the page. No page scroll lock: it would need `:has()` on `html` (decision 3).

### 100. The dialog title is a size step, like a legend

- Extends decision 27. `rs-dialog__title`: `font-size-lg` through `--rs-dialog-title-font-size`, semibold through `--rs-dialog-title-font-weight`, `line-height-tight`, its own `color`, `margin: 0`. It heads a whole surface, so weight alone is not enough.
- `rs-dialog__description` is Alert's: `color` and `margin: 0`, page size.

### 101. Actions are an element class, usually on the closing form

- `rs-dialog__actions`: a flex row, wrapping, end-aligned, gap `space-3` (`--rs-dialog-actions-gap`), `margin: 0`. The consumer puts it on `<form method="dialog">`, so no extra wrapper is needed.
- Cancel comes first. The browser focuses the first focusable element, so a destructive confirmation opens on the safe choice. No `autofocus`.
- No named `actions` slot (decision 31: no structural position). A component-rendered wrapper would choose `div` or `form` for the consumer, and would split a form dialog's buttons from the fields they submit. The default slot takes any markup; the class is optional.

### 102. Dialog fades; reduced motion turns it off

- Unlike form controls (decision 38), the dialog and its backdrop fade in and out on opacity only, over `transition-fast` (140ms, `ease`), through a local, `--rs-dialog-duration`, that reads the opt-in hook `--rs-dialog-transition-duration` with `transition-fast` as its fallback. **Amended 2026-10-26 (RCL-12):** first written with no dialog hook; every animated component now gets a `--rs-<name>-transition-duration` hook (decision 114), so one dialog can change speed without changing Button and links. The block and `::backdrop` both read the local (`::backdrop` inherits from its dialog). No slide or scale: opacity is not movement, and it is the safest kind of animation for vestibular-sensitive users.
- `@media (prefers-reduced-motion: reduce) { transition: none; }` on the block and on `::backdrop`, so those users get an instant open and close (WCAG 2.3.3).
- Fading in uses `@starting-style` inside `&:modal`, and `&:modal::backdrop` for the backdrop (one class plus pseudo-classes and a pseudo-element, decision 3).
- Fading out needs `overlay` and `display` transitions with `allow-discrete`, which keep the closing dialog in the top layer. Only browsers that pass `@supports (overlay: auto)` get them (Chromium today). Elsewhere a fading dialog would drop into the page flow, so it closes instantly instead.
- Verified in Chromium: the fade runs in and out, it is instant with reduced motion, and axe is clean in light and dark once open. Firefox and Safari not yet checked.

### 103. Dialog story: one alert dialog, opened by its trigger

- `Components/Dialog` → `Default` (`Dialog.stories.tsx`, `DialogDefault.astro`): a "Delete project" Button opens an alert dialog, "Delete Apollo?", with a description and Cancel / Delete project actions. Real copy, no script, no story CSS.
- The canvas shows the closed state. It never opens on load, because that steals focus (decision 39). Axe was run with the dialog opened by clicking the trigger in the check harness.
- Checked light and dark: the closed and open states are axe clean (after decision 104).

### 104. Text on accent is dark navy in dark mode

- Dark `color-accent-contrast` changes from `#f8fbff` to `#060b18` (the dark `bg` navy). Light stays `#ffffff`.
- The primary Button's dark text was 3.18:1 on `#4f89ff`, below the 4.5:1 text minimum. It is now 5.95:1. Found by the Dialog story's axe check; `Base/Button` → `Variants` failed the same way on main.
- One token fixes every fill: the Checkbox and Radio marks on `color-accent` go from 3.2:1 to 6.0:1 (decision 34).
- `color-accent` is unchanged, so accent strokes and fills keep their contrast against dark surfaces. Darkening the accent to keep white text (`#3366e0`, 4.91:1) would have dimmed every accent stroke and left it 3.43:1 on `color-surface`.
- Re-checked light and dark, axe clean: `Base/Button` → `Variants`, `Sizes`; `Components/Checkbox` → `States`, `Set`; `Components/Radio` → `States`; `Components/Dialog` → `Default`, both closed and open.
- The pre-review Button still falls back to `#ffffff` when tokens are not loaded (`var(--rs-color-accent-contrast, #ffffff)`). Moving it to `rs-token()` belongs to the Button review.

### 105. Dialog and Popover differ on purpose: trigger and motion

- Settles decision 81's "revisit if Dialog standardises on invoker commands". Each component uses the best declarative trigger its element has. Dialog: `command="show-modal"` / `commandfor` (decision 96), the only script-free way to open a modal dialog. Popover: `popovertarget`, supported everywhere; `commandfor` would lose that for no gain.
- Dialog fades (decision 102); Popover stays instant (decision 85). Popover was reviewed and looks right as it is.

### 106. An optional close X is the `rs-dialog__close` element class

- People look for an X in the corner, and on a touch screen there is no Escape key. The consumer writes the button and names it; the library paints the X (decisions 5, 16 and 22):
  ```astro
  <button
    class="rs-dialog__close"
    type="button"
    command="close"
    commandfor="delete-project"
    aria-label="Close"></button>
  ```
- A native `<button>`, not `<Button>`: Button's own pill, padding and colours would fight the element class (two blocks on one element, decision 3). The class makes it a library part, as `rs-dialog__actions` does for the native form.
- 32px square (target size, decision 35), `position: absolute` at `space-4` from the top and end. A modal dialog is `position: fixed`, so it is the containing block. `radius-sm`, focus ring on `:focus-visible`.
- The X is the button's `::before`: a 16px box clipped to an X polygon (2px strokes) and filled with `currentColor`, like Checkbox's tick (decision 34). `color-muted` at rest (about 6.9:1, graphics need 3:1), `--rs-dialog-color` on hover. Hook `--rs-dialog-close-color`.
- `rs-dialog__title` always pads its end by the X's width plus `space-2`, so a long title wraps before the button. A dialog without an X loses 32px of title width; accepted, because the title cannot know whether an X exists without `:has()` (decision 3).
- Forced colours: the `::before` gets `background: ButtonText` with `forced-color-adjust: none`, because forced colours would repaint its background in the canvas colour and hide the X. Reasoned from the spec, not yet seen on Windows.
- In the story it comes after the actions in the source. The browser focuses the first focusable element, so the dialog still opens on Cancel (decision 101), and Tab runs Cancel, Delete project, Close.
- Checked in Chromium, light and dark: axe clean with the dialog open; the X closes the dialog and returns focus to the trigger.

### 107. Disclosure is a fixed `<details>`; the platform owns the state (applies decisions 1 and 24)

**Agreed 2026-10-26.**

- Browser support, checked 2026-10-26: `:open` Chrome 133, Firefox 136, Safari 26.5; `::details-content` Chrome 131, Firefox 143, Safari 18.4; exclusive `<details name>` Chrome 120, Firefox 130, Safari 17.2.
- No `as` prop: `details` is the only element that discloses without script. The Svelte `as?: 'details'` was a union of one.
- No `open` prop. `open` and `name` are native attributes and flow through `...attrs`, typed by `HTMLAttributes<'details'>`. The browser toggles the state, so there is no JavaScript and no `bind:open` to mirror.

### 108. The summary is a named slot, rendered first (applies decision 31)

**Agreed 2026-10-26.**

- `<summary>` only works as the first child, a structural position. Disclosure renders `<summary class="rs-disclosure__summary"><slot name="summary" /></summary>` before the default slot, only when the slot is filled. No `summary` string prop.
- The slot is required in practice: without it the browser renders its own "Details" label, in its language, not the consumer's.
- No heading inside the summary: it has the button role, whose children are presentational, so a heading level is lost to assistive tech in some browsers. A heading above the group names the set ("Frequently asked questions"); each summary is a named button, so screen readers still list and tab through the items.

### 109. An accordion is composition, not a component (applies decision 80)

**Agreed 2026-10-26.** A joined look (one box with dividers) waits until a real design needs it.

- A set of disclosures is `<Stack gap="small">` of Disclosures. No Accordion component, no `mode` prop and no registry script.
- One-open-at-a-time is native: give each Disclosure the same `name`. The browser closes the others.

### 110. The open state is `:open`, and it only reassigns variables (applies decision 3)

**Agreed 2026-10-26.** No `[open]` fallback: Safari before 26.5 still toggles, with the chevron down and no bottom padding. The panel collapses to `0px` only inside `@supports selector(:open)`, so where `:open` is missing the panel keeps `auto` and its content shows (found at wrap-up: an unconditional `0px` hid it). The locals are internal, set by state, not documented hooks (like decision 47).

- `.rs-disclosure:open` is one class plus a pseudo-class. No `[open]` attribute selector and no descendant `&[open] .rs-disclosure__indicator`, as the Svelte version had.
- It sets block locals that its parts read: `--rs-disclosure-icon-turn` (the chevron), `--rs-disclosure-panel-block-size` and `--rs-disclosure-panel-padding-block-end` (the panel).

### 111. The chevron is a painted border on the summary's `::after` (applies decision 22)

**Agreed 2026-10-26.**

- No `__indicator` span. Two borders of `border-width-md` in `--rs-disclosure-icon-color` (`color-muted`, like Select's chevron, about 6.9:1), an 8px literal box rotated 45° and turned 180° when open. Borders are repainted as text in forced colours, so it needs no fallback, unlike gradients (Select) or `clip-path` (Checkbox).
- A last `translate(-25%, -25%)` moves it back along its diagonal, so the drawn corner, not the rotated box, sits on the line centre in both states. The summary reserves `space-5` at the end so text never runs under it.
- At the inline end, centred on the summary's first line (`padding + 0.5lh`), so it stays put when the summary wraps.
- The summary is `display: block`, which drops the native marker in Chromium and Firefox; `::-webkit-details-marker` hides WebKit's (a prefixed selector reaching a native part, decision 76). The summary stays one text box: no flex row (decision 19).

### 112. The panel is the browser's `::details-content`; no wrapper (applies decision 5)

**Agreed 2026-10-26.** Before Chrome 131, Firefox 143 and Safari 18.4 the panel still toggles but loses its side padding and gap.

- Content goes in the default slot. `.rs-disclosure::details-content` is a flex column whose gap (`--rs-disclosure-gap`, `space-2`) spaces the consumer's elements; it pads the sides and, only when open, the bottom. A closed slot keeps its box, so unconditional padding would leave a gap under a closed summary.
- Body copy is `<p class="rs-disclosure__description">`: `color` and `margin: 0`, the shared vocabulary of Alert and Card.

### 113. The box: a hairline border, no surface, a semibold summary

**Agreed 2026-10-26.** The summary is 51px tall at 16px text (`space-4` block padding, matching Alert's).

- `rs-disclosure`: `border-width-sm` `color-border` edge and `radius-md`, like Table and Alert. No background, so it sits on whatever surface places it. Hooks `--rs-disclosure-border-width`, `--rs-disclosure-border-color`, `--rs-disclosure-border-radius`.
- `__summary` is styled as a title (decision 12): inherited size, `font-weight-semibold` through `--rs-disclosure-summary-font-weight`, `line-height-tight`, its own `color-fg`. One padding pair for summary and panel, `--rs-disclosure-padding-block` / `--rs-disclosure-padding-inline` (`space-4`).
- No container-query size step and no `font-family` (decisions 8 and 9).

### 114. Open and close transition smoothly, in CSS only; no hover (applies decision 23)

**Agreed 2026-10-26.**

- Shane: a smooth open and close, CSS only. Decision 38's instant change stays for form controls; a disclosure reveals content, so motion shows where it came from.
- The block sets `interpolate-size: allow-keywords`, and `:open` reassigns `--rs-disclosure-panel-block-size` from `0px` to `auto`. `::details-content` transitions `block-size` and `padding-block-end`, plus `content-visibility` with `allow-discrete` so the panel stays visible until it has closed. `overflow: clip` hides the content while it grows. The chevron transitions `transform`.
- One local, `--rs-disclosure-duration`, reads the hook `--rs-disclosure-transition-duration` (fallback `transition-medium`). `prefers-reduced-motion: reduce` sets the local to `0s`, so everything is instant.
- The motion rule for every animated component: a `--rs-<name>-duration` local reading the opt-in hook `--rs-<name>-transition-duration`, with a `transition-*` token as fallback. Dialog was aligned in this PR (decision 102, amended).
- New token `transition-medium: 210ms` (foundation, both modes). `transition-fast` (140ms) stays for colour changes on Button and links; a height change reads smoother slower. Shane's value.
- `interpolate-size` is Chromium only (129); Firefox and Safari open and close instantly while the chevron still turns. No Firefox implementation bug or Mozilla position found (2026-10-26); the code needs no change when it ships. Shane tested Chrome and Firefox: Chrome is clearly better; keep `interpolate-size` as the only mechanism, no `max-height` or grid hack.
- No hover: the affordance is `cursor: pointer` and the chevron.

### 115. Focus is the library ring on the summary

**Agreed 2026-10-26.**

- `&__summary:focus-visible` uses the standard `2px` `color-focus-ring` outline at `2px` offset. The summary is the only focusable part.

### 116. Disclosure stories: `Default`, then `Accordion` as its own aspect (applies decision 29)

**Agreed 2026-10-26.** The usage code stays on every docs page: the canvas shows rendered HTML, so only the source shows the slot syntax, element classes and imports.

- Both are docs pages (decision 80, amended), sorted `Default` then `Accordion` in `preview.ts`.
- `Components/Disclosure` → `Default` (`Disclosure.stories.tsx`, `DisclosureDefault.astro`, example `DisclosureDefaultExample.astro`): what a disclosure is, two that open on their own (one closed with two paragraphs, one `open`), the usage code, and three tables: props and attributes (`class`, `open`, `name`), slots (`summary`, default), CSS hooks with their token defaults.
- `Components/Disclosure` → `Accordion` (`Disclosure.accordion.stories.tsx`, `DisclosureAccordion.astro`, example `DisclosureAccordionExample.astro`): one open at a time through a shared `name`, three plan questions in `<Stack gap="small">`, and the usage code. No second API table: the API is the same.
- Axe clean in light and dark with every panel opened (headless Chromium, a11y addon's axe).

### 117. Disclosure, Popover and Dialog are the reference for native open state

**Agreed 2026-10-26.**

- Skill table row "Native open state (`<details>`, popover)" → `Disclosure.astro`, `Popover.astro`, with a `patterns.md` section of that name: the platform owns the state; style it with its pseudo-class (`:open`, `:popover-open`), never `[open]`; the state only reassigns locals; fixed-position parts are slots rendered first; content goes in the browser's own slot; border-drawn decoration; `transition-medium` with reduced motion; one open at a time is a shared `name`.
- The skill's stop rule drops `[open]` and `popover`: native open state follows the row. Open state the platform does not own, `:has()`, `::backdrop`, focus trapping and script still go to Shane first.
- `rocketship-stories.mdc` gains "Docs pages (Astro)" and the template's story wrapper becomes the docs page plus its example file (decision 80, amended), so components built next start as docs pages. Popover and Tooltip move over in RCL-21.
- Dialog (RCL-13) landed first and joins the row: `Dialog.astro` (modal `<dialog>`, `:modal`, `::backdrop`, invoker commands). The stop rule no longer lists `::backdrop`; Dialog is its reference.

### 118. Grid lists keep their semantics; the gap reads a token (applies decisions 6 and 13)

**Agreed 2026-10-26 (RCL-08).**

- When `as` is `ul` or `ol`, Grid adds `role="list"`, as Stack does: `list-style: none` drops list semantics in Safari/VoiceOver. A `role` in `...attrs` still overrides it. Resolves the parked Grid note in Progress.
- The gap fallback is `var(--rs-grid-gap, #{rs-token(space-4)})`, replacing the hand-written `var(--rs-space-4, 16px)` chain. Same value.

### 119. Grid stories: `Default` is the docs page; the column stories stay

**Agreed 2026-10-27 (RCL-08, RCL-21).**

- The three column stories are a good set and stay separate aspects (decision 29). Two columns is the default, so a separate docs page would repeat `TwoColumns`; instead `TwoColumns` becomes `Default`, the docs page (`Grid.stories.tsx`, `GridDefault.astro`, example `GridDefaultExample.astro`), as with Disclosure → `Default` and `Accordion`. `ThreeColumns` and `FourColumns` are unchanged. Sort order: `Default`, `ThreeColumns`, `FourColumns`.
- The page follows decision 80 (amended): description, a two-column Grid of four Cards with real `<h2>` titles, the usage code, and tables for props and attributes (`columns`, `as`, `class`) and CSS hooks (`--rs-grid-gap`). The slots table was dropped in decision 125.
- Shane: teach people to use the CSS variables and to use Grid for their own layouts. After the tables, a `Customising` section with code snippets: changing the gap with `--rs-grid-gap` on their own class (with a spacing token), making any box a container with `container-type: inline-size` so the grid fits a sidebar, giving one item the whole row with `grid-column: 1 / -1` (safe at every step, unlike `span 2`, which adds a column in the one-column layout), and rendering a list. It states why the column steps are fixed: container queries cannot read CSS variables.
- Snippets are code only: stories have no CSS, so the techniques are not rendered live. Whether every docs page gets a Customising section is part of the RCL-21 proposal (`_planning/rcl-08-audit.md`).
- **Amended 2026-10-27:** Shane: the page was overcooked ("we like our steak medium rare"), the same as Container's first draft (decision 125). Cut to what a user asks: a two-sentence description, and two how-tos as plain `<h2>` sections with no "Customising" wrapper: "Use it in a sidebar" (make the box a container; no container means one column) and "Span the whole row" (`1 / -1`, not `span 2`). "Change the gap" and "Render a list" went, because the hooks table and the `as` row already say them, and so did the paragraph on why the column steps are fixed.
- **Amended again 2026-10-27:** Shane saw no value in those two how-tos either ("as a user what would I want to know?"). Spanning a row is generic CSS grid. The one real gotcha, that a grid with no container around it stays one column, moves into the description: "It measures its container, not the screen, so place it inside a Container". The page is now description, example, usage, props and hooks, the same shape as Container.
- The Svelte `Base/Grid` → `TwoColumns` story keeps its old name until it is ported (a Daruma task).
- No 6-column grid. Proposed as `columns={6}` (1, then 2, 3 and 6 at 500/700/900px); Shane declined it on 2026-10-27. `columns` stays `2 | 3 | 4`.

### 120. Container reads its tokens and uses logical sizes (applies decisions 6 and 9)

**Agreed 2026-10-27 (RCL-08).** No visual change.

- The five values that have tokens read them through `rs-token()`: `container-gutter` (both gutters), `container-width-content-sm`, `container-width-content-lg`, `container-width-wide` and `container-padding-block`. The hand-written `var(--rs-x, literal)` fallbacks go.
- `width` and `max-width` become `inline-size` and `max-inline-size`.
- `container-name: rs-component` goes. Nothing has queried it since `container-query-up` stopped needing the name (decision 9); `container-type: inline-size` stays, because Container is a layout box.
- The block's variables come first, then `container-type`, as the style rule orders them.

### 121. New token `container-width-default` (1000px)

**Agreed 2026-10-27 (RCL-08).**

- The default width was the only Container width without a token: `var(--rs-container-width-default, 1000px)` read a variable nothing defined. `container.width.default` joins `wide`, `content.sm` and `content.lg` in `foundation.tokens.json`, and the map is regenerated.
- Container reads `#{rs-token(container-width-default)}`. Same value and the same variable name, so consumers who already set `--rs-container-width-default` see no change; the variable is now on `:root`, in Figma exports and themeable.

### 122. `padded` keeps the safe area and the one-side overrides

**Agreed 2026-10-27 (RCL-08).**

- `rs-container--padded` replaced `padding-block` outright, so a padded container ignored the safe-area insets and `--rs-container-padding-block-start` / `-end`. The layout rule's "they resolve with the safe area" held only for unpadded containers.
- The block sets an internal local, `--rs-container-inset-block: 0px`, and the gutters read `max(env(safe-area-inset-*), var(--rs-container-padding-block-start|end, var(--rs-container-inset-block)))`. `padded` only reassigns the local to `container-padding-block`. A modifier changes a variable, not the property (decision 3).
- No change on screens without insets (20/30/40px at base/`md`/`lg`). With `viewport-fit=cover`, a padded container gets the larger of the inset and its padding, and the one-side overrides now work when padded.
- The local is set by the modifier, not a documented hook (like decision 47).

### 123. `flush` replaces `--no-gutters`: a container with no side padding

**Agreed 2026-10-27 (RCL-08).**

- Shane: there is a real use for a container with no padding (a full-bleed banner or image, a Container inside something already padded). The Astro `rs-container--no-gutters` rule had no prop, so it was reachable only by hand-adding the class, and its `padding-inline: 0` also dropped the side safe-area insets.
- New prop `flush?: boolean`, off by default with no class (decision 42), emitting `rs-container--flush`. Named for the result (edges flush with the parent), not a negative `noGutters`.
- The block sets an internal local, `--rs-container-inset-inline: #{rs-token(container-gutter)}`, and the side gutters read `max(env(safe-area-inset-*), var(--rs-container-inset-inline))`. `flush` reassigns the local to `0px`, so content reaches the edges on ordinary screens and still clears a landscape notch.
- A local, not `--rs-container-gutter: 0px` on the modifier: custom properties inherit, so setting the public hook would also strip the gutters of any Container nested inside. Every Container redeclares the local, so nothing leaks. The `--rs-container-gutter` hook still works on any ancestor. Shane doubts Containers should nest; the local stays as a guard anyway, because the full-bleed band (`size="full" flush` around a `content` Container) is the likeliest way consumers will nest them.
- No block padding comes with it: a Container has none unless `padded`, so `flush` alone is padding-free.
- `Container.svelte` and its tests still use `--no-gutters` until the Svelte port (a Daruma task).

### 124. Container's size classes are `rs-container--<size>`

**Agreed 2026-10-27 (RCL-08).**

- `size="full"` emitted `rs-container--full-width`, the only class that did not match its prop value. It is now `rs-container--full`, so every size follows the reviewed pattern (Alert `--error`, Stack `--large`), and the frontmatter is one line: ``size !== 'default' && `rs-container--${size}` ``. `padded` and `flush` use the same `&&` form.
- The prop is unchanged; only hand-written `rs-container--full-width` classes break. `Container.svelte` and its tests keep the old name until the Svelte port.

### 125. Container's docs page is three sibling Containers, kept short

**Agreed 2026-10-27 (RCL-08, RCL-21).**

- A live Container inside the page's own `<Container size="content" padded>` would teach nesting. The page is three siblings instead: a content Container with the `<h1>` and description, the example (`ContainerDefaultExample.astro`: a default-width Container holding one Card, whose edges show the container's 1000px width against the narrower text; a Grid of Cards was dropped because it brought in a second component a reader could take for part of Container), and a content Container with the usage code, tables and Customising. The only docs page that is not one Container; the usage code is still the example's `?raw` source.
- The example Container is not `padded`: padded, the space between the three siblings doubled.
- Shane: the first draft had too much information. Cut to: a two-sentence description; props and attributes (`size` with its widths, `padded` with its steps, `flush`, `as`, `class`); four CSS hooks (`--rs-container-gutter`, `--rs-container-padding-block`, `-start`, `-end`), leaving the width tokens to the `size` row; and no Customising section. A second pass also dropped the two how-tos: a background behind a Container is ordinary CSS with nothing Container-specific, and the `flush` row already says what `flush` does.
- Shane: "lets not write content just for sake of writing content … lets write what a user will actually want to know." A docs page section earns its place only by answering a question the example and the tables do not. Grid keeps its Customising section because its container behaviour and full-row items are not in the tables.
- No slots table when the only slot is the default one: a "(default): the content" row says nothing. Applied to Grid too (its one useful note, that list children are `<li>`, moved to the `as` row).
- `Base/Container` → `Default` is `Container.stories.tsx`.
- **Amended 2026-10-27:** once `Sizes` (decision 126) showed the widths side by side, the live example repeated it. Shane agreed to drop it: the page is one content Container like every other docs page (the three-sibling exception above is gone), and Usage is a short static snippet (`<Container size="content" padded>…</Container>` with its import) instead of an example file's `?raw` source. `ContainerDefaultExample.astro` is removed.

### 126. Container's sizes are one comparison story

**Agreed 2026-10-27 (RCL-08).**

- `Content`, `Wide` and `FullWidth` each rendered the same legal-notice document (`ContainerDocument.astro`) at one width through a Storybook control, with instruction copy in the canvas (decision 80). No canvas showed one width against another.
- One `Sizes` story replaces them (`Container.sizes.stories.tsx`, `ContainerSizes.astro`), like Button → `Sizes` and Stack → `Gaps`: four sibling padded Containers, narrowest to widest, each holding one Card with the size's name and width. `ContainerDocument.astro` and the control are removed. Sort order: `Default`, `Sizes`.
- Kept rather than dropped (the props table already lists the widths) because a width is easier to judge by eye than from a number.

### 127. Card keeps an opinionated anatomy; only `__content` goes

**Agreed 2026-10-27 (RCL-08).** Amends decision 5's description of Card.

- Shane: a bare `<article class="rs-card"><slot /></article>` has no opinion about what a card is, and component libraries give Card one. They do: Bootstrap (`card-img-top`, `card-body`, `card-footer`), Shoelace (`image`, `header`, `footer` slots), MUI (`CardMedia`, `CardContent`, `CardActions`), Spectrum (preview, title, description, footer). The shared anatomy is media at the top edge to edge, padded content, and details or actions at the bottom.
- Card keeps that anatomy: the `media` slot first (edge to edge), a padded `__body`, and the `meta` slot last. Both named slots are structural positions (decision 31). Card is the exception to decision 5's "no component-rendered wrappers": `__body` exists so media can bleed to the edges while the content is padded.
- `__content`, a second wrapper inside `__body` with its own 4px gap, is removed. The body is the one flex column, and `--rs-card-body-gap` (now `space-2`, 8px, as Alert) spaces everything in it. Title to description goes from 4px to 8px; content to meta from 12px to 8px. `--rs-card-content-gap` is gone.
- Meta pins to the bottom: the block is a flex column, `__body` grows (`flex: 1 1 auto`) and `__meta` takes `margin-block-start: auto`, so meta lines up across cards of different lengths in a Grid row.
- Meta stays inside `__body`, so it shares the body padding; the sketch in review showed it as a sibling, which would have needed its own padding.
- No story markup changes. `Card.svelte` and its tests still render `__content` until the Svelte port.

### 128. RCL-08 components read every token through `rs-token()`, without a question each

**Agreed 2026-10-27 (RCL-08).**

- Shane: apply the token conversion everywhere, not one component at a time. Card, Button and Typography (including the typography mixins in `styles/mixins/typography/`) replace every hand-written `var(--rs-x, literal)` fallback with `#{rs-token(x)}`. Same values; standalone dark mode works because the fallbacks become `light-dark()` pairs (decision 6).
- Done for Card: surface, border, radius, gaps, padding, title and description colour and type, and the `__token` chip. The literal `96px` media height and `2px` chip padding wait for the media and `__token` questions.
- Shane, on the same day: "if the answer is obvious there is no need to ask the question, if not obvious then please ask." Changes that follow directly from an agreed decision or rule (no `font-family`, logical properties, rule order, `///` comments, a default variant with no class, the motion rule) are applied without a question and listed in the review summary. Open design choices are still asked one at a time.

### 129. Card's title and description follow decisions 8, 11 and 100

**Applied 2026-10-27 (RCL-08)** without a question, under decision 128.

- No `font-family` on `__title` or `__description` (decision 8).
- `__description` sets only `color` (`color-muted`) and `margin: 0`; its `font-size-md` and `line-height-base` go, so card body copy matches the page (decision 11).
- `__title` heads a whole surface, so it keeps its size step, as Dialog's title does (decision 100): `font-size-lg` through `--rs-card-title-font-size`, semibold through `--rs-card-title-font-weight`, `line-height-tight`, its own `color-fg`, `margin: 0`. Same look as before; the two hooks are new.
- Logical sizes: `min-height` → `min-block-size` on `__media`, `min-width` → `min-inline-size` on `__meta`.

### 130. No `rs-card__token`; docs pages show token names with Typography's inline code

**Agreed 2026-10-27 (RCL-08).**

- `rs-card__token` was a monospace chip that existed only for the Foundations pages: docs styling in the library, not part of what a card is. Its `font-family` was also the last thing keeping Card in stylelint's `ignoreFiles`. Removed; Card now passes the BEM rules and leaves the ignore list.
- Shane tried plain `<code slot="meta">` first and missed the background. The Foundations pages (Colors, Borders, Spacing, Shadows; 32 cards) now write `<Typography slot="meta"><code>--rs-color-bg</code></Typography>`: Typography's existing inline-code style draws the same pill (elevated surface, `radius-sm`, monospace), so Card stays free of docs styling.
- Only the swapped lines change in those stories. Prettier would also reformat Borders, Spacing and Shadows (not Prettier-clean on `main`); that churn is left out.

### 131. A linked card is one link on its title, stretched over the card

**Agreed 2026-10-27 (RCL-08).**

- Shane: a card should have one link, and there is an accessibility trick for it. The stretched link (Heydon Pickering's pseudo-content trick in _Inclusive Components_; Bootstrap's `.stretched-link`): the consumer writes the link in the title, `<h2 class="rs-card__title"><a class="rs-card__link" href="…">Build 482</a></h2>`, and the link's `::after` covers the whole card (`position: absolute; inset: 0` against `.rs-card { position: relative }`).
- The whole card is the click target, and screen readers hear one link named by the title. Wrapping the card in an `<a>` instead makes every word of the card the link's name.
- The link looks like the title (`color: inherit`, no underline). Hovering anywhere on the card hovers the overlay, which belongs to the link, so the title underlines: a clickable card is an action, so decision 44's no-hover rule for static content does not apply.
- Focus: the link's own outline is replaced by a `2px` `color-focus-ring` outline on its `::after`, offset `-2px`, with the card's radius minus its border width, so the ring outlines the whole card inside its border and `overflow: hidden` never clips it. `.rs-card__link:focus-visible::after` is one class with a pseudo-class and a pseudo-element (decision 3).
- One link per card. Text in a linked card cannot be selected, and any second link or button must sit above the overlay; the docs say so.
- `overflow: hidden` stays (the review's concern was overstated: content sits inside 16px of body padding, so ordinary focus rings never reach the edge).

### 132. Card is a `div` by default

**Agreed 2026-10-27 (RCL-08).** Applies decision 1 more strictly.

- `article` claims every card is self-contained content, and screen readers announce "article" on entering each one (six in a grid of six). A stat tile or a colour swatch is not an article.
- `as` defaults to `div`, which claims nothing. `article`, `section` and `li` stay in the union: `as="li"` inside `<Grid as="ul">` for a set of cards ("list, 6 items"), `as="article"` for a card that is standalone content. Props are typed `HTMLAttributes<'div'>`, like Stack.
- Shane asked whether an `article` reads its heading twice. It does not: an article takes no name from its content, so the heading is read once. It would double only with `aria-labelledby` on the article, which Card does not add.
- Stories that relied on the default (Stack, Scroll, Grid, Container) now render `div`; the Foundations pages already pass `as="li"`.

### 133. Card media is a consumer-written `rs-card__media`, cropped to 16:9

**Agreed 2026-10-27 (RCL-08).** Applies decision 58 (Figure) to Card.

- The `media` slot rendered inside a component-owned `<div class="rs-card__media">`, so an `<img>` in it could only be styled through a descendant selector (decision 3). Images sat inline, with a gap below, and did not fill or crop.
- Card renders `<slot name="media" />` first, with no wrapper. The consumer writes the class on the element: `<img slot="media" class="rs-card__media" …>`. A colour swatch is `<div slot="media" class="rs-card__media">`.
- `rs-card__media`: `display: block`, `inline-size: 100%`, `block-size: auto` (cancels the `height` attribute), `aspect-ratio: var(--rs-card-media-aspect-ratio, 16 / 9)`, `object-fit: cover`, `background: var(--rs-card-media-bg)`, `margin: 0`. Every card in a row crops to the same shape. The `96px` minimum and `--rs-card-media-min-height` are gone; swatches are 16:9 now.
- Cost, as with Figure: an image without the class is unstyled.
- Applied without a question (decision 128): `__meta` sets its own `color-muted` (decision 11), so dates and details read as secondary.

### 134. Card's docs page shows linked image cards in a list

**Agreed 2026-10-27 (RCL-08, RCL-21).** Shane: the card stories need images.

- `Components/Card` → `Default` (`Card.stories.tsx`, `CardDefault.astro`, example `CardDefaultExample.astro`). Description: what a card is, the one-link rule and its caveats (a second link sits under the overlay; text in a linked card cannot be selected).
- Example: `<Grid as="ul">` of two `<Card as="li">`: Artemis II on the pad at sunset and Apollo 11 clearing the tower (the NASA photos already in `story-assets`), each with an `rs-card__media` image, an `<h2 class="rs-card__title">` holding an `rs-card__link` to the NASA mission page, a description, and a `<time slot="meta">`.
- Tables: props and attributes (`as`, `class`), slots (`media`, default, `meta`), element classes (`__media`, `__title`, `__link`, `__description`: the anatomy is consumer-written, so the classes are the API), and CSS hooks. The variant-owned local `--rs-card-media-bg` is not listed.
- Checked in Chromium: the keyboard focus ring outlines the whole card.

### 135. Button keeps three fixed sizes; text never shrinks

**Agreed 2026-10-27 (RCL-08).** An exception to the component-API rule "No `size` … prop" (decision 21).

- Shane: most libraries ship button sizes, the same argument as Card's anatomy (decision 127): a component carries the opinion people expect. Button keeps `size?: 'small' | 'medium' | 'large'`.
- No container-query growth (decision 9): a button is the same size wherever it sits. The 18 `--rs-button-*` values on `:root` in `variables.scss` (and its now unused `functions` import) are gone; sizes are locals on the block, reassigned by the modifier.
- `medium` is the default and emits no class (decision 4). It lines up with Input: `min-block-size: calc(line-height-base × 1em + 2 × space-2 + 2 × border-width-sm)`, about 41px at 16px text, padding-inline `space-4`.
- `small`: 32px, padding-inline `space-3`, page-size text. Smaller through height and padding, never text (decision 17).
- `large`: 48px, padding-inline `space-6`, `font-size-lg` (18px). Text may step up, never down.
- Label text inherits the page size (`--rs-button-font-size: 100%`, which `large` reassigns). A percentage, not `inherit`, because a custom property set to `inherit` would inherit the property itself.

### 136. Button conformance applied without a question (decision 128)

**Applied 2026-10-27 (RCL-08).**

- Every fallback through `rs-token()`; the `#ffffff` accent-contrast fallback from decision 104's note is gone. `padding-block: 8px` and the `36px` base height go: the size's `min-block-size` and `align-items: center` set the height.
- No `font-family` (decision 8). Variables first, then `all: unset` (style rule order).
- `primary` is the base and emits no class (decision 4); `rs-button--primary` had no rule.
- The disabled link's `[aria-disabled='true']` attribute selector becomes a derived modifier, `rs-button--disabled`, added in the frontmatter when a link is disabled (decision 3, as `--invalid` from `aria-invalid`).
- The motion rule (decision 114): `--rs-button-duration` reads the opt-in `--rs-button-transition-duration` (fallback `transition-fast`); `prefers-reduced-motion: reduce` sets it to `0s`.
- The standard focus ring, `2px` `color-focus-ring` at `2px` offset; the `--rs-button-focus-ring-color` local goes.
- Button leaves stylelint's `ignoreFiles`.
- Still open: hover and active (`filter: brightness()`), the secondary hover's `color-link-hover`, and the `disabled` prop and `href="#"` link handling.

### 137. New token `color-accent-text`: accent-coloured text on page surfaces

**Agreed 2026-10-27 (RCL-08).** Applies decision 18, as `color-danger-text` did.

- Secondary and ghost Buttons wrote their labels in `color-accent`, a stroke-and-fill role that only promises 3:1. It passes 4.5:1 as text today, but retuning the accent for softer borders would silently break the labels.
- `color.accent.text: {color.accent.$root}` in `light.tokens.json` and `dark.tokens.json` (`color-accent-text: (alias: color-accent)` in the map). Same value today, so nothing changes visually; the contract is now "text, 4.5:1", and it can take its own value later without touching components.
- Secondary and ghost labels read it; the secondary border stays `color-accent` (a stroke). `Foundations/Colors` shows it after Accent contrast.

### 138. Button hover is mixed from tokens with `color-mix()`

**Agreed 2026-10-28 (RCL-08).** Shane: "maybe acceptable but still a bit subtle". If it is revisited, the step lives in one place, the `color-accent-hover` values in the token files.

- Shane noticed no difference from the first attempt (secondary fill-only `color-surface-elevated`, about 1.06:1 on white) and found primary's `filter: brightness(1.08)` hover lame. Secondary's old hover also borrowed `color-link-hover`, a link-text role (decision 18).
- Each variant owns two locals, `--rs-button-hover-bg` and `--rs-button-hover-border-color`; one `&:hover` rule assigns them. No new tokens: every theme gets a hover derived from its own accent.
- Primary: `color-mix(in srgb, color-accent, color-fg 15%)`, border the same. `color-fg` is navy in light and near-white in dark, so the fill darkens in light and lightens in dark, always away from its label.
- Secondary: `color-mix(in srgb, color-accent 10%, color-surface)`, border stays `color-accent`. Ghost: `color-mix(in srgb, color-accent 10%, transparent)`. 12% was tried first: the dark secondary label measured 4.48:1, under 4.5.
- Measured on hover (label against fill): primary 6.9 light, 7.2 dark; secondary 5.0 light, 4.65 dark; ghost about 4.7 light, 4.6 dark on a surface.
- Press keeps `filter: brightness(0.94)`.
- Shane still found the primary hover boring. Primary now lifts: hover adds `box-shadow: var(--rs-button-hover-shadow)` (`shadow-md`, a soft glow in dark mode), transitioned with the other properties and instant under reduced motion. Secondary and ghost set the local to `none`. The primary mix rises from 15% to 20%, which only raises its label contrast. No movement; a `translate: 0 -1px` nudge is the follow-up if it still feels flat.
- Shane: good in light mode, not in dark. Mixing toward `color-fg` (near-white in dark) washed the hovered fill out to a pale periwinkle. A `light-dark()` in Button was proposed and rejected: it would put mode logic in a component, and `light-dark()` cannot hold a shadow. New `color-accent-hover` and `shadow-accent` tokens were proposed next; Shane asked whether existing tokens already cover it. They do: `shadow-md`'s dark glow is the system's designed dark elevation (decision 7, `Foundations/Shadows`).
- Primary's hover fill stayed `color-accent` with `shadow-md` alone. Shadow-only proved invisible at normal size: `shadow-md`'s dark glow (8px, white at 40%) disappears beside a bright blue button, and light mode lost its darkening. Earlier checks used zoomed captures; hovers are now checked at normal size.
- Primary hover then tried `color-mix(in srgb, color-accent, color-fg 10%)` with `shadow-lg`. Dark was fine; Shane found light mode horrendous (the heavy shadow).
- Shane asked what other libraries do and wanted live buttons to try, not code. Primer and Carbon put a per-mode hover colour in the token layer (Primer's `button.primary.bgColor.hover` is darker than rest in light and lighter in dark); Bootstrap 5.3 darkens 15% (`shade-color($primary, 15%)`). None adds a hover shadow. Shane tried them live and chose Bootstrap's look.
- **Settled:** new token `color-accent-hover`, Bootstrap's 15% step computed into the token files. Light `#284dba` (15% darker than `#2f5bdb`, white label 7.4:1). Dark `#699bff` (15% lighter than `#4f89ff`, Bootstrap's `tint-color`): darkening in dark would drop our navy label (decision 104) to about 4.4:1. Primary hover changes only its fill and border to the token. No `color-mix()`, no shadow, no mode logic in Button. Secondary and ghost keep the 10% accent wash. `Foundations/Colors` shows Accent hover.

### 139. `href` decides Button's element; `disabled` works on both

**Agreed 2026-10-28 (RCL-08).** Decided without a question as obvious (Shane, relayed by the coordinating session, and confirmed).

- The `as` prop goes. With `href` Button renders an `<a>`, without it a `<button>`: one way to make a link, and no `<a href="#">` link to nowhere (the old `as="a"` with no `href`). Nothing in the repo used `as` on Button.
- `disabled` stays a prop, because links have no native `disabled` (decision 24's exception: one prop across two elements, not a re-declared attribute). On a `<button>` it is the native attribute. On a link it drops the `href` and adds `role="link"`, `aria-disabled="true"`, `tabindex="-1"` and the derived `rs-button--disabled` (decision 136), so it is announced as an unavailable link and does nothing when clicked.
- Disabled keeps `opacity: 0.55` and `pointer-events: none`; the `cursor: not-allowed` beside it is removed, since no pointer events means the cursor never shows.

### 140. Button stories: `Default` is the docs page, `Sizes` stays an aspect

**Applied 2026-10-28 (RCL-08, RCL-21)** without a question, following decisions 119 and 125.

- `Base/Button` → `Variants` becomes `Default` (`Button.stories.tsx`, `ButtonDefault.astro`, example `ButtonDefaultExample.astro`): a short description (one primary per view), the example (Deploy, Preview and Cancel in the three variants; a link to Astro's deploy guide through `href`; a disabled "Deploying"), the usage code, props and attributes (`variant`, `size`, `href`, `disabled`, `type`, `class`) and the opt-in CSS hooks. No slots table (decision 125). Variant-owned locals (fill, colour, padding, height, hover) are not listed.
- `Sizes` stays its own aspect (decision 135), rebuilt to the stories rule: one content Container and a small Stack of three rows, small, medium and large, each in the three variants. The old rows used Containers as spacers, `<h3>` headings with no outline above them, and `aria-label`s that did not match the visible text (WCAG 2.5.3).
- Buttons in a row are separated with `{' '}`, because Astro drops the whitespace between components on separate lines (decision 62); without it the Variants buttons touched.

### 141. Typography conformance applied without a question (decision 128)

**Applied 2026-10-28 (RCL-08).**

- The prose mixins in `styles/mixins/typography/` read every token through `rs-token()` (colours, spacing, weights, line heights, radii, border width, transition, the heading and text spacing tokens, `font-size-sm`, `font-family-mono`), so standalone dark mode works (decision 6). Typography's own size hooks (`--rs-typography-h1-size` and so on) are not tokens and keep their literal fallbacks.
- No sans `font-family` on headings, paragraphs or the intro (decision 8). Code, `kbd`, `samp` and `var` keep `font-family-mono`: that is the code face, not the page's.
- Logical properties: `margin-top`/`-bottom` → `margin-block-start`/`-end`, the list counters' `left` → `inset-inline-start`, `text-align: left` → `start`, `border-top` → `border-block-start`.
- `.intro-text` was first renamed `rs-typography__intro` here; Shane pointed out that was not obvious, and it is removed instead (decision 143).

### 142. Prose is the one exception to decision 3, at tag weight through `:where()`

**Agreed 2026-10-28 (RCL-08).** Resolves the parked "Typography mixins" question.

- Typography styles bare tags (`h2`, `p`, `a`, lists, tables) because Markdown and CMS output has no classes. It is the one component allowed descendant tag selectors, and it stays in stylelint's `ignoreFiles` as that documented exception.
- Its scope is `:where(.rs-typography)`, which matches the same elements but adds no specificity: `:where(.rs-typography) p` is (0,0,1). Before, `.rs-typography p` and `.rs-typography a` (0,1,1) beat every single library class (0,1,0), so a `<Button href>` inside prose rendered as blue underlined link text on a blue pill, and a Card description took paragraph margins. Now any class inside the prose wins. Checked in Chromium: a Button inside prose is white with no underline, and a plain link keeps its link colour and underline.
- The link mixin's states are `&:where(:hover)`, `&:where(:visited)`, `&:where(:focus-visible)`, so a visited or hovered state cannot add the weight back. Same order, so a visited link's colour still wins over hover, as before.
- `:where()` is in every current browser (Chrome 88, Firefox 78, Safari 14). The Svelte Typography uses the same mixins, so it picks up the link change on its next build; its own selectors are ported later.

### 143. No intro class in Typography

**Agreed 2026-10-28 (RCL-08).**

- `.intro-text` (`.rs-typography .intro-text`) was an author-facing class: an editor working in a CMS, who cannot use components, could mark the opening paragraph as a lead (bigger, medium weight), like Bootstrap's `.lead`. Unprefixed so it was easy to type in content.
- Removed from the Astro library: nothing used it but the Typography specimen story, it was the library's only author-facing and only unprefixed class, and plain Markdown cannot add a class anyway. If a lead paragraph is wanted later, it comes back deliberately, with its name decided then.
- Shane: a decision that affects Svelte must not leave a mess there. Removed in the same change: the `.intro-text` rule in `Typography.svelte`, its two assertions in `packages/svelte/test/components.test.mjs` (the raw-HTML test now uses a plain `<p>`), `class="intro-text"` in the Svelte `TypographyExample` and `ContainerExample` stories, and the `typography-intro` mixin itself.

### 144. Prose headings grow with their container (an exception to decision 9)

**Agreed 2026-10-28 (RCL-08).**

- Typography's headings step up as their container widens (h1 32 → 36 → 44px at 500 and 900px; h2 to h4 likewise) and prose paragraphs go from 16 to 17px at 700px. The review proposed fixing them at one size under decision 9; Shane: an h1 is expected to be smaller on mobile than on desktop.
- Decision 9 is about components changing density (Alert, Button, controls). Page typography with a heading scale that grows with space is standard (Bootstrap's responsive headings, GOV.UK's larger headings from tablet, Tailwind's prose sizes), so the steps stay.
- They keep measuring the nearest container, not the viewport, so an article in a narrow sidebar gets the small sizes. Text still never shrinks below its base size.

### 145. Typography stories: `Default` is the docs page, `Prose` is the specimen

**Applied 2026-10-29 (RCL-08, RCL-21)** without a question, following decisions 119, 125 and 140.

- `Base/Typography` → `Default` (`Typography.stories.tsx`, `TypographyDefault.astro`, example `TypographyDefaultExample.astro`): what Typography is for (prose you don't write classes for), that headings grow with their container, and that components and classes inside it keep their own styles (decision 142). The example is a short release note with a heading, paragraphs, inline code, a list and a link. Tables: props and attributes (`as`, `html` with a "trusted HTML only" note, `class`) and the size hooks, one row per step, because each step has its own hook (`--rs-typography-h1-size`, `-sm`, `-lg`).
- The 250-line terms document stays as its own aspect, `Base/Typography` → `Prose` (`Typography.prose.stories.tsx`, `TypographyProse.astro`), the full specimen of every element. Sort order `Default`, `Prose`; the stale `TermsStyleDocument` entry in `preview.ts` is gone.

### 146. Docs page tables scroll inside `<Scroll>`

**Applied 2026-11-01 (RCL-08, RCL-21)** without a question, following decisions 40 and 41.

- At 375px the five docs pages overflowed sideways, up to 448px wide, because the API tables' long type strings cannot wrap. Each table now sits in `<Scroll tabindex="0" role="region" aria-labelledby="…">`, named by its caption (`<span slot="caption" id="props-caption">`). `rocketship-stories.mdc` and the docs page template say the same, so new pages start this way.

### 147. Form stories get their own `Forms/` group; both groups sort by type

**Agreed 2026-11-01 (RCL-08, RCL-21).**

- `Components/` was one flat list of 18 mixed items, and Dialog, Popover, File Input and Range Input were missing from the sort order. Shane: forms go in their own group; `Foundations/` and `Base/` stay as they are.
- `Forms/`: Field, Fieldset, Label, Input, Textarea, Select, Checkbox, Radio, File Input, Range Input (wrappers, text controls, choices, native-part controls).
- `Components/` is not split further at 8 items. Order: Card, Table, Figure, Alert, Disclosure, Dialog, Popover, Tooltip (content on the page first, then what opens on demand).

## Parked for later

- **Prose figures:** prose `figure`/`figcaption` (Markdown output, no classes) waited on the prose exception, which decision 142 settled. Typography still has no rule for them.
- **Alert:** once the role goes, "error" is conveyed by colour plus title text only. Decide on a non-colour signal.
- **Style queries:** check current browser support (Firefox) before making rule 3's style-query clause binding. Resolved 2026-10-24: Firefox 151 (19 May 2026) shipped `@container style()` for custom properties, completing cross-browser support (Chrome/Edge 111, Safari 18). The clause is binding for exact-value matches only; range syntax (`>`, `<`) is still behind a Firefox flag and is not allowed.
- **Svelte:** `Alert.svelte` has the same issues, and `packages/svelte/test/components.test.mjs` asserts the prop-beats-slot title behaviour. The `@labcat2020/rocketship/styles/mixins` subpath export is needed for `rs-token()` to reach Svelte.

- **Axe test recipe (from RCL-29's dropped skill-friction log):** build Storybook static, serve it, drive `iframe.html?id=<storyId>&viewMode=story` with Playwright and run axe in the page. Reuse the a11y addon's embedded `window.axe` (injecting a second axe-core fails with "Axe is already running"); exclude only iframe-shell rules (`region`, `landmark-one-main`, `page-has-heading-one`); in axe 4.13 disable rules with `rules: { id: { enabled: false } }`, since `disable: [...]` was a no-op. Decide whether this becomes a scripted check.
- **Range tick marks:** visible steps would be painted on the track (gradient stops aligned to `step`), not a `<datalist>` (decision 78). A component feature needing its own review.

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
- PR #13 (RCL-28): Fieldset rebuilt with decisions 24–32 as an unboxed `<fieldset>` group whose `legend` slot renders a floated `rs-fieldset__legend` as its first child; `Components/Fieldset` → `Default`, groups in an xlarge Stack. Stack (Astro) gains `xlarge`. Astro and Svelte skills, a11y/bem-scss/svelte rules and the port checklist updated.
- PR #62 (RCL-57): Svelte Fieldset ported from `Fieldset.astro` — the `legend` snippet replaces the named slot, and the `as`, `legend` and `disabled` props are gone (`disabled` flows through `...attrs`). Stack gains `xlarge`. `Components/Fieldset` collapses to one `Default` story mirroring Astro; no version bump.
- PR #15 (RCL-30): Checkbox and Radio rebuilt with decisions 33–39 as one `<input>` each with a clipped `::before` mark, 24px, in `<Field inline>` rows. Field gains `inline`, Label `--rs-label-offset`, Fieldset `__hint`/`__error`. `Components/Checkbox` → `States` and `Components/Radio` → `States`. Mark on fill measured 5.8:1 light, 3.2:1 dark. Svelte ports of Field inline, Label offset, Fieldset hint/error and Stack xlarge are still to do.
- PR #9 (RCL-10): Table rebuilt with decisions 40–54 as a single `<table>` (caption slot, consumer-written header/cell/row classes, `striped`, numeric modifier, clip-path corners); new `Scroll` primitive (`vertical` option). Stories `Components/Table` → `Default`, `Striped`; `Base/Scroll` → `Horizontal`, `Vertical`. Verified light and dark, axe clean (Chromium; Firefox/Safari caption clipping unchecked). Skills, templates, a11y/bem-scss/layout/svelte rules and the port checklist updated. The Svelte Table predates these decisions and needs porting with Scroll.
- PR #64 (RCL-11): Figure rebuilt with decisions 56–62 as a fixed `<figure>` with a caption slot and a consumer-written `__media` class, capped at 80svh. `Components/Figure` → `Default` (landscape) and `Portrait`, with NASA photos. Verified light and dark, axe clean. PR #5 closed. The Svelte Figure (PR #51) predates these decisions and still needs porting; its README row names `Figure.astro`, which the provenance test enforces.
- Open: whether the source of truth becomes a DTCG `tokens.json` (W3C Design Tokens format) that generates `$rs-tokens`, so Figma variables can sync with it. Decided: decision 55.
- Parked: Grid renders `ul`/`ol` with `list-style: none` but no `role="list"` (same Safari/VoiceOver issue Stack handles). Resolved by decision 118.
- PR #12 (RCL-29): File Input and Range Input rebuilt with decisions 63–78 as one `<input>` each, styling their native parts (browse button; track and thumb), with Input's box for File Input and a 24px thumb for Range. Stories `Components/File Input` → `States` and `Components/Range Input` → `States`. The PR's skill-friction log was dropped (its axe recipe is parked). Skill (native-part controls), bem-scss (no vendor prefixes), a11y (forced colours) and stories (spaced titles, no inert markup, error examples) rules updated. Forced colours reasoned, not yet seen on Windows. No Svelte ports exist yet.
- RCL-13: Dialog built with decisions 95–103 and 106 as a native modal `<dialog>` (invoker commands to open, `<form method="dialog">` to close, layout under `:modal`, opacity fade off under reduced motion). New `color-backdrop` token, shown in `Foundations/Colors`. Decision 104 fixed dark text on accent (Button, Checkbox and Radio marks). `Components/Dialog` → `Default`. Verified light and dark, axe clean, in Chromium only. Skill and rules not yet updated for the JS-tier native pattern; no Svelte port.
- RCL-12: Disclosure built with decisions 107–117 as a fixed `<details>` with a `summary` slot, styled from `:open` and `::details-content`, a border chevron, and a CSS-only height transition (`interpolate-size`, Chromium; instant elsewhere). New token `transition-medium` (210ms). No Accordion component: a shared `name`. Stories `Components/Disclosure` → `Default` and `Accordion` are the first docs pages (decision 80, amended). Skill (native open state row: Disclosure, Popover, Dialog), patterns, stories rule and template updated. Axe clean light and dark. The Svelte Disclosure and Accordion (RCL-58) predate these decisions and need porting; the Svelte README now names `Disclosure.astro` as its original.
- RCL-08: Grid, Container, Card, Button and Typography reviewed with decisions 118–145. New tokens `container-width-default`, `color-accent-text`, `color-accent-hover`. Every Astro component now leaves stylelint's ignore list except Typography, the documented prose exception. All five have docs pages; card titles in stories are real headings. Skill and rules updated, including the exceptions: Button's `size` and `disabled`, Card's `__body`, Typography's selectors and heading steps. Svelte clean-up for shared changes is done (`intro-text`, Button's size values); the five Svelte ports are Daruma tasks to file after this merges. Checked in headless Chromium: axe clean on all 39 Astro stories in light and dark; real mouse hover and press and keyboard focus on Button and Card in both modes; no page overflow at 375px; Container widths and padding at three breakpoints; Grid columns at three widths; `:where(:visited)` painting a visited link. Forced colours and reduced motion were emulated, not seen on a Windows contrast theme. Firefox and Safari are not checked. `Base/Button` → `Default` renders a disabled link: in both modes it has no `href`, `role="link"` and `aria-disabled="true"`, Tab skips it, and axe is clean.

## Sequence

1. Finish the Alert review (decisions only).
2. Token system refactor: token map, `rs-token()`, `light-dark()`, generated `variables.scss`, layered shadows.
3. Build Stack, then rebuild Alert and its story on top of the token system with every decision above.
4. Rewrite the skill and rules in one pass, with Alert as the reference example.
5. Port the changes to Svelte.
