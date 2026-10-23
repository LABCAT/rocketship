<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements'

  export type TextareaSize = 'sm' | 'md' | 'lg'

  type Props = {
    size?: TextareaSize
    invalid?: boolean
    class?: string
    value?: string
  } & Omit<HTMLTextareaAttributes, 'value'>

  let {
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
    [
      'rs-textarea',
      `rs-textarea--${size}`,
      isInvalid ? 'rs-textarea--invalid' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

<textarea {...attrs} aria-invalid={ariaInvalid} bind:value class={classes}></textarea>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-textarea {
      // Size locals live on the block so a size modifier only reassigns them; `--rs-textarea-font-size`
      // stays unset here so a consumer can override one control without touching the others.
      --rs-textarea-font-size-sm: var(--rs-font-size-sm, #{to-rem(14)});
      --rs-textarea-font-size-md: var(--rs-font-size-md, #{to-rem(16)});
      --rs-textarea-font-size-lg: var(--rs-font-size-lg, #{to-rem(18)});
      --rs-textarea-min-height-sm: 72px;
      --rs-textarea-min-height-md: 96px;
      --rs-textarea-min-height-lg: 128px;
      --rs-textarea-padding-inline-sm: var(--rs-space-2, 8px);
      --rs-textarea-padding-inline-md: var(--rs-space-3, 12px);
      --rs-textarea-padding-inline-lg: var(--rs-space-4, 16px);
      background: var(--rs-textarea-bg, var(--rs-color-surface, #ffffff));
      border: var(--rs-textarea-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-textarea-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-textarea-border-radius, var(--rs-radius-sm, 6px));
      box-sizing: border-box;
      color: var(--rs-textarea-color, var(--rs-color-fg, #131a2f));
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
      font-size: var(--rs-textarea-font-size, var(--rs-textarea-font-size-md));
      line-height: var(--rs-line-height-base, 1.45);
      min-height: var(--rs-textarea-min-height, var(--rs-textarea-min-height-md));
      padding-block: var(--rs-textarea-padding-block, var(--rs-space-2, 8px));
      padding-inline: var(--rs-textarea-padding-inline, var(--rs-textarea-padding-inline-md));
      resize: var(--rs-textarea-resize, vertical);
      transition:
        background-color var(--rs-transition-fast, 140ms) ease,
        border-color var(--rs-transition-fast, 140ms) ease;
      width: 100%;

      &::placeholder {
        color: var(--rs-textarea-placeholder-color, var(--rs-color-muted, #4f5b7d));
      }

      &:focus-visible {
        border-color: var(--rs-textarea-focus-border-color, var(--rs-color-accent, #2f5bdb));
        outline: 2px solid var(--rs-textarea-focus-ring-color, var(--rs-color-focus-ring, #296dff));
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &--sm {
        --rs-textarea-font-size: var(--rs-textarea-font-size-sm);
        --rs-textarea-min-height: var(--rs-textarea-min-height-sm);
        --rs-textarea-padding-inline: var(--rs-textarea-padding-inline-sm);
      }

      &--md {
        --rs-textarea-font-size: var(--rs-textarea-font-size-md);
        --rs-textarea-min-height: var(--rs-textarea-min-height-md);
        --rs-textarea-padding-inline: var(--rs-textarea-padding-inline-md);
      }

      &--lg {
        --rs-textarea-font-size: var(--rs-textarea-font-size-lg);
        --rs-textarea-min-height: var(--rs-textarea-min-height-lg);
        --rs-textarea-padding-inline: var(--rs-textarea-padding-inline-lg);
      }

      // The error state owns a coordinated colour set, so the modifier reassigns the locals the base
      // rule already reads instead of restating background, border and colour.
      &--invalid {
        --rs-textarea-bg: var(--rs-color-danger-bg, #ffeef0);
        --rs-textarea-border-color: var(--rs-color-danger-border, #f0a8b0);
        --rs-textarea-color: var(--rs-color-danger-fg, #3d0a08);
      }

      @include container-query-up($rs-cq-sm) {
        --rs-textarea-font-size-sm: var(--rs-font-size-md, #{to-rem(16)});
        --rs-textarea-font-size-md: var(--rs-font-size-lg, #{to-rem(18)});
        --rs-textarea-font-size-lg: var(--rs-font-size-xl, #{to-rem(20)});
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }
  }
</style>
