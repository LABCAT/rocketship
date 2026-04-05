import type { Meta, StoryObj } from '@storybook/html'
import ButtonSizes from './components/ButtonSizes.astro'
import '@rocketship/base/components/Button'
import '@rocketship/base/components/Container'
import '@rocketship/base/components/Typography'

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
