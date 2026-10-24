# Svelte Port Checklist

Copy the variant that matches the component into every Svelte component PR. It is the acceptance contract for a component built in `packages/svelte`.

- **Port variant**: a reviewed Astro original exists on `main`.
- **Svelte-first variant**: no Astro original exists on `main`.

## Part 1: Fixed decisions

These are settled. A component PR does not reopen them.

- **Target:** Svelte 5 with runes and TypeScript. One component per `.svelte` file.
- **Source of truth:** Astro. Every rule in `.agents/skills/rocketship-component/SKILL.md` and the decisions in `_planning/component-review-decisions.md` apply to Svelte.
- **Styles:** a copy of the Astro style block inside `:global { }` (port), or authored by the same rules (Svelte-first). Tokens only through `#{rs-token()}`; no hex, px or rem fallbacks; container queries only for layout changes.
- **References:** reviewed components only (Alert, Stack, Field, Label, Fieldset, Input, Textarea, Select, Checkbox, Radio, Table, Scroll). Open Astro PRs and pre-review components are never copied.
- **Shared design system:** tokens and mixins come from `@labcat2020/rocketship/styles` and the `./styles/mixins` barrel; nothing is duplicated.
- **Location:** `packages/svelte`; Storybook in `apps/svelte`.
- **Versions:** component PRs never bump `version`; merging to `main` publishes bumped packages.
- **Provisional status (Svelte-first):** Astro wins when the two diverge.

## Part 2: Per-task checklist

### Port variant

1. **Use the Astro reference.** Start from `packages/base/src/components/<Name>.astro`; the style block is identical inside `:global`.
2. **Preserve public behaviour.** Same `.rs-*` classes and props; `as` only if the Astro original has it.
3. **Record API differences.** Slots → snippets at minimum, and any breaking change to the published Svelte API.
4. **Update package hygiene.** Exports, `src/index.ts`, README, and the four test files named in the Svelte skill.
5. **Verify.** Tests, `svelte-check` and the root build pass; axe passes in light and dark.

### Svelte-first variant

1. **No Astro original on `main`.** Design from the decisions and the reviewed references. If an open Astro PR exists, note its number but do not port from it.
2. **Follow the rules.** Consumer-owned content elements, `rs-token()` only, hardcore BEM, no font-family, no outer margin, no props that re-declare native attributes, form decisions 14–39, table and scroll decisions 40–54.
3. **Record provisional status.** Astro is the source of truth on divergence.
4. **Update package hygiene.** As for the port variant.
5. **Verify.** As for the port variant.

### Copy-paste block for the PR

Port variant:

```markdown
## Svelte port checklist

- [ ] Based on `packages/base/src/components/<Name>.astro`; style block identical inside `:global`
- [ ] Same `.rs-*` classes and public props (`as` only where Astro has it)
- [ ] API differences and breaking changes recorded in this PR
- [ ] Exports, index, README and the four test files updated; no version bump
- [ ] Tests, svelte-check and root build pass; axe clean in light and dark
```

Svelte-first variant:

```markdown
## Svelte-first checklist

- [ ] No Astro original on `main`; designed from the decisions and reviewed references
- [ ] Open Astro PR #N noted (not ported from), if one exists
- [ ] Provisional status noted (Astro is source of truth on divergence)
- [ ] Exports, index, README and the four test files updated; no version bump
- [ ] Tests, svelte-check and root build pass; axe clean in light and dark
```
