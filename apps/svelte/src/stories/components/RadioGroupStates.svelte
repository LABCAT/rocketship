<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
  import Radio from '@labcat2020/rocketship-svelte/components/Radio'
  import RadioGroup from '@labcat2020/rocketship-svelte/components/RadioGroup'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  // Each group owns one bound value, so the story shows the selection moving between radios
  // rather than three radios that happen to look checked.
  let delivery = $state('standard')
  let wrapping = $state('none')
  let contact = $state('')
</script>

<Container size="content" padded>
  <Stack gap="xlarge">
    <RadioGroup bind:group={delivery}>
      {#snippet legend()}Delivery{/snippet}
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="group-delivery-standard" value="standard" />
            <Label for="group-delivery-standard">Standard, 3 to 5 days</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="group-delivery-express" value="express" />
            <Label for="group-delivery-express">Express, next day</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="group-delivery-collect" value="collect" />
            <Label for="group-delivery-collect">Collect in store</Label>
          {/snippet}
        </Field>
      </Stack>
    </RadioGroup>

    <RadioGroup bind:group={wrapping} disabled>
      {#snippet legend()}Gift wrapping{/snippet}
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="group-wrapping-none" value="none" />
            <Label for="group-wrapping-none">No wrapping</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="group-wrapping-paper" value="paper" />
            <Label for="group-wrapping-paper">Recycled paper</Label>
          {/snippet}
        </Field>
      </Stack>
    </RadioGroup>

    <RadioGroup bind:group={contact} aria-invalid="true" aria-describedby="group-contact-error">
      {#snippet legend()}Contact method{/snippet}
      <p class="rs-fieldset__error" id="group-contact-error">
        Choose how we should contact you.
      </p>
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="group-contact-email" value="email" />
            <Label for="group-contact-email">Email</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="group-contact-phone" value="phone" />
            <Label for="group-contact-phone">Phone</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="group-contact-post" value="post" />
            <Label for="group-contact-post">Post</Label>
          {/snippet}
        </Field>
      </Stack>
    </RadioGroup>
  </Stack>
</Container>
