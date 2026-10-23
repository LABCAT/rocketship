<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
  export type AlertTag = 'div' | 'section' | 'aside' | 'article'

  type Props = {
    as?: AlertTag
    variant?: AlertVariant
    title?: string
    role?: 'alert' | 'status'
    class?: string
    titleSlot?: Snippet
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'div',
    variant = 'info',
    title,
    role: roleProp,
    class: className = '',
    titleSlot,
    children,
    ...attrs
  }: Props = $props()

  const role = $derived(roleProp ?? (variant === 'error' || variant === 'warning' ? 'alert' : 'status'))

  const classes = $derived(['rs-alert', `rs-alert--${variant}`, className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes} role={role}>
  {#if title}
    <h4 class="rs-alert__title">{title}</h4>
  {:else if titleSlot}
    <h4 class="rs-alert__title">
      {@render titleSlot()}
    </h4>
  {/if}
  <div class="rs-alert__body">
    {@render children?.()}
  </div>
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-alert {
      --rs-alert-bg: var(--rs-color-surface-elevated, #eef2ff);
      --rs-alert-color: var(--rs-color-fg, #131a2f);
      --rs-alert-border-color: var(--rs-color-border, #c8d2eb);
      --rs-alert-accent-color: var(--rs-color-accent, #2f5bdb);
      display: flex;
      flex-direction: column;
      gap: var(--rs-alert-gap, var(--rs-space-2, 8px));
      font-family: var(
        --rs-font-family-sans,
        'Inter',
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif
      );
      background: var(--rs-alert-bg);
      border: var(--rs-alert-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-alert-border-color);
      border-inline-start: var(--rs-alert-accent-width, var(--rs-border-width-lg, 4px)) solid
        var(--rs-alert-accent-color);
      border-radius: var(--rs-alert-border-radius, var(--rs-radius-md, 10px));
      color: var(--rs-alert-color);
      padding-block: var(--rs-alert-padding-block, var(--rs-space-3, 12px));
      padding-inline: var(--rs-alert-padding-inline, var(--rs-space-4, 16px));

      @include container-query-up($rs-cq-sm) {
        gap: var(--rs-alert-gap, var(--rs-space-3, 12px));
        padding-block: var(--rs-alert-padding-block, var(--rs-space-4, 16px));
        padding-inline: var(--rs-alert-padding-inline, var(--rs-space-5, 20px));
      }

      &--success {
        --rs-alert-bg: var(--rs-color-success-bg, #e6f4ea);
        --rs-alert-border-color: var(--rs-color-success-border, #a7d8b5);
        --rs-alert-accent-color: var(--rs-color-success-accent, #1a7a32);
        --rs-alert-color: var(--rs-color-success-fg, #0f2a18);
      }

      &--warning {
        --rs-alert-bg: var(--rs-color-warning-bg, #fff8e1);
        --rs-alert-border-color: var(--rs-color-warning-border, #f0c36a);
        --rs-alert-accent-color: var(--rs-color-warning-accent, #9a5d00);
        --rs-alert-color: var(--rs-color-warning-fg, #3d2800);
      }

      &--error {
        --rs-alert-bg: var(--rs-color-danger-bg, #ffeef0);
        --rs-alert-border-color: var(--rs-color-danger-border, #f0a8b0);
        --rs-alert-accent-color: var(--rs-color-danger-accent, #c5221f);
        --rs-alert-color: var(--rs-color-danger-fg, #3d0a08);
      }

      &__title {
        color: var(--rs-alert-color);
        font-size: var(--rs-alert-title-font-size, var(--rs-font-size-md, #{to-rem(16)}));
        font-weight: var(--rs-alert-title-font-weight, var(--rs-font-weight-semibold, 600));
        line-height: var(--rs-alert-title-line-height, var(--rs-line-height-tight, 1.2));
        margin: 0;

        @include container-query-up($rs-cq-sm) {
          font-size: var(--rs-alert-title-font-size, var(--rs-font-size-lg, #{to-rem(18)}));
        }
      }

      &__body {
        color: var(--rs-alert-color);
        font-size: var(--rs-alert-body-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
        line-height: var(--rs-alert-body-line-height, var(--rs-line-height-base, 1.45));
        margin: 0;

        @include container-query-up($rs-cq-sm) {
          font-size: var(--rs-alert-body-font-size, var(--rs-font-size-md, #{to-rem(16)}));
        }
      }
    }
  }
</style>
