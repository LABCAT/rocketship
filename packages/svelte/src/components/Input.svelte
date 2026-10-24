<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel'
  export type InputSize = 'sm' | 'md' | 'lg'

  type Props = {
    type?: InputType
    size?: InputSize
    invalid?: boolean
    class?: string
    value?: string | number
  } & Omit<HTMLInputAttributes, 'size' | 'type' | 'value'>

  let {
    type = 'text',
    size = 'md',
    invalid = false,
    class: className = '',
    value = $bindable(''),
    ...attrs
  }: Props = $props()

  // Field passes its wiring (`id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`) to
  // the `children` snippet, which spreads it onto this control. An explicit attribute wins over the
  // `invalid` prop, so the error state Field reports is the one the element announces and styles.
  const ariaInvalid = $derived(attrs['aria-invalid'] ?? (invalid ? 'true' : undefined))
  // Only the hard `true` state drives the styling; `spelling`/`grammar` are announced but not
  // painted as an error, and an explicit `aria-invalid="false"` always wins over the prop.
  const isInvalid = $derived(ariaInvalid === true || ariaInvalid === 'true')

  const classes = $derived(
    ['rs-input', `rs-input--${size}`, isInvalid ? 'rs-input--invalid' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<input {...attrs} aria-invalid={ariaInvalid} bind:value class={classes} {type} />

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-input {
      // Size locals live on the block so a size modifier only reassigns them; `--rs-input-font-size`
      // stays unset here so a consumer can override one control without touching the others.
      --rs-input-font-size-sm: var(--rs-font-size-sm, #{to-rem(14)});
      --rs-input-font-size-md: var(--rs-font-size-md, #{to-rem(16)});
      --rs-input-font-size-lg: var(--rs-font-size-lg, #{to-rem(18)});
      --rs-input-min-height-sm: 34px;
      --rs-input-min-height-md: 40px;
      --rs-input-min-height-lg: 48px;
      --rs-input-padding-inline-sm: var(--rs-space-2, 8px);
      --rs-input-padding-inline-md: var(--rs-space-3, 12px);
      --rs-input-padding-inline-lg: var(--rs-space-4, 16px);
      background: var(--rs-input-bg, var(--rs-color-surface, #ffffff));
      border: var(--rs-input-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-input-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-input-border-radius, var(--rs-radius-sm, 6px));
      box-sizing: border-box;
      color: var(--rs-input-color, var(--rs-color-fg, #131a2f));
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
      font-size: var(--rs-input-font-size, var(--rs-input-font-size-md));
      line-height: var(--rs-line-height-base, 1.45);
      min-height: var(--rs-input-min-height, var(--rs-input-min-height-md));
      padding-block: var(--rs-input-padding-block, var(--rs-space-2, 8px));
      padding-inline: var(--rs-input-padding-inline, var(--rs-input-padding-inline-md));
      transition:
        background-color var(--rs-transition-fast, 140ms) ease,
        border-color var(--rs-transition-fast, 140ms) ease;
      width: 100%;

      &::placeholder {
        color: var(--rs-input-placeholder-color, var(--rs-color-muted, #4f5b7d));
      }

      &:focus-visible {
        border-color: var(--rs-input-focus-border-color, var(--rs-color-accent, #2f5bdb));
        outline: 2px solid var(--rs-input-focus-ring-color, var(--rs-color-focus-ring, #296dff));
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &--sm {
        --rs-input-font-size: var(--rs-input-font-size-sm);
        --rs-input-min-height: var(--rs-input-min-height-sm);
        --rs-input-padding-inline: var(--rs-input-padding-inline-sm);
      }

      &--md {
        --rs-input-font-size: var(--rs-input-font-size-md);
        --rs-input-min-height: var(--rs-input-min-height-md);
        --rs-input-padding-inline: var(--rs-input-padding-inline-md);
      }

      &--lg {
        --rs-input-font-size: var(--rs-input-font-size-lg);
        --rs-input-min-height: var(--rs-input-min-height-lg);
        --rs-input-padding-inline: var(--rs-input-padding-inline-lg);
      }

      // The error state owns a coordinated colour set, so the modifier reassigns the locals the base
      // rule already reads instead of restating background, border and colour.
      &--invalid {
        --rs-input-bg: var(--rs-color-danger-bg, #ffeef0);
        --rs-input-border-color: var(--rs-color-danger-border, #f0a8b0);
        --rs-input-color: var(--rs-color-danger-fg, #3d0a08);
      }

      @include container-query-up($rs-cq-sm) {
        --rs-input-font-size-sm: var(--rs-font-size-md, #{to-rem(16)});
        --rs-input-font-size-md: var(--rs-font-size-lg, #{to-rem(18)});
        --rs-input-font-size-lg: var(--rs-font-size-xl, #{to-rem(20)});
        --rs-input-min-height-sm: 40px;
        --rs-input-min-height-md: 44px;
        --rs-input-min-height-lg: 52px;
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }
  }
</style>
