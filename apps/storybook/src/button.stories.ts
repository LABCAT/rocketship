import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Button',
  parameters: {
    a11y: {
      disable: false,
    },
  },
}

export default meta
type Story = StoryObj

export const Variants: Story = {
  render: () => `
    <p>
      <button class="rs-button rs-button--primary rs-button--medium">Primary</button>
      <button class="rs-button rs-button--secondary rs-button--medium">Secondary</button>
      <button class="rs-button rs-button--ghost rs-button--medium">Ghost</button>
    </p>
  `,
}

export const SizeVariants: Story = {
  render: () => `
    <p>
      <button class="rs-button rs-button--primary rs-button--small">Small</button>
      <button class="rs-button rs-button--primary rs-button--medium">Medium</button>
      <button class="rs-button rs-button--primary rs-button--large">Large</button>
    </p>
  `,
}

export const AutoSizeByContainer: Story = {
  render: () => `
    <div class="rs-size-context">
      <button class="rs-button rs-button--primary rs-button--auto-size">Auto-size button</button>
    </div>
  `,
}
