import type { Meta, StoryObj } from '@storybook/html'
import FieldsetStates from './components/FieldsetStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Fieldset'
import '@labcat2020/rocketship/components/Input'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FieldsetStates> = {
  title: 'Components/Fieldset',
  component: FieldsetStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FieldsetStates>

export const States: Story = {}
