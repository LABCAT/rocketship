import type { Meta, StoryObj } from '@storybook/html'
import FieldsetDisabled from './components/FieldsetDisabled.astro'
import '@labcat/rocketship/components/Fieldset'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof FieldsetDisabled> = {
  title: 'Components/Fieldset',
  component: FieldsetDisabled,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FieldsetDisabled>

export const Disabled: Story = {}
