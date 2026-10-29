import type { Meta, StoryObj } from '@storybook/svelte'
import CheckboxStates from './components/CheckboxStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof CheckboxStates>

export default meta
type Story = StoryObj<typeof CheckboxStates>

export const States: Story = {}
