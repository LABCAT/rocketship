<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type TableTag = 'div' | 'section'

  export type TableProps = {
    as?: TableTag
    striped?: boolean
    compact?: boolean
    hover?: boolean
    caption?: string
    label?: string
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'div',
    striped = false,
    compact = false,
    hover = false,
    caption,
    label,
    class: className = '',
    children,
    ...attrs
  }: TableProps = $props()

  let holder = $state<HTMLElement | null>(null)
  let table = $state<HTMLTableElement | null>(null)
  let overflows = $state(false)

  const hasCaption = $derived(Boolean(caption?.trim()))

  /**
   * Names the scroll region. The caption names the table, so it can name the region too; when
   * there is no caption, `label` is the only hook for an accessible name.
   */
  const regionLabel = $derived(label?.trim() || caption?.trim() || 'Table')

  const holderClasses = $derived(['rs-table-holder', className].filter(Boolean).join(' '))

  /**
   * The scroll region is announced only once the holder actually scrolls, and only for the keys
   * the consumer left unset, so an explicit `role`, `tabindex`, or `aria-label` always wins.
   */
  const regionAttrs = $derived.by(() => {
    if (!overflows) return {}
    const region: Record<string, unknown> = {}
    if (!('role' in attrs)) region.role = 'region'
    if (!('tabindex' in attrs)) region.tabindex = 0
    if (!('aria-label' in attrs)) region['aria-label'] = regionLabel
    return region
  })

  const tableClasses = $derived(
    [
      'rs-table',
      striped ? 'rs-table--striped' : undefined,
      compact ? 'rs-table--compact' : undefined,
      hover ? 'rs-table--hover' : undefined,
    ]
      .filter(Boolean)
      .join(' '),
  )

  /**
   * A scroll container only becomes reachable by keyboard once it actually overflows, so the
   * region semantics come from a measurement rather than being applied unconditionally: a
   * table that fits stays out of the tab order and off the landmark list. Both the holder and
   * the table are observed so a holder resize and a content resize each re-measure.
   */
  $effect(() => {
    const holderElement = holder
    const tableElement = table
    if (!holderElement || !tableElement) return

    const measure = () => {
      overflows = holderElement.scrollWidth > holderElement.clientWidth
    }

    measure()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(holderElement)
    observer.observe(tableElement)

    return () => observer.disconnect()
  })
</script>

<svelte:element this={as} {...attrs} {...regionAttrs} bind:this={holder} class={holderClasses}>
  <table class={tableClasses} bind:this={table}>
    {#if hasCaption}
      <caption>{caption}</caption>
    {/if}
    {@render children?.()}
  </table>
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-table-holder {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      background: var(--rs-color-surface, #ffffff);
      border: var(--rs-table-border-width, var(--rs-border-width-sm, 1px)) solid
        var(--rs-table-border-color, var(--rs-color-border, #c8d2eb));
      border-radius: var(--rs-table-border-radius, var(--rs-radius-md, 10px));

      &:focus-visible {
        outline: 2px solid var(--rs-table-focus-ring-color, var(--rs-color-focus-ring, #296dff));
        outline-offset: 2px;
      }
    }

    .rs-table {
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
      font-family: var(
        --rs-font-family-sans,
        'Inter',
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif
      );
      font-size: var(--rs-table-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
      line-height: var(--rs-line-height-base, 1.45);
      color: var(--rs-color-fg, #131a2f);
      text-align: left;

      th,
      td {
        padding-block: var(--rs-table-cell-padding-block, var(--rs-space-2, 8px));
        padding-inline: var(--rs-table-cell-padding-inline, var(--rs-space-3, 12px));
        text-align: left;
        vertical-align: top;
        border-bottom: var(--rs-table-border-width, var(--rs-border-width-sm, 1px)) solid
          var(--rs-table-border-color, var(--rs-color-border, #c8d2eb));
      }

      thead th {
        background: var(--rs-table-head-bg, var(--rs-color-surface-elevated, #eef2ff));
        color: var(--rs-table-head-color, var(--rs-color-fg, #131a2f));
        font-weight: var(--rs-font-weight-semibold, 600);
        white-space: nowrap;
        border-bottom-width: var(--rs-table-head-border-width, var(--rs-border-width-sm, 1px));
      }

      tbody tr:last-child td {
        border-bottom: 0;
      }

      caption {
        caption-side: top;
        color: var(--rs-color-muted, #4f5b7d);
        font-size: var(--rs-font-size-sm, #{to-rem(14)});
        line-height: var(--rs-line-height-base, 1.45);
        padding-block: var(--rs-space-2, 8px);
        padding-inline: var(--rs-space-3, 12px);
        text-align: left;
      }

      &--striped {
        tbody tr:nth-child(even) {
          background: var(--rs-table-striped-bg, var(--rs-color-surface-elevated, #eef2ff));
        }
      }

      &--hover {
        tbody tr:hover {
          background: var(--rs-table-hover-bg, var(--rs-color-surface-elevated, #eef2ff));
        }
      }

      &--compact {
        th,
        td {
          padding-block: var(--rs-table-compact-padding-block, var(--rs-space-1, 4px));
          padding-inline: var(--rs-table-compact-padding-inline, var(--rs-space-2, 8px));
        }
      }
    }
  }
</style>
