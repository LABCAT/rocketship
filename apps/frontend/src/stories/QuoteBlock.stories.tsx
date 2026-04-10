import type { Meta, StoryObj } from '@storybook/html'
import QuoteBlock from '@rocketship/base/components/QuoteBlock'

const meta = {
  title: 'Components/QuoteBlock',
  component: QuoteBlock,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof QuoteBlock>

export default meta
type Story = StoryObj<typeof QuoteBlock>

export const Default: Story = {
  args: {
    quoteHtml:
      '<p>Design systems pay off when <strong>teams</strong> share the same <em>language</em> for UI.</p>',
    attribution: '— Alex Rivera',
    roleOrSource: 'Principal Designer, Example Co.',
  },
}

export const AttributionOnly: Story = {
  args: {
    quoteHtml: '<p>Keep quotes visually distinct from body copy.</p>',
    attribution: '— The documentation',
    roleOrSource: undefined,
  },
}

export const QuoteOnly: Story = {
  args: {
    quoteHtml: '<p>Quote body with <u>no</u> attribution fields.</p>',
    attribution: undefined,
    roleOrSource: undefined,
  },
}
