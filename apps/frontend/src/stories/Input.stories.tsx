import type { Meta, StoryObj } from '@storybook/html'
import InputStates from './components/InputStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Input'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof InputStates> = {
  title: 'Components/Input',
  component: InputStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof InputStates>

export const States: Story = {}
