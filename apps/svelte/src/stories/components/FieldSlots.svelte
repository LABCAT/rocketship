<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
</script>

<Container as="main" size="content" padded>
  <Field
    id="field-notes"
    label="Release notes"
    hint="Markdown is supported."
    error="Add at least ten characters."
  >
    {#snippet children(control)}
      <textarea {...control} rows="2" placeholder="What changed?"></textarea>
    {/snippet}
  </Field>

  <Field id="field-name">
    {#snippet labelSlot(controlId)}
      <Label for={controlId} required>Display name</Label>
    {/snippet}
    {#snippet hintSlot()}
      This appears next to your comments.
    {/snippet}
    {#snippet children(control)}
      <input {...control} type="text" />
    {/snippet}
  </Field>

  <Field id="field-bio">
    {#snippet labelSlot(controlId)}
      <Label for={controlId} optional>Short bio</Label>
    {/snippet}
    {#snippet children(control)}
      <textarea {...control} rows="2" placeholder="One or two sentences"></textarea>
    {/snippet}
  </Field>
</Container>
