<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type StackTag = 'div' | 'ul' | 'ol'
  export type StackGap = 'small' | 'medium' | 'large'

  type Props = {
    as?: StackTag
    gap?: StackGap
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'div', gap = 'medium', class: className = '', children, ...attrs }: Props = $props()

  const classes = $derived(
    ['rs-stack', gap !== 'medium' ? `rs-stack--${gap}` : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<svelte:element
  this={as}
  role={as === 'div' ? undefined : 'list'}
  {...attrs}
  class={classes}
>
  {@render children?.()}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-stack {
      --rs-stack-gap: #{rs-token(space-4)};
      display: flex;
      flex-direction: column;
      gap: var(--rs-stack-gap);
      list-style: none;
      margin: 0;
      padding: 0;

      &--small {
        --rs-stack-gap: #{rs-token(space-2)};
      }

      &--large {
        --rs-stack-gap: #{rs-token(space-6)};
      }
    }
  }
</style>
