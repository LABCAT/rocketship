<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Figure from '@labcat2020/rocketship-svelte/components/Figure'
</script>

<Container as="main" size="content" padded>
  <Figure caption="Deployment pipeline: build, test, and release run in order for every merge.">
    <svg
      role="img"
      aria-label="Deployment pipeline diagram with build, test, and release stages"
      viewBox="0 0 480 240"
      width="480"
      height="240"
      fill="currentColor"
    >
      <rect width="480" height="240" opacity="0.1" />
      <rect x="32" y="96" width="112" height="48" rx="8" />
      <rect x="184" y="96" width="112" height="48" rx="8" opacity="0.7" />
      <rect x="336" y="96" width="112" height="48" rx="8" opacity="0.4" />
    </svg>
  </Figure>

  <Figure caption="First response time by queue after the routing change, measured over seven days.">
    <svg
      role="img"
      aria-label="Bar chart of first response time by queue"
      viewBox="0 0 480 240"
      width="480"
      height="240"
      fill="currentColor"
    >
      <rect width="480" height="240" opacity="0.1" />
      <rect x="48" y="120" width="48" height="80" />
      <rect x="128" y="88" width="48" height="112" />
      <rect x="208" y="140" width="48" height="60" />
      <rect x="288" y="64" width="48" height="136" />
      <rect x="368" y="104" width="48" height="96" />
    </svg>
  </Figure>
</Container>
