<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  export type FileInputProps = {
    files?: FileList | null
    class?: string
  } & Omit<HTMLInputAttributes, 'type' | 'files'>

  // `files` is the platform's FileList as a binding, so a consumer can list the chosen names and
  // clear the selection. Choosing a file stays the user's action; the component never invents one.
  let { files = $bindable(null), class: className = '', ...attrs }: FileInputProps = $props()

  let control = $state<HTMLInputElement | null>(null)

  // The platform ignores a null assignment to `files`, which would leave the old filename text
  // beside a cleared selection. An empty value is the one write a file input accepts from script,
  // and it drops the FileList together with the text.
  $effect(() => {
    if (files == null && control && control.value !== '') control.value = ''
  })

  // The control's own attribute is the one source of truth, so the painted error state and the
  // state assistive tech announces can never disagree.
  const invalid = $derived(attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true')
  const classes = $derived(
    ['rs-file-input', invalid ? 'rs-file-input--invalid' : undefined, className]
      .filter(Boolean)
      .join(' '),
  )
</script>

<input bind:this={control} {...attrs} type="file" class={classes} bind:files />

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-file-input {
      --rs-file-input-border-color: #{rs-token(color-border-control)};
      margin: 0;
      padding: var(--rs-file-input-padding, #{rs-token(space-1)});
      background: var(--rs-file-input-bg, #{rs-token(color-surface)});
      border: var(--rs-file-input-border-width, #{rs-token(border-width-sm)}) solid
        var(--rs-file-input-border-color);
      border-radius: var(--rs-file-input-border-radius, #{rs-token(radius-sm)});
      color: var(--rs-file-input-color, #{rs-token(color-fg)});
      cursor: pointer;
      font: inherit;
      line-height: #{rs-token(line-height-base)};

      /// The browse button is the input's own part, so it is styled here rather than rendered.
      /// No `all: unset`: it breaks the native button in some engines.
      &::file-selector-button {
        box-sizing: border-box;
        margin-inline-end: var(--rs-file-input-gap, #{rs-token(space-3)});
        padding-block: #{rs-token(space-1)};
        padding-inline: #{rs-token(space-3)};
        background: var(--rs-file-input-button-bg, #{rs-token(color-surface-elevated)});
        border: 0;
        border-radius: var(--rs-file-input-button-border-radius, #{rs-token(radius-pill)});
        color: var(--rs-file-input-button-color, #{rs-token(color-fg)});
        cursor: pointer;
        font: inherit;
        font-weight: #{rs-token(font-weight-semibold)};

        /// Forced colours paint the fill in the system button colour, often the same as the box,
        /// so the borderless pill loses its shape. A system border gives it back.
        @media (forced-colors: active) {
          border: 1px solid ButtonBorder;
        }
      }

      &:focus-visible {
        outline: 2px solid #{rs-token(color-focus-ring)};
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &:disabled::file-selector-button {
        cursor: not-allowed;
      }

      &--invalid {
        --rs-file-input-border-color: #{rs-token(color-danger-accent)};
      }
    }
  }
</style>
