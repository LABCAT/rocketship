# RCL-08 audit: Container, Button, Typography, Card, Grid

Audited 2026-10-26 against `main` at 492e4fd. No code was changed for this audit. The findings below describe the components as they were then; the outcomes are decisions 118–145 in `component-review-decisions.md`.

Sources of truth: the DTCG files in `packages/base/src/tokens/` (generated into `styles/mixins/token-map.scss`), `_planning/component-review-decisions.md` (decisions 1–117), `.agents/rules/`, and the reviewed components Alert, Stack, Field, Input, Select, Dialog and Disclosure.

## Summary

None of the five has been reviewed yet. The skill says so: "Button, Card, Container, Grid and Typography predate the review. Never copy them." None uses `rs-token()`; every one writes its own `var(--rs-x, literal)` fallbacks. Button, Card and Typography are still in stylelint's `ignoreFiles` because they fail the BEM rules. Container and Grid pass lint.

What main already settles for them:

- The token system (decision 55) exists, so each component only needs to switch to `rs-token()`. Every token they read already exists, except Container's default width (see below).
- Decision 104 fixed the primary Button's dark-mode contrast through `color-accent-contrast`. Button's own `#ffffff` fallback is still the old value.
- Decision 9 names Grid as the right use of container queries, and `container-query-up` no longer needs the `rs-component` name.
- Decision 13 (no outer margin) and Stack (`role="list"` on lists) give Grid its pattern.
- Decision 80 (amended) and `rocketship-stories.mdc` → "Docs pages (Astro)" give the docs-page shape, with `DisclosureDefault.astro` as the reference.
- Already parked in the decisions doc: the Button review list, Card's `<p class="rs-card__title">` stories, Grid's missing `role="list"`, and whether prose (Typography) is an exception to rule 3.

Severity: **gap** breaks a decision or a rule; **check** needs your call; **ok** conforms.

## Container (`Base/Container`)

| Area     | Finding                                                                                                                                                                                                                                                                                                                            | Severity |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tokens   | Hand-written fallbacks: `var(--rs-container-width-wide, 1200px)`, `-content-sm` 600px, `-content-lg` 800px, `--rs-container-gutter` 16px, `--rs-container-padding-block` 20px. All are tokens (`container-width-wide`, `container-width-content-sm/lg`, `container-gutter`, `container-padding-block`) and should be `rs-token()`. | gap      |
| Tokens   | Default width `var(--rs-container-width-default, 1000px)` has no token. Needs a `container-width-default` token or stays a literal hook.                                                                                                                                                                                           | check    |
| Tokens   | `variables.scss` sets `--rs-container-padding-block` to literal 30px (`md`) and 40px (`lg`), outside the token files.                                                                                                                                                                                                              | check    |
| Contract | `container-name: rs-component` is left over from before decision 9. Nothing queries it (`grep rs-component` finds only this line).                                                                                                                                                                                                 | gap      |
| Contract | `padded` replaces `padding-block` with the token, so a padded container loses the safe-area insets and ignores `--rs-container-padding-block-start/-end`. The layout rule says those overrides "resolve with the safe area", which is true only when unpadded.                                                                     | gap      |
| Contract | `&--no-gutters` has a rule but no prop; it is reachable only by hand-adding the class.                                                                                                                                                                                                                                             | check    |
| Contract | `size="full"` emits `rs-container--full-width`: the class name does not match the prop value.                                                                                                                                                                                                                                      | check    |
| Contract | Physical `width` / `max-width` where the rules ask for logical properties (`inline-size`, `max-inline-size`).                                                                                                                                                                                                                      | gap      |
| Contract | `as` covers seven tags; several are valid roots (decision 1), so `as` stays. Typed as `HTMLAttributes<'div'>`.                                                                                                                                                                                                                     | ok       |
| Contract | `container-type: inline-size` on a layout box, as the layout rule asks. Viewport queries only in Container and `variables.scss`.                                                                                                                                                                                                   | ok       |
| Stories  | Four stories (`Default`, `Content`, `Wide`, `FullWidth`) render the same legal-notice document at different widths via an arg. The canvas has instruction copy ("Use this story to check gutters", decision 80). No docs page, no props or hooks table.                                                                            | gap      |

## Button (`Base/Button`)

| Area     | Finding                                                                                                                                                                                                                                                                                                                         | Severity |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tokens   | No `rs-token()`. Hex fallbacks `#2f5bdb`, `#ffffff` (pre-decision 104 dark value), `#eef2ff`, `#173ea8`, `#296dff`; literal `padding-block: 8px`, `--rs-button-min-height: 36px`.                                                                                                                                               | gap      |
| Tokens   | 18 `--rs-button-*` size values live on `:root` in `variables.scss`, not in the component (parked).                                                                                                                                                                                                                              | gap      |
| Tokens   | Secondary hover uses `color-link-hover` for border and text. That token's role is link text (decision 18).                                                                                                                                                                                                                      | check    |
| Contract | `rs-button--primary` is emitted with no rule; `rs-button--medium` is the default but emits a class and a rule (decision 4, parked).                                                                                                                                                                                             | gap      |
| Contract | Sets `font-family` (decision 8; stylelint would fail).                                                                                                                                                                                                                                                                          | gap      |
| Contract | `size` prop with three steps, and a container-query step that grows type and height above 500px. The component-API rule says "No `size`, `compact` or density prop" and decision 9 forbids size steps in container queries; decision 29 still names "Button sizes" as an aspect. Small is 14px text (rule: text never shrinks). | check    |
| Contract | `&[aria-disabled='true']` is an attribute selector (decision 3). Reviewed controls derive a modifier from the attribute (`--invalid` from `aria-invalid`).                                                                                                                                                                      | gap      |
| Contract | `pointer-events: none` on disabled duplicates the platform (decision 67).                                                                                                                                                                                                                                                       | check    |
| Contract | `disabled` is a prop. On `<button>` it re-declares the native attribute (decision 24); on `<a>` it maps to `aria-disabled`, removes `href` and sets `tabindex="-1"`.                                                                                                                                                            | check    |
| Contract | `as="a"` with no `href` renders `href="#"`. Two ways to get a link (`as="a"` or `href`).                                                                                                                                                                                                                                        | check    |
| Contract | `all: unset` sits before the custom properties; the rule order is variables, then `all: unset`.                                                                                                                                                                                                                                 | gap      |
| Contract | Hover and active use `filter: brightness()`. Transition uses `transition-fast` with no `--rs-button-transition-duration` hook and no reduced-motion opt-out (decision 114's motion rule).                                                                                                                                       | gap      |
| Contract | `display: inline-flex` with `gap` (icon plus label); `white-space: nowrap` lets long labels overflow narrow screens.                                                                                                                                                                                                            | check    |
| Contract | Focus ring is the standard 2px ring through a `--rs-button-focus-ring-color` hook; other components read `color-focus-ring` directly.                                                                                                                                                                                           | check    |
| Stories  | `Variants`: three buttons, no disabled, no link. `Sizes`: each row is two Containers (a spacer pattern the stories rule forbids) with an `<h3>` and a `<p>`, and each button has an `aria-label` that differs from its visible text ("Primary, small size" vs "Primary (small)", WCAG 2.5.3 label in name). No docs page.       | gap      |

## Typography (`Base/Typography`)

| Area     | Finding                                                                                                                                                                                                                                                                                         | Severity |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tokens   | Mixins in `styles/mixins/typography/` use hand-written fallbacks with hex values (`#131a2f`, `#1f49c6`, `#c8d2eb`, `#4f5b7d`, …), so standalone dark mode breaks (decision 6).                                                                                                                  | gap      |
| Tokens   | Heading sizes are literal hooks (`--rs-typography-h1-size`, 32/36/44px …) with no tokens; only `font-size-3xl` (32px) is close. `heading-spacing-*`, `text-spacing-bottom` and `list-spacing-bottom` are tokens but read with literals.                                                         | check    |
| Contract | Every rule is a descendant tag selector (`.rs-typography h1`, `ol > li > ul`). This is the parked question: is prose an exception to rule 3?                                                                                                                                                    | check    |
| Contract | Specificity clash: `.rs-typography a` and `.rs-typography p` (0,1,1) beat any single library class (0,1,0). A `<Button href>`, Card or Table placed inside Typography is restyled as a link, paragraph or prose table. Wrapping the scope in `:where(.rs-typography)` would drop it to (0,0,1). | gap      |
| Contract | Headings and `p` set `font-family` (decision 8).                                                                                                                                                                                                                                                | gap      |
| Contract | Container-query type steps on `h1`–`h4` and `p` (16px to 17px). Decision 9 and the layout rule: never for type steps.                                                                                                                                                                           | gap      |
| Contract | `.intro-text` is an unprefixed, non-BEM class.                                                                                                                                                                                                                                                  | gap      |
| Contract | Prose `caption` is `caption-side: bottom`; Table's caption is top (decision 51).                                                                                                                                                                                                                | check    |
| Contract | `html` prop renders with `set:html`. It is for trusted Markdown output; the docs should say so.                                                                                                                                                                                                 | check    |
| Contract | `as`: `div`, `section`, `article`. Valid.                                                                                                                                                                                                                                                       | ok       |
| Stories  | `Default`: a 250-line terms document using every element, with headings labelled "h1 …". `preview.ts` sorts a story called `TermsStyleDocument` that no longer exists. No docs page. Typography is also the prose engine of every docs page (Disclosure), so a change here moves every page.    | gap      |

## Card (`Components/Card`)

| Area         | Finding                                                                                                                                                                                                                                 | Severity |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tokens       | No `rs-token()`. Hex fallbacks `#eef2ff`, `#ffffff`, `#c8d2eb`, `#131a2f`, `#4f5b7d`; literal `min-height: 96px`, `padding-block: 2px`.                                                                                                 | gap      |
| Contract     | Renders wrappers `__body` and `__content`, and `__media` / `__meta` around named slots. Decision 5 forbids component-rendered content wrappers (Alert lost `__body`); decision 31 allows a named slot only where position is structure. | gap      |
| Contract     | `__title` and `__description` set `font-family`, and `__description` sets `font-size` and `line-height` (decisions 8 and 11). `__title` is `font-size-lg`, not `inherit` (decision 12, unless Card takes decision 27's size step).      | gap      |
| Contract     | `__token` is a monospace chip used only by the Foundations stories. Library vocabulary that exists for docs.                                                                                                                            | check    |
| Contract     | `overflow: hidden` clips focus rings of anything focusable inside the card.                                                                                                                                                             | check    |
| Contract     | The block sets no `color`; its elements do. Background is not a local.                                                                                                                                                                  | check    |
| Contract     | `as`: `article` (default), `section`, `div`, `li`. Valid roots (decision 1).                                                                                                                                                            | ok       |
| Blast radius | 91 `Card` usages in `ColorsDocument.astro` (media and meta slots, `__token`), plus Borders, Shadows, Spacing, Stack, Scroll and Grid stories. Removing the wrappers or slots changes every Foundations page.                            | —        |
| Stories      | One card with `<p class="rs-card__title">` (parked: titles are headings). No media or meta example, no docs page.                                                                                                                       | gap      |

## Grid (`Base/Grid`)

| Area     | Finding                                                                                                                                                                                                                                                           | Severity |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tokens   | `var(--rs-grid-gap, var(--rs-space-4, 16px))`: hand-written chain. Should be `var(--rs-grid-gap, #{rs-token(space-4)})`.                                                                                                                                          | gap      |
| Contract | `as="ul"` / `"ol"` with `list-style: none` and no `role="list"` (parked; Stack handles it). The Foundations pages render `<Grid as="ul">`, so this affects live docs today.                                                                                       | gap      |
| Contract | Default (2 columns) emits no class; `--3-cols` and `--4-cols` do (decision 4).                                                                                                                                                                                    | ok       |
| Contract | Container queries change the layout only (decision 9), no outer margin, list reset.                                                                                                                                                                               | ok       |
| Contract | One gap with no steps, unlike Stack's `gap` prop.                                                                                                                                                                                                                 | check    |
| Stories  | Three stories (`TwoColumns`, `ThreeColumns`, `FourColumns`) of identical placeholder Cards with `<p>` titles, in a default-width Container with no Stack. Column counts are one comparison; decision 29 would make them one story. No list example, no docs page. | gap      |

## Checks

There is no `AGENTS.md` in this repo. The checks in the component skill's step 5 cover the same ground:

- `pnpm lint:styles`
- `pnpm --filter @labcat2020/rocketship build` (token map and `tsc`, the typecheck)
- `pnpm --filter @labcat2020/rocketship test` (map matches the JSON)
- `pnpm build` (packages and the static Storybook)
- axe in light and dark on each touched story (the parked Playwright recipe against `storybook-static`)

When a component is reviewed, it also leaves `ignoreFiles` in `stylelint.config.mjs`.

## RCL-21 docs parts for these five: what the review settled

All five follow decision 80 (amended) and `rocketship-stories.mdc` → "Docs pages (Astro)". The review settled the points the proposal left open:

1. **Keep pages lean.** Shane: write what a user will actually want to know. Every page is a short description, the example, the usage code and the tables that say something (decisions 119, 125).
2. **Grid:** `Default` is the docs page; `ThreeColumns` and `FourColumns` stay (decision 119).
3. **Container:** one content Container with a static usage snippet; the widths are shown by one `Sizes` story (decisions 125, 126).
4. **Card:** linked image cards in a list, with an element classes table (decision 134).
5. **Button:** `Default` and a `Sizes` aspect (decision 140).
6. **Typography:** `Default` and the terms document as a `Prose` aspect (decision 145).
7. **Hooks tables** list opt-in hooks only, not variant-owned locals.
8. **No slots table** when the default slot is the only one (decision 125).
9. **No "Customising" section.** Tried on Grid and Container and removed: it repeated the tables or taught generic CSS (decisions 119, 125).

Still open for RCL-21: moving the other components (Alert, the form controls, Table, Figure, Stack, Scroll, Popover, Tooltip, Dialog) onto docs pages.

## Proposed order

One component at a time, smallest blast radius first: Grid, Container, Card, Button, Typography. Typography last because every docs page depends on it, and the prose rule-3 exception must be decided first.

Out of scope here: the Svelte ports of all five (Daruma tasks), and PageHeader, BlockTitle, ContentBlock and QuoteBlock.
