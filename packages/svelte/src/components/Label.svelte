<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLLabelAttributes } from 'svelte/elements'

  export type LabelTag = 'label' | 'span' | 'div'

  type Props = {
    as?: LabelTag
    required?: boolean
    optional?: boolean
    requiredText?: string
    optionalText?: string
    class?: string
    children?: Snippet
  } & HTMLLabelAttributes

  let {
    as = 'label',
    required = false,
    optional = false,
    requiredText = '(required)',
    optionalText = '(optional)',
    class: className = '',
    for: htmlFor,
    children,
    ...attrs
  }: Props = $props()

  const classes = $derived(['rs-label', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes} for={as === 'label' ? htmlFor : undefined}>
  {@render children?.()}
  {#if required}
    <span class="rs-label__required" aria-hidden="true">*</span>
    <span class="rs-label__sr-only">{requiredText}</span>
  {:else if optional}
    <span class="rs-label__optional">{optionalText}</span>
  {/if}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-label {
      align-items: baseline;
      color: var(--rs-label-color, var(--rs-color-fg, #131a2f));
      display: flex;
      font-family: var(
        --rs-font-family-sans,
        'Inter',
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif
      );
      font-size: var(--rs-label-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
      font-weight: var(--rs-label-font-weight, var(--rs-font-weight-medium, 500));
      gap: var(--rs-label-gap, var(--rs-space-1, 4px));
      line-height: var(--rs-label-line-height, var(--rs-line-height-base, 1.45));

      @include container-query-up($rs-cq-sm) {
        font-size: var(--rs-label-font-size, var(--rs-font-size-md, #{to-rem(16)}));
      }

      &__required {
        color: var(--rs-label-required-color, var(--rs-color-danger-accent, #c5221f));
        font-weight: var(--rs-font-weight-regular, 400);
      }

      &__optional {
        color: var(--rs-label-optional-color, var(--rs-color-muted, #4f5b7d));
        font-weight: var(--rs-font-weight-regular, 400);
      }

      &__sr-only {
        border: 0;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }
    }
  }
</style>
