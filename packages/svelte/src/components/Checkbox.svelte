<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  /** The value a checkbox stands for inside a bound set. */
  export type CheckboxValue = string | number

  /**
   * One native checkbox. Bind `checked` for a single box. Give several boxes a `value` and bind the
   * same array to `group` — `bind:group` — to collect the ticked values: checking a box adds its
   * value, unchecking removes it.
   *
   * `indeterminate` is never a prop. It has no HTML attribute, and `aria-checked` is not allowed on
   * a native checkbox, so a prop could only paint a dash while assistive tech announced a plain
   * unchecked box. Set the DOM property instead: `el.indeterminate = true`.
   */
  export type CheckboxProps = {
    checked?: boolean
    value?: CheckboxValue
    group?: CheckboxValue[]
    class?: string
  } & Omit<HTMLInputAttributes, 'type' | 'checked' | 'value'>

  let {
    checked = $bindable(),
    value,
    group = $bindable<CheckboxValue[]>(),
    class: className = '',
    onchange,
    ...attrs
  }: CheckboxProps = $props()

  // A bound set holds the ticked values, so membership is the checked state and there is no second
  // copy of it to fall out of step. A box with no value cannot be a member, so it stays native.
  const isChecked = $derived(
    group !== undefined && value !== undefined ? group.includes(value) : checked,
  )

  // The control's own attribute is the one source of truth, so the painted error state and the
  // state assistive tech announces can never disagree.
  const invalid = $derived(attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true')
  const classes = $derived(
    ['rs-checkbox', invalid ? 'rs-checkbox--invalid' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )

  const handleChange = (event: Event & { currentTarget: HTMLInputElement }) => {
    const { checked: isTicked } = event.currentTarget
    if (group !== undefined && value !== undefined) {
      const without = group.filter((entry: CheckboxValue) => entry !== value)
      group = isTicked ? [...without, value] : without
    } else {
      checked = isTicked
    }
    onchange?.(event)
  }
</script>

<input {...attrs} type="checkbox" {value} checked={isChecked} class={classes} onchange={handleChange} />

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-checkbox {
      --rs-checkbox-bg: #{rs-token(color-surface)};
      --rs-checkbox-border-color: #{rs-token(color-border-control)};
      --rs-checkbox-mark-color: transparent;
      appearance: none;
      display: inline-grid;
      flex: none;
      place-content: center;
      background: var(--rs-checkbox-bg);
      block-size: var(--rs-checkbox-size, 24px);
      border: var(--rs-checkbox-border-width, #{rs-token(border-width-sm)}) solid
        var(--rs-checkbox-border-color);
      border-radius: var(--rs-checkbox-border-radius, #{rs-token(radius-sm)});
      cursor: pointer;
      inline-size: var(--rs-checkbox-size, 24px);
      margin: 0;

      /// The mark is the input's own pseudo-element, clipped to a tick and painted from a
      /// variable, so it follows the theme. It is transparent until the box is checked.
      &::before {
        background: var(--rs-checkbox-mark-color);
        block-size: 14px;
        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        content: '';
        inline-size: 14px;
      }

      &:checked,
      &:indeterminate {
        --rs-checkbox-bg: #{rs-token(color-accent)};
        --rs-checkbox-border-color: #{rs-token(color-accent)};
        --rs-checkbox-mark-color: #{rs-token(color-accent-contrast)};
      }

      &:indeterminate::before {
        clip-path: inset(42% 10%);
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
        --rs-checkbox-border-color: #{rs-token(color-danger-accent)};
      }

      /// Forced colours can drop author backgrounds, so high-contrast users get the native box.
      @media (forced-colors: active) {
        appearance: auto;

        &::before {
          content: none;
        }
      }
    }
  }
</style>
