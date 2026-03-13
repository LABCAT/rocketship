# Rocketship Tasks (one agent per MR)

## Planning tasks (Phase 1)

1. **Create `_planning` folder and master plan doc**  
   - Files: `_planning/rocketship-plan.md` and this file.  
   - Done when: both exist, the plan contains vision/decisions/task list, and this file lists all tasks with brief acceptance criteria.

2. **Rule: `rocketship-overview.mdc`**  
   - Add high-level Rocketship overview (what the project is, CSS-first, package suite, Storybook, theming, container queries).  
   - Done when: file exists in `.cursor/rules/` with frontmatter + concise bullets and points to `_planning/rocketship-plan.md`.

3. **Rule: `rocketship-bem-scss.mdc`**  
   - Capture BEM (`rs`), SCSS usage, and `--rs-*` variable conventions.  
   - Done when: file exists with rules for class naming, variable usage, and “no inline styles for design.”

4. **Rule: `rocketship-layout-responsive.mdc`**  
   - Capture media-query-only-for-layout rule, container component, and container queries for sizes.  
   - Done when: file exists specifying breakpoints, container modifiers, and container-query sizing.

5. **Rule: `rocketship-themes.mdc`**  
   - Capture default + planet theme model and CSS-only theming.  
   - Done when: file exists describing default theme, planet theme packages, and CSS-variable-based theming.

6. **Rule: `rocketship-a11y.mdc`**  
   - Capture accessibility expectations (WCAG, semantic HTML, Storybook a11y usage).  
   - Done when: file exists describing targets and expectations for a11y in components and stories.

7. **Review and adjust tasks**  
   - Ensure this file reflects the current roadmap and add new tasks when scope grows.

## Build tasks (later phases)

8. **Repo structure**  
   - Add `packages/` (e.g. `packages/base`) and `apps/storybook`, update `pnpm-workspace.yaml`.  
   - No new code beyond minimal scaffolding.

9. **Base package scaffold**  
   - Create `@rocketship/base` with package.json, tsconfig, and minimal SCSS entry point; hook into workspace.  
   - No components exported yet.

10. **Design tokens + default theme**  
    - Define minimal `--rs-*` tokens for colors, typography, spacing; implement default theme in base package.  
    - Document tokens in `_planning/rocketship-plan.md`.  
    - **Combined MR:** Use prompt `_planning/prompt-tasks-10-11-14.md` — **must deliver 10, 11, and 14 together.**

11. **Container component**  
    - Implement Astro Container component + SCSS; support `full`, `wide`, `content` modifiers and `media-breakpoint-up` only.  
    - Document usage and breakpoints.  
    - **Combined MR:** Same as task 10 (see prompt above).

12. **Button component**  
    - Implement `.rs-button` with BEM, CSS variables, and container-query-based small/medium/large sizes.  
    - Stories cover primary variants and size behavior.

13. **Link component**  
    - Implement `.rs-link` with BEM, CSS variables, and size variants; focus on accessible focus and visited states.  
    - Stories show link in typical contexts.

14. **Typography components/utilities**  
    - Implement heading/text primitives or utilities using tokens; support size variants via container queries.  
    - Document mapping between tokens and visual scale.  
    - **Combined MR:** Same as tasks 10 and 11 (see `_planning/prompt-tasks-10-11-14.md`); **all three tasks required in one MR.**

15. **Storybook app**  
    - Add `apps/storybook` with Storybook for Astro, wired to `@rocketship/base`.  
    - Add stories for Container, Button, Link, Typography + a11y addon.

16. **First planet theme package**  
    - Implement one planet theme package (e.g. `@rocketship/theme-mars`) with CSS variable overrides only.  
    - Document how to apply it in Astro + Storybook.
