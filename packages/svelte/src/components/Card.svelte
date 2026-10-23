<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type CardTag = 'article' | 'section' | 'div' | 'li'

  type Props = {
    as?: CardTag
    class?: string
    media?: Snippet
    meta?: Snippet
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'article', class: className = '', media, meta, children, ...attrs }: Props = $props()

  const classes = $derived(['rs-card', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes}>
  {#if media}
    <div class="rs-card__media">
      {@render media()}
    </div>
  {/if}
  <div class="rs-card__body">
    <div class="rs-card__content">
      {@render children?.()}
    </div>
    {#if meta}
      <div class="rs-card__meta">
        {@render meta()}
      </div>
    {/if}
  </div>
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-card {
      --rs-card-media-bg: var(--rs-color-surface-elevated, #eef2ff);
      background: var(--rs-color-surface, #ffffff);
      border: var(--rs-card-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-card-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-card-border-radius, var(--rs-radius-md, 10px));
      box-shadow: var(--rs-card-shadow, none);
      overflow: hidden;

      &__media {
        background: var(--rs-card-media-bg);
        min-height: var(--rs-card-media-min-height, 96px);
      }

      &__body {
        display: flex;
        flex-direction: column;
        gap: var(--rs-card-body-gap, var(--rs-space-3, 12px));
        padding: var(--rs-card-body-padding, var(--rs-space-4, 16px));
      }

      &__content {
        display: flex;
        flex-direction: column;
        gap: var(--rs-card-content-gap, var(--rs-space-1, 4px));
        min-width: 0;
      }

      &__meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--rs-card-meta-gap, var(--rs-space-2, 8px));
        min-width: 0;
      }

      &__title {
        color: var(--rs-color-fg, #131a2f);
        font-family: var(
          --rs-font-family-sans,
          'Inter',
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif
        );
        font-size: var(--rs-font-size-lg, #{to-rem(18)});
        font-weight: var(--rs-font-weight-semibold, 600);
        line-height: var(--rs-line-height-tight, 1.2);
        margin: 0;
      }

      &__description {
        color: var(--rs-color-muted, #4f5b7d);
        font-family: var(
          --rs-font-family-sans,
          'Inter',
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif
        );
        font-size: var(--rs-font-size-md, #{to-rem(16)});
        line-height: var(--rs-line-height-base, 1.45);
        margin: 0;
      }

      &__token {
        background: var(--rs-color-surface-elevated, #eef2ff);
        border-radius: var(--rs-radius-sm, 6px);
        color: var(--rs-color-muted, #4f5b7d);
        display: inline-block;
        font-family: var(--rs-font-family-mono, ui-monospace, monospace);
        font-size: var(--rs-font-size-sm, #{to-rem(14)});
        line-height: var(--rs-line-height-base, 1.45);
        overflow-wrap: anywhere;
        padding-block: 2px;
        padding-inline: var(--rs-space-2, 8px);
      }
    }
  }
</style>
