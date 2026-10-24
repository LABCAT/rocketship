---
name: rocketship-component
description: 'Create a new Rocketship Astro component by copying a reviewed reference. Use when asked to add, build, or scaffold a component in packages/base (Astro + SCSS + BEM rs- prefix + --rs-* tokens), including its Storybook stories in apps/frontend.'
---

# Rocketship component (Astro)

Build a component in `packages/base` by copying the closest reviewed reference and changing only what the new component needs.

## 1. Read the rules

They are binding.

- `.agents/rules/rocketship-component-api.mdc`: props and markup
- `.agents/rules/rocketship-bem-scss.mdc`: styles
- `.agents/rules/rocketship-a11y.mdc`: accessibility
- `.agents/rules/rocketship-layout-responsive.mdc`: media and container queries, scrolling
- `.agents/rules/rocketship-stories.mdc` and `rocketship-story-copy.mdc`: stories
- `.agents/rules/rocketship-typescript.mdc`: functions

## 2. Pick the reference

Copy only these files from `packages/base/src/components/`:

| Building                                 | Copy                                            | Also read in `references/patterns.md` |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| Content block with variants              | `Alert.astro`                                   | —                                     |
| Layout primitive with `as`               | `Stack.astro`                                   | —                                     |
| Region the placer constrains (scrolling) | `Scroll.astro`                                  | Scroll                                |
| Form wrapper, label or group             | `Field.astro`, `Label.astro`, `Fieldset.astro`  | Forms                                 |
| Text control                             | `Input.astro`, `Textarea.astro`, `Select.astro` | Text controls                         |
| Choice control                           | `Checkbox.astro`, `Radio.astro`                 | Choice controls                       |
| Structured content (rows, cells)         | `Table.astro`                                   | Table                                 |

Button, Card, Container, Grid and Typography predate the review. Never copy them. A button-like control may read `Button.astro`, but follows the rules wherever it differs.

## 3. Stop and ask Shane if

- The component needs `:has()`, `[open]`, `::backdrop`, `popover`, focus trapping or JavaScript state. Shane writes the first one by hand.
- A token you need does not exist, or no token states the role you need.
- Nothing in the table above is close.

## 4. Create the files

1. `packages/base/src/components/<Name>.astro`: copy the reference. Rename `Alert` → `<Name>` and `rs-alert` → `rs-<name>` everywhere. Keep the order: frontmatter, markup, `<style is:global lang="scss">`. Skeleton: [component-template.md](./references/component-template.md).
2. `packages/base/package.json` → `exports`: add `"./components/<Name>": "./src/components/<Name>.astro"`. When rebuilding a pre-review component, also remove it from `ignoreFiles` in `stylelint.config.mjs`.
3. `apps/frontend/src/stories/<Name>.stories.tsx` and `apps/frontend/src/stories/components/<Name>Default.astro`: see the template and `rocketship-stories.mdc`.

## 5. Verify

Run from the repo root:

```bash
pnpm lint:styles
pnpm --filter @labcat2020/rocketship build
pnpm --filter @labcat2020/rocketship test
pnpm build
```

Then run `pnpm storybook` and check every story:

- in light and dark (toolbar colour-scheme switch);
- with no axe violations (Accessibility panel).

Finally, diff your file against its reference: same section order, same naming style, `rs-token()` everywhere. List any deliberate difference in the PR.
