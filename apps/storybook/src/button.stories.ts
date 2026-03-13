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
    <div class="rs-storybook-page">
      <div class="rs-storybook-card rs-storybook-stack">
        <div class="rs-storybook-row">
          <button class="rs-button rs-button--primary rs-button--medium">Primary</button>
          <button class="rs-button rs-button--secondary rs-button--medium">Secondary</button>
          <button class="rs-button rs-button--ghost rs-button--medium">Ghost</button>
        </div>
      </div>
    </div>
  `,
}

export const FixedSizes: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-storybook-card">
        <div class="rs-storybook-row">
          <button class="rs-button rs-button--primary rs-button--small">Small</button>
          <button class="rs-button rs-button--primary rs-button--medium">Medium</button>
          <button class="rs-button rs-button--primary rs-button--large">Large</button>
        </div>
      </div>
    </div>
  `,
}

export const AutoSizeByContainer: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-storybook-card rs-storybook-size-grid">
        <div class="rs-size-context rs-storybook-size-demo rs-storybook-size-demo--sm">
          <span class="rs-storybook-size-caption">Container: small</span>
          <button class="rs-button rs-button--primary rs-button--auto-size">Auto-size button</button>
        </div>
        <div class="rs-size-context rs-storybook-size-demo rs-storybook-size-demo--md">
          <span class="rs-storybook-size-caption">Container: medium</span>
          <button class="rs-button rs-button--primary rs-button--auto-size">Auto-size button</button>
        </div>
        <div class="rs-size-context rs-storybook-size-demo rs-storybook-size-demo--lg">
          <span class="rs-storybook-size-caption">Container: large</span>
          <button class="rs-button rs-button--primary rs-button--auto-size">Auto-size button</button>
        </div>
      </div>
    </div>
  `,
}
