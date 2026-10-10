# Rocketship

Astro-focused, CSS-first component library monorepo.

- **`packages/base`:** `@labcat2020/rocketship` — design tokens, default theme, and core Astro components
- **`apps/frontend`:** Storybook host (Astro app only exists so Storybook can run)

> Node 26 is required (`package.json` `engines.node` — used by fnm). Use `pnpm` for all commands.

## Quick start

```bash
fnm use            # installs/uses Node from engines.node if needed
pnpm install
pnpm dev           # Storybook (http://localhost:6006)
```

## Workspace layout

| Path         | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `packages/`  | Publishable library packages (start with `@labcat2020/rocketship`) |
| `apps/`      | Internal apps (Storybook host today; room for more later)    |
| `_planning/` | Vision, roadmap, and task list                               |

Root `package.json` only orchestrates workspace scripts and shared tooling (Prettier, TypeScript).

## Common scripts

| Command                       | Action                                                    |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm dev` / `pnpm storybook` | Start Storybook                                           |
| `pnpm build`                  | Build packages, then Storybook                            |
| `pnpm build:storybook`        | Build static Storybook (`apps/frontend/storybook-static`) |
| `pnpm preview`                | Serve the static Storybook build                          |
| `pnpm format`                 | Format the repo with Prettier (includes `.astro`)         |
| `pnpm format:check`           | Check formatting without writing                          |

## Library notes

- Components use **BEM** with an `rs` prefix and **CSS custom properties** (`--rs-*`).
- Prefer **SCSS/CSS over JavaScript**; theming is CSS-variable based.
- Planning source of truth: [`_planning/rocketship-plan.md`](_planning/rocketship-plan.md).

## CI and gated previews

A pull request is not ready for founder review just because CI is green. The
visible Storybook preview is published only after the PR agent calls the PR
merge-ready.

1. **`opencode-review.yml`** reviews every PR. When the review passes it adds
   the `preview-ready` label; when a later review requests changes it removes the
   label. The label is only kept while the review matches the current head
   commit, so a new push must be re-reviewed before the label returns.
2. **`preview-deploy.yml`** is the only thing that reacts to the label. It builds
   the Storybook and publishes one Cloudflare Pages preview when `preview-ready`
   is added, and does nothing when the label is absent or removed. Production
   deploys are untouched — the workflow runs only for pull requests and only ever
   publishes previews.
3. The founder remains the only merge authority; merging to `main` deploys
   production exactly as before.

One Cloudflare Pages setting is required for this gate (founder action):
in the `rocketship3000` project go to **Settings → Builds & deployments →
Configure Preview deployments** and turn off automatic preview branch
deployments (**None**), leaving production branch deployments enabled. Without
that change Cloudflare still builds a preview on every push, before the label is
added. The repository needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
Actions secrets for `preview-deploy.yml`.
