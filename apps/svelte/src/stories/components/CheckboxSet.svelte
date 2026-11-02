<script lang="ts">
  import { onMount } from 'svelte'
  import Checkbox from '@labcat2020/rocketship-svelte/components/Checkbox'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  // One bound array holds the ticked topics, so the group behaves as a set of choices.
  let topics = $state(['builds', 'security'])

  // The DOM property is the only way to express "some of these are checked": there is no
  // attribute and no prop, so the story sets it the way a consumer would.
  onMount(() => {
    const all = document.getElementById('notify-all')
    if (all instanceof HTMLInputElement) all.indeterminate = true
  })
</script>

<Container size="content" padded>
  <Fieldset>
    {#snippet legend()}Notify me about{/snippet}
    <Stack gap="small">
      <Field inline>
        {#snippet children()}
          <Checkbox id="notify-all" name="notify" value="all" />
          <Label for="notify-all">All topics</Label>
        {/snippet}
      </Field>
      <Field inline>
        {#snippet children()}
          <Checkbox id="notify-builds" name="notify" value="builds" bind:group={topics} />
          <Label for="notify-builds">Failed builds</Label>
        {/snippet}
      </Field>
      <Field inline>
        {#snippet children()}
          <Checkbox id="notify-deployments" name="notify" value="deployments" bind:group={topics} />
          <Label for="notify-deployments">Finished deployments</Label>
        {/snippet}
      </Field>
      <Field inline>
        {#snippet children()}
          <Checkbox
            id="notify-security"
            name="notify"
            value="security"
            bind:group={topics}
            disabled
            aria-describedby="notify-security-hint"
          />
          <Label for="notify-security">Security alerts</Label>
          <p class="rs-field__hint" id="notify-security-hint">We always send these.</p>
        {/snippet}
      </Field>
      <Field inline>
        {#snippet children()}
          <Checkbox
            id="notify-usage"
            name="notify"
            value="usage"
            disabled
            aria-describedby="notify-usage-hint"
          />
          <Label for="notify-usage">Usage reports</Label>
          <p class="rs-field__hint" id="notify-usage-hint">Available on the Pro plan.</p>
        {/snippet}
      </Field>
    </Stack>
  </Fieldset>
</Container>
