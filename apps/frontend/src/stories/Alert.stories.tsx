import type { Meta, StoryObj } from '@storybook/html'
import AlertVariants from './components/AlertVariants.astro'
import '@labcat2020/rocketship/components/Alert'
import '@labcat2020/rocketship/components/Container'

const meta: Meta<typeof AlertVariants> = {
  title: 'Components/Alert',
  component: AlertVariants,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof AlertVariants>

export const Variants: Story = {}
