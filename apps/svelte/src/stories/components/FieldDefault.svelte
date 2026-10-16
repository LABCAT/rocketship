<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
</script>

<Container as="main" size="content" padded>
  <Field label="Work email" hint="We send deployment alerts to this address.">
    {#snippet children(control)}
      <input {...control} type="email" autocomplete="email" />
    {/snippet}
  </Field>

  <Field label="Billing plan" required hint="Switch plans at any time from workspace settings.">
    {#snippet children(control)}
      <select {...control}>
        <option value="">Choose a plan</option>
        <option>Starter</option>
        <option>Pro</option>
        <option>Enterprise</option>
      </select>
    {/snippet}
  </Field>

  <Field
    label="Release notes"
    hint="Markdown is supported."
    error="Add at least ten characters."
  >
    {#snippet children(control)}
      <textarea {...control} rows="3" placeholder="What changed in this release?"></textarea>
    {/snippet}
  </Field>
</Container>
