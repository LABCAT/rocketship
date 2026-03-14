# MR: Tasks 12 and 13 (single MR — both required)

**You must deliver tasks 12 and 13 in this single merge request. Do not deliver only one of them. Both are required.**

---

## Scope of this MR

| Task | What to deliver |
|------|-----------------|
| **12** | Button component: `.rs-button` with BEM, `--rs-*` CSS variables, and container-query-based small/medium/large sizes. Astro `<Button>` (or equivalent). Stories cover primary variants and size behavior. |
| **13** | Link component: `.rs-link` with BEM, `--rs-*` CSS variables, and size variants; accessible focus and visited states. Astro `<Link>` (or equivalent). Stories show link in typical contexts. |
| **Stories** | Storybook stories for Button and Link in `apps/storybook`, with the a11y addon used. |

If you only implement 12 or only 13, the MR is incomplete. Stories for both components are required.

---

## Conventions (read first)

- **BEM:** Block prefix `rs`. `.rs-button`, `.rs-button--primary`, `.rs-button__icon`; `.rs-link`, `.rs-link--muted`. See `.cursor/rules/rocketship-bem-scss.mdc`.
- **Sizing:** Use **container queries** for component size (small/medium/large), not viewport media queries. See `.cursor/rules/rocketship-layout-responsive.mdc`.
- **Variables:** All design tokens and component variables use the `--rs-*` prefix (e.g. `--rs-button-bg`, `--rs-link-color`).

---

## Task 12: Button component

- **Astro:** Export a Button component in the base package. Supports: variant (e.g. primary, secondary, outline), size (small/medium/large — prefer size via container query where possible, or a size prop that sets a class), disabled state. Renders as `<button>` (or configurable element) with classes `.rs-button`, `.rs-button--primary`, `.rs-button--secondary`, `.rs-button--outline`, `.rs-button--small`, etc.
- **SCSS:** One file (e.g. `button.scss`) in the base package. Use `--rs-button-*` variables for colors, padding, border-radius, etc. Implement small/medium/large via **container queries** (e.g. `@container (min-width: ...)` and `.rs-button--small` / `--medium` / `--large`, or container-query-based rules without modifier classes). Import from the main styles entry.
- **Stories:** In `apps/storybook`, add stories for Button: default/primary, secondary, outline, disabled; show size behavior (small/medium/large, including in a narrow container). Run the a11y addon.

---

## Task 13: Link component

- **Astro:** Export a Link component. Supports: `href`, size or style variants (e.g. default, muted), and renders as `<a>` with classes `.rs-link`, `.rs-link--muted`, etc. Ensure it works with Astro’s routing if used for internal links (e.g. `<a href={href}>` or use Astro’s built-in handling).
- **SCSS:** One file (e.g. `link.scss`). Use `--rs-link-*` variables. **Accessibility:** clear focus style (visible focus ring) and distinct visited state (e.g. `:visited` color) so users can tell visited from unvisited links.
- **Stories:** In `apps/storybook`, add stories for Link: default, muted, inside typography, focus and visited states. Run the a11y addon.

---

## Storybook stories (required)

- **Button:** Stories for variants (primary, secondary, outline), sizes (small, medium, large), and disabled. Demonstrate container-query size behavior if applicable. Use a11y addon.
- **Link:** Stories in typical contexts (standalone, in text). Show focus and visited states. Use a11y addon.

Stories must import the base package styles so Button and Link render correctly.

---

## Checklist before submitting the MR

- [ ] **Task 12:** Astro Button component and `.rs-button` SCSS exist; `--rs-*` variables; sizes via container queries (or documented size modifiers); Storybook stories with a11y.
- [ ] **Task 13:** Astro Link component and `.rs-link` SCSS exist; `--rs-*` variables; accessible focus and visited states; Storybook stories with a11y.
- [ ] Both components are in the same MR; stories for both in `apps/storybook`.
- [ ] BEM and `--rs-*` naming used throughout.
