# Rocketship Storybook host

Astro 7 app that exists to run Storybook for `@labcat/rocketship`. There is no public Astro homepage; `src/pages` is kept only so Astro does not warn. Storybook is the only served UI.

## Commands

Run from the repository root:

| Command                | Action                                              |
| ---------------------- | --------------------------------------------------- |
| `pnpm dev`             | Start Storybook (`http://localhost:6006`)           |
| `pnpm build:storybook` | Build Storybook to `apps/frontend/storybook-static` |
| `pnpm preview`         | Serve the static build (`http://localhost:6006`)    |
