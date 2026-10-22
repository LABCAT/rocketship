<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  let team = $state('')
  let region = $state('eu-central-1')
</script>

<Container as="main" size="content" padded>
  <Field label="Team" hint="Controls which runbooks appear in your sidebar.">
    {#snippet children(control)}
      <Select {...control} placeholder="Choose a team" bind:value={team} name="team">
        <optgroup label="Design">
          <option value="product">Product design</option>
          <option value="brand">Brand and identity</option>
        </optgroup>
        <optgroup label="Engineering">
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
        </optgroup>
        <optgroup label="Operations">
          <option value="platform">Platform</option>
          <option value="security">Security</option>
        </optgroup>
      </Select>
    {/snippet}
  </Field>

  <Field
    label="Deployment region"
    required
    hint="The region is fixed for this workspace. Changing it needs an admin."
  >
    {#snippet children(control)}
      <Select {...control} bind:value={region} name="region">
        <option value="us-east-1">US East (N. Virginia)</option>
        <option value="eu-central-1">EU Central (Frankfurt)</option>
        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
      </Select>
    {/snippet}
  </Field>
</Container>
