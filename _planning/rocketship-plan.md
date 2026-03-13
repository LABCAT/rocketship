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

### Button token layer

- Base button style tokens:
  - `--rs-button-bg`, `--rs-button-color`, `--rs-button-border-color`
  - `--rs-button-border-radius`, `--rs-button-font-size`, `--rs-button-min-height`
  - `--rs-button-padding-inline`, `--rs-button-focus-ring-color`
- Size behavior:
  - Explicit modifiers: `.rs-button--small`, `.rs-button--medium`, `.rs-button--large`
  - Container-aware sizing: `.rs-button--auto-size` using named container `rs-component`
  - Container thresholds: `--rs-cq-sm`, `--rs-cq-md`

### Link token layer

- Base link style tokens:
  - `--rs-link-color`, `--rs-link-hover-color`, `--rs-link-visited-color`
  - `--rs-link-font-size`, `--rs-link-line-height`
  - `--rs-link-underline-offset`, `--rs-link-underline-thickness`
  - `--rs-link-focus-ring-color`
- Size behavior:
  - Explicit modifiers: `.rs-link--small`, `.rs-link--medium`, `.rs-link--large`
  - Container-aware sizing: `.rs-link--auto-size` using named container `rs-component`

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

