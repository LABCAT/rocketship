import type { Meta, StoryObj } from '@storybook/html'
import Container from '@rocketship/base/components/Container'

const meta: Meta<typeof Container> = {
  title: 'Rocketship/Container',
  component: Container,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof Container>

export const Wide: Story = {
  args: {
    size: 'wide',
    slots: { default: '<p>Container content area</p>' },
  },
}

export const FullWidth: Story = {
  args: {
    size: 'full',
    slots: { default: '<p>Container content area</p>' },
  },
}

export const Content: Story = {
  args: {
    size: 'content',
    slots: { default: '<p>Container content area</p>' },
  },
}

export const Narrow: Story = {
  args: {
    size: 'narrow',
    slots: { default: '<p>Container content area</p>' },
  },
}
