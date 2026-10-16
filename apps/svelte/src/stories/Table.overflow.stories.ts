import type { Meta, StoryObj } from '@storybook/svelte'
import TableOverflow from './components/TableOverflow.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableOverflow,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableOverflow>

export default meta
type Story = StoryObj<typeof TableOverflow>

export const Overflow: Story = {}
