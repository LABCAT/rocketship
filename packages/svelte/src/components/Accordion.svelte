<script lang="ts">
  import { untrack } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { setAccordion, type AccordionItem } from './Disclosure.svelte'

  export type AccordionMode = 'multiple' | 'single'
  export type AccordionTag = 'div' | 'section' | 'article' | 'ul'

  type Props = {
    as?: AccordionTag
    mode?: AccordionMode
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'div',
    mode = 'multiple',
    class: className = '',
    children,
    ...attrs
  }: Props = $props()

  const items = new Set<AccordionItem>()
  let lastOpened: AccordionItem | undefined

  const closeSiblings = (item: AccordionItem) => {
    if (mode !== 'single') return
    for (const other of items) {
      if (other !== item) other.close()
    }
  }

  setAccordion({
    register: (item) => {
      items.add(item)
    },
    unregister: (item) => {
      items.delete(item)
      if (lastOpened === item) lastOpened = undefined
    },
    opened: (item) => {
      lastOpened = item
      closeSiblings(item)
    },
  })

  // Switching to single mode at runtime must reconcile panels that are already open,
  // keeping the most recently opened one. `untrack` avoids subscribing to child state.
  $effect(() => {
    if (mode !== 'single') return
    untrack(() => {
      const open = [...items].filter((item) => item.isOpen())
      if (open.length <= 1) return
      const keep = lastOpened && open.includes(lastOpened) ? lastOpened : open[open.length - 1]
      for (const item of open) {
        if (item !== keep) item.close()
      }
    })
  })

  const classes = $derived(
    ['rs-accordion', mode === 'single' ? 'rs-accordion--single' : undefined, className]
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
    .rs-accordion {
      --rs-accordion-gap: var(--rs-space-2, 8px);
      display: flex;
      flex-direction: column;
      gap: var(--rs-accordion-gap);

      &--single {
        --rs-accordion-gap: 0;
      }
    }
  }
</style>
