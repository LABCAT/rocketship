import type { Meta, StoryObj } from '@storybook/html'
import LabelVariants from './components/LabelVariants.astro'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Field'
import '@labcat/rocketship/components/Label'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof LabelVariants> = {
  title: 'Components/Label',
  component: LabelVariants,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof LabelVariants>

export const Variants: Story = {}
