<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Textarea from '@labcat2020/rocketship-svelte/components/Textarea'
</script>

<Container as="main" size="content" padded>
  <Field
    label="Postmortem notes"
    error="Add at least ten characters so the summary is useful."
  >
    {#snippet children(control)}
      <Textarea {...control} rows="3" value="Too short" />
    {/snippet}
  </Field>

  <Field label="Frozen transcript" hint="Imported from the incident archive." disabled>
    {#snippet children(control)}
      <Textarea {...control} rows="2" value="2026-04-02T09:14Z deploy rolled back by the on-call engineer." />
    {/snippet}
  </Field>

  <Textarea invalid aria-label="Rollback command" value="kubectl rollout undo deployment/api" />
</Container>
