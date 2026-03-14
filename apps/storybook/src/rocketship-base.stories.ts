import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Base',
  render: () => {
    return `
      <main>
        <h1>Rocketship Base</h1>
        <p>Base styles loaded from <code>@rocketship/base/styles</code>.</p>
      </main>
    `
  },
}

export default meta
type Story = StoryObj

export const Overview: Story = {}

