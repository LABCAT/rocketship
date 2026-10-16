<script module lang="ts">
  import { createContext } from 'svelte'

  /**
   * A disclosure registered with an Accordion. `isOpen` lets the accordion reconcile
   * panels when it switches into single-open mode, and `close` is how it collapses a
   * sibling.
   */
  export type AccordionItem = { isOpen: () => boolean; close: () => void }

  export type AccordionContext = {
    register: (item: AccordionItem) => void
    unregister: (item: AccordionItem) => void
    opened: (item: AccordionItem) => void
  }

  export const [getAccordion, setAccordion, hasAccordion] = createContext<AccordionContext>()
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLDetailsAttributes, ToggleEventHandler } from 'svelte/elements'

  export type DisclosureTag = 'details'

  type Props = {
    as?: DisclosureTag
    summary?: string
    open?: boolean
    class?: string
    summarySlot?: Snippet
    children?: Snippet
  } & Omit<HTMLDetailsAttributes, 'open'>

  let {
    as = 'details',
    summary,
    open = $bindable(false),
    class: className = '',
    summarySlot,
    children,
    ontoggle,
    ...attrs
  }: Props = $props()

  const accordion = hasAccordion() ? getAccordion() : undefined

  const self: AccordionItem = {
    isOpen: () => open,
    close: () => {
      open = false
    },
  }

  $effect(() => {
    if (!accordion) return
    accordion.register(self)
    if (untrack(() => open)) accordion.opened(self)
    return () => accordion.unregister(self)
  })

  // `<details>` fires `toggle` once its own open state has changed, so mirroring the
  // element here is what gives consumers a working `bind:open`.
  const onToggle: ToggleEventHandler<HTMLDetailsElement> = (event) => {
    open = event.currentTarget.open
    if (open) accordion?.opened(self)
    ontoggle?.(event)
  }

  const classes = $derived(['rs-disclosure', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes} open={open} ontoggle={onToggle}>
  <summary class="rs-disclosure__summary">
    <span class="rs-disclosure__label">
      {#if summary}{summary}{:else if summarySlot}{@render summarySlot()}{/if}
    </span>
    <span class="rs-disclosure__indicator" aria-hidden="true"></span>
  </summary>
  <div class="rs-disclosure__panel">
    {@render children?.()}
  </div>
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-disclosure {
      --rs-disclosure-duration: var(--rs-transition-fast, 140ms);
      --rs-disclosure-font-size: var(--rs-font-size-md, #{to-rem(16)});
      border: var(--rs-disclosure-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-disclosure-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-disclosure-border-radius, var(--rs-radius-md, 10px));
      color: var(--rs-disclosure-color, var(--rs-color-fg, #131a2f));
      font-family: var(
        --rs-font-family-sans,
        'Inter',
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif
      );

      &__summary {
        align-items: center;
        cursor: pointer;
        display: flex;
        font-size: var(--rs-disclosure-summary-font-size, var(--rs-disclosure-font-size));
        font-weight: var(--rs-font-weight-medium, 500);
        gap: var(--rs-space-2, 8px);
        justify-content: space-between;
        line-height: var(--rs-line-height-tight, 1.2);
        list-style: none;
        padding-block: var(--rs-disclosure-summary-padding-block, var(--rs-space-3, 12px));
        padding-inline: var(--rs-disclosure-summary-padding-inline, var(--rs-space-4, 16px));

        &::-webkit-details-marker {
          display: none;
        }

        &:focus-visible {
          outline: 2px solid var(--rs-color-focus-ring, #296dff);
          outline-offset: -2px;
        }
      }

      &__label {
        min-width: 0;
      }

      &__indicator {
        border-color: currentcolor;
        border-style: solid;
        border-width: 0 var(--rs-border-width-md, 2px) var(--rs-border-width-md, 2px) 0;
        flex: none;
        height: 8px;
        transform: rotate(45deg);
        transition: transform var(--rs-disclosure-duration) ease;
        width: 8px;
      }

      &__panel {
        font-size: var(--rs-disclosure-panel-font-size, var(--rs-disclosure-font-size));
        opacity: 0;
        padding-block: 0 var(--rs-disclosure-panel-padding-block, var(--rs-space-4, 16px));
        padding-inline: var(--rs-disclosure-panel-padding-inline, var(--rs-space-4, 16px));
        transform: translateY(-2px);
        transition:
          opacity var(--rs-disclosure-duration) ease-out,
          transform var(--rs-disclosure-duration) ease-out;
      }

      &[open] {
        .rs-disclosure__indicator {
          transform: rotate(-135deg);
        }

        .rs-disclosure__panel {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @include container-query-up($rs-cq-sm) {
        --rs-disclosure-font-size: var(--rs-font-size-lg, #{to-rem(18)});
      }

      @media (prefers-reduced-motion: reduce) {
        .rs-disclosure__indicator,
        .rs-disclosure__panel {
          transition: none;
        }
      }
    }
  }
</style>
