import type { Meta, StoryObj } from '@storybook/html'
import CheckboxStates from './components/CheckboxStates.astro'
import '@labcat2020/rocketship/components/Checkbox'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

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
