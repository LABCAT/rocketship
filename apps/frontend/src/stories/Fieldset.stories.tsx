import type { Meta, StoryObj } from '@storybook/html'
import FieldsetDefault from './components/FieldsetDefault.astro'
import '@labcat/rocketship/components/Fieldset'
import '@labcat/rocketship/components/Container'

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
