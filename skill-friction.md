# Skill friction — rocketship-component

Skill version: `e990f95` (`git log --oneline -1 -- .agents/skills/`) at the start of RCL-30 (checkbox + radio).

Observations from authoring `Checkbox.astro` and `Radio.astro`. Nothing was
changed in the skill or its process; these are open questions for a future
revision.

## 1. "Always include `as?:`" conflicts with control components

The non-negotiable Props list says _"always include `as?:` (polymorphic tag)"_.
Checkbox and Radio must render a `<label>` as their root — a `span`/`div` root
would break the implicit label-input association (`.agents/rules/rocketship-a11y.mdc`
bans non-semantic roots for controls). The newest component (`Alert.astro`)
already omits `as`, so the rule is enforced inconsistently.

Proposal: soften to "include `as` when the root supports polymorphism"; name
`Alert` (no `as`) and `Checkbox`/`Radio` (label root) as the legitimate
exceptions.

## 2. Tier awareness does not cover native form-control state pseudo-classes

The Tier list flags `:has()`, `[open]`, `::backdrop`, `popover`, and
focus-trapping as novel interactive-state primitives. For checkbox/radio the
interactive state layer came entirely from standard CSS: `:checked`, `:disabled`,
`:indeterminate`, `:focus`, `:focus-visible`, plus sibling selectors
(`.rs-checkbox__input:checked ~ .rs-checkbox__control`). No JS and no flagged
pattern were needed. The tier list should call these out as the existing
form-control precedent so the next author knows native input state selectors are
in-bounds.

## 3. Focus-visibility rule is ambiguous about `:focus` vs `:focus-visible`

`Button.astro` uses `:focus-visible` only. `Checkbox`/`Radio` use plain `:focus`
on the visual control so the ring shows for _any_ focus method, including
programmatic/`autofocus`, which is how the "Focused" story demonstrates the
state. The a11y rule "Focus must be visible (outline 2px solid + offset)" does
not say which pseudo-class a leaf control should prefer. Worth a sentence in
`rocketship-a11y.mdc` stating that form controls favor constant `:focus` while
chrome-level controls use `:focus-visible`.

## 4. No guidance on sharing styles between sibling controls

"Never create separate component `.scss` files" forces Checkbox and Radio to
carry near-identical control/state SCSS in their own `<style>` blocks (the
token names differ: `--rs-checkbox-*` vs `--rs-radio-*`). The barrel ban means
the only sanctioned sharing is a new `mixins/` partial, which a single component
MR can't add without touching the shared barrel (forbidden by the parallel-work
contract). Two options to document: accept the duplication, or allow form-control
SCSS under `styles/mixins/form/` as a deliberate exception.

## 5. State-matrix stories vs "one aspect per story" is ambiguous

The rules say a multi-example comparison exports `Variants`, otherwise `Default`,
and "only add extra stories when there is genuinely more than one aspect." A
control's states (checked / disabled / invalid / indeterminate) feel like one
aspect, so they were stacked in a `States` story — but the rule never defines a
"states" story for a leaf control, and the focused state is not capturable in a
static stack (only one element can hold focus) so it needed a third, own-story
wrapper. Also, the skill only documents the single-story CSF; using per-story
`component:` overrides (which `@storybook-astro/framework` supports — see
`render.js` reading `context.component`) to serve multiple wrappers from one
`<Name>.stories.tsx` is undocumented.

## 6. WCAG 2.2 target size not mentioned

~20px control + adjacent clickable label meets the 24px target rule, but the
a11y rule file only cites contrast and focus. A one-line note (native inputs +
wrapping `<label>` are the compliant default; keep the whole label clickable)
would preempt the question for every future form component.

## 7. Per-story `component:` overrides do not work with the Astro framework

The skill shows one `component` in meta and implies extra stories are added to
the same `<Name>.stories.tsx`. With `@storybook-astro/framework` 1.10 a story
object's `component:` override is ignored (it always renders `meta.component` —
verified via `render.js`, which reads `context.component`, and by running the
built Storybook: the States story rendered the Default wrapper). Multiple
stories for one component require **separate CSF files sharing a title**
(e.g. `Checkbox.states.stories.tsx` with `title: 'Components/Checkbox'`), which
is exactly how `Button.variants` / `Button.sizes` already work but is nowhere in
the skill. This also explains why the static build's `astro-prerendered-stories.json`
only contains the `Default` stories.

## 8. Do not emit `aria-checked="mixed"` on a native checkbox

For the indeterminate state I first rendered `aria-checked="mixed"` on
`<input type="checkbox">`. Axe (4.11.1) flags this as `aria-conditional-attr`
(serious), because the native `checked` attribute must mirror the ARIA value and
no `checked` state can represent "mixed". The correct zero-JS approach: drive the
indeterminate _visual_ from CSS-only triggers — the native `:indeterminate`
pseudo-class (matches when consumers set the DOM property themselves) plus a
block modifier (`.rs-checkbox--indeterminate`) for the static-prop case — and
leave ARIA to the native input. Worth a line in the a11y rules: for native form
controls, native state is the accessibility truth; never layer ARIA state that
contradicts it.
