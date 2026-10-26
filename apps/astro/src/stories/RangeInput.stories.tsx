import type { Meta, StoryObj } from '@storybook/html'
import RangeInputStates from './components/RangeInputStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/RangeInput'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof RangeInputStates> = {
  title: 'Components/Range Input',
  component: RangeInputStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RangeInputStates>

export const States: Story = {}
