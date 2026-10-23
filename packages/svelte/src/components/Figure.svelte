<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type FigureTag = 'figure' | 'div'
  export type FigureVariant = 'default' | 'bordered'
  export type FigureCaptionAlign = 'start' | 'center'

  type Props = {
    as?: FigureTag
    variant?: FigureVariant
    captionAlign?: FigureCaptionAlign
    caption?: string
    class?: string
    captionSlot?: Snippet
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'figure',
    variant = 'default',
    captionAlign = 'start',
    caption,
    class: className = '',
    captionSlot,
    children,
    ...attrs
  }: Props = $props()

  const hasCaptionText = $derived(Boolean(caption?.trim()))
  const hasCaption = $derived(hasCaptionText || Boolean(captionSlot))

  // `<figcaption>` is only valid inside `<figure>`, so the `div` root pairs the caption
  // with `role="note"` instead of rendering an orphaned caption element.
  const isFigure = $derived(as === 'figure')

  const classes = $derived(
    ['rs-figure', variant === 'bordered' ? 'rs-figure--bordered' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )

  const captionClasses = $derived(
    ['rs-figure__caption', captionAlign === 'center' ? 'rs-figure__caption--center' : undefined]
      .filter(Boolean)
      .join(' '),
  )
</script>

<svelte:element this={as} {...attrs} class={classes}>
  <div class="rs-figure__media">
    {@render children?.()}
  </div>
  {#if hasCaption}
    <svelte:element
      this={isFigure ? 'figcaption' : 'div'}
      class={captionClasses}
      role={isFigure ? undefined : 'note'}
    >
      {#if hasCaptionText}{caption}{/if}{#if captionSlot}{@render captionSlot()}{/if}
    </svelte:element>
  {/if}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-figure {
      container-name: rs-component;
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      gap: var(--rs-figure-gap, var(--rs-space-3, 12px));
      margin-block: 0 var(--rs-text-spacing-bottom, 16px);
      margin-inline: 0;

      &__media {
        border-radius: var(--rs-figure-media-radius, var(--rs-radius-md, 10px));
        display: block;
        overflow: hidden;

        :is(img, picture, video, canvas, svg) {
          display: block;
          height: auto;
          max-width: 100%;
          width: 100%;
        }

        table {
          margin-bottom: 0;
          width: 100%;
        }
      }

      // Only the bordered variant frames the media, so the border is declared on the
      // modifier and the default variant stays unframed.
      &--bordered .rs-figure__media {
        border: var(--rs-figure-media-border-width, var(--rs-border-width-sm, 1px)) solid
          var(--rs-figure-media-border-color, var(--rs-color-border, #c8d2eb));
      }

      &__caption {
        color: var(--rs-figure-caption-color, var(--rs-color-muted, #4f5b7d));
        font-family: var(
          --rs-font-family-sans,
          'Inter',
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif
        );
        font-size: var(--rs-figure-caption-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
        line-height: var(--rs-figure-caption-line-height, var(--rs-line-height-base, 1.45));
        text-align: start;

        @include container-query-up($rs-cq-sm) {
          font-size: var(--rs-figure-caption-font-size-sm, var(--rs-font-size-sm, #{to-rem(14)}));
        }

        &--center {
          text-align: center;
        }
      }
    }
  }
</style>
