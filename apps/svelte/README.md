# Rocketship Svelte Storybook host

Svelte Storybook host for `@labcat2020/rocketship-svelte`. It is separate from the Astro host in `apps/frontend` and does not replace it.

Stories render components from `@labcat2020/rocketship-svelte`, which reuses the Rocketship design system from `@labcat2020/rocketship`.

## Commands

Run from the repository root:

| Command                       | Action                                            |
| ----------------------------- | ------------------------------------------------- |
| `pnpm storybook:svelte`       | Start Storybook (`http://localhost:6007`)         |
| `pnpm build:storybook:svelte` | Build Storybook to `apps/svelte/storybook-static` |
