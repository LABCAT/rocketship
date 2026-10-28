# @labcat2020/rocketship-svelte

Svelte 5 port of the Rocketship component library. Components reuse the same design system as the Astro package (`@labcat2020/rocketship`): design tokens, the mixin barrel, and the base resets are shared, not duplicated.

Components are either copy-style ports of their Astro originals, or Svelte-first components with no Astro original yet. Either way they render the same BEM classes and follow the same props, token, `:global` style, container-query and a11y conventions, so an Astro version can be ported back from a Svelte-first component. A Svelte-first component is provisional — it may change once the matching Astro component's platinum standard lands, and Astro is the source of truth when the two diverge.

## Components

| Component    | Export                                                | Astro original     |
| ------------ | ----------------------------------------------------- | ------------------ |
| `Container`  | `@labcat2020/rocketship-svelte/components/Container`  | `Container.astro`  |
| `Grid`       | `@labcat2020/rocketship-svelte/components/Grid`       | `Grid.astro`       |
| `Card`       | `@labcat2020/rocketship-svelte/components/Card`       | `Card.astro`       |
| `Typography` | `@labcat2020/rocketship-svelte/components/Typography` | `Typography.astro` |
| `Button`     | `@labcat2020/rocketship-svelte/components/Button`     | `Button.astro`     |
| `Alert`      | `@labcat2020/rocketship-svelte/components/Alert`      | `Alert.astro`      |
| `Stack`      | `@labcat2020/rocketship-svelte/components/Stack`      | `Stack.astro`      |
| `Table`      | `@labcat2020/rocketship-svelte/components/Table`      | `Table.astro`      |
| `Field`      | `@labcat2020/rocketship-svelte/components/Field`      | `Field.astro`      |
| `Label`      | `@labcat2020/rocketship-svelte/components/Label`      | `Label.astro`      |
| `Input`      | `@labcat2020/rocketship-svelte/components/Input`      | `Input.astro`      |
| `Textarea`   | `@labcat2020/rocketship-svelte/components/Textarea`   | `Textarea.astro`   |
| `Select`     | `@labcat2020/rocketship-svelte/components/Select`     | `Select.astro`     |
| `Disclosure` | `@labcat2020/rocketship-svelte/components/Disclosure` | `Disclosure.astro` |
| `Accordion`  | `@labcat2020/rocketship-svelte/components/Accordion`  | — (Svelte-first)   |
| `Figure`     | `@labcat2020/rocketship-svelte/components/Figure`     | `Figure.astro`     |
| `Fieldset`   | `@labcat2020/rocketship-svelte/components/Fieldset`   | `Fieldset.astro`   |

Import components from their `./components/*` subpaths. Those subpaths are the package's public surface; deep imports such as `@labcat2020/rocketship-svelte/src/components/Container.svelte` are not exported and will not resolve.

```svelte
<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Grid from '@labcat2020/rocketship-svelte/components/Grid'
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Typography from '@labcat2020/rocketship-svelte/components/Typography'
  import Button from '@labcat2020/rocketship-svelte/components/Button'
</script>

<Container as="main" size="content" padded>
  <Typography as="article">
    <h1>Title</h1>
    <p>Body copy.</p>
  </Typography>
  <Grid columns={3}>
    <Card>…</Card>
    <Card>…</Card>
    <Card>…</Card>
  </Grid>
  <Button variant="primary">Continue</Button>
</Container>
```

Each component spreads unknown attributes onto its rendered element and composes an incoming `class` with its BEM block.

| Component    | Props                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`  | `as` (`div`, `section`, `main`, `article`, `header`, `footer`, `nav`), `size` (`default`, `content`, `wide`, `full`), `padded`, `class`       |
| `Grid`       | `as` (`div`, `ul`, `ol`), `columns` (`2`, `3`, `4`), `class`                                                                                  |
| `Card`       | `as` (`article`, `section`, `div`, `li`), `media` snippet, `meta` snippet, `class`                                                            |
| `Typography` | `as` (`div`, `section`, `article`), `html`, `class`                                                                                           |
| `Button`     | `as` (`button`, `a`), `href`, `variant` (`primary`, `secondary`, `ghost`), `size` (`small`, `medium`, `large`), `disabled`, `type`, `class`   |
| `Alert`      | `variant` (`info`, `success`, `warning`, `error`), `role` (`alert`, `status`, `note`), `class`                                                |
| `Stack`      | `as` (`div`, `ul`, `ol`), `gap` (`small`, `medium`, `large`, `xlarge`), `class`                                                               |
| `Input`      | `type` (`text`, `email`, `password`, `number`, `search`, `url`, `tel`), `size` (`sm`, `md`, `lg`), `invalid`, `value` (`bind:value`), `class` |
| `Textarea`   | `size` (`sm`, `md`, `lg`), `invalid`, `value` (`bind:value`), `class`                                                                         |
| `Select`     | `size` (`sm`, `md`, `lg`), `invalid`, `placeholder`, `value` (`bind:value`), `children` snippet, `class`                                      |
| `Figure`     | `as` (`figure`, `div`), `variant` (`default`, `bordered`), `captionAlign` (`start`, `center`), `caption`, `captionSlot` snippet, `class`      |
| `Fieldset`   | `legend` snippet, `children` snippet, `class`                                                                                                 |

### `Typography` `html` prop

`Typography` keeps the `html` prop: pass a string and it renders as raw markup inside the wrapper, taking precedence over the `children` snippet. It is the Svelte equivalent of the Astro component's `set:html`.

**Sanitize before you pass it.** The prop renders trusted HTML verbatim and does not sanitize its input, so it is only safe for content you control or content already sanitized at the boundary. Never pass unsanitized user input, request data, or third-party HTML through it — run it through a sanitizer (for example DOMPurify) first, or render structured markup with the `children` snippet instead.

### `Field`, `Input` and `Textarea`

`Field` hands each control its wiring through the `children` snippet: `id`, `aria-describedby`, `aria-invalid`, `required` and `disabled`. Spread that object onto `Input` or `Textarea` so the label, hint and error text stay linked to the control.

```svelte
<script lang="ts">
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
  import Textarea from '@labcat2020/rocketship-svelte/components/Textarea'

  let email = $state('')
  let notes = $state('')
</script>

<Field label="Work email" hint="We send deployment alerts here.">
  {#snippet children(control)}
    <Input {...control} type="email" bind:value={email} />
  {/snippet}
</Field>

<Field label="Release notes" error="Add at least ten characters.">
  {#snippet children(control)}
    <Textarea {...control} rows="3" bind:value={notes} />
  {/snippet}
</Field>
```

Both controls also work standalone. `invalid` raises `aria-invalid` and applies the error styling, and a size modifier (`sm`, `md`, `lg`) sets the type scale and control height. A `Field` error flows into the control's `aria-invalid` and its modifier, so the styling follows the error text Field renders.

### `Alert`

`Alert` is a fixed `div` styling the message, never the markup inside it. It takes no title prop, title snippet or content wrapper: write the elements yourself and apply `rs-alert__title` and `rs-alert__description`, choosing the heading level the page outline needs.

```svelte
<Alert variant="warning">
  <h2 class="rs-alert__title">Check your quota</h2>
  <p class="rs-alert__description">
    You have used 85% of your build minutes. Upgrade or wait for the next cycle.
  </p>
</Alert>
```

`role` is opt-in and is never derived from the variant: pass `alert` or `status` when the content is injected dynamically. The default `info` variant emits no modifier class, because the base class is the default.

### `Stack`

`Stack` is a flex column whose `gap` owns the space between its children, so components keep no outer margins and the page decides the rhythm. `gap` accepts `small` (8px), `medium` (16px, the default, which emits no modifier), `large` (24px) and `xlarge` (40px). Render it as `ul` or `ol` to get list semantics, and it adds `role="list"` so Safari/VoiceOver keep them despite `list-style: none`.

```svelte
<Stack as="ul" gap="small">
  <li>Deploy the preview.</li>
  <li>Run the smoke tests.</li>
</Stack>
```

### `Select`

`Select` wraps a native `<select>` and takes its options through the `children` snippet, plain `<option>` and `<optgroup>` included. There is no custom listbox, so keyboard, screen-reader and mobile behaviour are the platform's.

```svelte
<script lang="ts">
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  let team = $state('')
</script>

<Select bind:value={team} placeholder="Choose a team" name="team">
  <optgroup label="Engineering">
    <option value="frontend">Frontend</option>
    <option value="backend">Backend</option>
  </optgroup>
</Select>
```

`placeholder` renders a disabled option with an empty value, so it reads as an unset field. Once a real option is chosen the placeholder cannot be selected again; a parent can still reset the field by writing `''`. `size` accepts `sm`, `md` or `lg`; a number is passed through to the native `size` attribute, which renders a listbox instead of a dropdown, in which case no chevron is drawn.

### `Fieldset`

`Fieldset` groups controls under one name without drawing a box: the block resets the native chrome and its `gap` owns the spacing, so a group reads like the Fields around it. Put it in a `Card` when a panel is wanted. The `legend` snippet renders as the fieldset's first child, which is the only position the browser accepts; with no snippet the group renders no legend and can be named by an external heading through `aria-labelledby`.

```svelte
<script lang="ts">
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Input from '@labcat2020/rocketship-svelte/components/Input'

  let name = $state('Ada Lovelace')
</script>

<Fieldset>
  {#snippet legend()}Billing contact{/snippet}
  <Field label="Full name" hint="Appears on every invoice.">
    {#snippet children(control)}
      <Input {...control} name="billing-name" bind:value={name} />
    {/snippet}
  </Field>
</Fieldset>
```

`disabled` is the native attribute, spread through `...attrs` rather than declared as a prop. It disables every control inside the group and leaves them out of the submitted form data, with no wiring of its own. The browser exempts controls inside the legend from that state, so an action there stays operable, and the legend itself stays readable.

A group's hint or error belongs to the fieldset: write `<p class="rs-fieldset__hint">` or `<p class="rs-fieldset__error">` after the legend and point at it with `aria-describedby` on the fieldset. Consecutive fieldsets go in `<Stack gap="xlarge">`, because the space between groups has to exceed the space within them.

## Install

```bash
npm install @labcat2020/rocketship-svelte @labcat2020/rocketship
```

## Usage

Import the base styles (tokens + default theme) once in your app, exactly as with the Astro package:

```js
import '@labcat2020/rocketship/styles'
```

Inside a component's `<style lang="scss">` block, import the shared mixin barrel:

```scss
@use '@labcat2020/rocketship/styles/mixins' as *;
```

`./styles/mixins` is a stable export of `@labcat2020/rocketship` and resolves to `src/styles/mixins.scss`, the barrel that forwards the functions, breakpoint, container-query, and typography mixins. Import the barrel — never individual partials under `mixins/`.

## Theming

Theming is CSS-variable based and unchanged from the Astro library. Components reference the global `--rs-*` tokens and expose `--rs-<component>-*` override hooks. Adopters can override tokens and component variables from `:root` or any ancestor.

## Scripts

```bash
pnpm build   # compile TypeScript
pnpm check   # svelte-check
pnpm test    # node --test
```
