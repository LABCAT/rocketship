import type { Meta, StoryObj } from '@storybook/html'
import CheckboxFocused from './components/CheckboxFocused.astro'
import '@labcat/rocketship/components/Checkbox'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof CheckboxFocused> = {
  title: 'Components/Checkbox',
  component: CheckboxFocused,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof CheckboxFocused>

export const Focused: Story = {}
