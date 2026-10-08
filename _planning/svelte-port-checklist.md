# Svelte Port Checklist

Copy this checklist into every Svelte port MR. It is the acceptance contract for porting one Astro component to Svelte.

## Part 1: Fixed decisions

These are settled. A port MR does not reopen them.

- **Target:** Svelte 5 with runes and TypeScript. One component per `.svelte` file.
- **Copy-style port:** the Svelte component mirrors the corresponding Astro component's style rule block. Port the styles as-is; do not redesign them.
- **Shared design system:** tokens, mixins, and base resets are **not** duplicated. Import them from `@labcat2020/rocketship/styles`.
- **Location:** Svelte components live in `packages/svelte` (`@labcat2020/rocketship-svelte`). Their Storybook is a separate host in `apps/svelte`.
- **Deferred:** renaming `apps/frontend` to `apps/astro` is out of scope for port MRs.
- **Naming:** the BEM prefix `rs` and the `--rs-*` tokens are unchanged.

## Part 2: Per-task checklist

Every port MR must satisfy all five items.

1. **Use the Astro reference.** Start from `packages/base/src/components/<Name>.astro` and its SCSS rule block, and mirror that block in the Svelte component.
2. **Preserve public behaviour.** Keep the same `.rs-*` classes and the same public props: `as`, `variant`/`size`, `class`, and spread native attributes.
3. **Record API differences.** Note every intentional difference (for example Astro slots vs Svelte snippets) in the PR description.
4. **Verify a11y and visual parity.** Run axe through the Storybook a11y addon and compare the rendered output against the Astro component.
5. **Confirm placement.** State whether the component remains generic enough to belong in Rocketship.

### Copy-paste block for the MR

```markdown
## Svelte port checklist

- [ ] Based on `packages/base/src/components/<Name>.astro` and its SCSS rule block
- [ ] Same `.rs-*` classes and public props (`as`, `variant`/`size`, `class`, native attributes spread)
- [ ] Intentional API differences recorded in this PR
- [ ] Axe (Storybook a11y addon) passes and visual parity checked
- [ ] Placement stated (generic enough for Rocketship)
```
