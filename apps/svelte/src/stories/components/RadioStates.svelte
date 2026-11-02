<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Fieldset from '@labcat2020/rocketship-svelte/components/Fieldset'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
  import Radio from '@labcat2020/rocketship-svelte/components/Radio'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  // One bound value per set: checking a radio writes its value, so the previous option unchecks.
  let delivery = $state('standard')
  let wrapping = $state('none')
  let contact = $state('')
</script>

<Container size="content" padded>
  <Stack gap="xlarge">
    <Fieldset>
      {#snippet legend()}Delivery{/snippet}
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="delivery-standard" name="delivery" value="standard" bind:group={delivery} />
            <Label for="delivery-standard">Standard, 3 to 5 days</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="delivery-express" name="delivery" value="express" bind:group={delivery} />
            <Label for="delivery-express">Express, next day</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="delivery-collect" name="delivery" value="collect" bind:group={delivery} />
            <Label for="delivery-collect">Collect in store</Label>
          {/snippet}
        </Field>
      </Stack>
    </Fieldset>
    <Fieldset disabled>
      {#snippet legend()}Gift wrapping{/snippet}
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="wrap-none" name="wrap" value="none" bind:group={wrapping} />
            <Label for="wrap-none">No wrapping</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="wrap-paper" name="wrap" value="paper" bind:group={wrapping} />
            <Label for="wrap-paper">Recycled paper</Label>
          {/snippet}
        </Field>
      </Stack>
    </Fieldset>
    <Fieldset aria-describedby="contact-error">
      {#snippet legend()}Contact method{/snippet}
      <p class="rs-fieldset__error" id="contact-error">Choose how we should contact you.</p>
      <Stack gap="small">
        <Field inline>
          {#snippet children()}
            <Radio id="contact-email" name="contact" value="email" bind:group={contact} aria-invalid="true" />
            <Label for="contact-email">Email</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="contact-phone" name="contact" value="phone" bind:group={contact} aria-invalid="true" />
            <Label for="contact-phone">Phone</Label>
          {/snippet}
        </Field>
        <Field inline>
          {#snippet children()}
            <Radio id="contact-post" name="contact" value="post" bind:group={contact} aria-invalid="true" />
            <Label for="contact-post">Post</Label>
          {/snippet}
        </Field>
      </Stack>
    </Fieldset>
  </Stack>
</Container>
