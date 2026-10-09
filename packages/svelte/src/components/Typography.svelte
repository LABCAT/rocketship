<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type TypographyTag = 'div' | 'section' | 'article'

  type Props = {
    as?: TypographyTag
    html?: string
    class?: string
    children?: Snippet
  } & HTMLAttributes<HTMLElement>

  let { as = 'div', html, class: className = '', children, ...attrs }: Props = $props()

  const classes = $derived(['rs-typography', className].filter(Boolean).join(' '))
</script>

<svelte:element this={as} {...attrs} class={classes}>
  {#if html}
    {@html html}
  {:else}
    {@render children?.()}
  {/if}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-typography {
      h1 {
        @include typography-h1;
      }

      h2 {
        @include typography-h2;
      }

      h3 {
        @include typography-h3;
      }

      h4 {
        @include typography-h4;
      }

      h5 {
        @include typography-h5;
      }

      h6 {
        @include typography-h6;
      }

      p {
        @include typography-p;
      }

      a {
        @include typography-a;
      }

      .intro-text {
        @include typography-intro;
      }

      i,
      em {
        @include typography-em;
      }

      b,
      strong {
        @include typography-strong;
      }

      hr {
        @include typography-hr;
      }

      li {
        @include typography-li;
      }

      ul {
        @include typography-ul;
      }

      ol {
        @include typography-ol;
      }

      @include typography-list-bridges;

      pre {
        @include typography-pre;
      }

      pre code {
        @include typography-pre-code;
      }

      code {
        @include typography-code-inline;
      }

      kbd {
        @include typography-kbd;
      }

      samp {
        @include typography-samp;
      }

      blockquote {
        @include typography-blockquote;
      }

      blockquote p {
        @include typography-blockquote-p;
      }

      q {
        @include typography-q;
      }

      table {
        @include typography-table;
      }

      caption {
        @include typography-caption;
      }

      dl {
        @include typography-dl;
      }

      dt {
        @include typography-dt;
      }

      dd {
        @include typography-dd;
      }

      small {
        @include typography-small;
      }

      sub {
        @include typography-sub;
      }

      sup {
        @include typography-sup;
      }

      mark {
        @include typography-mark;
      }

      abbr[title] {
        @include typography-abbr;
      }

      del {
        @include typography-del;
      }

      ins {
        @include typography-ins;
      }

      address {
        @include typography-address;
      }

      dfn {
        @include typography-dfn;
      }

      cite {
        @include typography-cite;
      }

      var {
        @include typography-var;
      }

      time {
        @include typography-time;
      }

      > :first-child {
        margin-top: 0;
      }

      > :last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
