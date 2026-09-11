# Skill friction log — RCL-28 Fieldset

Skill: `.agents/skills/rocketship-component`
Skill hash at start: `e990f95` (`git log --oneline -1 -- .agents/skills/`)

## Ambiguities and gaps encountered

1. **`as?:` is listed as always-required, but not every component needs it.**
   The procedure says Props must "always include `as?:` (polymorphic tag)". For a
   semantic grouping element like `<fieldset>`, polymorphism would let adopters
   render a `div`, destroying the native grouping semantics the component exists
   for. Card/Button/Grid are polymorphic because their tag is a presentational
   choice; fieldset/legend are not. The skill would benefit from a note that
   `as` is optional *when the element is semantically fixed* (e.g. `legend`,
   screen-reader-only presentational tags).

2. **No guidance for form-associated / grouping components.**
   The skill covers layout wrappers, controls, and presentation, but nothing
   about native form grouping (`<fieldset>`/`<legend>`), including the
   native `disabled` propagation on fieldset, the `:disabled` pseudo-class on
   non-control elements, or `<legend>`'s special position/rendering quirks.
   Worth a short "form semantics" section, especially since RCL-29..32 are
   landing alongside.

3. **"Always include `class?: string` and variants" is Button/Card-shaped.**
   `Fieldset` has no variant/size axis. The template's exported-union-types step
   does not cover "no-axes component". A one-line "skip when the component has no
   variant/tag axes" would help.

4. **Story naming for a two-aspect component is under-specified.**
   The skill documents single-file `Default` and multi-example `Variants`, and
   "one aspect per story in a separate file" (Button.sizes / Button.variants).
   It does not say whether a *state* aspect (e.g. `Disabled`) belongs as a second
   export in the same `.stories.tsx` file or as a separate aspect file.
   I followed the Button precedent: `Fieldset.stories.tsx` → `Default` and
   `Fieldset.disabled.stories.tsx` → `Disabled`. A note would remove guesswork.

5. **Story title group `Base/` vs `Components/` is explained, but the sidebar
   sort config in `preview.ts` is not mentioned.** New `Components/*` titles are
   appended after the explicitly ordered list. Not a blocker, just a
   discoverability note.

6. **Native form elements in story wrappers.** The rule "library components
   only" presumes siblings exist. Form-control stories (RCL-29..32) will need
   native `<input>`/`<label>` until their components land. A sentence permitting
   native semantic elements as *demo content* (never story-only styling) would
   clarify this. This Fieldset MR uses native inputs for exactly that reason.

No skill changes proposed in this MR (component work only). Flagging the above
for a future skill revision.