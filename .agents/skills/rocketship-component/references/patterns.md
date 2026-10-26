# Patterns by component kind

Read only the section for the kind you are building. These rules are binding. The reference component's code shows each one.

## Forms (Field, Label, Fieldset)

Copy: `Field.astro`, `Label.astro`, `Fieldset.astro`.

- Label has no `as`; it is always a `<label>`.
- Fieldset has no `legend` prop. Its `legend` slot renders `<legend class="rs-fieldset__legend">` as the first child.
- `rs-fieldset__legend` sets `float: inline-start`, so the block's `gap` spaces it.
- The legend is `font-size-lg` and semibold. Labels, hints and errors inherit the page size.
- Fieldset adds no box: no background, border, radius or padding. Reset the native chrome: `border: 0; margin: 0; padding: 0; min-inline-size: 0`.
- A disabled fieldset gets no legend style.
- Compose a form like this:
  - Consecutive Fields: `<Stack gap="large">`.
  - Fields inside a fieldset: Fieldset's own gap (`space-4`).
  - Options (radios, checkboxes): `<Fieldset>` holding a `<Stack gap="small">` of `<Field inline>` rows.
  - Consecutive fieldsets: `<Stack gap="xlarge">`. Never a Fieldset margin.

## Text controls (Input, Textarea, Select)

Copy: `Input.astro`, `Textarea.astro`, `Select.astro`.

- Set `font: inherit`.
- One size. Density comes from the padding hooks.
- No `invalid` prop. Derive the modifier from the control's own attribute:
  ```astro
  const invalid = attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true'
  ```
- No hover state. No transitions. (`transition-fast` is for Button and links only.)
- Select's chevron is a `background-image` coloured by `--rs-select-icon-color`, never an element.
- When `multiple` or `size > 1` makes Select a list box, add the derived modifier `rs-select--list`. Never an attribute selector.

## Choice controls (Checkbox, Radio)

Copy: `Checkbox.astro`, `Radio.astro`.

- One `<input>` with `appearance: none`. No wrapping label, hidden input, `__control` span or sibling selector.
- The mark (tick, dash, dot) is the input's own `::before`, shaped with `clip-path` and filled with `background: var(--rs-checkbox-mark-color)`. Never an SVG data URI.
- `:checked` sets fill and border to `color-accent` and the mark to `color-accent-contrast`.
- The box is 24px through `--rs-checkbox-size`, with a `border-width-sm` edge in `color-border-control` and `cursor: pointer`.
- Forced colours: `appearance: auto` and `&::before { content: none; }`.
- No hover state. No transitions.
- A choice row is `<Field inline>`: control first, then the Label, hint and error. Field's inline modifier puts the text in column 2 (`--rs-field-text-column`) and centres the Label's first line on the box (`--rs-label-offset`).

## Native-part controls (File Input, Range Input)

Copy: `FileInput.astro`, `RangeInput.astro`.

- One `<input>`. Style its built-in parts through their pseudo-elements: `::file-selector-button`, `::-webkit-slider-runnable-track` / `::-webkit-slider-thumb`, `::-moz-range-track` / `::-moz-range-thumb`. Never `all: unset` on a part.
- File Input is Input's box. The box pads `space-1` and the browse button (a semibold pill) pads `space-1` × `space-3`, so its height matches Input.
- Range sets its height, never its width. A 24px thumb on a 4px track, through hooks. The track is one colour; the thumb is a `color-surface` disc with a `border-width-md` `color-accent` ring.
- Invalid swaps every edge: File Input's border; Range's track and thumb ring.
- Forced colours: a part that loses only its edge gets `border: 1px solid ButtonBorder`. A part that loses its shape gets `appearance: auto`, on WebKit's thumb too.
- No hover state. No transitions.

## Table

Copy: `Table.astro`.

- The box is on `rs-table`: `border-collapse: separate; border-spacing: 0`.
- Round the corners with `clip-path: inset(0 round var(--rs-table-border-radius, #{rs-token(radius-md)}))`, the same hook as `border-radius`. Never per-cell radii.
- The caption is a named slot and is styled as the table's title, not small print.
- Element classes exist only where there is a rule: `__caption`, `__column-header`, `__row-header`, `__cell`, `__body-row`, `__foot-row`. `<thead>`, `<tbody>`, `<tfoot>` and header rows get no class.
- Numeric columns: `--numeric` on both the cells and their header (`text-align: end`, `tabular-nums`).
- `striped` is a boolean. Striping is the only row aid: no `hover` prop, no row highlight.
- Interactive rows (selection, opening a record) are a separate data-table component. Stop and ask Shane.

## Scroll

Copy: `Scroll.astro`.

- Scroll has no border, padding or background. Its only paint is the focus ring.
- The consumer makes it focusable and names it. Never make the content itself scroll.
