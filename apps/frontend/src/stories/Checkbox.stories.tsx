import type { Meta, StoryObj } from '@storybook/html'
import CheckboxDefault from './components/CheckboxDefault.astro'
import '@labcat/rocketship/components/Checkbox'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof CheckboxDefault> = {
  title: 'Components/Checkbox',
  component: CheckboxDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof CheckboxDefault>

export const Default: Story = {}
