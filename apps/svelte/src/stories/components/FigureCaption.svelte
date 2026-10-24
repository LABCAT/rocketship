<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Figure from '@labcat2020/rocketship-svelte/components/Figure'
</script>

<Container as="main" size="content" padded>
  <Figure>
    <svg
      role="img"
      aria-label="Pipeline overview with no caption"
      viewBox="0 0 480 160"
      width="480"
      height="160"
      fill="currentColor"
    >
      <rect width="480" height="160" opacity="0.1" />
      <rect x="32" y="64" width="416" height="32" rx="8" />
    </svg>
  </Figure>

  <Figure>
    <svg
      role="img"
      aria-label="Traffic by region split between edge and origin reads"
      viewBox="0 0 480 160"
      width="480"
      height="160"
      fill="currentColor"
    >
      <rect width="480" height="160" opacity="0.1" />
      <rect x="48" y="48" width="384" height="24" rx="4" />
      <rect x="48" y="88" width="288" height="24" rx="4" opacity="0.6" />
    </svg>
    {#snippet captionSlot()}
      Fig. 1 — Traffic by region, with <em>edge</em> reads separated from
      <a href="https://example.com/regions">origin</a> reads.
    {/snippet}
  </Figure>
</Container>
