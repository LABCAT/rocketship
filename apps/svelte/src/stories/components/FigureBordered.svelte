<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Figure from '@labcat2020/rocketship-svelte/components/Figure'
</script>

<Container as="main" size="content" padded>
  <Figure variant="bordered" caption="Onboarding checklist shown to every new workspace owner.">
    <svg
      role="img"
      aria-label="Onboarding checklist with three completed steps"
      viewBox="0 0 480 240"
      width="480"
      height="240"
      fill="currentColor"
    >
      <rect width="480" height="240" opacity="0.1" />
      <rect x="48" y="48" width="384" height="24" rx="4" />
      <rect x="48" y="96" width="384" height="24" rx="4" opacity="0.7" />
      <rect x="48" y="144" width="384" height="24" rx="4" opacity="0.4" />
    </svg>
  </Figure>
</Container>
