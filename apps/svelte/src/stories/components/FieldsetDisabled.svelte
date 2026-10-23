<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
  import Select from '@labcat2020/rocketship-svelte/components/Select'
  import Textarea from '@labcat2020/rocketship-svelte/components/Textarea'
</script>

<Container as="main" size="content" padded>
  <Fieldset legend="Billing contact" disabled>
    <Field label="Full name" hint="Appears on every invoice.">
      {#snippet children(control)}
        <Input {...control} value="Ada Lovelace" />
      {/snippet}
    </Field>

    <Field label="Billing email" hint="We send receipts and dunning notices here.">
      {#snippet children(control)}
        <Input {...control} type="email" value="billing@labcat.dev" />
      {/snippet}
    </Field>

    <Field label="Country">
      {#snippet children(control)}
        <Select {...control} value="gb">
          <option value="gb">United Kingdom</option>
          <option value="de">Germany</option>
        </Select>
      {/snippet}
    </Field>

    <Field label="Purchase order" hint="Optional reference for your finance team." optional>
      {#snippet children(control)}
        <Textarea {...control} rows="2" value="PO-4471"></Textarea>
      {/snippet}
    </Field>
  </Fieldset>

  <Fieldset legend="Shipping contact">
    <Field label="Full name">
      {#snippet children(control)}
        <Input {...control} value="Grace Hopper" />
      {/snippet}
    </Field>
  </Fieldset>
</Container>
