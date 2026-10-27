# Rocketship

Rocketship is a CSS-first component library for Astro and Svelte.

- Style almost everything with CSS variables, from the global design tokens down to each component
- Plain BEM classes for anything the variables don't cover
- Light and dark mode built in
- Design tokens in the [W3C standard format](https://www.designtokens.org/tr/2025.10/format/), so your Figma designs can use the same colours and spacing as the code

## Packages

| Package                                                      | Install                                                         | Storybook                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------- |
| [`@labcat2020/rocketship`](packages/base/README.md)          | `pnpm add @labcat2020/rocketship`                               | [Astro Storybook](https://rocketship3000.pages.dev)  |
| [`@labcat2020/rocketship-svelte`](packages/svelte/README.md) | `pnpm add @labcat2020/rocketship-svelte @labcat2020/rocketship` | [Svelte Storybook](https://rocketship3030.pages.dev) |

## Contributing

You'll need Node 26 and pnpm.

```bash
pnpm install
pnpm dev               # Astro Storybook on http://localhost:6006
pnpm storybook:svelte  # Svelte Storybook on http://localhost:6007
```

Before creating a pull request, run the following checks:

```bash
pnpm lint:styles
pnpm --filter @labcat2020/rocketship test
pnpm build:packages
pnpm --filter @labcat2020/rocketship-svelte check
pnpm --filter @rocketship/svelte-storybook test
```
