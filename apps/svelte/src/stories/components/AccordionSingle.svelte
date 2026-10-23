<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Accordion from '@labcat2020/rocketship-svelte/components/Accordion'
  import Disclosure from '@labcat2020/rocketship-svelte/components/Disclosure'
</script>

<Container as="main" size="content" padded>
  <Accordion mode="single">
    <Disclosure summary="Which plan fits a small team?" open>
      Starter covers five seats and one production environment. It includes the full deployment
      history and ninety days of build logs.
    </Disclosure>
    <Disclosure summary="Can I change plans later?">
      Yes. Upgrades apply immediately and downgrades apply at the end of the current billing cycle.
    </Disclosure>
    <Disclosure summary="Do you offer annual billing?">
      Annual billing takes two months off the list price. Contact support to switch an existing
      workspace.
    </Disclosure>
  </Accordion>
</Container>
