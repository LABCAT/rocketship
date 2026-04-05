import type { Meta, StoryObj } from '@storybook/html'
import ButtonVariants from './components/ButtonVariants.astro'
import '@rocketship/base/components/Button'
import '@rocketship/base/components/Container'

const meta: Meta<typeof ButtonVariants> = {
  title: 'Base/Button',
  component: ButtonVariants,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ButtonVariants>

export const Variants: Story = {}
