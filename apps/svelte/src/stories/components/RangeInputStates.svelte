<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import RangeInput from '@labcat2020/rocketship-svelte/components/RangeInput'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  let workers = $state(4)
  let rollout = $state(25)
</script>

<Container size="content" padded>
  <Stack gap="large">
    <Field id="range-workers" label="Build workers">
      {#snippet children(control)}
        <RangeInput {...control} name="workers" min={1} max={8} bind:value={workers} />
      {/snippet}
      {#snippet hintSlot()}
        <output for="range-workers">{workers}</output> workers run builds in parallel.
      {/snippet}
    </Field>

    <Field
      id="range-rollout"
      label="Rollout percentage"
      error="Rollout cannot go below the 50% already released."
    >
      {#snippet children(control)}
        <RangeInput {...control} name="rollout" min={0} max={100} step={25} bind:value={rollout} />
      {/snippet}
    </Field>

    <Field
      id="range-retention"
      label="Log retention in days"
      hint="Fixed by the workspace plan."
      disabled
    >
      {#snippet children(control)}
        <RangeInput {...control} name="retention" min={7} max={90} value={30} />
      {/snippet}
    </Field>
  </Stack>
</Container>
