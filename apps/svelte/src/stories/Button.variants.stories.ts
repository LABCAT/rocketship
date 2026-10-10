import type { Meta, StoryObj } from '@storybook/svelte'
import ButtonVariantsExample from './components/ButtonVariantsExample.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Button',
  component: ButtonVariantsExample,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof ButtonVariantsExample>

export default meta
type Story = StoryObj<typeof ButtonVariantsExample>

export const Variants: Story = {}
