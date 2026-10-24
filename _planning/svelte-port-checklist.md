# Svelte port checklist

Paste the matching block into every Svelte component PR. The steps are in `.agents/skills/rocketship-component-svelte/SKILL.md`.

- **Port**: a reviewed Astro original exists on `main`.
- **Svelte-first**: no Astro original exists on `main`.

## Port

```markdown
## Svelte port checklist

- [ ] Based on `packages/base/src/components/<Name>.astro`; style block identical inside `:global`
- [ ] Same `.rs-*` classes and public props (`as` only where Astro has it)
- [ ] API differences and breaking changes recorded in this PR
- [ ] Exports, index, README and the four test files updated; no version bump
- [ ] Tests, svelte-check and root build pass; axe clean in light and dark
```

## Svelte-first

```markdown
## Svelte-first checklist

- [ ] No Astro original on `main`; designed from the rules and reviewed references
- [ ] Open Astro PR #N noted (not ported from), if one exists
- [ ] Provisional status noted (Astro is source of truth on divergence)
- [ ] Exports, index, README and the four test files updated; no version bump
- [ ] Tests, svelte-check and root build pass; axe clean in light and dark
```
