<script lang="ts">
  import Checkbox from '@labcat2020/rocketship-svelte/components/Checkbox'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import Label from '@labcat2020/rocketship-svelte/components/Label'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'
</script>

<Container size="content" padded>
  <Stack gap="large">
    <p>Fields marked * are required.</p>
    <Field inline>
      {#snippet children()}
        <Checkbox
          id="checkbox-summary"
          name="summary"
          aria-describedby="checkbox-summary-hint"
        />
        <Label for="checkbox-summary">Email me a monthly summary</Label>
        <p class="rs-field__hint" id="checkbox-summary-hint">We send one email a month.</p>
      {/snippet}
    </Field>
    <Field inline>
      {#snippet children()}
        <Checkbox id="checkbox-remember" name="remember" checked />
        <Label for="checkbox-remember">Remember me on this device</Label>
      {/snippet}
    </Field>
    <Field inline>
      {#snippet children()}
        <Checkbox id="checkbox-share" name="share" disabled />
        <Label for="checkbox-share">Share my profile</Label>
      {/snippet}
    </Field>
    <Field inline>
      {#snippet children()}
        <Checkbox id="checkbox-two-factor" name="two-factor" checked disabled />
        <Label for="checkbox-two-factor">Use two-factor sign-in</Label>
      {/snippet}
    </Field>
    <Field inline>
      {#snippet children()}
        <Checkbox
          id="checkbox-terms"
          name="terms"
          required
          aria-invalid="true"
          aria-describedby="checkbox-terms-error"
        />
        <Label for="checkbox-terms" required>I accept the terms</Label>
        <p class="rs-field__error" id="checkbox-terms-error">Accept the terms to continue.</p>
      {/snippet}
    </Field>
  </Stack>
</Container>
