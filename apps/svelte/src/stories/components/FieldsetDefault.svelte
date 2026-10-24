<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  let billingName = $state('')
  let billingStreet = $state('')
</script>

<Container size="content" padded>
  <Stack gap="xlarge">
    <Fieldset>
      {#snippet legend()}Billing address{/snippet}
      <Field label="Name">
        {#snippet children(control)}
          <Input {...control} name="billing-name" autocomplete="name" bind:value={billingName} />
        {/snippet}
      </Field>
      <Field label="Street address">
        {#snippet children(control)}
          <Input
            {...control}
            name="billing-street"
            autocomplete="street-address"
            bind:value={billingStreet}
          />
        {/snippet}
      </Field>
    </Fieldset>
    <Fieldset disabled>
      {#snippet legend()}Shipping address{/snippet}
      <Field label="Name">
        {#snippet children(control)}
          <Input {...control} name="shipping-name" value="Grace Hopper" />
        {/snippet}
      </Field>
      <Field label="Street address">
        {#snippet children(control)}
          <Input {...control} name="shipping-street" value="1 Navy Yard" />
        {/snippet}
      </Field>
    </Fieldset>
  </Stack>
</Container>
