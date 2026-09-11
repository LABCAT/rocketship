# Skill friction — rocketship-component

Skill version audited: `e990f95` (`git log --oneline -1 -- .agents/skills/`)
Component delivered against it: `Select` (RCL-31).

Notes on what was missing, wrong, or ambiguous while authoring the Select
component. None of these blocked the work; they are recorded so the skill can
evolve deliberately.

## 1. `as?:` is listed as a non-negotiable, meaningless for native form controls

Procedure step 1 lists `as?:` (polymorphic tag) as a non-negotiable prop. For a
native `<select>` there is no legitimate alternate root tag — the root must stay
`<select>` to keep form semantics, name/value submission, and keyboard behavior.
Button/Card/Grid/Container are all wrappers; Select is the first component whose
root is forced by the platform.

**Decision:** Select deliberately omits `as`. Suggestion: the template should
say `as?:` applies to _wrapper_ components; form controls (select/checkbox/radio)
may omit it.

## 2. A form control needs a wrapper + control + icon structure, not "single root tag"

Procedure says "single root tag via dynamic Tag" and Card-style BEM. A select with
a custom chevron requires a block wrapper (`span.rs-select`) holding a native
`select.rs-select__control` plus an `svg.rs-select__icon`. This introduces:

- `:focus-visible` on the control (not the block) — fine and Button-like.
- A disabled-state relationship between siblings done with
  `.rs-select__control:disabled + .rs-select__icon`, because the block cannot be
  selected on its child's state without `:has()`, which the skill flags as a
  novel pattern. (No `:has()` was used.)

Suggestion: add a short "form control" pattern to the skill (wrapper block +
control element + decorative icon element, state styling pushed to the native
element) so later checkbox/radio/range work has a reference.

## 3. Ambiguity: "size variants via @include container-query-up"

The skill ties size variants to container queries, but Button implements sizes
as an explicit `size` prop (small/medium/large) with container queries _scaling_
those sizes. Selected-follows-Button: explicit `size` prop, with `$rs-cq-sm`
bumping touch target (min-height/padding) but not font. Two ambiguities worth
making explicit:

- Whether font-size should scale with the container (Button does; Select does
  not — form controls keep type size stable). Select's choice is intentional.
- The native `<select size>` attribute (visible row count) collides with the
  `size` variant prop. Select type-guards the prop and forwards numeric/non-literal
  values to the native attribute; the skill has no guidance on attribute/prop
  name collisions with native HTMLAttributes.

## 4. Size tokens live in variables.scss for Button; Select defines them in-component

Button's per-size tokens (`--rs-button-min-height-sm`, `-sm-cq`, …) are global
`:root` values in `variables.scss`. Per the parallel-work contract, `variables.scss`
is read-only, so Select's per-size opt-in hooks (`--rs-select-min-height-sm` …) are
defined as component-level defaults on `.rs-select`. If the team wants a single
home for control-size tokens, `variables.scss` consolidation should be a shared/design
change, not a component change. So noted in the MR description.

## 5. Only one story shape is documented; multi-aspect stories are an established but undocumented pattern

The skill documents a single `Default` story. `Select` ships four stories
(`Default`, `States`, `Focused`, `Sizes`) as separate files sharing the
`Components/Select` title — the pattern used by `Button.variants` / `Button.sizes`
but never described in the skill. Suggestion: document the "one aspect per story =
one wrapper file + one story file, shared title" shape explicitly.

## 6. No guidance on focus-demonstration stories

Rule "all interactive components should have stories that include keyboard
interaction examples". In a static Astro wrapper the only way to show the
`:focus-visible` ring is programmatic focus. The repo has no `@storybook/test`
dependency and no precedent `play` functions. Select's Focused story uses a
`play` callback with a plain DOM query (`canvasElement.querySelector('select').focus()`).
Suggestion: standardize either this pattern or add `@storybook/test` to the
frontend devDeps, and document it.

## 7. a11y verification is addon-only; no runnable check exists in-repo

`parameters: { a11y: { disable: false } }` is set on all Select stories and they
pass axe (verified against the static build: 0 violations, 0 incomplete, using the
same rule exclusions the addon applies to iframe previews — `landmark-one-main`,
`page-has-heading-one`, `region`, `bypass`). There is no in-repo script/CI to run
axe headlessly; verification was done ad hoc with Playwright + axe-core against
`storybook build` output. Suggestion: a `test:a11y` script (e.g. Storybook test
runner or a Playwright + axe scan) would make the "run accessibility tests" step
repeatable.

## 8. Story copy rule vs. form-control semantics

`.agents/rules/rocketship-story-copy.mdc` and the wrapper rules say wrappers import
"only @labcat/rocketship components". Every Select story needs an associated
`<label>` (axe `select-name`). No label/Field component exists yet (RCL-32 work),
so stories use a native `<label>` + native `<option>`/`<optgroup>`. Native HTML
used for a11y semantics and data content is worth an explicit carve-out in the
wrapper rules.
