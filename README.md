# Rocketship

Astro-focused, CSS-first component library monorepo.

- **`packages/base`:** `@rocketship/base` — design tokens, default theme, and core Astro components
- **`apps/frontend`:** Storybook host (Astro app only exists so Storybook can run)

> Node 24 is required (`package.json` `engines.node` — used by fnm). Use `pnpm` for all commands.

## Quick start

```bash
fnm use            # installs/uses Node from engines.node if needed
pnpm install
pnpm dev           # Storybook (http://localhost:6006)
```

## Workspace layout

| Path         | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `packages/`  | Publishable library packages (start with `@rocketship/base`) |
| `apps/`      | Internal apps (Storybook host today; room for more later)    |
| `_planning/` | Vision, roadmap, and task list                               |

Root `package.json` only orchestrates workspace scripts and shared tooling (Prettier, TypeScript).

## Common scripts

| Command                       | Action                                                    |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm dev` / `pnpm storybook` | Start Storybook                                           |
| `pnpm build`                  | Build packages, then Storybook                            |
| `pnpm build:storybook`        | Build static Storybook (`apps/frontend/storybook-static`) |
| `pnpm format`                 | Format the repo with Prettier (includes `.astro`)         |
| `pnpm format:check`           | Check formatting without writing                          |

## Library notes

- Components use **BEM** with an `rs` prefix and **CSS custom properties** (`--rs-*`).
- Prefer **SCSS/CSS over JavaScript**; theming is CSS-variable based.
- Planning source of truth: [`_planning/rocketship-plan.md`](_planning/rocketship-plan.md).
