import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Base',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

export const Overview: Story = {
  render: () =>
    '<main><h1>Rocketship Base</h1><p>Base styles and Astro components from <code>@rocketship/base</code>.</p></main>',
}