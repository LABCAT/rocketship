import type { Meta, StoryObj } from '@storybook/html'
import RangeInputStates from './components/RangeInputStates.astro'
import '@labcat/rocketship/components/RangeInput'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof RangeInputStates> = {
  title: 'Components/RangeInput',
  component: RangeInputStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RangeInputStates>

export const States: Story = {}
