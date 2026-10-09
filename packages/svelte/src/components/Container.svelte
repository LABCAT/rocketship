<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type ContainerSize = 'default' | 'full' | 'wide' | 'content'
  export type ContainerTag = 'div' | 'section' | 'main' | 'article' | 'header' | 'footer' | 'nav'

  type Props = {
    as?: ContainerTag
    size?: ContainerSize
    padded?: boolean
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'div',
    size = 'default',
    padded = false,
    class: className = '',
    children,
    ...attrs
  }: Props = $props()

  const classes = $derived(
    [
      'rs-container',
      size === 'full' ? 'rs-container--full-width' : undefined,
      size === 'wide' ? 'rs-container--wide' : undefined,
      size === 'content' ? 'rs-container--content' : undefined,
      padded ? 'rs-container--padded' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

<svelte:element this={as} {...attrs} class={classes}>
  {@render children?.()}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-container {
      container-type: inline-size;
      container-name: rs-component;
      --rs-container-width: var(--rs-container-width-default, 1000px);
      --rs-container-gutter-left: max(env(safe-area-inset-left), var(--rs-container-gutter, 16px));
      --rs-container-gutter-right: max(env(safe-area-inset-right), var(--rs-container-gutter, 16px));
      --rs-container-gutters: calc(
        var(--rs-container-gutter-left) + var(--rs-container-gutter-right)
      );
      --rs-container-gutter-top: max(
        env(safe-area-inset-top),
        var(--rs-container-padding-block-start, 0px)
      );
      --rs-container-gutter-bottom: max(
        env(safe-area-inset-bottom),
        var(--rs-container-padding-block-end, 0px)
      );
      margin-inline: auto;
      max-width: calc(var(--rs-container-width) + var(--rs-container-gutters));
      padding-block: var(--rs-container-gutter-top) var(--rs-container-gutter-bottom);
      padding-inline: var(--rs-container-gutter-left) var(--rs-container-gutter-right);
      width: 100%;

      &--content {
        --rs-container-width: var(--rs-container-width-content-sm, 600px);

        @include media-breakpoint-up(lg) {
          --rs-container-width: var(--rs-container-width-content-lg, 800px);
        }
      }

      &--wide {
        --rs-container-width: var(--rs-container-width-wide, 1200px);
      }

      &--full-width {
        --rs-container-width: 100%;
      }

      &--padded {
        padding-block: var(--rs-container-padding-block, 20px);
      }

      &--no-gutters {
        padding-inline: 0;
      }
    }
  }
</style>
