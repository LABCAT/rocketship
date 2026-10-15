<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
</script>

<Container as="main" size="content" padded>
  <Field
    label="Workspace name"
    hint="Shown in the dashboard header."
    error="This name is already taken."
    disabled
  >
    {#snippet children(control)}
      <input {...control} type="text" value="acme" />
    {/snippet}
  </Field>

  <Field label="Region" disabled>
    {#snippet children(control)}
      <select {...control}>
        <option>Frankfurt</option>
      </select>
    {/snippet}
  </Field>
</Container>
