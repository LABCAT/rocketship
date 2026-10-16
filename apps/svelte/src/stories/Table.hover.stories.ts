import type { Meta, StoryObj } from '@storybook/svelte'
import TableHover from './components/TableHover.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableHover,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableHover>

export default meta
type Story = StoryObj<typeof TableHover>

export const Hover: Story = {}
