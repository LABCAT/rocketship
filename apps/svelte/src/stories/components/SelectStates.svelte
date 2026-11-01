<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Select from '@labcat2020/rocketship-svelte/components/Select'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'
</script>

<Container size="content" padded>
  <Stack gap="large">
    <p>Fields marked * are required.</p>

    <Field label="Team" required hint="Controls which runbooks appear in your sidebar.">
      {#snippet children(control)}
        <Select {...control} name="team">
          <option value="" disabled selected>Choose a team</option>
          <optgroup label="Design">
            <option value="product">Product design</option>
            <option value="brand">Brand and identity</option>
          </optgroup>
          <optgroup label="Engineering">
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
          </optgroup>
        </Select>
      {/snippet}
    </Field>

    <Field label="Billing plan" error="Choose a billing plan to continue.">
      {#snippet children(control)}
        <Select {...control} name="plan">
          <option value="" disabled selected>Choose a plan</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
        </Select>
      {/snippet}
    </Field>

    <Field label="Region" hint="The region is fixed for this workspace." disabled>
      {#snippet children(control)}
        <Select {...control} name="region">
          <option value="eu">Europe</option>
          <option value="na">North America</option>
        </Select>
      {/snippet}
    </Field>

    <Field label="Topics" hint="Hold Ctrl or Cmd to choose more than one.">
      {#snippet children(control)}
        <Select {...control} multiple size={4} name="topics">
          <option value="components" selected>Components</option>
          <option value="tokens">Design tokens</option>
          <option value="patterns">Patterns</option>
          <option value="accessibility">Accessibility</option>
        </Select>
      {/snippet}
    </Field>
  </Stack>
</Container>
