<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Label from './Label.svelte'

  export type FieldTag = 'div' | 'section'

  /**
   * Attributes Field derives from its own props so the wrapped control stays linked to
   * the label, hint, and error text. Spread it onto the control inside the `children` snippet.
   */
  export type FieldControlProps = {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': 'true' | undefined
    required: boolean | undefined
    disabled: boolean | undefined
  }

  type Props = {
    as?: FieldTag
    id?: string
    label?: string
    hint?: string
    error?: string
    hintId?: string
    errorId?: string
    required?: boolean
    optional?: boolean
    disabled?: boolean
    class?: string
    labelSlot?: Snippet
    hintSlot?: Snippet
    errorSlot?: Snippet
    children?: Snippet<[FieldControlProps]>
  } & HTMLAttributes<HTMLElement>

  let {
    as = 'div',
    id: idProp,
    label,
    hint,
    error,
    hintId: hintIdProp,
    errorId: errorIdProp,
    required = false,
    optional = false,
    disabled = false,
    class: className = '',
    labelSlot,
    hintSlot,
    errorSlot,
    children,
    ...attrs
  }: Props = $props()

  const generatedId = $props.id()
  const id = $derived(idProp ?? `rs-field-${generatedId}`)
  const hintId = $derived(hintIdProp ?? `${id}-hint`)
  const errorId = $derived(errorIdProp ?? `${id}-error`)
  const hasLabel = $derived(Boolean(label ?? labelSlot))
  const hasHint = $derived(Boolean(hint ?? hintSlot))
  const hasError = $derived(Boolean(error ?? errorSlot))

  const describedBy = $derived(
    [hasHint ? hintId : undefined, hasError ? errorId : undefined].filter(Boolean).join(' ') ||
      undefined,
  )

  const control = $derived({
    id,
    'aria-describedby': describedBy,
    'aria-invalid': hasError ? 'true' : undefined,
    required: required || undefined,
    disabled: disabled || undefined,
  } satisfies FieldControlProps)

  const classes = $derived(
    ['rs-field', disabled ? 'rs-field--disabled' : undefined, className].filter(Boolean).join(' '),
  )
</script>

<svelte:element this={as} {...attrs} class={classes}>
  {#if hasLabel}
    <div class="rs-field__label">
      {#if label}
        <Label for={id} {required} {optional}>{label}</Label>
      {:else if labelSlot}
        {@render labelSlot()}
      {/if}
    </div>
  {/if}
  <div class="rs-field__control">
    {@render children?.(control)}
  </div>
  {#if hasHint}
    <div class="rs-field__hint" id={hintId}>
      {#if hint}
        {hint}
      {:else if hintSlot}
        {@render hintSlot()}
      {/if}
    </div>
  {/if}
  {#if hasError}
    <div class="rs-field__error" id={errorId}>
      {#if error}
        {error}
      {:else if errorSlot}
        {@render errorSlot()}
      {/if}
    </div>
  {/if}
</svelte:element>

<style lang="scss">
  @use '@labcat2020/rocketship/styles/mixins' as *;

  :global {
    .rs-field {
      container-name: rs-component;
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      font-family: var(
        --rs-font-family-sans,
        'Inter',
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif
      );
      gap: var(--rs-field-gap, var(--rs-space-2, 8px));
      min-width: 0;

      @include container-query-up($rs-cq-sm) {
        gap: var(--rs-field-gap, var(--rs-space-3, 12px));
      }

      &--disabled {
        .rs-field__label {
          opacity: 0.55;
        }
      }

      &__control {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        min-width: 0;
      }

      &__hint {
        color: var(--rs-field-hint-color, var(--rs-color-muted, #4f5b7d));
        font-size: var(--rs-field-hint-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
        line-height: var(--rs-line-height-base, 1.45);
        margin: 0;
      }

      &__error {
        color: var(--rs-field-error-color, var(--rs-color-danger-fg, #3d0a08));
        font-size: var(--rs-field-error-font-size, var(--rs-font-size-sm, #{to-rem(14)}));
        line-height: var(--rs-line-height-base, 1.45);
        margin: 0;
      }
    }
  }
</style>
