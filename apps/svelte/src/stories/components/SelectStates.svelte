<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  let plan = $state('')
</script>

<Container as="main" size="content" padded>
  <Field
    label="Billing plan"
    required
    error="Choose a plan before you start the trial."
    hint="You can change the plan at any time."
  >
    {#snippet children(control)}
      <Select {...control} placeholder="Choose a plan" bind:value={plan} name="plan">
        <option value="starter">Starter</option>
        <option value="growth">Growth</option>
        <option value="enterprise">Enterprise</option>
      </Select>
    {/snippet}
  </Field>

  <Field label="Region" hint="The region is fixed for this workspace." disabled>
    {#snippet children(control)}
      <Select {...control} name="region-disabled" value="eu-central-1">
        <option value="us-east-1">US East (N. Virginia)</option>
        <option value="eu-central-1">EU Central (Frankfurt)</option>
        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
      </Select>
    {/snippet}
  </Field>

  <Select invalid aria-label="Deployment channel" name="channel" value="canary">
    <option value="stable">Stable</option>
    <option value="canary">Canary</option>
  </Select>
</Container>
