# Skill friction — rocketship-component

Skill hash at start of session: `e990f95` (`.agents/skills/`).

Recorded while building `FileInput.astro` + `RangeInput.astro` (RCL-29). The skill worked well for the Card-class of presentational containers; form controls exposed several gaps. Nothing here was silently "fixed" — proposals are listed for a follow-up skill revision.

## Gaps (missing from the skill)

1. **Native-element components.** The procedure assumes a container component: always `as?:` polymorphic tag, `<Tag {...attrs}>`, "single root tag via dynamic Tag", one `<style>` block. An input component *is* the native element — no `as`, no dynamic tag, root `<input>` / wrapping `<label>`. The template's "non-negotiables" (`as?:`, dynamic tag) are ambiguous for inputs. Decide how the skill wants these treated (skip `as` silently vs. explicit exception).

2. **No form-control conventions at all.** Nothing covers: accessible-name ownership (component-owned `aria-label` vs. consumer `<label for>` — I used a `label` prop → `aria-label` on the input, and left `<label for>` to consumers, expecting the RCL-32 field wrapper to own labels), `aria-invalid` wiring, disabled-state contrast, or label-vs-wrapper choice.

3. **Styling native inputs via pseudo-elements.** File and range styling depends on `::file-selector-button`, `::-webkit-slider-runnable-track` / `::-webkit-slider-thumb`, `::-moz-range-track` / `::-moz-range-thumb`, and `:focus-within` for the wrapping-label file control. The skill's novel-pattern tier list (`:has()`, `[open]`, `::backdrop`, popover, focus-trapping) is silent on styled native controls, pseudo-element parts, and `:focus-within`. These are new *kinds* of work for the library; the tier list should acknowledge them.

4. **`all: unset` is the Button reset, not a universal reset.** Fine for `.rs-button`, wrong for `::file-selector-button` (it nukes the native file button's function in some engines). The template's reset guidance should warn against applying the control reset to native form-control pseudo-elements.

5. **"Focused" story technique undocumented.** axe cannot synthesize keyboard focus. I demonstrated focus with `autofocus` + a `:focus`/`:focus-within` ring so the outline deterministically renders on load. The skill has no recipe for a focused-state story.

6. **No a11y-test recipe.** "axe reports no violations" assumes a running Storybook. Procedure that worked: build static, serve, drive with Playwright against `iframe.html?id=<storyId>&viewMode=story`, run axe in-page, exclude only iframe-shell rules (`region`, `landmark-one-main`, `page-has-heading-one` — they fire on `html`/`#storybook-root` for every story including Card/Button/Alert). Two concrete gotchas worth recording: the a11y addon's own axe runs in the preview, so **do not inject a second axe-core** (you get "Axe is already running") — reuse the embedded `window.axe`; and axe 4.13's `disable: [...]` option was a no-op in that build — use `rules: { id: { enabled: false } }` instead.

## Proposals (would go in a separate skill commit)

- Add a short "Form controls" section: native-element components don't take `as:`/dynamic tag; accessible name via `label` prop → `aria-label` or consumer `<label for>`; `aria-invalid` + `--invalid` modifier for the invalid state; focus ring on the wrapping `<label>` via `:focus-within` when the native control fills it.
- Add native-input styling notes (pseudo-element parts, disabling native `:focus-visible` outline when the wrapper owns the ring).
- Document the `autofocus` focused-story recipe and the Static-build + Playwright axe recipe (with the two axe gotchas above).
- Extend the "Tier Awareness" list with styled native form controls / input pseudo-elements and `:focus-within`.