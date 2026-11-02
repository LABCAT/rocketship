<script lang="ts">
  import type { ChangeEventHandler, HTMLInputAttributes } from 'svelte/elements'
  import { getRadioGroup, hasRadioGroup } from './RadioGroup.svelte'

  /** The value a radio stands for: what a set of radios selects. */
  export type RadioValue = string | number

  /**
   * A radio picks one `value` out of a set. Bind the same variable to `group` on every radio in
   * the set — `bind:group` — and that variable holds the choice: checking one writes its value and
   * the rest uncheck. Inside a `<RadioGroup>` the group holds the variable, so a radio only needs
   * its `value`. A radio with no `value` is the plain native control and binds `checked` instead.
   */
  export type RadioProps = {
    group?: RadioValue
    value?: RadioValue
    checked?: boolean
    class?: string
  } & Omit<HTMLInputAttributes, 'type' | 'checked' | 'value'>

  let {
    group = $bindable(),
    value,
    checked = $bindable(false),
    class: className = '',
    onchange,
    ...attrs
  }: RadioProps = $props()

  const context = hasRadioGroup() ? getRadioGroup() : undefined

  // The group owns the selection when there is one, otherwise the consumer's binding does.
  const selection = $derived(context ? context.selected() : group)

  // The set decides only when it holds something to compare against: a group that starts unset
  // ("nothing chosen yet") and a radio with no value are left with the state they were given, so a
  // static `checked` radio keeps working before anything is selected.
  const isChecked = $derived(
    value !== undefined && selection !== undefined ? selection === value : checked,
  )

  // `aria-invalid` reaches the control through the attribute spread rather than a prop of its own,
  // so Svelte does not warn about a role that does not list it, as the reviewed Astro component
  // already does. A group in error marks every radio in it; a control's own attribute still wins.
  const ariaInvalid = $derived(attrs['aria-invalid'] ?? (context?.invalid() ? 'true' : undefined))
  const invalid = $derived(ariaInvalid === true || ariaInvalid === 'true')
  const controlAttrs = $derived(
    ariaInvalid === undefined ? attrs : { ...attrs, 'aria-invalid': ariaInvalid },
  )
  const name = $derived(attrs.name ?? context?.name())
  const classes = $derived(
    ['rs-radio', invalid ? 'rs-radio--invalid' : undefined, className].filter(Boolean).join(' '),
  )

  // A radio in a set only reports the value it stands for; the set decides exclusivity, so nothing
  // here needs to uncheck a sibling. A radio with no value has nothing to report, so the browser
  // keeps handling it as the plain native control.
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (value !== undefined) {
      if (context) context.select(value)
      else group = value
    } else {
      checked = event.currentTarget.checked
    }
    onchange?.(event)
  }
</script>

<input
  {...controlAttrs}
  type="radio"
  {value}
  {name}
  checked={isChecked}
  class={classes}
  onchange={handleChange}
/>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-radio {
      --rs-radio-bg: #{rs-token(color-surface)};
      --rs-radio-border-color: #{rs-token(color-border-control)};
      --rs-radio-mark-color: transparent;
      appearance: none;
      display: inline-grid;
      flex: none;
      place-content: center;
      background: var(--rs-radio-bg);
      block-size: var(--rs-radio-size, 24px);
      border: var(--rs-radio-border-width, #{rs-token(border-width-sm)}) solid
        var(--rs-radio-border-color);
      border-radius: var(--rs-radio-border-radius, #{rs-token(radius-pill)});
      cursor: pointer;
      inline-size: var(--rs-radio-size, 24px);
      margin: 0;

      /// The dot is the input's own pseudo-element, clipped to a circle and painted from a
      /// variable, so it follows the theme. It is transparent until the radio is checked.
      &::before {
        background: var(--rs-radio-mark-color);
        block-size: 10px;
        clip-path: circle(50%);
        content: '';
        inline-size: 10px;
      }

      &:checked {
        --rs-radio-bg: #{rs-token(color-accent)};
        --rs-radio-border-color: #{rs-token(color-accent)};
        --rs-radio-mark-color: #{rs-token(color-accent-contrast)};
      }

      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &--invalid {
        --rs-radio-border-color: #{rs-token(color-danger-accent)};
      }

      /// Forced colours can drop author backgrounds, so high-contrast users get the native radio.
      @media (forced-colors: active) {
        appearance: auto;

        &::before {
          content: none;
        }
      }
    }
  }
</style>
