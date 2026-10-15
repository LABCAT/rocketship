<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
</script>

<Container as="main" size="content" padded>
  <Field id="label-default">
    {#snippet labelSlot()}
      <Label for="label-default">Email address</Label>
    {/snippet}
    {#snippet children(control)}
      <input {...control} type="email" autocomplete="email" />
    {/snippet}
  </Field>

  <Field id="label-required">
    {#snippet labelSlot()}
      <Label for="label-required" required>Email address</Label>
    {/snippet}
    {#snippet children(control)}
      <input {...control} type="email" required />
    {/snippet}
  </Field>

  <Field id="label-optional">
    {#snippet labelSlot()}
      <Label for="label-optional" optional>Referral code</Label>
    {/snippet}
    {#snippet children(control)}
      <input {...control} type="text" />
    {/snippet}
  </Field>
</Container>
