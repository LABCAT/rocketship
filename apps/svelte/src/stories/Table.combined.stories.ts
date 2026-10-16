import type { Meta, StoryObj } from '@storybook/svelte'
import TableCombined from './components/TableCombined.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableCombined,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableCombined>

export default meta
type Story = StoryObj<typeof TableCombined>

export const Combined: Story = {}
