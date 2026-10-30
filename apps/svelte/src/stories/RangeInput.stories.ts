import type { Meta, StoryObj } from '@storybook/svelte'
import RangeInputStates from './components/RangeInputStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Range Input',
  component: RangeInputStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof RangeInputStates>

export default meta
type Story = StoryObj<typeof RangeInputStates>

export const States: Story = {}
