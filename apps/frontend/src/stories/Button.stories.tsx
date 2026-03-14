import type { Meta, StoryObj } from '@storybook/html'
import Button from '@rocketship/base/components/Button'

const meta: Meta<typeof Button> = {
  title: 'Rocketship/Button',
  component: Button,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    slots: { default: 'Primary' },
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
    slots: { default: 'Secondary' },
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'medium',
    slots: { default: 'Ghost' },
  },
}

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'small',
    slots: { default: 'Small' },
  },
}

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    slots: { default: 'Medium' },
  },
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'large',
    slots: { default: 'Large' },
  },
}
