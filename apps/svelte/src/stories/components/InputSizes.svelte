<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Input from '@labcat2020/rocketship-svelte/components/Input'
</script>

<Container as="main" size="content" padded>
  <Field label="Small" hint="Fits dense toolbars and inline table filters.">
    {#snippet children(control)}
      <Input {...control} size="sm" value="acme-rockets" />
    {/snippet}
  </Field>

  <Field label="Medium" hint="The default size for stacked forms.">
    {#snippet children(control)}
      <Input {...control} size="md" value="acme-rockets" />
    {/snippet}
  </Field>

  <Field label="Large" hint="Comfortable on touch screens and hero forms.">
    {#snippet children(control)}
      <Input {...control} size="lg" value="acme-rockets" />
    {/snippet}
  </Field>
</Container>
