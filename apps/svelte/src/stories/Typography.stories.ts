import type { Meta, StoryObj } from '@storybook/svelte'
import TypographyExample from './components/TypographyExample.svelte'

const meta = {
  title: 'Base/Typography',
  component: TypographyExample,
  parameters: {
    a11y: { disable: false },
  },
  argTypes: {
    aspect: {
      control: 'select',
      options: ['headings', 'text'],
    },
  },
} satisfies Meta<typeof TypographyExample>

export default meta
type Story = StoryObj<typeof TypographyExample>

export const Headings: Story = {
  args: { aspect: 'headings' },
}

export const Text: Story = {
  args: { aspect: 'text' },
}
