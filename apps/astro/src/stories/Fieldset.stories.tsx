import type { Meta, StoryObj } from '@storybook/html'
import FieldsetDefault from './components/FieldsetDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Fieldset'
import '@labcat2020/rocketship/components/Input'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FieldsetDefault> = {
  title: 'Components/Fieldset',
  component: FieldsetDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FieldsetDefault>

export const Default: Story = {}
