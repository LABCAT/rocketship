import type { Meta, StoryObj } from '@storybook/html'

const demoContent = '<p>Container content area</p>'

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
    <div class="rs-container rs-container--wide">${demoContent}</div>
  `,
}

export const FullWidth: Story = {
  render: () => `
    <div class="rs-container rs-container--full-width">${demoContent}</div>
  `,
}

export const Content: Story = {
  render: () => `
    <div class="rs-container rs-container--content">${demoContent}</div>
  `,
}

export const Narrow: Story = {
  render: () => `
    <div class="rs-container rs-container--narrow">${demoContent}</div>
  `,
}
