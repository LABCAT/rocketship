import type { Meta, StoryObj } from '@storybook/html'
import ContainerSizes from './components/ContainerSizes.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'

const meta: Meta<typeof ContainerSizes> = {
  title: 'Base/Container',
  component: ContainerSizes,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ContainerSizes>

export const Sizes: Story = {}
