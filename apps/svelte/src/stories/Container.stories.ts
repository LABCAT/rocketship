import type { Meta, StoryObj } from '@storybook/svelte'
import ContainerExample from './components/ContainerExample.svelte'

const meta = {
  title: 'Base/Container',
  component: ContainerExample,
  parameters: {
    a11y: { disable: false },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'content', 'narrow', 'wide', 'full'],
    },
  },
} satisfies Meta<typeof ContainerExample>

export default meta
type Story = StoryObj<typeof ContainerExample>

export const Default: Story = {
  args: { size: 'default' },
}

export const Full: Story = {
  args: { size: 'full' },
}

export const Wide: Story = {
  args: { size: 'wide' },
}

export const Content: Story = {
  args: { size: 'content' },
}

export const Narrow: Story = {
  args: { size: 'narrow' },
}
