<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Input from '@labcat2020/rocketship-svelte/components/Input'

  let email = $state('')
  let password = $state('')
  let seats = $state('5')
  let query = $state('')
</script>

<Container as="main" size="content" padded>
  <Field label="Work email" hint="We send deployment alerts to this address.">
    {#snippet children(control)}
      <Input {...control} type="email" autocomplete="email" bind:value={email} />
    {/snippet}
  </Field>

  <Field label="Password" required hint="At least twelve characters.">
    {#snippet children(control)}
      <Input {...control} type="password" autocomplete="new-password" bind:value={password} />
    {/snippet}
  </Field>

  <Field label="Seats" hint="Billed monthly, cancellable at any time.">
    {#snippet children(control)}
      <Input {...control} type="number" min="1" max="500" bind:value={seats} />
    {/snippet}
  </Field>

  <Field label="Search runs" hint="Filter by commit, branch, or author.">
    {#snippet children(control)}
      <Input {...control} type="search" placeholder="Search deployment history" bind:value={query} />
    {/snippet}
  </Field>
</Container>
