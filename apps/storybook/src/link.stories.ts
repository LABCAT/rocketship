import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Link',
  parameters: {
    a11y: {
      disable: false,
    },
  },
}

export default meta
type Story = StoryObj

export const TypicalContexts: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-storybook-card rs-storybook-copy">
        <p>
          Rocketship docs are built to be read quickly. Start with the
          <a class="rs-link rs-link--medium" href="https://example.com/getting-started">getting started guide</a>
          then open the
          <a class="rs-link rs-link--muted rs-link--medium" href="https://example.com/tokens">token reference</a>.
        </p>
        <p>
          Keyboard users should see a clear focus style: tab to this
          <a class="rs-link rs-link--medium" href="https://example.com/focus">focus demo link</a>.
        </p>
      </div>
    </div>
  `,
}

export const SizeVariants: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-storybook-card">
        <div class="rs-storybook-row">
          <a class="rs-link rs-link--small" href="https://example.com/small">Small link</a>
          <a class="rs-link rs-link--medium" href="https://example.com/medium">Medium link</a>
          <a class="rs-link rs-link--large" href="https://example.com/large">Large link</a>
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
          <a class="rs-link rs-link--auto-size" href="https://example.com/auto-small">Auto-size link</a>
        </div>
        <div class="rs-size-context rs-storybook-size-demo rs-storybook-size-demo--md">
          <span class="rs-storybook-size-caption">Container: medium</span>
          <a class="rs-link rs-link--auto-size" href="https://example.com/auto-medium">Auto-size link</a>
        </div>
        <div class="rs-size-context rs-storybook-size-demo rs-storybook-size-demo--lg">
          <span class="rs-storybook-size-caption">Container: large</span>
          <a class="rs-link rs-link--auto-size" href="https://example.com/auto-large">Auto-size link</a>
        </div>
      </div>
    </div>
  `,
}
