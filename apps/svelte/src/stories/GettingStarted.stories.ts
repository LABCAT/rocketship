import type { Meta, StoryObj } from '@storybook/svelte'
import GettingStarted from './components/GettingStarted.svelte'

const meta = {
  title: 'Svelte/GettingStarted',
  component: GettingStarted,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof GettingStarted>

export default meta
type Story = StoryObj<typeof GettingStarted>

export const Default: Story = {}
