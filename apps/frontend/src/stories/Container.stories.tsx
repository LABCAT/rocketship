import type { Meta, StoryObj } from '@storybook/html'
import ContainerDocument from './components/ContainerDocument.astro'
import '@rocketship/base/components/Container'
import '@rocketship/base/components/Typography'

const meta = {
  title: 'Base/Container',
  component: ContainerDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
  argTypes: {
    containerSize: {
      control: 'select',
      options: ['default', 'content', 'wide', 'full'],
    },
  },
} satisfies Meta<typeof ContainerDocument>

export default meta
type Story = StoryObj<typeof ContainerDocument>

export const Default: Story = {
  args: { containerSize: 'default' },
}

export const Content: Story = {
  args: { containerSize: 'content' },
}

export const Wide: Story = {
  args: { containerSize: 'wide' },
}

export const FullWidth: Story = {
  args: { containerSize: 'full' },
}
