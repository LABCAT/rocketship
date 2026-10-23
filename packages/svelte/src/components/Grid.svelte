<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type GridColumns = 2 | 3 | 4
  export type GridTag = 'div' | 'ul' | 'ol'

  type Props = {
    as?: GridTag
    columns?: GridColumns
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'div', columns = 2, class: className = '', children, ...attrs }: Props = $props()

  const classes = $derived(
    [
      'rs-grid',
      columns === 3 ? 'rs-grid--3-cols' : undefined,
      columns === 4 ? 'rs-grid--4-cols' : undefined,
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
    .rs-grid {
      display: grid;
      gap: var(--rs-grid-gap, var(--rs-space-4, 16px));
      grid-template-columns: minmax(0, 1fr);
      list-style: none;
      margin: 0;
      padding: 0;

      @include container-query-up($rs-cq-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      &--3-cols {
        @include container-query-up($rs-cq-md) {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      &--4-cols {
        @include container-query-up($rs-cq-md) {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
    }
  }
</style>
