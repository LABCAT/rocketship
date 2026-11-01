<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLSelectAttributes } from 'svelte/elements'

  type Props = {
    class?: string
    value?: string | string[]
    children?: Snippet
  } & Omit<HTMLSelectAttributes, 'value'>

  let { class: className = '', value = $bindable(), children, ...attrs }: Props = $props()

  // The control's own attribute is the one source of truth, so the painted error state and the
  // state assistive tech announces can never disagree.
  const invalid = $derived(attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true')
  // `multiple` or a row count above one renders a list box, where a dropdown chevron would lie.
  const list = $derived(Boolean(attrs.multiple) || Number(attrs.size) > 1)
  const classes = $derived(
    [
      'rs-select',
      list ? 'rs-select--list' : undefined,
      invalid ? 'rs-select--invalid' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

<select {...attrs} bind:value class={classes}>
  {@render children?.()}
</select>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-select {
      --rs-select-border-color: #{rs-token(color-border-control)};
      --rs-select-icon-color: #{rs-token(color-muted)};
      --rs-select-icon-space: #{rs-token(space-5)};
      --rs-select-icon:
        linear-gradient(45deg, transparent 50%, var(--rs-select-icon-color) 50%),
        linear-gradient(135deg, var(--rs-select-icon-color) 50%, transparent 50%);
      appearance: none;
      background-color: var(--rs-select-bg, #{rs-token(color-surface)});
      background-image: var(--rs-select-icon);
      background-position:
        right calc(var(--rs-select-padding-inline, #{rs-token(space-3)}) + 5px) center,
        right var(--rs-select-padding-inline, #{rs-token(space-3)}) center;
      background-repeat: no-repeat;
      background-size: 5px 5px;
      border: var(--rs-select-border-width, #{rs-token(border-width-sm)}) solid
        var(--rs-select-border-color);
      border-radius: var(--rs-select-border-radius, #{rs-token(radius-sm)});
      color: var(--rs-select-color, #{rs-token(color-fg)});
      cursor: pointer;
      font: inherit;
      line-height: #{rs-token(line-height-base)};
      margin: 0;
      padding-block: var(--rs-select-padding-block, #{rs-token(space-2)});
      padding-inline: var(--rs-select-padding-inline, #{rs-token(space-3)});
      padding-inline-end: calc(
        var(--rs-select-padding-inline, #{rs-token(space-3)}) + var(--rs-select-icon-space)
      );

      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &--list {
        --rs-select-icon: none;
        --rs-select-icon-space: 0px;
      }

      &--invalid {
        --rs-select-border-color: #{rs-token(color-danger-accent)};
      }

      // Forced colours can drop background images, so high-contrast users get the native arrow.
      @media (forced-colors: active) {
        --rs-select-icon: none;
        --rs-select-icon-space: 0px;
        appearance: auto;
      }
    }
  }
</style>
