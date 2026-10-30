<script module lang="ts">
  import { createContext } from 'svelte'
  import type { RadioValue } from './Radio.svelte'

  /**
   * The state a `RadioGroup` shares with the radios inside it. The group owns the selected value,
   * so a radio can never paint a choice the group does not hold.
   */
  export type RadioGroupContext = {
    selected: () => RadioValue | undefined
    select: (value: RadioValue) => void
    name: () => string | undefined
    invalid: () => boolean
  }

  export const [getRadioGroup, setRadioGroup, hasRadioGroup] = createContext<RadioGroupContext>()
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLFieldsetAttributes } from 'svelte/elements'
  import Fieldset from './Fieldset.svelte'

  export type { RadioValue }

  /**
   * A fieldset of radios that owns the selected value. Bind `group`, give each `Radio` a `value`,
   * and the group keeps the choice, names every radio so arrows move between them, and marks them
   * all invalid together. The fieldset is what names the group and what a group message describes.
   */
  export type RadioGroupProps = {
    group?: RadioValue
    invalid?: boolean
    legend?: Snippet
    children?: Snippet
    class?: string
  } & HTMLFieldsetAttributes

  let {
    group = $bindable(),
    invalid = false,
    legend,
    children,
    class: className = '',
    name: nameProp,
    ...attrs
  }: RadioGroupProps = $props()

  // Radios in one group share a name: it is what the browser uses for exclusivity and arrow-key
  // movement, and what assistive tech announces. One is generated so the consumer need not.
  const generatedName = $props.id()
  const name = $derived(nameProp ?? `rs-radio-group-${generatedName}`)

  setRadioGroup({
    selected: () => group,
    select: (next) => {
      group = next
    },
    name: () => name,
    invalid: () => invalid,
  })
</script>

<Fieldset {...attrs} {legend} class={className}>
  {@render children?.()}
</Fieldset>
