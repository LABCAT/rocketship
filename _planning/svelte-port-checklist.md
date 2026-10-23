# Svelte Port Checklist

Copy the variant that matches the component into every Svelte component MR. It is the acceptance contract for a component built in `packages/svelte`.

- **Port variant** — an Astro original exists (a copy-style port, as today).
- **Svelte-first variant** — no Astro original exists; the component is designed in Svelte.

Both variants share the fixed decisions in Part 1; they differ only in the per-task items and the MR copy-paste block.

## Part 1: Fixed decisions

These are settled. A component MR does not reopen them.

- **Target:** Svelte 5 with runes and TypeScript. One component per `.svelte` file.
- **Styles:** either a copy-style port of the Astro component's style rule block (port path), or authored in Svelte following the same conventions (Svelte-first path). Do not redesign or re-tokenize an existing Astro block.
- **Shared design system:** tokens, mixins, and base resets are **not** duplicated. Import them from `@labcat2020/rocketship/styles`.
- **Location:** Svelte components live in `packages/svelte` (`@labcat2020/rocketship-svelte`). Their Storybook is a separate host in `apps/svelte`.
- **Deferred:** renaming `apps/frontend` to `apps/astro` is out of scope for component MRs.
- **Naming:** the BEM prefix `rs` and the `--rs-*` tokens are unchanged.
- **Conventions (Svelte-first):** BEM `rs-` classes, `--rs-*` tokens with the standard three-level fallback (`var(--rs-<name>-<hook>, var(--rs-<token>, <literal>))`), `:global { ... }` styles, container queries for sizing, a11y per `.agents/rules/rocketship-a11y.mdc`, and the typed-prop/polymorphic-tag pattern.
- **Provisional status (Svelte-first):** a Svelte-first component may need updates once the founder's "platinum standard" for the matching Astro component is defined or merged. **Astro is the source of truth when the two diverge** (tracked by a follow-up platinum pass task).

## Part 2: Per-task checklist

### Port variant

Every port MR must satisfy all five items.

1. **Use the Astro reference.** Start from `packages/base/src/components/<Name>.astro` and its SCSS rule block, and mirror that block in the Svelte component.
2. **Preserve public behaviour.** Keep the same `.rs-*` classes and the same public props: `as`, `variant`/`size`, `class`, and spread native attributes.
3. **Record API differences.** Note every intentional difference (for example Astro slots vs Svelte snippets) in the PR description.
4. **Verify a11y and visual parity.** Run axe through the Storybook a11y addon and compare the rendered output against the Astro component.
5. **Confirm placement.** State whether the component remains generic enough to belong in Rocketship.

### Svelte-first variant

Every Svelte-first MR must satisfy all five items.

1. **No Astro original.** There is no `packages/base/src/components/<Name>.astro`; the component is designed in Svelte. If an open Astro PR for the same component exists, consult it so the two converge (note its number).
2. **Follow the conventions.** Use the same BEM `rs-` classes, `--rs-*` tokens (standard fallback depth), `:global` styles, container queries, a11y, and typed-prop/polymorphic-tag pattern as a port, so a later Astro version can be ported back from it.
3. **Record provisional status.** Note in the PR description that the component is provisional and may change once the matching Astro "platinum standard" lands; Astro is the source of truth on divergence.
4. **Verify a11y.** Run axe through the Storybook a11y addon; there is no Astro component to compare against.
5. **Confirm placement.** State whether the component remains generic enough to belong in Rocketship.

### Copy-paste block for the MR

Port variant:

```markdown
## Svelte port checklist

- [ ] Based on `packages/base/src/components/<Name>.astro` and its SCSS rule block
- [ ] Same `.rs-*` classes and public props (`as`, `variant`/`size`, `class`, native attributes spread)
- [ ] Intentional API differences recorded in this PR
- [ ] Axe (Storybook a11y addon) passes and visual parity checked
- [ ] Placement stated (generic enough for Rocketship)
```

Svelte-first variant:

```markdown
## Svelte-first checklist

- [ ] No Astro original; conventions followed (BEM `rs-`, `--rs-*` tokens, `:global`, container queries, a11y, typed props)
- [ ] Open Astro PR #N consulted if one exists
- [ ] Provisional status noted (Astro is source of truth on divergence; platinum pass tracked)
- [ ] Axe (Storybook a11y addon) passes
- [ ] Placement stated (generic enough for Rocketship)
```
