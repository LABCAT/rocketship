<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  let street = $state('12 Bridge Street')
  let country = $state('gb')
</script>

<Container as="main" size="content" padded>
  <Fieldset>
    {#snippet legendSlot()}
      Billing address <span>(step 2 of 3)</span>
    {/snippet}

    <Field label="Street address">
      {#snippet children(control)}
        <Input {...control} autocomplete="street-address" bind:value={street} />
      {/snippet}
    </Field>

    <Field label="Country">
      {#snippet children(control)}
        <Select {...control} bind:value={country}>
          <option value="gb">United Kingdom</option>
          <option value="de">Germany</option>
          <option value="us">United States</option>
        </Select>
      {/snippet}
    </Field>
  </Fieldset>
</Container>
