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
| `Checkbox`   | `@labcat2020/rocketship-svelte/components/Checkbox`   | `Checkbox.astro`   |
| `Radio`      | `@labcat2020/rocketship-svelte/components/Radio`      | `Radio.astro`      |
| `FileInput`  | `@labcat2020/rocketship-svelte/components/FileInput`  | `FileInput.astro`  |
| `RangeInput` | `@labcat2020/rocketship-svelte/components/RangeInput` | `RangeInput.astro` |

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
| `Select`     | `value` (`bind:value`), `children` snippet, `class`                                                                                           |
| `Figure`     | `as` (`figure`, `div`), `variant` (`default`, `bordered`), `captionAlign` (`start`, `center`), `caption`, `captionSlot` snippet, `class`      |
| `Fieldset`   | `legend` snippet, `children` snippet, `class`                                                                                                 |
| `Field`      | `as` (`div`, `section`), `inline`, `id`, `label`, `hint`, `error`, `hintId`, `errorId`, `required`, `optional`, `disabled`, `class`           |
| `Checkbox`   | `checked`, `disabled`, `required`, `aria-invalid` (derives `rs-checkbox--invalid`), `class`                                                   |
| `Radio`      | `checked`, `disabled`, `required`, `aria-invalid` (derives `rs-radio--invalid`), `class`                                                      |
| `FileInput`  | `files` (`bind:files`), `aria-invalid` (derives `rs-file-input--invalid`), `class`                                                            |
| `RangeInput` | `value` (`bind:value`), `aria-invalid` (derives `rs-range-input--invalid`), `class`                                                           |

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

`Select` is one native `<select>` with the `.rs-select` block, so `class`, `id` and every `aria-*` attribute land on the control itself. It takes its options through the `children` snippet, plain `<option>` and `<optgroup>` included. There is no custom listbox, so keyboard, screen-reader and mobile behaviour are the platform's.

```svelte
<script lang="ts">
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  let team = $state('')
</script>

<Field label="Team" hint="Controls which runbooks appear in your sidebar.">
  {#snippet children(control)}
    <Select {...control} name="team" bind:value={team}>
      <option value="" disabled selected>Choose a team</option>
      <optgroup label="Engineering">
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </optgroup>
    </Select>
  {/snippet}
</Field>
```

The chevron is painted with two `linear-gradient` background layers coloured by `--rs-select-icon-color`, so no icon element exists to hide from assistive tech and the chevron dims with the control's own `opacity` when disabled. Forced-colours mode drops background images, so the component falls back to the native arrow there.

`multiple`, or a native `size` above one, renders a list box. The component derives `rs-select--list` from it, which removes the chevron and its reserved space.

The error state comes only from `aria-invalid`. Spread a `Field`'s `control` object onto the component and a `Field` error paints `rs-select--invalid`. There is no `invalid` prop and no `:invalid` styling, because a required select with an empty placeholder matches `:invalid` on load.

`value` is `bind:value`-able: a string for a single select, an array of strings when `multiple` is set. The component renders no option of its own, so a placeholder is an `<option value="" disabled>` you write yourself.

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

### `Checkbox` and `Radio`

Each is one native `<input>` with the `.rs-checkbox` or `.rs-radio` block, so `class`, `id`, `name` and every `aria-*` attribute land on the control itself. There is no wrapper label, hidden input or sibling selector, so the tick, dash and dot are the input's own `::before`, shaped with `clip-path` and painted from `--rs-checkbox-mark-color` / `--rs-radio-mark-color`. The mark follows the theme instead of being baked into an SVG.

```svelte
<script lang="ts">
  import Checkbox from '@labcat2020/rocketship-svelte/components/Checkbox'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Label from '@labcat2020/rocketship-svelte/components/Label'

  let summary = $state(true)
</script>

<Field inline>
  {#snippet children()}
    <Checkbox id="checkbox-summary" name="summary" bind:checked={summary} />
    <Label for="checkbox-summary">Email me a monthly summary</Label>
  {/snippet}
</Field>
```

A choice row is `<Field inline>`: the control goes first, then the `Label`, hint and error. Field's inline modifier turns the block into a two-column grid so the text sits beside the box, and shifts the Label's first line down by `--rs-label-offset` so it centres on the 24px control.

The box is 24px through `--rs-checkbox-size` / `--rs-radio-size`, which meets WCAG 2.2 target size on its own. `--rs-checkbox-border-width`, `--rs-checkbox-border-radius`, `--rs-radio-border-width` and `--rs-radio-border-radius` keep the edge and corners tunable, and the background and edge colours read from `--rs-checkbox-bg` / `--rs-radio-bg` and `--rs-checkbox-border-color` / `--rs-radio-border-color`.

`indeterminate` is never a prop. There is no HTML attribute for it and `aria-checked` is not allowed on a native checkbox, so a prop could only paint a dash while assistive tech still announced "not checked". Set the DOM property instead, and `.rs-checkbox:indeterminate` paints the dash:

```js
document.getElementById('notify-all').indeterminate = true
```

The error state comes only from `aria-invalid`, like every other reviewed control. Spread a `Field`'s `control` object onto the component and a `Field` error paints `--invalid`. Forced colours restore `appearance: auto` and drop the painted mark, so high-contrast users get the native control back.

### `FileInput`

`FileInput` is one native `<input type="file">` with the `.rs-file-input` block: no wrapper, no hidden input, so `class`, `id`, `name`, `accept`, `multiple` and every `aria-*` attribute land on the control itself. The box takes the surface colour and the control border, and the browse button is the input's own `::file-selector-button`, styled as the library's pill.

```svelte
<script lang="ts">
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import FileInput from '@labcat2020/rocketship-svelte/components/FileInput'

  let notes = $state<FileList | null>(null)
  const chosen = $derived(notes ? [...notes].map((file) => file.name) : [])
</script>

<Field
  label="Release notes"
  hint={chosen.length ? `Attached: ${chosen.join(', ')}` : 'PDF only. You can attach several files.'}
>
  {#snippet children(control)}
    <FileInput {...control} name="notes" accept="application/pdf" multiple bind:files={notes} />
  {/snippet}
</Field>
```

`files` is the platform's `FileList`, bound with `bind:files`. The component never invents a file: the picker fills the list, and the consumer reads the names back from it. The browser prints one name itself, or a file count when `multiple` is set, so list the names when the exact selection matters.

Set `files` back to `null` to clear the selection. A file input does not accept a `files` assignment, so the component clears its value instead, which removes both the list and the printed text in one write. For the same reason the control always starts empty: only the picker can fill the list.

The error state comes only from `aria-invalid`, like every other reviewed control: it reassigns the box's border colour to `color-danger-accent` and leaves the browse button alone, so the error never reads as a destructive action. Disabled dims the whole control to `opacity: 0.55` and the platform blocks the picker; the component never uses `pointer-events`.

### `RangeInput`

`RangeInput` is one native `<input type="range">` with the `.rs-range-input` block. `min`, `max` and `step` are native attributes, so the platform clamps and snaps the value: the component re-implements none of those rules. The track is a 4px guide through `--rs-range-input-track-height`, and the thumb is a 24px ringed handle through `--rs-range-input-thumb-size`, which meets WCAG 2.2 target size on its own.

```svelte
<script lang="ts">
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import RangeInput from '@labcat2020/rocketship-svelte/components/RangeInput'

  let workers = $state(4)
</script>

<Field label="Build workers" hint="Each worker runs one build at a time.">
  {#snippet children(control)}
    <RangeInput {...control} name="workers" min={1} max={8} bind:value={workers} />
  {/snippet}
</Field>
```

`value` is a number and is `bind:value`-able. The thumb's position is the value, so write the number out beside the slider when the exact figure matters — a hint or an `<output>` you own. The component paints no progress fill, because WebKit and Chromium have no part for it. There are no tick marks either: a browser draws a `datalist`'s ticks only on the native slider, so `step` does the snapping and a visible scale would be a separate feature.

A write outside `min`/`max`, or between two steps, is clamped or snapped by the platform, and the bound value adopts the number the thumb actually shows, so an output written from the state never disagrees with the slider. With no value given, the state adopts the platform default the slider displays.

The error state comes only from `aria-invalid`, and it turns both edges of the control: the track and the thumb's ring read `color-danger-accent`, since a slider with one red edge out of two reads as two states. Forced colours fall back to the native slider, because repainting the track in the page colour would leave the thumb floating.

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
