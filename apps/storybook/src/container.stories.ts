import type { Meta, StoryObj } from '@storybook/html'

const demoContent = '<div class="rs-storybook-demo-box">Container content area</div>'

const meta: Meta = {
  title: 'Rocketship/Container',
  parameters: {
    a11y: {
      disable: false,
    },
  },
}

export default meta
type Story = StoryObj

export const WideDefault: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-container rs-container--wide">${demoContent}</div>
    </div>
  `,
}

export const FullWidth: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-container rs-container--full-width">${demoContent}</div>
    </div>
  `,
}

export const Content: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-container rs-container--content">${demoContent}</div>
    </div>
  `,
}

export const Narrow: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-container rs-container--narrow">${demoContent}</div>
    </div>
  `,
}
