import type { Meta, StoryObj } from '@storybook/html'
import RangeInputFocused from './components/RangeInputFocused.astro'
import '@labcat/rocketship/components/RangeInput'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof RangeInputFocused> = {
  title: 'Components/RangeInput',
  component: RangeInputFocused,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RangeInputFocused>

export const Focused: Story = {}
