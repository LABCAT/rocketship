<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Field from '@labcat2020/rocketship-svelte/components/Field'
  import FileInput from '@labcat2020/rocketship-svelte/components/FileInput'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  // The picker fills the platform FileList, and `bind:files` is how a consumer reads the names back.
  let notes = $state<FileList | null>(null)
  const chosen = $derived(notes ? [...notes].map((file) => file.name) : [])
</script>

<Container size="content" padded>
  <Stack gap="large">
    <p>Fields marked * are required.</p>

    <Field id="file-notes" label="Release notes">
      {#snippet children(control)}
        <FileInput {...control} name="notes" accept="application/pdf" multiple bind:files={notes} />
      {/snippet}
      {#snippet hintSlot()}
        PDF only. You can attach several files.
        {#if chosen.length}
          <output for="file-notes">Attached: {chosen.join(', ')}</output>
        {/if}
      {/snippet}
    </Field>

    <Field
      id="file-certificate"
      label="Signing certificate"
      required
      error="Add a .pem certificate to sign the build."
    >
      {#snippet children(control)}
        <FileInput {...control} name="certificate" accept=".pem" />
      {/snippet}
    </Field>

    <Field id="file-artifact" label="Build artifact" hint="Chosen by the release service." disabled>
      {#snippet children(control)}
        <FileInput {...control} name="artifact" />
      {/snippet}
    </Field>
  </Stack>
</Container>
