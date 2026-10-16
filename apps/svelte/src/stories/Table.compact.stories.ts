import type { Meta, StoryObj } from '@storybook/svelte'
import TableCompact from './components/TableCompact.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableCompact,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableCompact>

export default meta
type Story = StoryObj<typeof TableCompact>

export const Compact: Story = {}
