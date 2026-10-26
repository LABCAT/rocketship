import type { Meta, StoryObj } from '@storybook/html'
import CheckboxSet from './components/CheckboxSet.astro'
import '@labcat2020/rocketship/components/Checkbox'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Fieldset'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof CheckboxSet> = {
  title: 'Components/Checkbox',
  component: CheckboxSet,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof CheckboxSet>

export const Set: Story = {}
