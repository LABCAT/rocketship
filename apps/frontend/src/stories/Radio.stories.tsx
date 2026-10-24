import type { Meta, StoryObj } from '@storybook/html'
import RadioStates from './components/RadioStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Fieldset'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Radio'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof RadioStates> = {
  title: 'Components/Radio',
  component: RadioStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RadioStates>

export const States: Story = {}
