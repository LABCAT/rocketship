<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Disclosure from '@labcat2020/rocketship-svelte/components/Disclosure'
</script>

<Container as="main" size="content" padded>
  <Disclosure>
    {#snippet summarySlot()}
      Release <strong>2026.10</strong> — rollback support
    {/snippet}
    Roll back a deployment to any build from the last ninety days. The action is recorded in the
    incident timeline with the account that triggered it.
  </Disclosure>

  <Disclosure summary="Keyboard controls">
    Focus a summary and press Enter or Space to toggle it. The disclosure is a native
    <code>details</code> element, so assistive technology reports the expanded state.
  </Disclosure>
</Container>
