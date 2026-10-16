import type { Meta, StoryObj } from '@storybook/svelte'
import DisclosureDefault from './components/DisclosureDefault.svelte'
import DisclosureSnippets from './components/DisclosureSnippets.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Disclosure',
  component: DisclosureDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof DisclosureDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Snippets: Story = {
  render: () => ({ Component: DisclosureSnippets }),
}
