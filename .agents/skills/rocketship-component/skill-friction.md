# Skill friction log — rocketship-component

Skill version at session start: `e990f95` (`git log --oneline -1 -- .agents/skills/`).
Session: RCL-32 Field layout + Label components (`rcl/32-field-layout`).

Notes below record what was missing, ambiguous, or wrong in the skill while
authoring the `Field` and `Label` components. Nothing here proposes a code
change; it is the basis for a future skill revision.

## Missing: form a11y semantics and label↔control wiring

`rocketship-a11y.mdc` and the skill's "A11y semantics" section cover roles,
headings, and focus, but say nothing about form-field wiring: `for`/`id`
pairing, `aria-describedby` from a control to helper/error text, or the
required-asterisk technique (decorative `aria-hidden` asterisk + visually
hidden `(required)` so the accessible name stays complete).

Practical consequences in this session:

- I had to build a per-component visually-hidden helper (`.rs-label__sr-only`)
  because no shared `sr-only`/visually-hidden utility exists. A shared utility
  in `common/base.scss` (or guidance to implement it per component) would
  benefit every future form component. I scoped it inside `Label` to avoid a
  shared-file change under the parallel-work contract; worth deciding globally
  before the form-control batch lands.
- `Field` needs `hintId`/`errorId` props so adopters can point the control's
  `aria-describedby` at helper/error text. The skill's named-slot guidance
  (`Astro.slots.has(...)`) covers rendering wrappers but not "where do the ids
  come from for a11y wiring".

## Ambiguous: which `HTMLAttributes<...>` to extend

The template and all five existing components extend `HTMLAttributes<'div'>`
even when the default tag differs (Container, Grid, Typography, Alert all root
as the tag they extend). For `Label` the natural default tag is `label`, and
only `HTMLAttributes<'label'>` provides the `for` attribute. The skill should
state: extend the attributes of the component's default tag, not always `div`.
Also note `for` cannot be destructured in plain JS without an alias
(`for: htmlFor`), which is worth calling out as a footgun.

## Ambiguous: a component that is itself a query container

The skill says size via container queries but never covers a component that
*also* establishes a container for its descendants. `.rs-field` sets
`container-type: inline-size; container-name: rs-component` (like `Container`)
so a nested `.rs-label` scales against the field's width. Its own `@container`
rules then resolve against an *ancestor* container, not itself. This
element ≠ context distinction is easy to get backwards; document it.

## Missing: native-control placeholder guidance in stories

The form-control components (Select, Checkbox/Radio, File/Range, Fieldset) are
being delivered in parallel (RCL-28–31) and did not exist when these stories
were written. The skill gives no guidance on what to render inside a
layout/label story when the composed control components are not yet shipped.
This session used unstyled native `<input>/<select>/<textarea>` as stand-ins;
that is fine for demonstrating the layout contract but leaves the stories
browser-styled until sibling components land. Worth a sentence or two in the
skill (stories may use native elements as placeholders; a future pass swaps in
the real controls).

## Verification: color contrast cannot be checked in jsdom

`Verify` says "axe reports no violations" from Storybook. In a headless/CI
context there is no browser, and jsdom cannot resolve `var(...)` or
`@container`, so `color-contrast` always reports `incomplete`. Verify contrast
numerically for each authored color pair (all pairs in RCL-32 pass AA) or spin
up a real browser. The skill doesn't mention this limitation.

## Naming

The plan/task language says "field layout", but the component was delivered as
`Field` (block `rs-field`): it reads as a unit, matches the "field" concept,
and pairs cleanly with the sibling `rs-fieldset`. Card was the correct
reference component (layout wrapper with elements/slots). Nothing wrong in the
skill here; recording the decision and the reference mapping for future
layout-wrapper components.