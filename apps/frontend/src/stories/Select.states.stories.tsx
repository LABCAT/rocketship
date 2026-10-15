import type { Meta, StoryObj } from '@storybook/html'
import SelectStates from './components/SelectStates.astro'
import '@labcat/rocketship/components/Select'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof SelectStates> = {
  title: 'Components/Select',
  component: SelectStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof SelectStates>

export const States: Story = {}
