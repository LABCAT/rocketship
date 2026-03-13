import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Base',
  render: () => {
    return `
      <div class="rs-storybook-page">
        <h1>Rocketship Base</h1>
        <div class="rs-storybook-card">
          <div class="rs-storybook-row">
            <span class="rs-storybook-pill">Base styles loaded from <code>@rocketship/base/styles</code></span>
          </div>
        </div>
      </div>
    `
  },
}

export default meta
type Story = StoryObj

export const Overview: Story = {}

