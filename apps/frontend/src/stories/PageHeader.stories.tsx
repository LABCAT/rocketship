import type { Meta, StoryObj } from '@storybook/html'
import PageHeader from '@rocketship/base/components/PageHeader'

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: 'Mission briefing',
    intro:
      'A short lead paragraph that sets context for the page. Use for summaries or key context above the fold.',
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Title without intro',
    intro: undefined,
  },
}
