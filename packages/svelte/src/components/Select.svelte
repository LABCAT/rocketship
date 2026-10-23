<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLSelectAttributes } from 'svelte/elements'

  export type SelectSize = 'sm' | 'md' | 'lg'

  type Props = {
    size?: SelectSize | number
    invalid?: boolean
    placeholder?: string
    class?: string
    value?: string
    children?: Snippet
  } & Omit<HTMLSelectAttributes, 'size' | 'value' | 'placeholder' | 'multiple'>

  // `size` is a Rocketship variant, but the native attribute of the same name is a visible row
  // count that renders a listbox, so a non-variant value is forwarded to the element untouched.
  const isSelectSize = (candidate: SelectSize | number | undefined): candidate is SelectSize =>
    candidate === 'sm' || candidate === 'md' || candidate === 'lg'

  let {
    size = 'md',
    invalid = false,
    placeholder,
    class: className = '',
    value = $bindable(''),
    children,
    ...attrs
  }: Props = $props()

  const variantSize = $derived(isSelectSize(size) ? size : 'md')
  const nativeSize = $derived(isSelectSize(size) ? undefined : size)

  // Field passes its wiring (`id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`) to
  // the `children` snippet, which spreads it onto this component and so onto the `<select>`. An
  // explicit attribute wins over the `invalid` prop, so the state the element announces is the one
  // it is styled with.
  const ariaInvalid = $derived(attrs['aria-invalid'] ?? (invalid ? 'true' : undefined))
  // Only the hard `true` state drives the styling; `spelling`/`grammar` are announced but not
  // painted as an error, and an explicit `aria-invalid="false"` always wins over the prop.
  const isInvalid = $derived(ariaInvalid === true || ariaInvalid === 'true')

  const hasPlaceholder = $derived(Boolean(placeholder?.trim()))
  // A numeric `size` turns the control into a listbox, where a dropdown chevron would be false.
  const showIcon = $derived(nativeSize === undefined)

  // The placeholder is a disabled, empty-valued option, so a user can never select it back once a
  // real option is chosen. Rendering `selected` keeps static server output on the placeholder; after
  // hydration the `bind:value` binding owns which option is selected.
  const placeholderSelected = $derived(value === '')

  const classes = $derived(
    [
      'rs-select',
      `rs-select--${variantSize}`,
      isInvalid ? 'rs-select--invalid' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

<span class={classes}>
  <select
    {...attrs}
    aria-invalid={ariaInvalid}
    bind:value
    class="rs-select__control"
    size={nativeSize}
  >
    {#if hasPlaceholder}
      <option disabled selected={placeholderSelected} value="">{placeholder}</option>
    {/if}
    {@render children?.()}
  </select>
  {#if showIcon}
    <svg
      aria-hidden="true"
      class="rs-select__icon"
      focusable="false"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  {/if}
</span>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-select {
      // Variant-owned locals: the control reads them, so a modifier swaps a coordinated set.
      --rs-select-bg: var(--rs-color-surface, #ffffff);
      --rs-select-border-color: var(--rs-color-border, #c8d2eb);
      --rs-select-color: var(--rs-color-fg, #131a2f);
      --rs-select-focus-ring-color: var(--rs-color-focus-ring, #296dff);
      --rs-select-icon-color: var(--rs-color-muted, #4f5b7d);
      --rs-select-invalid-bg: var(--rs-color-danger-bg, #ffeef0);
      --rs-select-invalid-border-color: var(--rs-color-danger-border, #f0a8b0);
      --rs-select-invalid-focus-ring-color: var(--rs-color-danger-accent, #c5221f);
      // Size defaults live on the block; the per-size hooks stay unset here, so an adopter can
      // override one control through `--rs-select-font-size` without touching the others.
      --rs-select-font-size: var(--rs-select-font-size-md, var(--rs-font-size-md, #{to-rem(16)}));
      --rs-select-min-height: var(--rs-select-min-height-md, 40px);
      --rs-select-padding-inline: var(--rs-select-padding-inline-md, var(--rs-space-3, 12px));
      display: block;
      position: relative;

      &--sm {
        --rs-select-font-size: var(--rs-select-font-size-sm, var(--rs-font-size-sm, #{to-rem(14)}));
        --rs-select-min-height: var(--rs-select-min-height-sm, 34px);
        --rs-select-padding-inline: var(--rs-select-padding-inline-sm, var(--rs-space-2, 8px));
      }

      &--md {
        --rs-select-font-size: var(--rs-select-font-size-md, var(--rs-font-size-md, #{to-rem(16)}));
        --rs-select-min-height: var(--rs-select-min-height-md, 40px);
        --rs-select-padding-inline: var(--rs-select-padding-inline-md, var(--rs-space-3, 12px));
      }

      &--lg {
        --rs-select-font-size: var(--rs-select-font-size-lg, var(--rs-font-size-lg, #{to-rem(18)}));
        --rs-select-min-height: var(--rs-select-min-height-lg, 48px);
        --rs-select-padding-inline: var(--rs-select-padding-inline-lg, var(--rs-space-4, 16px));
      }

      // Roomier touch targets once the component's own container is wide enough.
      @include container-query-up($rs-cq-sm) {
        --rs-select-min-height: var(--rs-select-min-height-md, 44px);
        --rs-select-padding-inline: var(--rs-select-padding-inline-md, var(--rs-space-4, 16px));

        &--sm {
          --rs-select-min-height: var(--rs-select-min-height-sm, 40px);
          --rs-select-padding-inline: var(--rs-select-padding-inline-sm, var(--rs-space-3, 12px));
        }

        &--lg {
          --rs-select-min-height: var(--rs-select-min-height-lg, 52px);
          --rs-select-padding-inline: var(--rs-select-padding-inline-lg, var(--rs-space-5, 20px));
        }
      }

      &__control {
        appearance: none;
        background: var(--rs-select-bg);
        border: var(--rs-select-border-width, var(--rs-border-width-sm, 1px)) solid
          var(--rs-select-border-color);
        border-radius: var(--rs-select-border-radius, var(--rs-radius-sm, 6px));
        box-sizing: border-box;
        color: var(--rs-select-color);
        cursor: pointer;
        display: block;
        font-family: var(
          --rs-font-family-sans,
          'Inter',
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif
        );
        font-size: var(--rs-select-font-size);
        line-height: var(--rs-line-height-base, 1.45);
        margin: 0;
        min-height: var(--rs-select-min-height);
        padding-block: var(--rs-select-padding-block, var(--rs-space-2, 8px));
        padding-inline: var(--rs-select-padding-inline);
        padding-inline-end: calc(var(--rs-select-padding-inline) + var(--rs-space-6, 24px));
        transition:
          background-color var(--rs-transition-fast, 140ms) ease,
          border-color var(--rs-transition-fast, 140ms) ease;
        width: 100%;

        &:hover {
          --rs-select-border-color: var(--rs-color-accent, #2f5bdb);
        }

        &:focus-visible {
          outline: 2px solid var(--rs-select-focus-ring-color);
          outline-offset: 2px;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        @media (prefers-reduced-motion: reduce) {
          transition: none;
        }
      }

      // The error state owns a coordinated colour set, so the modifier reassigns the locals the
      // control already reads instead of restating background, border and colour. It follows the
      // control's `:hover` so its danger border and focus ring outrank the hover accent.
      &--invalid &__control {
        --rs-select-bg: var(--rs-select-invalid-bg);
        --rs-select-border-color: var(--rs-select-invalid-border-color);
        --rs-select-focus-ring-color: var(--rs-select-invalid-focus-ring-color);
      }

      &__icon {
        color: var(--rs-select-icon-color);
        inset-block-start: 50%;
        inset-inline-end: var(--rs-select-padding-inline);
        pointer-events: none;
        position: absolute;
        transform: translateY(-50%);
        transition:
          color var(--rs-transition-fast, 140ms) ease,
          opacity var(--rs-transition-fast, 140ms) ease;

        @media (prefers-reduced-motion: reduce) {
          transition: none;
        }
      }

      // The chevron dims with the control, so the pair reads as one disabled unit.
      &__control:disabled + .rs-select__icon {
        opacity: 0.55;
      }
    }
  }
</style>
