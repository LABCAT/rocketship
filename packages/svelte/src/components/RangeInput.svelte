<script lang="ts">
  import { untrack } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  export type RangeInputProps = {
    value?: number
    class?: string
  } & Omit<HTMLInputAttributes, 'type' | 'value'>

  // `min`, `max` and `step` stay native attributes: the platform clamps and snaps the value, so the
  // component never re-implements the range rules. `value` is a number, because a range is a number.
  let { value = $bindable(), class: className = '', ...attrs }: RangeInputProps = $props()

  let control = $state<HTMLInputElement | null>(null)

  // A range keeps only the values it accepts: a write outside `min`/`max`, or between two steps,
  // moves the thumb but leaves the number in the state where it was, so an output the consumer
  // writes from that state would disagree with the slider. Reading the accepted value back settles
  // the state on the number the thumb is showing, and an unset value adopts the platform default
  // the slider already displays.
  $effect(() => {
    const next = value
    const element = untrack(() => control)
    if (!element) return

    if (next != null) element.value = String(next)

    const accepted = element.valueAsNumber
    if (Number.isFinite(accepted) && accepted !== next) value = accepted
  })

  // The control's own attribute is the one source of truth, so the painted error state and the
  // state assistive tech announces can never disagree.
  const invalid = $derived(attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true')
  const classes = $derived(
    ['rs-range-input', invalid ? 'rs-range-input--invalid' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<input bind:this={control} {...attrs} type="range" class={classes} bind:value />

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-range-input {
      --rs-range-input-track-color: #{rs-token(color-border-control)};
      --rs-range-input-thumb-border-color: #{rs-token(color-accent)};
      block-size: calc(var(--rs-range-input-thumb-size, 24px) + #{rs-token(space-2)});
      margin: 0;
      appearance: none;
      background: transparent;
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      /// The track and thumb are the input's own parts. WebKit and Firefox name them differently,
      /// so each part is written twice.
      &::-webkit-slider-runnable-track {
        block-size: var(--rs-range-input-track-height, 4px);
        background: var(--rs-range-input-track-color);
        border-radius: #{rs-token(radius-pill)};
      }

      &::-webkit-slider-thumb {
        box-sizing: border-box;
        block-size: var(--rs-range-input-thumb-size, 24px);
        inline-size: var(--rs-range-input-thumb-size, 24px);
        margin-block-start: calc(
          (var(--rs-range-input-track-height, 4px) - var(--rs-range-input-thumb-size, 24px)) / 2
        );
        appearance: none;
        background: var(--rs-range-input-thumb-bg, #{rs-token(color-surface)});
        border: var(--rs-range-input-thumb-border-width, #{rs-token(border-width-md)}) solid
          var(--rs-range-input-thumb-border-color);
        border-radius: #{rs-token(radius-pill)};

        /// WebKit sets the thumb's appearance separately from the input's.
        @media (forced-colors: active) {
          appearance: auto;
        }
      }

      &::-moz-range-track {
        block-size: var(--rs-range-input-track-height, 4px);
        background: var(--rs-range-input-track-color);
        border-radius: #{rs-token(radius-pill)};
      }

      &::-moz-range-thumb {
        box-sizing: border-box;
        block-size: var(--rs-range-input-thumb-size, 24px);
        inline-size: var(--rs-range-input-thumb-size, 24px);
        background: var(--rs-range-input-thumb-bg, #{rs-token(color-surface)});
        border: var(--rs-range-input-thumb-border-width, #{rs-token(border-width-md)}) solid
          var(--rs-range-input-thumb-border-color);
        border-radius: #{rs-token(radius-pill)};
      }

      &--invalid {
        --rs-range-input-track-color: #{rs-token(color-danger-accent)};
        --rs-range-input-thumb-border-color: #{rs-token(color-danger-accent)};
      }

      /// Forced colours repaint the track in the page colour, so high-contrast users get the native
      /// slider.
      @media (forced-colors: active) {
        appearance: auto;
      }
    }
  }
</style>
