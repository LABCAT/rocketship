<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Input from '@labcat2020/rocketship-svelte/components/Input'

  let name = $state('Ada Lovelace')
  let email = $state('billing@labcat.dev')
</script>

<Container as="main" size="content" padded>
  <Fieldset legend="Billing contact">
    <Field label="Full name" hint="Appears on every invoice.">
      {#snippet children(control)}
        <Input {...control} autocomplete="name" bind:value={name} />
      {/snippet}
    </Field>

    <Field label="Billing email" hint="We send receipts and dunning notices here.">
      {#snippet children(control)}
        <Input {...control} type="email" autocomplete="email" bind:value={email} />
      {/snippet}
    </Field>
  </Fieldset>
</Container>
