import type { Meta, StoryObj } from '@storybook/html'
import SelectStates from './components/SelectStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Select'
import '@labcat2020/rocketship/components/Stack'

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
