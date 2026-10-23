<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
</script>

<Container as="main" size="content" padded>
  <Field label="Support email" error="Enter a valid email address, for example ops@acme.example.">
    {#snippet children(control)}
      <Input {...control} type="email" value="ops@acme" />
    {/snippet}
  </Field>

  <Field label="Region" hint="The region is fixed for this workspace." disabled>
    {#snippet children(control)}
      <Input {...control} type="text" value="eu-central-1" />
    {/snippet}
  </Field>

  <Input invalid aria-label="Webhook URL" value="https://acme.example/hooks" />
</Container>
