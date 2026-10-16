<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Accordion from '@labcat2020/rocketship-svelte/components/Accordion'
  import Disclosure from '@labcat2020/rocketship-svelte/components/Disclosure'
</script>

<Container as="main" size="content" padded>
  <Accordion>
    <Disclosure summary="Billing">
      Invoices are issued on the first working day of the month and emailed to every workspace
      owner.
    </Disclosure>
    <Disclosure summary="Seats">
      Add or remove seats from workspace settings. Changes apply at the next billing cycle.
    </Disclosure>
    <Disclosure summary="Data retention">
      Build logs are kept for ninety days. Deployment records are kept indefinitely.
    </Disclosure>
  </Accordion>
</Container>
