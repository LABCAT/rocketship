<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLFieldsetAttributes } from 'svelte/elements'

  export type FieldsetProps = {
    class?: string
    legend?: Snippet
    children?: Snippet
  } & HTMLFieldsetAttributes

  let { class: className = '', legend, children, ...attrs }: FieldsetProps = $props()

  const classes = $derived(['rs-fieldset', className].filter(Boolean).join(' '))
</script>

<fieldset {...attrs} class={classes}>
  {#if legend}
    <legend class="rs-fieldset__legend">{@render legend()}</legend>
  {/if}
  {@render children?.()}
</fieldset>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-fieldset {
      display: flex;
      flex-direction: column;
      gap: var(--rs-fieldset-gap, #{rs-token(space-4)});
      border: 0;
      margin: 0;
      min-inline-size: 0;
      padding: 0;

      /// Floating opts out of the legend's border-notch layout, so it becomes a flex item and
      /// the block's gap owns its spacing. Flex items ignore float, so nothing floats.
      &__legend {
        float: inline-start;
        color: var(--rs-fieldset-legend-color, #{rs-token(color-fg)});
        font-size: var(--rs-fieldset-legend-font-size, #{rs-token(font-size-lg)});
        font-weight: var(--rs-fieldset-legend-font-weight, #{rs-token(font-weight-semibold)});
        line-height: #{rs-token(line-height-tight)};
        margin: 0;
        padding: 0;
      }

      &__hint {
        color: var(--rs-fieldset-hint-color, #{rs-token(color-muted)});
        margin: 0;
      }

      &__error {
        color: var(--rs-fieldset-error-color, #{rs-token(color-danger-text)});
        font-weight: var(--rs-fieldset-error-font-weight, #{rs-token(font-weight-semibold)});
        margin: 0;
      }
    }
  }
</style>
