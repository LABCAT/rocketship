<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLFieldsetAttributes } from 'svelte/elements'

  export type FieldsetTag = 'fieldset'

  export type FieldsetProps = {
    as?: FieldsetTag
    legend?: string
    disabled?: boolean
    class?: string
    legendSlot?: Snippet
    children?: Snippet
  } & Omit<HTMLFieldsetAttributes, 'disabled'>

  let {
    as = 'fieldset',
    legend,
    disabled = false,
    class: className = '',
    legendSlot,
    children,
    ...attrs
  }: FieldsetProps = $props()

  // A blank legend would leave the group named by nothing, so only real text counts. The prop wins
  // over the snippet because a fieldset takes exactly one legend, and it has to stay its first child.
  const hasLegendText = $derived(Boolean(legend?.trim()))
  const hasLegend = $derived(hasLegendText || Boolean(legendSlot))

  const classes = $derived(['rs-fieldset', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes} disabled={disabled}>
  {#if hasLegend}
    <legend class="rs-fieldset__legend">
      {#if hasLegendText}{legend}{:else}{@render legendSlot?.()}{/if}
    </legend>
  {/if}
  {@render children?.()}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-fieldset {
      background: var(--rs-fieldset-bg, transparent);
      border: var(--rs-fieldset-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-fieldset-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-fieldset-border-radius, var(--rs-radius-sm, 6px));
      display: flex;
      flex-direction: column;
      gap: var(--rs-fieldset-gap, var(--rs-space-3, 12px));
      margin: 0;
      // A fieldset sizes itself to its content, which overflows a grid or flex parent. Resetting
      // the min-content width lets it shrink into the space it is given.
      min-inline-size: 0;
      padding-block: var(--rs-fieldset-padding-block, var(--rs-space-3, 12px));
      padding-inline: var(--rs-fieldset-padding-inline, var(--rs-space-4, 16px));

      @include container-query-up($rs-cq-sm) {
        gap: var(--rs-fieldset-gap, var(--rs-space-4, 16px));
        padding-block: var(--rs-fieldset-padding-block, var(--rs-space-4, 16px));
        padding-inline: var(--rs-fieldset-padding-inline, var(--rs-space-5, 20px));
      }

      &__legend {
        color: var(--rs-fieldset-legend-color, var(--rs-color-fg, #131a2f));
        font-size: var(--rs-fieldset-legend-font-size, var(--rs-font-size-md, #{to-rem(16)}));
        font-weight: var(--rs-fieldset-legend-font-weight, var(--rs-font-weight-semibold, 600));
        line-height: var(--rs-fieldset-legend-line-height, var(--rs-line-height-tight, 1.2));
        margin: 0;
        padding: 0;

        @include container-query-up($rs-cq-sm) {
          font-size: var(--rs-fieldset-legend-font-size, var(--rs-font-size-lg, #{to-rem(18)}));
        }
      }

      // Nested controls are disabled by the browser itself; the legend is not a control, so its
      // dimming has to be styled. Controls inside the legend stay operable, as the spec requires.
      &:disabled &__legend {
        color: var(--rs-fieldset-disabled-legend-color, var(--rs-color-muted, #4f5b7d));
      }
    }
  }
</style>
