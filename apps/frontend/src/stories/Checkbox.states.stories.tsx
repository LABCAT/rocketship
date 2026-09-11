import type { Meta, StoryObj } from '@storybook/html'
import CheckboxStates from './components/CheckboxStates.astro'
import '@labcat/rocketship/components/Checkbox'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof CheckboxStates> = {
  title: 'Components/Checkbox',
  component: CheckboxStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof CheckboxStates>

export const States: Story = {}
