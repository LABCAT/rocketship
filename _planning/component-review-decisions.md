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
- PR #11 (RCL-32): Field and Label rebuilt with decisions 14–19, `color-danger-text` alias added, stories split into `Components/Field` → `Default` and `Components/Label` → `Markers`. Skill and a11y/bem-scss rules updated. Verified light and dark, axe clean. The Svelte skill is not yet updated for 14–19.
- Parked: there is no Astro Input/Textarea, so form stories show browser-styled native controls.
- Open: whether the source of truth becomes a DTCG `tokens.json` (W3C Design Tokens format) that generates `$rs-tokens`, so Figma variables can sync with it.
- Parked: Grid renders `ul`/`ol` with `list-style: none` but no `role="list"` (same Safari/VoiceOver issue Stack handles).

## Sequence

1. Finish the Alert review (decisions only).
2. Token system refactor: token map, `rs-token()`, `light-dark()`, generated `variables.scss`, layered shadows.
3. Build Stack, then rebuild Alert and its story on top of the token system with every decision above.
4. Rewrite the skill and rules in one pass, with Alert as the reference example.
5. Port the changes to Svelte.
