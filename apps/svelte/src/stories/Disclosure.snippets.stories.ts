import type { Meta, StoryObj } from '@storybook/svelte'
import DisclosureSnippets from './components/DisclosureSnippets.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Disclosure',
  component: DisclosureSnippets,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof DisclosureSnippets>

export default meta
type Story = StoryObj<typeof DisclosureSnippets>

export const Snippets: Story = {}
