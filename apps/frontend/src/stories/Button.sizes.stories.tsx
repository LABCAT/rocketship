import type { Meta, StoryObj } from '@storybook/html'
import ButtonSizes from './components/ButtonSizes.astro'
import '@labcat/rocketship/components/Button'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof ButtonSizes> = {
  title: 'Base/Button',
  component: ButtonSizes,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ButtonSizes>

export const Sizes: Story = {}
