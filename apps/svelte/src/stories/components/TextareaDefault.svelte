<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Textarea from '@labcat2020/rocketship-svelte/components/Textarea'

  let notes = $state('')
  let summary = $state('')
  let log = $state('')
</script>

<Container as="main" size="content" padded>
  <Field label="Release notes" hint="Markdown is supported.">
    {#snippet children(control)}
      <Textarea {...control} rows="3" placeholder="What changed in this release?" bind:value={notes} />
    {/snippet}
  </Field>

  <Field label="Incident summary" required hint="One or two sentences for the status page.">
    {#snippet children(control)}
      <Textarea {...control} rows="2" placeholder="Describe the impact" bind:value={summary} />
    {/snippet}
  </Field>

  <Field label="Deployment log excerpt">
    {#snippet children(control)}
      <Textarea
        {...control}
        rows="4"
        placeholder="Paste the tail of the failing step"
        bind:value={log}
      />
    {/snippet}
  </Field>
</Container>
