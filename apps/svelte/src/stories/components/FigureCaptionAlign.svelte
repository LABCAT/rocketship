<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Figure from '@labcat2020/rocketship-svelte/components/Figure'
</script>

<Container as="main" size="content" padded>
  <Figure captionAlign="start" caption="Start aligned caption, the default reading order for body copy.">
    <svg
      role="img"
      aria-label="Start aligned caption example"
      viewBox="0 0 480 160"
      width="480"
      height="160"
      fill="currentColor"
    >
      <rect width="480" height="160" opacity="0.1" />
      <rect x="48" y="64" width="384" height="32" rx="8" />
    </svg>
  </Figure>

  <Figure captionAlign="center" caption="Centre aligned caption, used under a centred chart or diagram.">
    <svg
      role="img"
      aria-label="Centre aligned caption example"
      viewBox="0 0 480 160"
      width="480"
      height="160"
      fill="currentColor"
    >
      <rect width="480" height="160" opacity="0.1" />
      <rect x="48" y="64" width="384" height="32" rx="8" />
    </svg>
  </Figure>
</Container>
