# MR: Tasks 10, 11, and 14 (single MR — all three required)

**You must deliver tasks 10, 11, and 14 in this single merge request. Do not deliver only one or two of them. All three are required.**

---

## Scope of this MR

| Task | What to deliver |
|------|-----------------|
| **10** | Design tokens + default theme: minimal `--rs-*` tokens (colors, typography, spacing), default theme in base package, document tokens in `_planning/rocketship-plan.md`. |
| **11** | Container component: Astro `<Container>` + SCSS; modifiers `full`, `wide`, `content` (and `narrow` as in spec); layout via `media-breakpoint-up` only. Document usage and breakpoints. |
| **14** | Typography components/utilities: typography mixins (headings, text, tables, lists), `<Typography>` Astro component + SCSS that applies those mixins. Document token-to-visual mapping. |
| **Stories** | Storybook stories for Container and Typography in `apps/storybook`, with the a11y addon used where relevant. |

If you only implement one of the three tasks (10, 11, 14), the MR is incomplete. Stories are required as part of this MR.

---

## Conventions (read first)

- **BEM:** Block prefix is `rs`. Use `.rs-container`, `.rs-container--full-width`, `.rs-typography`, etc. See `.cursor/rules/rocketship-bem-scss.mdc`.
- **Layout:** Viewport media queries only for layout/container; use `media-breakpoint-up` (min-width). Component sizing uses container queries. See `.cursor/rules/rocketship-layout-responsive.mdc`.
- **Tokens:** All design tokens and theme variables use the `--rs-*` prefix. Component-level CSS custom properties (e.g. container width, gutters, heading spacing) must also use `--rs-*`, e.g. `--rs-container-width`, `--rs-container-gutter-left`, `--rs-heading-spacing-top`, not `--container-width` or `--base-heading-spacing-top`.

---

## SCSS folder structure (base package)

Use this structure under `packages/base/src/scss/` (or `packages/base/src/styles/` if you keep a single styles entry; ensure the main entry is wired in package.json).

```
scss/
  variables.scss           # Design tokens + default theme (--rs-*); light/dark if needed
  mixins.scss              # Single import file for all mixins

  common/
    base.scss              # HTML element resets/overrides
    print.scss             # Print styles (follow print best practices)

  mixins/
    breakpoints.scss       # media-breakpoint-up(sm|md|lg|xl) mixin
    container-query.scss   # Container-query mixin for component sizing
    fonts/
      example-font.scss    # Font-face / @mixin example-font-regular() placeholder pattern
    typography/
      headings.scss        # typography-h1 … typography-h6 (and h2-alt if desired)
      text.scss            # typography-p, typography-intro, typography-em, typography-strong, typography-hr
      lists.scss           # typography-list, typography-li, typography-ul, typography-ol (can be separate from text.scss)
      tables.scss          # typography-table
      links.scss           # typography-a (referenced by .rs-typography a)
```

- **Main entry:** `scss/styles.scss` (or equivalent) must:
  - `@import 'variables';`
  - `@import 'mixins';`
  - `@import 'common/base';`
  - `@import 'common/print';`
  - Then import Container and Typography component SCSS (see below).

- **to-rem:** The typography mixins use `to-rem(...)`. Add a small SCSS function or mixin (e.g. `@function to-rem($px)`) that converts px to rem (e.g. divide by 16 and emit `Xrem`), and make it available where typography mixins are used.

---

## Task 10: Design tokens + default theme

- In `variables.scss` (or a token partial it imports), define:
  - Color tokens (e.g. `--rs-color-*`, background, foreground, accent, border).
  - Typography tokens (e.g. font families, sizes, spacing) used by the default theme.
  - Spacing/gutter tokens (e.g. `--rs-space-*`, `--rs-container-gutter` for container gutters).
- Default theme: set fallback values for all `--rs-*` variables (e.g. on `:root` or a theme class).
- Document the token set (names and purpose) in `_planning/rocketship-plan.md`.

---

## Task 11: Container component

- **Astro:** Export a `<Container>` component (e.g. in `packages/base/src/components/Container.astro` or similar). Accept a prop for modifier: `full` | `wide` | `content` | `narrow` (and default to `wide` or as per spec). Render a single root element with BEM classes: `.rs-container`, `.rs-container--full-width`, `.rs-container--wide`, `.rs-container--content`, `.rs-container--narrow`.
- **SCSS:** One file (e.g. `container.scss`) that defines:
  - Base `.rs-container` with CSS custom properties using the `--rs-*` prefix: `--rs-container-width`, `--rs-container-gutter-left`, `--rs-container-gutter-right`, `--rs-container-gutters` (gutters: `max(env(safe-area-inset-*), var(--rs-container-gutter))`), `margin-inline: auto`, `padding-inline`, `max-width: calc(var(--rs-container-width) + var(--rs-container-gutters))`.
  - Modifiers override `--rs-container-width` (e.g. full-width 100%, content 600px/800px at lg, narrow 1000px at lg, wide 1200px). Use only `@include media-breakpoint-up(...)` for layout.
- Import this SCSS from the main entry.
- Document: usage (Astro props + classes) and breakpoints in `_planning/rocketship-plan.md` or README.
- **Stories:** Add Storybook stories in `apps/storybook` for Container (e.g. default, full, wide, content, narrow) and run a11y checks where relevant.

**Example pattern (all variables `--rs-*`; adapt breakpoints as needed):**

```scss
.rs-container {
  --rs-container-width: 1200px;
  --rs-container-gutter-left: max(env(safe-area-inset-left), var(--rs-container-gutter));
  --rs-container-gutter-right: max(env(safe-area-inset-right), var(--rs-container-gutter));
  --rs-container-gutters: calc(var(--rs-container-gutter-left) + var(--rs-container-gutter-right));
  margin-inline: auto;
  padding-inline: var(--rs-container-gutter-left) var(--rs-container-gutter-right);
  width: 100%;
  max-width: calc(var(--rs-container-width) + var(--rs-container-gutters));
}

.rs-container--full-width {
  --rs-container-width: 100%;
  padding: 0;
}

.rs-container--content {
  --rs-container-width: 600px;
  @include media-breakpoint-up(lg) {
    --rs-container-width: 800px;
  }
}

.rs-container--narrow {
  @include media-breakpoint-up(lg) {
    --rs-container-width: 1000px;
  }
}

.rs-container--wide {
  --rs-container-width: 1200px;
}
```

---

## Task 14: Typography component and mixins

- **Mixins:** Implement the typography mixins as specified in the structure above:
  - **headings.scss:** `typography-h1` … `typography-h6` (and optionally `typography-h2-alt`). Use `--rs-heading-spacing-top` / `--rs-heading-spacing-bottom` for margins (set defaults in theme; mixins can override per-heading); use `to-rem()` and `@include media-breakpoint-up(sm|md|lg)` for responsive sizes/line-heights.
  - **text.scss:** `typography-p`, `typography-intro`, `typography-em`, `typography-strong`, `typography-hr` with spacing/size variables and breakpoints as needed.
  - **lists.scss:** `typography-list`, `typography-li`, `typography-ul`, `typography-ol` (list styling and counters: level1 decimal, level2 lower-alpha, level3 lower-roman; `.typography-ol` / `.typography-ul` structure as in the user spec).
  - **tables.scss:** `typography-table` (min-width, cell padding, borders, alignment, thead/th).
  - **links.scss:** `typography-a` for default link styling (used by `.rs-typography a:not(.button, .button-text)`).
- **Typography component SCSS:** A file (e.g. `typography.scss`) that applies the mixins to `.rs-typography` descendants:

```scss
.rs-typography h1 { @include typography-h1; }
.rs-typography h2 { @include typography-h2; }
.rs-typography h3 { @include typography-h3; }
.rs-typography h4 { @include typography-h4; }
.rs-typography h5 { @include typography-h5; }
.rs-typography h6 { @include typography-h6; }
.rs-typography p { @include typography-p; }
.rs-typography .intro-text { @include typography-intro; }
.rs-typography i, .rs-typography em { @include typography-em; }
.rs-typography b, .rs-typography strong { @include typography-strong; }
.rs-typography hr { @include typography-hr; }
.rs-typography li { @include typography-li; }
.rs-typography ul { @include typography-ul; }
.rs-typography ol { @include typography-ol; }
.rs-typography:not(.video__transcript) table { @include typography-table; }
.rs-typography a:not(.button, .button-text) { @include typography-a; }
.rs-typography > :first-child { margin-top: 0; }
.rs-typography > :last-child { margin-bottom: 0; }
```

- **Astro:** Export a `<Typography>` component that renders a wrapper (e.g. `<div class="rs-typography" set:html={...}>` or a slot for content) so consumers can wrap rich content and get the above styles.
- **Document:** In `_planning/rocketship-plan.md` (or a typography section), document the mapping between tokens and visual scale (headings, body, intro, etc.).
- **Stories:** Add Storybook stories in `apps/storybook` for Typography (e.g. headings, body, intro, lists, table, links) and run a11y addon checks.

---

## Storybook stories (required)

In `apps/storybook`:

- **Container:** Stories that render `<Container>` with each modifier (full, wide, content, narrow) and enough content to show layout. Use the a11y addon.
- **Typography:** Stories that render `<Typography>` with sample content covering h1–h6, paragraphs, intro text, lists (ul/ol), a table, and links. Use the a11y addon.

Stories must import and apply the base package styles (e.g. `@rocketship/base/styles`) so the components render correctly.

---

## Fonts mixin (placeholder)

In `mixins/fonts/example-font.scss` use a placeholder pattern that can be replaced later with real font faces, e.g.:

```scss
// @mixin example-font-regular() {
//   font-family: 'Example Font', sans-serif;
//   font-weight: 400;
// }
```

No need to implement real font files in this MR; the structure is enough.

---

## Checklist before submitting the MR

- [ ] **Task 10:** `variables.scss` (or token file) has `--rs-*` tokens; default theme sets fallbacks; `_planning/rocketship-plan.md` documents tokens.
- [ ] **Task 11:** Astro `<Container>` exists with modifiers full/wide/content/narrow; SCSS uses only `media-breakpoint-up` and `--rs-container-*` variables; usage/breakpoints documented.
- [ ] **Task 14:** All typography mixins (headings, text, lists, tables, links) exist; `.rs-typography` SCSS applies them; Astro `<Typography>` component exists; token-to-visual mapping documented; typography variables use `--rs-*`.
- [ ] **Stories:** Storybook stories for Container and Typography in `apps/storybook`, with a11y addon used; stories import base package styles.
- [ ] SCSS structure matches the specified layout (common/base, common/print, mixins/breakpoints, mixins/container-query, mixins/typography/*, mixins.scss, styles.scss).
- [ ] Main SCSS entry imports variables, mixins, common/base, common/print, and component SCSS. Package export for styles points at that entry.
- [ ] **Variables:** All design tokens and component variables use the `--rs-*` prefix (e.g. `--rs-container-width`, `--rs-heading-spacing-top`, not `--container-width` or `--base-heading-spacing-top`).
- [ ] BEM: all public classes use `rs-` prefix (`.rs-container`, `.rs-typography`, etc.).
