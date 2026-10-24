---
name: rocketship-component-svelte
description: 'Port or create a Rocketship Svelte component. Use when asked to add, build, or port a component in packages/svelte (Svelte 5 runes + TypeScript + SCSS + BEM rs- prefix + --rs-* tokens), usually by translating the reviewed Astro component in packages/base, including its Storybook stories in apps/svelte.'
---

# Rocketship component (Svelte)

Astro is the source of truth. Port a component by copying the reviewed Astro file and translating its syntax. Change nothing else.

## 1. Read the rules

All of `.agents/rules/` applies: `rocketship-svelte.mdc`, `rocketship-component-api.mdc`, `rocketship-bem-scss.mdc`, `rocketship-a11y.mdc`, `rocketship-layout-responsive.mdc`, `rocketship-stories.mdc`, `rocketship-story-copy.mdc`, `rocketship-typescript.mdc`.

## 2. Pick the path

- **Port**: the component exists in `packages/base/src/components/` and is reviewed: Alert, Stack, Field, Label, Fieldset, Input, Textarea, Select, Checkbox, Radio, Table, Scroll. Copy it. Also read its section in `.agents/skills/rocketship-component/references/patterns.md`.
- **Svelte-first**: no Astro original on `main`. Build from the rules and the closest reference in the Astro skill's table. Say in the PR that it is provisional: Astro wins.
- Never copy from an open Astro PR. If one exists for your component, put its number in your PR.

## 3. Check the Svelte status

| Svelte file                                                                              | Status                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Alert.svelte`                                                                           | Current, except its `Props` type: a fixed `div` root uses `HTMLAttributes<HTMLDivElement>`. |
| `Stack.svelte`                                                                           | Current except the `xlarge` gap. Add it.                                                    |
| `Field`, `Label`, `Input`, `Textarea`, `Select`, `Table`                                 | Pre-review. Port again from Astro.                                                          |
| `Fieldset` (PR #62)                                                                      | Copies an unreviewed design. Port again from Astro.                                         |
| `Checkbox`, `Radio`, `Scroll`                                                            | Not ported yet.                                                                             |
| `Accordion`, `Button`, `Card`, `Container`, `Disclosure`, `Figure`, `Grid`, `Typography` | Pre-review. Never copy.                                                                     |

- Before Checkbox or Radio: port Field's `inline`, Label's `--rs-label-offset`, Fieldset's `__hint` / `__error` and Stack's `xlarge`.
- Port Table together with Scroll.

## 4. Translate

Copy `packages/base/src/components/<Name>.astro` to `packages/svelte/src/components/<Name>.svelte` and change only this:

| Astro                                                                      | Svelte                                                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `---` frontmatter                                                          | `<script lang="ts">`                                                                                                                        |
| `import type { HTMLAttributes } from 'astro/types'`                        | `import type { HTMLAttributes } from 'svelte/elements'` and `import type { Snippet } from 'svelte'`                                         |
| `HTMLAttributes<'div'>`                                                    | `HTMLAttributes<HTMLDivElement>`; `HTMLLabelAttributes`, `HTMLInputAttributes` etc. for other tags; `HTMLAttributes<HTMLElement>` with `as` |
| `const { … } = Astro.props as Props`                                       | `let { …, children, ...attrs }: Props = $props()`                                                                                           |
| `class: className`                                                         | `class: className = ''`                                                                                                                     |
| `const classes = [ … ]` + `class:list={classes}`                           | `const classes = $derived([ … ].filter(Boolean).join(' '))` + `class={classes}`                                                             |
| `cond && 'rs-x--y'`                                                        | `cond ? 'rs-x--y' : undefined`                                                                                                              |
| `<slot />`                                                                 | `{@render children?.()}`, with `children?: Snippet` in `Props`                                                                              |
| `{Astro.slots.has('legend') && <legend …><slot name="legend" /></legend>}` | `{#if legend}<legend …>{@render legend()}</legend>{/if}`, with `legend?: Snippet` in `Props`                                                |
| `const Tag = as` + `<Tag …>`                                               | `<svelte:element this={as} …>`; `as` keeps the Astro default                                                                                |
| `<style is:global lang="scss">`                                            | `<style lang="scss">` with every rule inside `:global { … }`                                                                                |
| `@use '../styles/mixins' as *;`                                            | `@use '@labcat2020/rocketship/styles/mixins' as *;`                                                                                         |

Selectors, declarations and their order stay exactly the same. Skeleton: [component-template.md](./references/component-template.md).

## 5. Register

- `packages/svelte/package.json` → `exports`: `"./components/<Name>": "./src/components/<Name>.svelte"` (the same key as Astro).
- `packages/svelte/src/index.ts`: the value export and its type exports.
- `packages/svelte/README.md`: the components table row, the props table and a `### <Name>` section.
- Never bump `version`.

## 6. Stories

`apps/svelte/src/stories/<Name>.stories.ts` and `apps/svelte/src/stories/components/<Name>Default.svelte`. Mirror the Astro stories: same title, same examples.

## 7. Update the tests

- `packages/svelte/test/components.test.mjs`: API and compiled-CSS tests for the component.
- `packages/svelte/test/consumer-install.test.mjs`: the published subpath list and the block-class map.
- `packages/svelte/test/a11y.test.mjs`: the story fixture list. A story missing here never reaches axe.
- `apps/svelte/test/storybook-host.test.mjs`: story structure tests.

## 8. Verify

Run from the repo root:

```bash
pnpm --filter @labcat2020/rocketship-svelte test
pnpm --filter @labcat2020/rocketship-svelte check
pnpm --filter @rocketship/svelte-storybook test
pnpm build
```

- Run `pnpm storybook:svelte` and check every story in light and dark with no axe violations.
- Port path: diff your style block against the Astro original. Inside `:global` it must be identical.

## 9. Open the PR

Paste the checklist from `_planning/svelte-port-checklist.md`. List every difference from the Astro original (at least slots → snippets) and any breaking change to the published Svelte API.
