import type { Meta, StoryObj } from '@storybook/svelte'
import TableDefault from './components/TableDefault.svelte'
import TableStriped from './components/TableStriped.svelte'
import TableCompact from './components/TableCompact.svelte'
import TableHover from './components/TableHover.svelte'
import TableCombined from './components/TableCombined.svelte'
import TableOverflow from './components/TableOverflow.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableDefault,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => ({ Component: TableDefault }) }

export const Striped: Story = { render: () => ({ Component: TableStriped }) }

export const Compact: Story = { render: () => ({ Component: TableCompact }) }

export const Hover: Story = { render: () => ({ Component: TableHover }) }

export const Combined: Story = { render: () => ({ Component: TableCombined }) }

export const Overflow: Story = { render: () => ({ Component: TableOverflow }) }
