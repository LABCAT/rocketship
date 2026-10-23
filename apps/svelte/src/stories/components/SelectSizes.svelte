<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Select from '@labcat2020/rocketship-svelte/components/Select'

  const sizes = [
    { size: 'sm', label: 'Small', hint: 'Fits dense filter bars and table headers.' },
    { size: 'md', label: 'Medium', hint: 'The default size for stacked forms.' },
    { size: 'lg', label: 'Large', hint: 'Comfortable on touch screens and hero forms.' },
  ] as const
</script>

<Container as="main" size="content" padded>
  {#each sizes as { size, label, hint } (size)}
    <Field {label} {hint}>
      {#snippet children(control)}
        <Select {...control} {size} name={`plan-${size}`} value="growth">
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
        </Select>
      {/snippet}
    </Field>
  {/each}
</Container>
