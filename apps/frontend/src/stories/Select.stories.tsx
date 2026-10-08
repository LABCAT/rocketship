import type { Meta, StoryObj } from '@storybook/html'
import SelectDefault from './components/SelectDefault.astro'
import '@labcat/rocketship/components/Select'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof SelectDefault> = {
  title: 'Components/Select',
  component: SelectDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof SelectDefault>

export const Default: Story = {}
