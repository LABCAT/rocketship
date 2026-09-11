import type { Meta, StoryObj } from '@storybook/html'
import FieldVariants from './components/FieldVariants.astro'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Field'
import '@labcat/rocketship/components/Label'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof FieldVariants> = {
  title: 'Components/Field',
  component: FieldVariants,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FieldVariants>

export const Variants: Story = {}
