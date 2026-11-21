<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type ScrollProps = {
    vertical?: boolean
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLDivElement>

  let { vertical = false, class: className = '', children, ...attrs }: ScrollProps = $props()

  const classes = $derived(
    ['rs-scroll', vertical ? 'rs-scroll--vertical' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<div {...attrs} class={classes}>
  {@render children?.()}
</div>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-scroll {
      overflow-x: auto;

      /// The consumer makes the region focusable (`tabindex="0"`) so keyboard users can scroll it.
      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      /// Without a height limit it never scrolls, so the hook falls back to most of the screen.
      /// Sideways scrolling stays `auto`: it only appears when content is too wide, and the
      /// alternative (`hidden`) would cut that content off.
      &--vertical {
        max-block-size: var(--rs-scroll-max-block-size, 70dvh);
        overflow-y: auto;
      }
    }
  }
</style>
