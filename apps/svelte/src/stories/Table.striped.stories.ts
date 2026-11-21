import type { Meta, StoryObj } from '@storybook/svelte'
import TableStriped from './components/TableStriped.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableStriped,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof TableStriped>

export default meta
type Story = StoryObj<typeof meta>

export const Striped: Story = {}
