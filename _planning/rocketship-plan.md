# Rocketship: Planning Folder and Cursor Rules

## Phase 1: Planning only

We are not building anything yet. Phase 1 is only about planning artifacts and rules:

1. Create the `_planning` folder.
2. Add this master plan document (vision, decisions, open questions, and the task list below).
3. Create five Cursor rules in `.cursor/rules`: `rocketship-overview.mdc`, `rocketship-bem-scss.mdc`, `rocketship-layout-responsive.mdc`, `rocketship-themes.mdc`, `rocketship-a11y.mdc`.

No new packages, Storybook app, or components in this phase.

---

## Vision and constraints

- **Goal:** Build the best Astro component library we can, with no commercial pressure or deadlines.
- **Long-term:** Grow into a fully featured Astro component library (comparable to popular UI kits) and a Payload template / collection / component library, with an optional matching Figma library (post-MVP).
- **Principle:** CSS/SCSS first, JavaScript last. The MVP is “done” (all planned CSS-only components + theming) before we add any JS-required components.

---

## MVP scope

- **Components:** Core only—buttons, links, typography and other purely presentational pieces. No inputs or forms yet.
- **Stack:**
  - Astro component library (BEM + SCSS)
  - CSS custom properties (`--rs-*`) as the primary styling API
  - pnpm monorepo (this repo already hosts backend + Astro frontend; Rocketship will live as packages/apps inside it)
- **No JS components** until MVP is complete.

---

## Package architecture (future-facing)

- **Library shape:**
  - Base package providing primitives, tokens, default theme, and core components (e.g. `@rocketship/base`).
  - Add-on packages for specific domains (forms, layout, ecommerce, etc.).
  - All packages designed to be publishable to npm.
- **Default theme:**
  - Lives in the base package.
  - Provides fallback values for all `--rs-*` variables.
- **Planet themes:**
  - Eight extra themes, one per planet.
  - Each shipped as a sub-package that only exports CSS variable overrides (no new components).
  - Each theme supports light + dark, driven by user preference.
- **Storybook:**
  - Separate app (e.g. `apps/storybook`).
  - Uses Storybook for Astro to render Rocketship components.
  - Used for docs, visual regression, and a11y checks.

---

## Layout and responsive strategy

- **Media queries:**
  - Only for top-level layout and container components.
  - Follow a Bootstrap-style “media-breakpoint-up” approach (min-width breakpoints, no “down” or “between” helpers).
- **Container component:**
  - Provides layout context and width modifiers:
    - `full` (full width)
    - `wide` (default ~1200px)
    - `content` (default ~800px)
  - Responsible for applying viewport-based media queries.
- **Component sizing:**
  - Use container queries for component sizing, not viewport queries.
  - Any component that has a size concept (button, cards, media blocks, etc.) supports small / medium / large via container size.

---

## Theming (CSS-only)

- **Default theme:**
  - Encodes the “rocketship / space-station” feel.
  - Provides fallback values for all `--rs-*` variables.
- **Planet themes:**
  - Each planet theme is a package that exports only CSS variable overrides.
  - No new components inside theme packages.
  - Light/dark variants follow user preference.
- **Flexibility:**
  - Every component must be fully styleable via CSS variables.
  - Defaults act as sensible fallbacks.

---

## Design tokens (MVP philosophy)

- Start with the simplest useful token set (colors + typography + spacing) and evolve from there.
- Use `--rs-*` naming consistently.
- Document new token layers (e.g. component-level tokens) here as they’re introduced.

### Default token set

- Color tokens:
  - `--rs-color-bg`, `--rs-color-fg`, `--rs-color-surface`, `--rs-color-surface-elevated`
  - `--rs-color-border`, `--rs-color-accent`, `--rs-color-accent-contrast`
  - `--rs-color-link`, `--rs-color-link-hover`, `--rs-color-link-visited`
  - `--rs-color-focus-ring`, `--rs-color-muted`
- Typography tokens:
  - `--rs-font-family-sans`, `--rs-font-family-mono`
  - `--rs-font-size-xs` through `--rs-font-size-3xl`
  - `--rs-font-weight-regular` through `--rs-font-weight-bold`
  - `--rs-line-height-tight`, `--rs-line-height-base`, `--rs-line-height-relaxed`
- Spacing and layout tokens:
  - `--rs-space-1` through `--rs-space-8`
  - `--rs-container-gutter`
  - `--rs-container-width-wide`, `--rs-container-width-content-sm`, `--rs-container-width-content-lg`, `--rs-container-width-narrow-lg`
- Typography spacing tokens:
  - `--rs-heading-spacing-top`, `--rs-heading-spacing-bottom`
  - `--rs-text-spacing-bottom`, `--rs-list-spacing-bottom`

### Container component usage and breakpoints

- Astro API: `<Container size="full|wide|content|narrow" />` with default `wide`.
- BEM classes:
  - `.rs-container`
  - `.rs-container--full-width`
  - `.rs-container--wide`
  - `.rs-container--content`
  - `.rs-container--narrow`
- Breakpoints use `media-breakpoint-up` only:
  - `sm: 36rem`
  - `md: 48rem`
  - `lg: 62rem`
  - `xl: 75rem`
- Width behavior:
  - `wide`: `1200px`
  - `content`: `600px`, then `800px` at `lg`
  - `narrow`: `1000px` at `lg`
  - `full-width`: `100%` with zero horizontal padding

### Typography token-to-scale mapping

- `h1`: `to-rem(32)` -> `to-rem(36)` at `sm` -> `to-rem(44)` at `lg`
- `h2`: `to-rem(28)` -> `to-rem(32)` at `sm` -> `to-rem(38)` at `lg`
- `h3`: `to-rem(24)` -> `to-rem(28)` at `sm` -> `to-rem(32)` at `lg`
- `h4`: `to-rem(21)` -> `to-rem(24)` at `md`
- `h5`: `to-rem(18)`
- `h6`: `to-rem(16)` uppercase
- Body paragraph (`typography-p`): `to-rem(16)` -> `to-rem(17)` at `md`
- Intro text (`typography-intro`): `to-rem(19)` -> `to-rem(21)` at `md`

---

## Naming, BEM, and accessibility

- **BEM prefix:**
  - Use `rs` as the block prefix, e.g. `.rs-button`, `.rs-button__icon`, `.rs-button--primary`.
- **Variables:**
  - Use `--rs-*` for all design tokens and component variables (e.g. `--rs-primary-color`).
- **Accessibility:**
  - Aim for WCAG 2.1 AA as a floor and AAA where feasible.
  - Document a11y decisions and trade-offs in component docs and stories.

---

## Task list (agent-sized)

See `_planning/tasks.md` for the canonical list. High level:

- Tasks 1–7: planning only (this file, tasks file, and new rules).
- Tasks 8–16: initial build work (repo structure, base package, tokens, Container, Button, Link, Typography, Storybook, first planet theme package).

---

## Open questions

- Exact default content width (currently 800px assumed) and wide width (1200px assumed).
- Theme delivery (per-theme file vs single switchable file with `[data-theme="planet"]`).
- Final MVP token set breakdown beyond colors / typography / spacing.

