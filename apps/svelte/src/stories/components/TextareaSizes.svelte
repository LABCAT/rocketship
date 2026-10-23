<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Textarea from '@labcat2020/rocketship-svelte/components/Textarea'
</script>

<Container as="main" size="content" padded>
  <Field label="Small" hint="A short note beside a single control.">
    {#snippet children(control)}
      <Textarea {...control} size="sm" value="Rotate the signing key on the next deploy." />
    {/snippet}
  </Field>

  <Field label="Medium" hint="The default size for stacked forms.">
    {#snippet children(control)}
      <Textarea {...control} size="md" value="Rotate the signing key on the next deploy." />
    {/snippet}
  </Field>

  <Field label="Large" hint="Room for long-form review notes.">
    {#snippet children(control)}
      <Textarea {...control} size="lg" value="Rotate the signing key on the next deploy." />
    {/snippet}
  </Field>
</Container>
